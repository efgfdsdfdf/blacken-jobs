/**
 * Logger configuration module.
 * @module config/logger
 */
import winston from 'winston';
import { env } from './env';

const { combine, timestamp, printf, colorize, json, errors } = winston.format;

const consoleFormat = combine(
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  printf(({ level, message, timestamp, stack, requestId, ...metadata }) => {
    let msg = `${timestamp} [${level}]`;
    if (requestId) {
      msg += ` [req:${requestId}]`;
    }
    msg += `: ${message}`;
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`;
    }
    if (stack) {
      msg += `\n${stack}`;
    }
    return msg;
  })
);

export const logger = winston.createLogger({
  level: env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: combine(
    errors({ stack: true }),
    timestamp(),
    json()
  ),
  defaultMeta: { service: 'api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}
