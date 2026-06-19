import { Notification, Prisma } from '@prisma/client';
import { prisma } from '../../configs/database';
import { PaginatedResult } from '../../types/common.types';
import { buildPaginatedResult, parsePaginationQuery } from '../../utils/pagination';
import { NotificationListQuery } from './notifications.types';

export class NotificationsRepository {
  async create(data: Prisma.NotificationCreateInput): Promise<Notification> {
    return prisma.notification.create({ data });
  }

  async findByUserId(userId: string, query: NotificationListQuery): Promise<PaginatedResult<Notification>> {
    const { skip, take, page, pageSize } = parsePaginationQuery(query);
    const where: Prisma.NotificationWhereInput = {
      userId,
      ...(query.isRead !== undefined && { isRead: query.isRead }),
    };

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      prisma.notification.count({ where }),
    ]);

    return buildPaginatedResult(notifications, total, page, pageSize);
  }

  async countUnread(userId: string): Promise<number> {
    return prisma.notification.count({ where: { userId, isRead: false } });
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    return prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async delete(id: string, userId: string): Promise<void> {
    await prisma.notification.deleteMany({ where: { id, userId } });
  }
}
