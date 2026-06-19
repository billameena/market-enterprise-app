import { NotificationType } from '@prisma/client';

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  imageUrl?: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationListQuery {
  page?: number;
  pageSize?: number;
  isRead?: boolean;
}
