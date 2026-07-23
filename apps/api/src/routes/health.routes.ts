/**
 * Health routes module.
 * @module routes/health.routes
 */
import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '@repo/db';

const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    let dbStatus = 'connected';
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      dbStatus = 'error';
    }

    res.status(200).json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: dbStatus,
      version: process.env.npm_package_version || '0.1.0',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
