import express from 'express';
import { generateTokenController } from '../controllers/videoCall.controller';

const router = express.Router();

router.get('/generate-token', generateTokenController);

export default router; 