/**
 * Custom error classes module.
 * @module utils/errors
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;

  constructor(message: string, statusCode: number, isOperational = true, code?: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', code?: string) {
    super(message, 404, true, code);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', code?: string) {
    super(message, 401, true, code);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', code?: string) {
    super(message, 403, true, code);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict', code?: string) {
    super(message, 409, true, code);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation Error', code?: string) {
    super(message, 422, true, code);
  }
}
