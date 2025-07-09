# FGPT - Finance GPT Chat Application

A modern full-stack AI-powered finance chatbot built with React and Node.js, featuring a clean interface, authentication system, and real-time chat capabilities.

## ✨ Features

- 🎨 **Modern UI**: Clean, responsive React interface with Vite for fast development
- 🌓 **Theme Toggle**: Seamless dark/light mode switching with React Context
- 💬 **Smart Chat**: Real-time messaging interface with chat history
- 🔐 **Authentication**: Secure user registration and login with bcrypt encryption
- 👤 **User Management**: Profile management with dashboard and settings
- 🗄️ **Database**: PostgreSQL with Prisma ORM for data persistence
- 📱 **Responsive**: Mobile-first design optimized for all devices
- 🚀 **Full-Stack**: Complete MERN-style architecture with modern tooling

## 🚀 Quick Start

```bash
# Clone the repository
git clone <your-repository-url>
cd FGPT

# Install all dependencies (uses npm workspaces)
npm run install:all

# Set up environment variables
cd server
cp .env.example .env  # Edit with your database URL
npm run db:setup     # Generate Prisma client and push schema
cd ..

# Start both frontend and backend
npm start
```

**Access URLs:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Database Studio: `cd server && npx prisma studio`

## 📦 Installation

### Prerequisites
- **Node.js** v18+ (LTS recommended)
- **npm** v8+ (comes with Node.js)
- **PostgreSQL** database (local or cloud - Supabase recommended)
- **Git** for version control

### Step-by-Step Setup

```bash
# 1. Clone the repository
git clone <your-repository-url>
cd FGPT

# 2. Install all dependencies using npm workspaces
npm run install:all

# 3. Set up environment variables
cd server
echo 'DATABASE_URL="postgresql://username:password@localhost:5432/fgpt"' > .env
# Replace with your actual database connection string

# 4. Set up the database
npx prisma generate
npx prisma db push
cd ..

# 5. Start the development servers
npm start
```

> **Note**: The project uses npm workspaces to manage dependencies across the monorepo structure.

## 🔧 Common Issues & Solutions

### Database Connection Issues
```bash
# Verify environment variables
cd server
cat .env  # Check DATABASE_URL is correct

# Regenerate Prisma client
npx prisma generate
npx prisma db push
```

### Dependency Installation Problems
```bash
# Clean install all packages
npm cache clean --force
rm -rf node_modules client/node_modules server/node_modules
rm -rf package-lock.json client/package-lock.json server/package-lock.json
npm run install:all
```

### Port Already in Use
```bash
# Kill processes on default ports (Windows)
netstat -ano | findstr :3001
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Or use different ports
cd client && npm run dev -- --port 5174
cd server && PORT=3002 npm start
```

### Module Resolution Errors
```bash
# Ensure you're using Node.js v18+
node --version

# Clear cache and reinstall
npm cache clean --force
npm run install:all
```

### Prisma Issues
```bash
cd server

# Reset database (caution: deletes data)
npx prisma migrate reset

# Or push schema changes
npx prisma db push

# View database
npx prisma studio
```

## 🛠️ Tech Stack

### Frontend
- **React 19** - Latest React with modern features
- **Vite 7** - Lightning-fast build tool and dev server
- **React Router DOM** - Client-side routing
- **CSS Variables** - Modern CSS with theme support
- **ESLint** - Code linting and formatting

### Backend
- **Node.js** - JavaScript runtime
- **Express 5** - Web application framework
- **Prisma** - Type-safe database ORM
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Database
- **PostgreSQL** - Primary database
- **Prisma Client** - Database access layer
- **Database migrations** - Version-controlled schema changes

### Development Tools
- **npm workspaces** - Monorepo package management
- **Concurrently** - Run multiple commands simultaneously
- **Node.js --watch** - Built-in file watching for development

## 📁 Project Structure

```
FGPT/
├── package.json              # Root workspace configuration
├── README.md                 # Project documentation
├── client/                   # React frontend application
│   ├── package.json         # Frontend dependencies
│   ├── vite.config.js       # Vite build configuration
│   ├── eslint.config.js     # ESLint configuration
│   ├── index.html           # HTML entry point
│   ├── public/              # Static assets
│   └── src/
│       ├── main.jsx         # React application entry
│       ├── App.jsx          # Main App component
│       ├── components/      # Reusable React components
│       │   ├── ChatArea.jsx
│       │   ├── ChatInput.jsx
│       │   ├── Header.jsx
│       │   ├── LandingPage.jsx
│       │   ├── dashboard.jsx
│       │   ├── login.jsx
│       │   ├── signup.jsx
│       │   ├── ProfileMenu.jsx
│       │   └── SettingsModal.jsx
│       ├── contexts/        # React contexts
│       │   └── ThemeContext.jsx
│       ├── hooks/           # Custom React hooks
│       │   └── useUserData.js
│       └── assets/          # Images, fonts, etc.
└── server/                   # Express.js backend API
    ├── package.json         # Backend dependencies
    ├── server.js            # Main server entry point
    ├── config/              # Configuration files
    │   ├── config.js
    │   └── database.js
    ├── controllers/         # Route controllers
    │   ├── authController.js
    │   ├── chatController.js
    │   └── healthController.js
    ├── middleware/          # Express middleware
    │   ├── errorHandler.js
    │   └── validation.js
    ├── routes/              # API route definitions
    │   ├── index.js
    │   ├── authRoutes.js
    │   ├── chatRoutes.js
    │   └── healthRoutes.js
    ├── services/            # Business logic services
    │   └── databaseService.js
    └── prisma/              # Database schema & migrations
        ├── schema.prisma    # Prisma schema definition
        └── migrations/      # Database migration files
```

> **Architecture**: This is a monorepo using npm workspaces for efficient dependency management across the full-stack application.

## 🎮 Usage Guide

### Getting Started
1. **Registration**: Create a new account from the landing page
2. **Login**: Access your personalized dashboard
3. **Dashboard**: Navigate through the main interface
4. **Chat Interface**: Start conversations with the Finance GPT
5. **Profile Settings**: Customize your profile via the avatar menu in the header
6. **Theme Toggle**: Switch between dark and light modes using the theme button

### Key Features
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Real-time Chat**: Instant messaging with persistent chat history
- **User Authentication**: Secure login/logout functionality
- **Theme Persistence**: Your theme preference is saved across sessions
- **Profile Management**: Update your user information and preferences

## 🔄 Development

### Available Scripts

#### Root Level (Monorepo)
```bash
npm start              # Start both frontend and backend concurrently
npm run install:all    # Install dependencies in all workspaces
npm run client:dev     # Start frontend development server only
npm run client:build   # Build frontend for production
npm run server:start   # Start backend server only
npm run server:server  # Start backend with concurrently script
```

#### Frontend Development (client/)
```bash
cd client
npm run dev      # Start Vite dev server (http://localhost:5173)
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

#### Backend Development (server/)
```bash
cd server
npm start            # Start production server
npm run dev         # Start with --watch flag for auto-restart
npm run server      # Same as npm start
npx prisma studio   # Open Prisma database browser
npx prisma generate # Generate Prisma client
npx prisma db push  # Push schema changes to database
```

### Development Workflow

1. **Start Development**: `npm start` from root directory
2. **Frontend Changes**: Edit files in `client/src/` - Vite provides hot reload
3. **Backend Changes**: Edit files in `server/` - Node.js --watch provides auto-restart
4. **Database Changes**: Update `server/prisma/schema.prisma` then run `npx prisma db push`
5. **Environment Variables**: Add to `server/.env` file

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Setup
1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/FGPT.git`
3. Create a feature branch: `git checkout -b feature/amazing-feature`
4. Follow the installation instructions above
5. Make your changes
6. Test thoroughly
7. Commit your changes: `git commit -m 'Add amazing feature'`
8. Push to the branch: `git push origin feature/amazing-feature`
9. Open a Pull Request

### Guidelines
- Follow the existing code style and patterns
- Add comments for complex logic
- Test your changes on both frontend and backend
- Update documentation if needed
- Ensure all linting passes: `npm run lint` in client directory

### Code Structure
- **Components**: Keep React components small and focused
- **API Routes**: Follow RESTful conventions
- **Database**: Use Prisma for all database operations
- **Styling**: Use CSS variables for theme consistency

## 📋 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Chat Endpoints
- `GET /api/chat/history` - Get chat history
- `POST /api/chat/message` - Send new message

### Health Check
- `GET /api/health` - Server health status

### Database Schema
The application uses PostgreSQL with the following main entities:
- **Users**: User accounts and authentication
- **ChatHistory**: Message storage and conversation tracking

## 🔒 Security Features

- **Password Hashing**: bcryptjs for secure password storage
- **CORS Protection**: Configured for cross-origin requests
- **Environment Variables**: Sensitive data stored in .env files
- **Input Validation**: Server-side validation middleware
- **Error Handling**: Centralized error handling middleware

## 🚀 Deployment

### Production Build
```bash
# Build frontend
npm run client:build

# The build files will be in client/dist/
# Serve them with your preferred static file server
```

### Environment Variables (Production)
```bash
# server/.env
DATABASE_URL="your_production_database_url"
NODE_ENV="production"
PORT=3001
```

### Recommended Hosting
- **Frontend**: Vercel, Netlify, or any static hosting
- **Backend**: Railway, Render, Heroku, or VPS
- **Database**: Supabase, PlanetScale, or any PostgreSQL provider

## 🆘 Support

If you encounter any issues:

1. **Check Common Issues**: See the troubleshooting section above
2. **Verify Prerequisites**: Ensure Node.js v18+ and PostgreSQL are properly installed
3. **Environment Setup**: Double-check your `.env` file configuration
4. **Clean Installation**: Try clearing cache and reinstalling dependencies
5. **Database Connection**: Verify your database URL and network connectivity
6. **Create an Issue**: If problems persist, create a GitHub issue with:
   - Operating system and Node.js version
   - Full error messages
   - Steps to reproduce the issue


## 👨‍💻 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- React team for the amazing frontend framework
- Prisma team for the excellent ORM
- Vite team for the lightning-fast build tool
- Express.js community for the robust backend framework

---

**Made with ❤️ for modern finance applications**


