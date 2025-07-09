import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { config } from './config/config.js';
import { databaseService } from './services/databaseService.js';
import { errorHandler, notFoundHandler, requestLogger } from './middleware/errorHandler.js';
import routes from './routes/index.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors(config.cors));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// API Routes
app.use('/api', routes);

// 404 handler
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

// Store server instance for graceful shutdown
let server;

// Start server
const startServer = async () => {
    try {
        // Connect to database
        const dbConnected = await databaseService.connect();
        
        if (!dbConnected) {
            console.error('❌ Failed to connect to database. Exiting...');
            process.exit(1);
        }

        // Start listening
        server = app.listen(config.port, () => {
            console.log(`🚀 Server running on http://localhost:${config.port}`);
            console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`📡 Server is ready to accept connections`);
        });

        // Handle server errors
        server.on('error', (error) => {
            console.error('❌ Server error:', error);
            process.exit(1);
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Graceful shutdown
const gracefulShutdown = async (signal) => {
    console.log(`\n${signal} received. Starting graceful shutdown...`);
    
    // Close server
    if (server) {
        server.close(() => {
            console.log('✅ HTTP server closed');
        });
    }
    
    // Disconnect from database
    await databaseService.disconnect();
    console.log('✅ Graceful shutdown completed');
    process.exit(0);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    console.error('Stack:', error.stack);
    gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    if (reason && reason.stack) {
        console.error('Stack:', reason.stack);
    }
    gracefulShutdown('UNHANDLED_REJECTION');
});

// Start the server
console.log('🔄 Starting server initialization...');
startServer().then(() => {
    console.log('✅ Server initialization completed');
}).catch((error) => {
    console.error('❌ Server initialization failed:', error);
    process.exit(1);
});
