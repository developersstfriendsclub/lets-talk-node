import express from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import {
  createChatMessage,
  getChatHistory,
  getUserChatRooms,
  deleteChatMessage,
  searchChatMessages
} from '../controllers/chat.controller';

const router = express.Router();

// Apply auth middleware to all routes
router.use(verifyToken);

// Chat message routes
router.post('/create', createChatMessage);
router.get('/history/:roomName', getChatHistory);
router.get('/rooms', getUserChatRooms);
router.delete('/:id', deleteChatMessage);
router.get('/search', searchChatMessages);

export default router;
