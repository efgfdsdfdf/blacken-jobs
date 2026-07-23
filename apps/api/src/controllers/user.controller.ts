/**
 * User controller module.
 * @module controllers/user.controller
 */
import { Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { ForbiddenError } from '../utils/errors';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = await this.userService.getUserById(req.user.id);
      
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  getUserById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      
      // Basic check: admin or self
      if (req.user.id !== id && req.user.role !== 'ADMIN') {
        throw new ForbiddenError('Access denied');
      }

      const user = await this.userService.getUserById(id);
      
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const profile = await this.userService.updateProfile(
        req.user.id, 
        req.body, 
        req.user.id,
        req.ip || req.socket.remoteAddress,
        req.get('user-agent')
      );
      
      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  };

  updateSettings = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const settings = await this.userService.updateSettings(
        req.user.id, 
        req.body,
        req.user.id,
        req.ip || req.socket.remoteAddress,
        req.get('user-agent')
      );
      
      res.status(200).json({
        success: true,
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteAccount = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await this.userService.softDeleteUser(
        req.user.id,
        req.user.id,
        req.ip || req.socket.remoteAddress,
        req.get('user-agent')
      );
      
      res.status(200).json({
        success: true,
        data: { message: 'Account successfully deleted' },
      });
    } catch (error) {
      next(error);
    }
  };
}
