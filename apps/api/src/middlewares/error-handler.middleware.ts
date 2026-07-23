/**
 * Error handler middleware module.
 * @module middlewares/error-handler.middleware
 */
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors';
import { logger } from '../config/logger';
import { env } from '../config/env';

/**
 * Global error handling middleware.
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestId = (req as any).id || req.headers['x-request-id'];
  
  if (err instanceof ZodError) {
    logger.warn('Validation error', { 
      requestId, 
      path: req.path, 
      method: req.method,
      errors: err.errors 
    });
    
    return res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: err.flatten().fieldErrors,
      },
    });
  }

  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error('Operational server error', { requestId, err });
    } else {
      logger.warn('Client error', { requestId, message: err.message, code: err.code, statusCode: err.statusCode });
    }

    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code || 'ERROR',
        message: err.message,
      },
    });
  }

  // Unhandled errors
  logger.error('Unhandled server error', { 
    requestId, 
    path: req.path, 
    method: req.method,
    err 
  });

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    },
  });
};
