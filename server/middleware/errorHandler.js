
// Error handling middleware
export const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Default error
    let error = {
        message: err.message || 'Something went wrong',
        status: err.status || 500
    };

    // Prisma errors
    if (err.code === 'P2002') {
        error.message = 'Duplicate entry';
        error.status = 400;
    }

    // Validation errors
    if (err.name === 'ValidationError') {
        error.message = 'Validation failed';
        error.status = 400;
    }

    res.status(error.status).json({
        error: error.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

// 404 handler
export const notFoundHandler = (req, res) => {
    res.status(404).json({
        error: `Route ${req.originalUrl} not found`
    });
};

// Request logging middleware
export const requestLogger = (req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
};
