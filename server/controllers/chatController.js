import prisma from '../config/database.js';
import { config } from '../config/config.js';

export const chatController = {
    // Save chat message
    saveChat: async (req, res) => {
        try {
            console.log('Received chat save request');
            
            const { 
                userMessage, 
                assistantReply, 
                userId, 
                documentName, 
                documentType, 
                documentPath, 
                documentSize 
            } = req.body;

            // Validation
            if (!userMessage || !assistantReply || !userId) {
                return res.status(400).json({ error: 'All fields are required' });
            }

            // Verify user exists
            const user = await prisma.user.findUnique({
                where: { id: parseInt(userId) }
            });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Save chat with document information
            const chatData = {
                userMessage,
                assistantReply,
                userId: parseInt(userId),
                documentName: documentName || null,
                documentType: documentType || null,
                documentPath: documentPath || null,
                documentSize: documentSize || null,
                uploadedAt: documentName ? new Date() : null
            };
            
            console.log('Saving chat with data');
            
            const chat = await prisma.chat.create({
                data: chatData
            });

            // Enforce chat history limit
            await chatController.enforceChatLimit(parseInt(userId));

            res.status(201).json({ 
                message: 'Chat saved successfully',
                chat: {
                    id: chat.id,
                    userMessage: chat.userMessage,
                    assistantReply: chat.assistantReply,
                    userId: chat.userId
                }
            });

        } catch (error) {
            console.error('Save chat error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Get user chat history
    getChatHistory: async (req, res) => {
        try {
            const { userId } = req.params;

            // Validation
            if (!userId) {
                return res.status(400).json({ error: 'User ID is required' });
            }

            // Verify user exists
            const user = await prisma.user.findUnique({
                where: { id: parseInt(userId) }
            });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Get user chats
            const chats = await prisma.chat.findMany({
                where: { userId: parseInt(userId) },
                orderBy: { id: 'asc' }
            });

            res.json({ 
                chats: chats.map(chat => ({
                    id: chat.id,
                    userMessage: chat.userMessage,
                    assistantReply: chat.assistantReply,
                    userId: chat.userId,
                    documentName: chat.documentName,
                    documentType: chat.documentType,
                    documentPath: chat.documentPath,
                    documentSize: chat.documentSize,
                    uploadedAt: chat.uploadedAt
                }))
            });

        } catch (error) {
            console.error('Get chats error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // AI chat endpoint
    aiChat: async (req, res) => {
        try {
            const { 
                message, 
                userId, 
                documentName, 
                documentType, 
                documentPath, 
                documentSize 
            } = req.body;

            // Validation
            if (!message || !userId) {
                return res.status(400).json({ error: 'Message and user ID are required' });
            }

            // Simple response (integrate with actual AI service later)
            const assistantReply = `You said: "${message}". This is a simple echo response. You can integrate with OpenAI API or other AI services here.`;

            // Save to database with document information
            const chat = await prisma.chat.create({
                data: {
                    userMessage: message,
                    assistantReply,
                    userId: parseInt(userId),
                    documentName: documentName || null,
                    documentType: documentType || null,
                    documentPath: documentPath || null,
                    documentSize: documentSize || null,
                    uploadedAt: documentName ? new Date() : null
                }
            });

            // Enforce chat history limit
            await chatController.enforceChatLimit(parseInt(userId));

            res.json({ 
                reply: assistantReply,
                chatId: chat.id
            });

        } catch (error) {
            console.error('AI chat error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Helper function to enforce chat limit per user
    enforceChatLimit: async (userId) => {
        try {
            const chats = await prisma.chat.findMany({
                where: { userId },
                orderBy: { id: 'desc' },
                skip: config.chat.maxHistoryPerUser,
            });

            // Delete older chats if more than limit
            const idsToDelete = chats.map((chat) => chat.id);
            if (idsToDelete.length > 0) {
                await prisma.chat.deleteMany({
                    where: { id: { in: idsToDelete } },
                });
            }
        } catch (error) {
            console.error('Enforce chat limit error:', error);
        }
    }
};
