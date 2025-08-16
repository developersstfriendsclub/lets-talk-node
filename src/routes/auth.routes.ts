import express, { RequestHandler } from 'express';
import { signUp, signIn, forgotPassword, generateVideoCallToken  , getHostDetails, updateUser, getUserById, sendOtp, verifiedOtp, logout, googleSignIn } from '../controllers/auth.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { signUpValidation, signInValidation, validateRequestSchema, updateUserValidation } from '../validators/auth.validator';
import { deleteHostThroughAdmin, getAdminDetailsById, getUserDetailsById, hostListForAdmin, hostListForUser, useSignIn, approveHostThroughAdmin, rejectHostThroughAdmin, userListForHost, createCallLog, updateCallStatus } from '../controllers/userAuth.controller';

const router = express.Router();

router.post('/sign-up', signUpValidation, validateRequestSchema, signUp as RequestHandler);
router.post('/sign-in', signInValidation, validateRequestSchema, signIn as RequestHandler);
router.post('/google-sign-in', googleSignIn as RequestHandler);
router.post('/logout', logout as RequestHandler);
router.get('/get-host-details',verifyToken, getHostDetails as RequestHandler);
router.get('/generate-token', generateVideoCallToken as RequestHandler);
router.put('/update-profile', verifyToken, updateUserValidation, validateRequestSchema, updateUser as RequestHandler);
router.get('/show-profile', verifyToken, getUserById as RequestHandler);
router.post('/send-otp', sendOtp as RequestHandler);
router.post('/verified-otp', verifiedOtp as RequestHandler);

////////////////////////// User Auth Routes ///////////////////////
router.post('/user-login', useSignIn as RequestHandler);
router.post('/user-details', verifyToken , getUserDetailsById as RequestHandler);
router.get('/host-list-for-user', verifyToken , hostListForUser as RequestHandler);
router.get('/user-list-for-host', verifyToken , userListForHost as RequestHandler);
router.post('/call/create', createCallLog as RequestHandler);
router.post('/call/update', updateCallStatus as RequestHandler);

/////////////////////////////// admin auth routes ///////////////////////
router.post('/host-list-for-admin' , hostListForAdmin as RequestHandler);
router.post('/host-details-by-id-for-admin' , getAdminDetailsById as RequestHandler);
router.post('/delete-host-through-admin' , deleteHostThroughAdmin as RequestHandler);
router.post('/approve-host-through-admin' , approveHostThroughAdmin as RequestHandler);
router.post('/reject-host-through-admin' , rejectHostThroughAdmin as RequestHandler);

export default router;
