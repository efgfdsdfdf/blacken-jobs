/**
 * Notification routes module.
 * @module routes/notification.routes
 */
import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();
const notificationController = new NotificationController();

// All notification routes require authentication
router.use(authenticateToken);

router.get('/', notificationController.getNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.patch('/read-all', notificationController.markAllAsRead);
router.patch('/:id/read', notificationController.markAsRead);
router.delete('/:id', notificationController.deleteNotification);

export default router;
