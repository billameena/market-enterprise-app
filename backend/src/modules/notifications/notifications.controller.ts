import { Request, Response, NextFunction } from 'express';
import { NotificationsService } from './notifications.service';
import { sendSuccess, sendNoContent } from '../../utils/response';

const service = new NotificationsService();

export class NotificationsController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await service.getNotifications(req.user!.id, req.query as never);
      sendSuccess(res, result.items, 'Notifications fetched', 200, result.meta);
    } catch (e) { next(e); }
  }

  async unreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const count = await service.getUnreadCount(req.user!.id);
      sendSuccess(res, { count });
    } catch (e) { next(e); }
  }

  async markRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const n = await service.markAsRead(req.user!.id, req.params['id']!);
      sendSuccess(res, n, 'Notification marked as read');
    } catch (e) { next(e); }
  }

  async markAllRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await service.markAllAsRead(req.user!.id);
      sendNoContent(res);
    } catch (e) { next(e); }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await service.deleteNotification(req.user!.id, req.params['id']!);
      sendNoContent(res);
    } catch (e) { next(e); }
  }
}
