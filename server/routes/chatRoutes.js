import express from 'express';
import { chatController } from '../controllers/chatController.js';

const router = express.Router();

// POST /api/chat - Save chat message
router.post('/', chatController.saveChat);

// GET /api/chat/:userId - Get user chat history
router.get('/:userId', chatController.getChatHistory);

// POST /api/chat/ai - AI chat endpoint
router.post('/ai', chatController.aiChat);

export default router;
