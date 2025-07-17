import express from 'express';
import passport from '../config/passport.js';
import { authController } from '../controllers/authController.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', authController.register);

// POST /api/auth/login  
router.post('/login', authController.login);

// Google OAuth routes
router.get('/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',  
    passport.authenticate('google', { failureRedirect: '/login?error=oauth_failed' }),
    authController.googleCallback
);

// Get current user profile
router.get('/profile', authController.getProfile);

// Get current authenticated user (for session-based auth)
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
