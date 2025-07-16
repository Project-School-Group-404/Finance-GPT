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
router.use('/users', (req, res, next) => {
    // Redirect /api/users to /api/auth/register
    if (req.method === 'POST') {
        req.url = '/register';
        authRoutes(req, res, next);
    } else {
        res.status(404).json({ error: 'Route not found' });
    }
});

router.use('/login', (req, res, next) => {
    // Redirect /api/login to /api/auth/login
    if (req.method === 'POST') {
        req.url = '/login';
        authRoutes(req, res, next);
    } else {
        res.status(404).json({ error: 'Route not found' });
    }
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
