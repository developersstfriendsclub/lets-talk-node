// src/routes/payments.route.ts - CORRECTED

import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware";
import { createOrder, verifyPayment } from "../controllers/payment.controller";

const router = Router();

// ✅ FIX: Add the verifyToken middleware back to both routes.
// This ensures that req.user is available in your controller.
router.post('/create-order', verifyToken, createOrder);
router.post('/verify', verifyToken, verifyPayment);

// NOTE: webhook is NOT defined here — it is mounted in app.ts with express.raw()
// This is correct because the webhook is called by Razorpay, not a logged-in user.

export default router;