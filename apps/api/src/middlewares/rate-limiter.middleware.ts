/**
 * Rate limiter middleware module.
 * @module middlewares/rate-limiter.middleware
 */
import { RateLimiterRedis, RateLimiterMemory } from 'rate-limiter-flexible';
import Redis from 'ioredis';
import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { logger } from '../config/logger';

const redisClient = new Redis(env.REDIS_URL, {
  enableOfflineQueue: false,
  maxRetriesPerRequest: 1,
});

redisClient.on('error', (err) => {
  logger.warn('Redis connection error in rate limiter. Falling back to memory.', { error: err.message });
});

let isRedisReady = false;
redisClient.on('ready', () => {
  isRedisReady = true;
  logger.info('Redis connected for rate limiting');
});

// Memory fallbacks
const globalMemoryLimiter = new RateLimiterMemory({
  points: 100,
  duration: 60,
});

const authMemoryLimiter = new RateLimiterMemory({
  points: 5,
  duration: 900,
});

// Redis limiters
const globalRedisLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'rl_global',
  points: 100, // 100 requests
  duration: 60, // per 60 seconds by IP
});

const authRedisLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'rl_auth',
  points: 5, // 5 requests
  duration: 900, // per 15 minutes by IP
});

/**
 * Helper to execute rate limiting with fallback
 */
const rateLimitHandler = async (
  req: Request, 
  res: Response, 
  next: NextFunction, 
  redisLimiter: RateLimiterRedis, 
  memoryLimiter: RateLimiterMemory
) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  
  try {
    const limiter = isRedisReady ? redisLimiter : memoryLimiter;
    const rateLimiterRes = await limiter.consume(ip);
    
    res.setHeader('Retry-After', rateLimiterRes.msBeforeNext / 1000);
    res.setHeader('X-RateLimit-Limit', limiter.points);
    res.setHeader('X-RateLimit-Remaining', rateLimiterRes.remainingPoints);
    res.setHeader('X-RateLimit-Reset', new Date(Date.now() + rateLimiterRes.msBeforeNext).toISOString());
    
    next();
  } catch (rejRes: any) {
    if (rejRes instanceof Error) {
      // Redis error, fail open
      logger.error('Rate limiter error, failing open', { error: rejRes.message });
      next();
    } else {
      // Rate limit exceeded
      res.setHeader('Retry-After', rejRes.msBeforeNext / 1000);
      res.setHeader('X-RateLimit-Limit', isRedisReady ? redisLimiter.points : memoryLimiter.points);
      res.setHeader('X-RateLimit-Remaining', rejRes.remainingPoints);
      res.setHeader('X-RateLimit-Reset', new Date(Date.now() + rejRes.msBeforeNext).toISOString());
      
      res.status(429).json({
        success: false,
        error: {
          code: 'TOO_MANY_REQUESTS',
          message: 'Too many requests, please try again later.',
        }
      });
    }
  }
};

export const globalRateLimiter = (req: Request, res: Response, next: NextFunction) => 
  rateLimitHandler(req, res, next, globalRedisLimiter, globalMemoryLimiter);

export const authRateLimiter = (req: Request, res: Response, next: NextFunction) => 
  rateLimitHandler(req, res, next, authRedisLimiter, authMemoryLimiter);
