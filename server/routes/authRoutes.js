




import express from 'express';
import { authController } from '../controllers/authController.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', authController.register);

// POST /api/auth/login  
router.post('/login', authController.login);


// Get current authenticated user
router.get('/me', (req, res) => {
    if (req.isAuthenticated && req.isAuthenticated()) {
        res.json({ user: req.user });
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});

// Logout route
router.post('/logout', (req, res) => {
    req.logout(() => {
        res.json({ message: 'Logged out successfully' });
    });
});


export default router;
