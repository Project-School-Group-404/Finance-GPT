import express from 'express';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';

// Initialize environment variables
dotenv.config();
const PORT = process.env.PORT || 3000;
// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app and Prisma client
const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from 'frontend' folder
app.use(express.static(path.join(__dirname, 'frontend')));

// === API Routes ===

// Register user
app.post('/api/users', async (req, res) => {
  const { email, name, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: { email, name, password: hashedPassword },
    });
    res.json({ message: 'User registered!' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Error creating user' });
  }
});

// Login user
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

    res.json({
      message: 'Login successful',
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error during login' });
  }
});

// Store chat (user message and assistant reply)
app.post('/api/chats', async (req, res) => {
  const { userId, userMessage, assistantReply } = req.body;

  try {
    // Save new chat
    await prisma.chat.create({
      data: {
        userMessage,
        assistantReply,
        user: { connect: { id: userId } },
      },
    });

    // Enforce only last 10 chats per user
    const chats = await prisma.chat.findMany({
      where: { userId },
      orderBy: { id: 'desc' },
      skip: 10,
    });

    // Delete older chats if more than 10
    const idsToDelete = chats.map((chat) => chat.id);
    if (idsToDelete.length > 0) {
      await prisma.chat.deleteMany({
        where: { id: { in: idsToDelete } },
      });
    }

    res.json({ message: 'Chat stored successfully' });
  } catch (error) {
    console.error('Error saving chat:', error);
    res.status(500).json({ error: 'Error saving chat' });
  }
});
app.get('/api/chats/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  try {
    const chats = await prisma.chat.findMany({
      where: { userId },
      orderBy: { id: 'desc' },
      take: 10,
    });
    res.json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ error: 'Error fetching chats' });
  }
});
// Fetch all users (optional)
app.get('/api/users', async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true },
  });
  res.json(users);
});
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'login.html'));
});
// Start server

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
