import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';
import { config } from '../config/config.js';

// Helper function to generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
};

export const authController = {
    // Register new user
    register: async (req, res) => {
        try {
            const { name, email, password } = req.body;

            // Validation
            if (!name || !email || !password) {
                return res.status(400).json({ error: 'All fields are required' });
            }

            // Check if user already exists
            const existingUser = await prisma.user.findUnique({
                where: { email }
            });

            if (existingUser) {
                return res.status(400).json({ error: 'User already exists with this email' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, config.bcrypt.saltRounds);

            // Create user
            const user = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    provider: 'local'
                }
            });

            const token = generateToken(user.id);

            res.status(201).json({ 
                message: 'User created successfully',
                user: { id: user.id, name: user.name, email: user.email },
                token
            });

        } catch (error) {
            console.error('Signup error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Login user
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            // Validation
            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password are required' });
            }

            // Find user
            const user = await prisma.user.findUnique({
                where: { email }
            });

            if (!user) {
                return res.status(400).json({ error: 'Invalid email' });
            }

            // Check if user signed up with OAuth and doesn't have a password
            if (!user.password && user.provider !== 'local') {
                return res.status(400).json({ 
                    error: `This email is associated with ${user.provider} login. Please use "Continue with ${user.provider}" instead.` 
                });
            }

            // Check if user has a password (local account)
            if (!user.password) {
                return res.status(400).json({ error: 'Invalid credentials' });
            }

            // Check password
            const isValidPassword = await bcrypt.compare(password, user.password);

            if (!isValidPassword) {
                return res.status(400).json({ error: 'Invalid Password' });
            }

            const token = generateToken(user.id);

            res.json({ 
                message: 'Login successful',
                user: { id: user.id, name: user.name, email: user.email },
                token
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Google OAuth success callback
    googleCallback: async (req, res) => {
        try {
            if (!req.user) {
                return res.redirect(`${config.cors.origin}/login?error=oauth_failed`);
            }

            const token = generateToken(req.user.id);
            
            // Redirect to frontend with token
            res.redirect(`${config.cors.origin}/auth/success?token=${token}`);
        } catch (error) {
            console.error('Google OAuth callback error:', error);
            res.redirect(`${config.cors.origin}/login?error=oauth_failed`);
        }
    },

    // Get current user profile
    getProfile: async (req, res) => {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            
            if (!token) {
                return res.status(401).json({ error: 'No token provided' });
            }

            const decoded = jwt.verify(token, config.jwt.secret);
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: { id: true, name: true, email: true, provider: true }
            });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json({ user });
        } catch (error) {
            console.error('Get profile error:', error);
            res.status(401).json({ error: 'Invalid token' });
        }
    },
};
