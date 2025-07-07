import express from 'express';
import { signUp, signIn, forgotPassword, dashboard } from '../controllers/auth.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { signUpSchema } from '../validators/auth.validator';
import { validate } from '../middleware/zod.middleware';

const router = express.Router();

router.post('/sign-up', signUp);
router.post('/sign-in', signIn);
// router.post('/forgot-password', forgotPassword);
// router.get('/dashboard', verifyToken, dashboard);

export default router;
