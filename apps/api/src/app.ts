/**
 * Express app assembly module.
 * @module app
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { requestLogger } from './middlewares/request-logger.middleware';
import { globalRateLimiter, authRateLimiter } from './middlewares/rate-limiter.middleware';
import { errorHandler } from './middlewares/error-handler.middleware';

// Routes
import healthRoutes from './routes/health.routes';
import userRoutes from "./routes/user.routes";
import notificationRoutes from "./routes/notification.routes";
import chatRoutes from "./routes/chat.routes";
import auditRoutes from './routes/audit.routes';
import authRoutes from './routes/auth.routes';
import jobRoutes from './routes/job.routes';

const app = express();

// Trust proxy if we are behind a load balancer (e.g., Nginx, Heroku, Render)
app.set('trust proxy', 1);

// Security headers
app.use(helmet({
  contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false,
}));

// CORS configuration
app.use(cors({
  origin: env.CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Global rate limiter applied to all API routes
app.use('/api', globalRateLimiter);

// Specific rate limiters
app.use('/api/v1/auth', authRateLimiter);

// Mount routes
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use("/api/v1/chats", chatRoutes);
app.use('/api/v1/audit', auditRoutes);
app.use('/api/v1/jobs', jobRoutes);

// Global error handler
app.use(errorHandler);

export default app;
