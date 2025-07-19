import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import prisma from '../config/database.js';

export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }

        const decoded = jwt.verify(token, config.jwt.secret);

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true, name: true, provider: true }
        });

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Token authentication error:', error);
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};

export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decoded = jwt.verify(token, config.jwt.secret);
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: { id: true, email: true, name: true, provider: true }
            });
            req.user = user;
        }

        next();
    } catch (error) {
        // If token is invalid, just continue without user
        next();
    }
};

// Unified authentication middleware that handles both JWT and session
export const authenticate = async (req, res, next) => {
    try {
        // First try JWT authentication
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            // JWT authentication
            try {
                const decoded = jwt.verify(token, config.jwt.secret);
                const user = await prisma.user.findUnique({
                    where: { id: decoded.userId },
                    select: { id: true, email: true, name: true, provider: true }
                });

                if (user) {
                    req.user = user;
                    req.authMethod = 'jwt';
                    return next();
                }
            } catch (jwtError) {
                // JWT failed, try session authentication
            }
        }

        // Try session authentication (for OAuth users)
        if (req.isAuthenticated && req.isAuthenticated()) {
            req.authMethod = 'session';
            return next();
        }

        return res.status(401).json({ error: 'Authentication required' });
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({ error: 'Authentication failed' });
    }
};
