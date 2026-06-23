import { NotificationType } from '@prisma/client';
import { Prisma } from '@prisma/client';

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  imageUrl?: string;
  actionUrl?: string;
  metadata?: Prisma.InputJsonValue;
}

export interface NotificationListQuery {
  page?: number;
  pageSize?: number;
  isRead?: boolean;
}
