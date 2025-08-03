import express, { RequestHandler } from 'express';
import { signUp, signIn, forgotPassword, generateVideoCallToken  , getHostDetails, updateUser, getUserById, sendOtp, verifiedOtp } from '../controllers/auth.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { signUpValidation, signInValidation, validateRequestSchema, updateUserValidation } from '../validators/auth.validator';
import { useSignIn } from '../controllers/userAuth.controller';

const router = express.Router();

router.post('/sign-up', signUpValidation, validateRequestSchema, signUp as RequestHandler);
router.post('/sign-in', signInValidation, validateRequestSchema, signIn as RequestHandler);
router.get('/get-host-details', getHostDetails as RequestHandler);
router.get('/generate-token', generateVideoCallToken as RequestHandler);
router.put('/update-profile', verifyToken, updateUserValidation, validateRequestSchema, updateUser as RequestHandler);
router.get('/show-profile', verifyToken, getUserById as RequestHandler);
router.post('/send-otp', sendOtp as RequestHandler);
router.post('/verified-otp', verifiedOtp as RequestHandler);

router.post('/user-login', useSignIn as RequestHandler); //////if user is exist then login otherwise registor then login .
// router.post('/user-details:/user-id', verifiedOtp as RequestHandler);
// router.post('/delete-user', verifiedOtp as RequestHandler);





export default router;
