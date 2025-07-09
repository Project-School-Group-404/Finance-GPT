import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';
import { config } from '../config/config.js';

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
                    password: hashedPassword
                }
            });

            res.status(201).json({ 
                message: 'User created successfully',
                user: { id: user.id, name: user.name, email: user.email }
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

            // Check password
            const isValidPassword = await bcrypt.compare(password, user.password);

            if (!isValidPassword) {
                return res.status(400).json({ error: 'Invalid Password' });
            }

            res.json({ 
                message: 'Login successful',
                user: { id: user.id, name: user.name, email: user.email }
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};
