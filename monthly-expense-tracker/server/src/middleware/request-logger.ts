import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to log incoming requests
 */
export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const start = Date.now();
  
  // Log request details
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  // Log request body if present (and not a file upload)
  if (req.body && Object.keys(req.body).length > 0 && req.headers['content-type']?.includes('application/json')) {
    console.log('Request body:', JSON.stringify(req.body));
  }
  
  // Capture response finish event to log response time
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
  });
  
  next();
}