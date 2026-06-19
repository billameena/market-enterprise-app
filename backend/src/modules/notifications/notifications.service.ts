import { Notification } from '@prisma/client';
import { NotificationsRepository } from './notifications.repository';
import { CreateNotificationInput, NotificationListQuery } from './notifications.types';
import { cache } from '../../configs/redis';
import { emitToUser } from '../../configs/socket';
import { PaginatedResult } from '../../types/common.types';

const repo = new NotificationsRepository();

export class NotificationsService {
  async createNotification(input: CreateNotificationInput): Promise<Notification> {
    const notification = await repo.create({
      user: { connect: { id: input.userId } },
      type: input.type,
      title: input.title,
      body: input.body,
      imageUrl: input.imageUrl,
      actionUrl: input.actionUrl,
      metadata: input.metadata,
    });

    // Emit real-time notification
    try {
      emitToUser(input.userId, 'notification:new', notification);
    } catch {
      // Socket not critical
    }

    // Invalidate unread count cache
    await cache.del(`notif:${input.userId}:unread`);

    return notification;
  }

  async getNotifications(userId: string, query: NotificationListQuery): Promise<PaginatedResult<Notification>> {
    return repo.findByUserId(userId, query);
  }

  async getUnreadCount(userId: string): Promise<number> {
    const cacheKey = `notif:${userId}:unread`;
    const cached = await cache.get<number>(cacheKey);
    if (cached !== null) return cached;

    const count = await repo.countUnread(userId);
    await cache.set(cacheKey, count, 60 * 60);
    return count;
  }

  async markAsRead(userId: string, notificationId: string): Promise<Notification> {
    const notification = await repo.markAsRead(notificationId, userId);
    await cache.del(`notif:${userId}:unread`);
    return notification;
  }

  async markAllAsRead(userId: string): Promise<void> {
    await repo.markAllAsRead(userId);
    await cache.del(`notif:${userId}:unread`);
  }

  async deleteNotification(userId: string, notificationId: string): Promise<void> {
    await repo.delete(notificationId, userId);
    await cache.del(`notif:${userId}:unread`);
  }
}
