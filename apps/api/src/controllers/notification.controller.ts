/**
 * Notification controller module.
 * @module controllers/notification.controller
 */
import { Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  getNotifications = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 20;

      const notifications = await this.notificationService.getNotifications(req.user.id, page, pageSize);
      
      res.status(200).json({
        success: true,
        data: notifications,
      });
    } catch (error) {
      next(error);
    }
  };

  getUnreadCount = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const count = await this.notificationService.getUnreadCount(req.user.id);
      
      res.status(200).json({
        success: true,
        data: { count },
      });
    } catch (error) {
      next(error);
    }
  };

  markAsRead = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const notification = await this.notificationService.markAsRead(id, req.user.id);
      
      res.status(200).json({
        success: true,
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  };

  markAllAsRead = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.notificationService.markAllAsRead(req.user.id);
      
      res.status(200).json({
        success: true,
        data: { updatedCount: result.count },
      });
    } catch (error) {
      next(error);
    }
  };

  deleteNotification = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.notificationService.deleteNotification(id, req.user.id);
      
      res.status(200).json({
        success: true,
        data: { message: 'Notification deleted successfully' },
      });
    } catch (error) {
      next(error);
    }
  };
}
