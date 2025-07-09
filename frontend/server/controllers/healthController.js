export const healthController = {
    // Health check endpoint
    healthCheck: (req, res) => {
        res.json({ 
            status: 'Server is running',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development'
        });
    }
};
