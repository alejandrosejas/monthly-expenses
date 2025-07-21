"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
/**
 * Global error handler middleware
 */
function errorHandler(err, req, res, next) {
    console.error('Error:', err);
    // Default error response
    const errorResponse = {
        error: 'InternalServerError',
        message: 'An unexpected error occurred',
        timestamp: new Date().toISOString()
    };
    // Handle specific error types
    if (err instanceof zod_1.ZodError) {
        // Validation error
        const fieldErrors = {};
        err.errors.forEach((error) => {
            const path = error.path.join('.');
            if (!fieldErrors[path]) {
                fieldErrors[path] = [];
            }
            fieldErrors[path].push(error.message);
        });
        errorResponse.error = 'ValidationError';
        errorResponse.message = 'Validation failed';
        errorResponse.details = fieldErrors;
        res.status(400).json(errorResponse);
        return;
    }
    // Handle known error types with custom status codes
    if (err.name === 'NotFoundError') {
        errorResponse.error = 'NotFoundError';
        errorResponse.message = err.message || 'Resource not found';
        res.status(404).json(errorResponse);
        return;
    }
    if (err.name === 'ConflictError') {
        errorResponse.error = 'ConflictError';
        errorResponse.message = err.message || 'Resource already exists';
        res.status(409).json(errorResponse);
        return;
    }
    if (err.name === 'UnauthorizedError') {
        errorResponse.error = 'UnauthorizedError';
        errorResponse.message = err.message || 'Unauthorized';
        res.status(401).json(errorResponse);
        return;
    }
    if (err.name === 'ForbiddenError') {
        errorResponse.error = 'ForbiddenError';
        errorResponse.message = err.message || 'Forbidden';
        res.status(403).json(errorResponse);
        return;
    }
    // Generic server error
    res.status(500).json(errorResponse);
}
