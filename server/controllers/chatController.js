import prisma from '../config/database.js';

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

    // AI chat endpoint - saves chat data from FastAPI server
    aiChat: async (req, res) => {
        try {
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
                return res.status(400).json({ error: 'User message, assistant reply, and user ID are required' });
            }

            // Save to database with document information
            const chat = await prisma.chat.create({
                data: {
                    userMessage,
                    assistantReply,
                    userId: parseInt(userId),
                    documentName: documentName || null,
                    documentType: documentType || null,
                    documentPath: documentPath || null,
                    documentSize: documentSize || null,
                    uploadedAt: documentName ? new Date() : null
                }
            });

            res.json({ 
                message: 'Chat saved successfully',
                chatId: chat.id
            });

        } catch (error) {
            console.error('AI chat error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};
