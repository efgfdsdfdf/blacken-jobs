/**
 * Notification repository module.
 * @module repositories/notification.repository
 */
import { prisma } from '@repo/db';
import type { Prisma, Notification } from '@repo/db';

export interface CreateNotificationInput {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Prisma.InputJsonValue;
}

export interface INotificationRepository {
  findByUserId(userId: string, page: number, pageSize: number): Promise<{ items: Notification[], total: number }>;
  findById(id: string): Promise<Notification | null>;
  create(data: CreateNotificationInput): Promise<Notification>;
  markAsRead(id: string): Promise<Notification>;
  markAllAsRead(userId: string): Promise<Prisma.BatchPayload>;
  getUnreadCount(userId: string): Promise<number>;
  delete(id: string): Promise<Notification>;
}

export class NotificationRepository implements INotificationRepository {
  async findByUserId(userId: string, page: number, pageSize: number) {
    const [items, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.notification.count({ where: { userId } }),
    ]);

    return { items, total };
  }

  async findById(id: string) {
    return prisma.notification.findUnique({
      where: { id },
    });
  }

  async create(data: CreateNotificationInput) {
    return prisma.notification.create({
      data,
    });
  }

  async markAsRead(id: string) {
    return prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  async delete(id: string) {
    return prisma.notification.delete({
      where: { id },
    });
  }
}
