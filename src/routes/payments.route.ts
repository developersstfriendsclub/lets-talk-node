

import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware";
import { createOrder, getTotalEarnedTime, getTotalPayments, verifyPayment } from "../controllers/payment.controller";

const router = Router();

router.post('/create-order', verifyToken, createOrder);
router.post('/verify', verifyToken, verifyPayment);
router.get('/time', verifyToken, getTotalEarnedTime);
router.get('/total', verifyToken, getTotalPayments);

// NOTE: webhook is NOT defined here — it is mounted in app.ts with express.raw()

export default router;