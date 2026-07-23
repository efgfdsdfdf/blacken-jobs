/**
 * Authentication middleware module.
 * @module middlewares/auth.middleware
 */
import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { prisma } from '@repo/db';

export interface AuthenticatedRequest extends Request {
  user?: any; // Replace with User entity type later if needed
}

/**
 * Middleware to authenticate user via Supabase token.
 */
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or invalid authorization header');
    }

    const token = authHeader.split(' ')[1];
    
    // Validate token and get user from Supabase
    const { data: { user: supabaseUser }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !supabaseUser) {
      throw new UnauthorizedError('Invalid or expired token');
    }

    // Fetch user from our database using supabaseId
    let user = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      include: { profile: true, settings: true }
    });

    // Auto-sync user from Supabase to Prisma if they don't exist
    if (!user) {
      user = await prisma.user.create({
        data: {
          supabaseId: supabaseUser.id,
          email: supabaseUser.email || "",
          role: "USER"
        },
        include: { profile: true, settings: true }
      });
    }

    if (user.deletedAt) {
      throw new UnauthorizedError('User account has been deleted');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware factory for role-based access control.
 * @param roles Array of allowed roles
 */
export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('User not authenticated');
      }

      // Assuming role is on the user object (add to schema if needed)
      const userRole = req.user.role || 'USER';
      
      if (!roles.includes(userRole)) {
        throw new ForbiddenError('Insufficient permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
