import { Server, Socket } from 'socket.io';
import { SOCKET_EVENTS } from '../events';
import { NotificationsService } from '../../modules/notifications/notifications.service';
import { logger } from '../../configs/logger';

export function registerNotificationHandlers(io: Server, socket: Socket): void {
  const notificationsService = new NotificationsService();
  const { userId } = socket.data as { userId: string };

  socket.on(SOCKET_EVENTS.MARK_NOTIFICATION_READ, async (data: { notificationId: string }) => {
    try {
      await notificationsService.markAsRead(userId, data.notificationId);
      const count = await notificationsService.getUnreadCount(userId);
      socket.emit('notification:unread_count', { count });
    } catch (err) {
      logger.error('Error marking notification read via socket', { error: err, userId });
    }
  });
}
