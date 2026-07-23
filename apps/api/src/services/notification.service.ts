/**
 * Notification service module.
 * @module services/notification.service
 */
import { NotificationRepository, CreateNotificationInput } from '../repositories/notification.repository';
import { NotFoundError, ForbiddenError } from '../utils/errors';

export class NotificationService {
  private notificationRepository: NotificationRepository;

  constructor() {
    this.notificationRepository = new NotificationRepository();
  }

  async getNotifications(userId: string, page: number, pageSize: number) {
    const { items, total } = await this.notificationRepository.findByUserId(userId, page, pageSize);
    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getUnreadCount(userId: string) {
    return this.notificationRepository.getUnreadCount(userId);
  }

  async createNotification(data: CreateNotificationInput) {
    return this.notificationRepository.create(data);
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.notificationRepository.findById(notificationId);
    
    if (!notification) {
      throw new NotFoundError('Notification not found');
    }
    
    if (notification.userId !== userId) {
      throw new ForbiddenError('You can only mark your own notifications as read');
    }

    return this.notificationRepository.markAsRead(notificationId);
  }

  async markAllAsRead(userId: string) {
    return this.notificationRepository.markAllAsRead(userId);
  }

  async deleteNotification(notificationId: string, userId: string) {
    const notification = await this.notificationRepository.findById(notificationId);
    
    if (!notification) {
      throw new NotFoundError('Notification not found');
    }
    
    if (notification.userId !== userId) {
      throw new ForbiddenError('You can only delete your own notifications');
    }

    return this.notificationRepository.delete(notificationId);
  }
}
