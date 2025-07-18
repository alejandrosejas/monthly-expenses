import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ErrorResponse } from 'shared';

/**
 * Global error handler middleware
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Error:', err);
  
  // Default error response
  const errorResponse: ErrorResponse = {
    error: 'InternalServerError',
    message: 'An unexpected error occurred',
    timestamp: new Date().toISOString()
  };
  
  // Handle specific error types
  if (err instanceof ZodError) {
    // Validation error
    const fieldErrors: Record<string, string[]> = {};
    
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