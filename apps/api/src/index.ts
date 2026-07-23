/**
 * API Server bootstrap.
 * @module index
 */
import app from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { prisma } from '@repo/db';
import http from 'http';

import { jobWorkerService } from './services/job-worker.service';

const port = env.API_PORT || 4000;
const server = http.createServer(app);

async function bootstrap() {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('✅ Database connected successfully');

    // Initialize background services
    jobWorkerService.start();

    server.listen(port, () => {
      logger.info(`🚀 API server listening on port ${port} in ${env.NODE_ENV} mode`);
    });

  } catch (error) {
    logger.error('❌ Failed to start server', { error });
    process.exit(1);
  }
}

// Graceful shutdown handling
const shutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  
  server.close(async () => {
    logger.info('HTTP server closed');
    
    try {
      await prisma.$disconnect();
      logger.info('Database disconnected');
      process.exit(0);
    } catch (err) {
      logger.error('Error during shutdown', { error: err });
      process.exit(1);
    }
  });

  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception thrown:', { error });
  process.exit(1);
});

bootstrap();
