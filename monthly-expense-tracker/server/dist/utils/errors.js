"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = exports.ForbiddenError = exports.UnauthorizedError = exports.ConflictError = exports.NotFoundError = void 0;
/**
 * Custom error for when a resource is not found
 */
class NotFoundError extends Error {
    constructor(message = 'Resource not found') {
        super(message);
        this.name = 'NotFoundError';
    }
}
exports.NotFoundError = NotFoundError;
/**
 * Custom error for when a resource already exists
 */
class ConflictError extends Error {
    constructor(message = 'Resource already exists') {
        super(message);
        this.name = 'ConflictError';
    }
}
exports.ConflictError = ConflictError;
/**
 * Custom error for when a request is unauthorized
 */
class UnauthorizedError extends Error {
    constructor(message = 'Unauthorized') {
        super(message);
        this.name = 'UnauthorizedError';
    }
}
exports.UnauthorizedError = UnauthorizedError;
/**
 * Custom error for when a request is forbidden
 */
class ForbiddenError extends Error {
    constructor(message = 'Forbidden') {
        super(message);
        this.name = 'ForbiddenError';
    }
}
exports.ForbiddenError = ForbiddenError;
/**
 * Custom error for when a validation fails
 */
class ValidationError extends Error {
    constructor(message = 'Validation failed') {
        super(message);
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
