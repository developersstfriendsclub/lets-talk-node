import { Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { sendSuccess, sendError, sendValidationError } from '../utils/response'
import Payment from '../models/payment.model';
import { sequelize } from '../config/database';
import { User } from '../models/user.model';
import { col, fn } from 'sequelize';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!
});

const calculateSecondsFromAmount = (amountPaise: number): number => {
    const amountRupees = amountPaise / 100;

    // Helper to convert minutes to seconds
    const toSeconds = (minutes: number) => minutes * 60;

    // Tiered business logic for recharge packs
    if (amountRupees === 25) {
        return toSeconds(1); // 1 minute
    } else if (amountRupees === 50) {
        return toSeconds(2); // 2 minutes
    } else if (amountRupees === 100) {
        return toSeconds(4); // 4 minutes
    } else if (amountRupees === 200) {
        return toSeconds(7); // 7 minutes
    } else if (amountRupees === 400) {
        return toSeconds(10); // 10 minutes
    } else if (amountRupees === 800) {
        return toSeconds(13); // 13 minutes
    } else if (amountRupees === 1600) {
        return toSeconds(18); // 18 minutes
    } else if (amountRupees === 2800) {
        return toSeconds(27); // 27 minutes
    } else if (amountRupees === 4500) {
        return toSeconds(60); // 1 hour
    } else if (amountRupees === 8900) {
        return toSeconds(130); // 2 hours 10 minutes
    } else if (amountRupees === 17800) {
        // 4h 20m regular + 15m extra = 275 minutes
        return toSeconds(275);
    } else if (amountRupees === 35600) {
        return toSeconds(480); // 8 hours
    }

    console.warn(`An amount of ₹${amountRupees} did not match any predefined recharge pack.`);
    return 0;
};

export const createOrder = async (req: Request, res: Response) => {
    const t = await sequelize.transaction();
    try {

        const userId = (req as any).user?.id;

        if (!userId) {
            await t.rollback();
            return sendValidationError(res, 'User authentication required', 401);
        }

        const user = await User.findOne({
            where: {
                id: userId,
                is_active: true
            }
        });

        if (!user) {
            await t.rollback();
            return sendValidationError(res, 'User not found or inactive', 404);
        }

        const { amount, currency = 'INR', receipt } = req.body;

        // in paise
        if (!amount || typeof amount !== 'number' || amount <= 0) {
            await t.rollback();
            return sendValidationError(res, 'Invalid amount. Amount should be in paise (e.g., 10000 paise = ₹100)');
        }
        const usersEarnedSeconds = calculateSecondsFromAmount(amount);

        if (usersEarnedSeconds <= 0) {
            await t.rollback();
            return sendValidationError(res, 'Invalid recharge amount. Please select one of the available recharge packs.');
        }

        const options = {
            amount: Math.round(amount),
            currency,
            receipt: receipt || `recharge_${userId}_${Date.now()}`,
            payment_capture: 1, // Auto-capture payments
        };

        const order = await razorpay.orders.create(options);

        // const usersEarnedSeconds = calculateSecondsFromAmount(amount);

        const payment = await Payment.create({
            transactionId: order.id,
            userId,
            amount: options.amount,
            usersEarnedSeconds,
            status: 'created',
            currency: options.currency,
            razorpayOrderId: order.id,
            created_by: userId,
            updated_by: userId
        }, { transaction: t });

        await t.commit();

        return sendSuccess(res, {
            order: {
                id: order.id,
                amount: order.amount,
                currency: order.currency,
                receipt: order.receipt,
                key_id: process.env.RAZORPAY_KEY_ID
            },
            paymentId: payment.id,
            estimatedMinutes: Math.floor(usersEarnedSeconds / 60) // Show minutes to user
        }, 'Payment order created successfully');

    } catch (error) {
        await t.rollback();
        console.error('createOrder error:', error);

        if (error instanceof Error && 'statusCode' in error && (error as any).statusCode === 400) {
            return sendValidationError(res, 'Invalid payment parameters. Please check amount or currency.');
        }

        return sendError(res, 'Failed to create payment order', 500, error);
    }
};

export const verifyPayment = async (req: Request, res: Response) => {
    const t = await sequelize.transaction();
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            await t.rollback();
            return sendValidationError(res, 'User authentication required', 401);
        }

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            await t.rollback();
            return sendValidationError(res, 'Missing payment verification data');
        }

        const body = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(body)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            await t.rollback();
            return sendValidationError(res, 'Payment signature verification failed', 400);
        }

        const payment = await Payment.findOne({
            where: {
                razorpayOrderId: razorpay_order_id,
                userId,
            }
        });

        if (!payment) {
            await t.rollback();
            return sendValidationError(res, 'Payment record not found', 404);
        }

        if (payment.status === 'captured') {
            await t.commit();
            return sendSuccess(res, {
                status: 'captured',
                message: 'Payment was already verified.'
            }, 'Payment already verified successfully!');
        }

        const usersEarnedSeconds = calculateSecondsFromAmount(payment.amount);

        await payment.update({
            status: 'captured',
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
            transactionId: razorpay_payment_id, // Update transaction ID to the final payment ID
            usersEarnedSeconds,
            updated_by: userId
        }, { transaction: t });


        await t.commit();

        return sendSuccess(res, {
            paymentId: payment.id,
            transactionId: razorpay_payment_id,
            status: 'captured',
            creditsEarned: Math.floor(usersEarnedSeconds / 60), // Return minutes
            amount: payment.amount / 100 // Convert paise back to rupees for display
        }, 'Payment verified successfully! Minutes added to your account.');

    } catch (error) {
        await t.rollback();
        console.error('verifyPayment error:', error);
        return sendError(res, 'Payment verification failed', 500, error);
    }
};


export const handleWebhook = async (req: Request, res: Response) => {
    const signatureHeader = req.headers['x-razorpay-signature'] as string;
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;

    const t = await sequelize.transaction();

    try {
        if (!signatureHeader || !webhookSecret) {
            console.warn('Webhook: Missing signature or webhook secret');
            await t.rollback();
            return res.status(400).json({ status: 'Signature or secret missing' });
        }

        const rawBody = (req as any).rawBody;
        if (!rawBody) {
            console.error('Webhook: Raw body not available. Ensure express.raw() middleware is used correctly.');
            await t.rollback();
            return res.status(500).send('Internal Server Error: Raw body missing.');
        }

        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(rawBody)
            .digest('hex');

        if (expectedSignature !== signatureHeader) {
            console.warn('Webhook: Invalid signature');
            await t.rollback();
            return res.status(400).json({ status: 'Invalid signature' });
        }

        const payload = req.body;
        const event = payload.event;

        console.log(`Razorpay Webhook received: ${event}`);

        if (event === 'payment.captured') {
            const paymentEntity = payload.payload.payment.entity;
            const orderId = paymentEntity.order_id;
            const paymentId = paymentEntity.id;

            const payment = await Payment.findOne({
                where: { razorpayOrderId: orderId }
            });

            if (payment && payment.status !== 'captured') {
                await payment.update({
                    status: 'captured',
                    razorpayPaymentId: paymentId,
                    transactionId: paymentId
                }, { transaction: t });
                console.log(`Webhook: Payment ${payment.id} for order ${orderId} updated to captured.`);
                // TODO: Credit user minutes here as well, as a fallback mechanism.
            } else if (payment) {
                console.log(`Webhook: Payment for order ${orderId} already captured. No action taken.`);
            } else {
                console.warn(`Webhook: Received captured event for unknown order ${orderId}.`);
            }
        }
        else if (event === 'payment.failed') {
            const paymentEntity = payload.payload.payment.entity;
            const orderId = paymentEntity.order_id;

            const payment = await Payment.findOne({
                where: { razorpayOrderId: orderId }
            });

            if (payment && payment.status !== 'captured') {
                await payment.update({ status: 'failed' }, { transaction: t });
                console.log(`Webhook: Payment ${payment.id} for order ${orderId} updated to failed.`);
            }
        }

        await t.commit();

        res.status(200).json({ status: 'ok' });

    } catch (error) {
        await t.rollback();
        console.error('Webhook processing error:', error);

        res.status(500).json({ status: 'error' });
    }
};

export const getTotalPayments = async (req: Request, res: Response) => {
    try {
        // This endpoint aggregates data across all users, so it should be
        const totalResult = await Payment.findOne({
            attributes: [
                // Use Sequelize's aggregation function `SUM` on the 'amount' column.
                [fn('SUM', col('amount')), 'totalAmount']
            ],
            where: {
                // Only include payments that were successfully completed.
                status: 'captured'
            },
            raw: true // Ensures we get a plain JSON object back.
        });

        // The result of SUM can be null if there are no payments, so we handle that case.
        const totalAmountPaise = totalResult && (totalResult as any).totalAmount ? parseInt((totalResult as any).totalAmount, 10) : 0;

        // Convert the final sum from paise to rupees for a user-friendly response.
        const totalAmountRupees = totalAmountPaise / 100;

        return sendSuccess(res, {
            totalAmount: totalAmountRupees,
            currency: 'INR'
        }, 'Total payments retrieved successfully.');
    } catch (error) {
        console.error('getTotalPayments error:', error);
        return sendError(res, 'Failed to retrieve total payments', 500, error);

    }
}

export const getTotalEarnedTime = async (req: Request, res: Response) => {
    try {

        const userId = (req as any).user?.id;
        if (!userId) {
            return sendValidationError(res, 'User authentication required', 401);
        }

        // Find the sum of earned seconds for this specific user.
        const totalResult = await Payment.findOne({
            attributes: [
                [fn('SUM', col('usersEarnedSeconds')), 'totalSeconds']
            ],
            where: {
                userId, // Filter by the authenticated user's ID.
                status: 'captured' // Only count successful payments.
            },
            raw: true
        });

        const totalEarnedSeconds = totalResult && (totalResult as any).totalSeconds ? parseInt((totalResult as any).totalSeconds, 10) : 0;

        // Convert the total seconds into a more readable format.
        const totalMinutes = Math.floor(totalEarnedSeconds / 60);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        // Create a human-readable string.
        const formattedTime = `${hours} hour(s) and ${minutes} minute(s)`;

        // Return all formats to give the frontend flexibility.
        return sendSuccess(res, {
            totalEarnedSeconds,
            totalEarnedMinutes: totalMinutes,
            formattedTime,
        }, 'Total earned time retrieved successfully.');

    } catch (error) {
        console.error('getTotalEarnedTime error:', error);
        return sendError(res, 'Failed to retrieve total earned time', 500, error);
    }
};