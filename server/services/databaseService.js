import prisma from '../config/database.js';

export const databaseService = {
    // Test database connection
    connect: async () => {
        try {
            // Test connection with a simple query
            await prisma.$queryRaw`SELECT 1`;
            console.log('✅ Database connected successfully');
            return true;
        } catch (error) {
            console.error('❌ Database connection failed:', error);
            return false;
        }
    },

    // Disconnect from database
    disconnect: async () => {
        try {
            await prisma.$disconnect();
            console.log('✅ Database disconnected successfully');
        } catch (error) {
            console.error('❌ Database disconnection failed:', error);
        }
    },

    // Health check for database
    healthCheck: async () => {
        try {
            await prisma.$queryRaw`SELECT 1`;
            return { status: 'healthy', timestamp: new Date().toISOString() };
        } catch (error) {
            return { status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() };
        }
    }
};
