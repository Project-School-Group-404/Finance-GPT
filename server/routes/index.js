import express from 'express';
import authRoutes from './authRoutes.js';
import chatRoutes from './chatRoutes.js';
import healthRoutes from './healthRoutes.js';

const router = express.Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/chat', chatRoutes);
router.use('/chats', chatRoutes); // Add alias for backward compatibility
router.use('/health', healthRoutes);


// Legacy routes for backward compatibility
router.post('/login', (req, res, next) => {
    // Forward login request to auth route
    req.url = '/auth/login';
    req.originalUrl = req.originalUrl.replace('/api/login', '/api/auth/login');
    next();
});

router.post('/users', (req, res, next) => {
    // Forward user registration to auth route
    req.url = '/auth/register';
    req.originalUrl = req.originalUrl.replace('/api/users', '/api/auth/register');
    next();
});

// For backward compatibility with /api/chats/:userId
router.get('/chats/:userId', (req, res, next) => {
    req.url = `/${req.params.userId}`;
    chatRoutes(req, res, next);
});

// For backward compatibility with /api/ai-chat
router.post('/ai-chat', (req, res, next) => {
    req.url = '/ai';
    chatRoutes(req, res, next);
});

export default router;
