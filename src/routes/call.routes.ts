import express from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import {
  createCall,
  updateCallStatus,
  getUserCallHistory,
  getUserCallStats,
  endCall
} from '../controllers/call.controller';

const router = express.Router();

// Apply auth middleware to all routes
router.use(verifyToken);

// Call routes
router.post('/create', createCall);
router.put('/:id/status', updateCallStatus);
router.get('/history', getUserCallHistory);
router.get('/stats', getUserCallStats);
router.put('/:roomName/end', endCall);

export default router;
