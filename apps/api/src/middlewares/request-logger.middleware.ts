/**
 * Request logger middleware module.
 * @module middlewares/request-logger.middleware
 */
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../config/logger';

/**
 * Middleware to generate request ID and log request details.
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const requestId = req.headers['x-request-id'] || uuidv4();
  req.headers['x-request-id'] = requestId;
  (req as any).id = requestId;

  const start = Date.now();

  res.setHeader('X-Request-Id', requestId);

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    
    logger.log(logLevel, `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`, {
      requestId,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration,
      ip: req.ip || req.socket.remoteAddress,
      userAgent: req.get('user-agent')
    });
  });

  next();
};
