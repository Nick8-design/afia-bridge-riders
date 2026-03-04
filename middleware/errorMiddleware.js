const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
    res.status(statusCode).json({
        success: false,
        message: err.message,
        // Only show the stack trace if we are in development mode on your Linux machine
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

// Middleware to handle 404 (Route not found)
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

module.exports = { errorHandler, notFound };