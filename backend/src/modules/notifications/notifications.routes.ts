import { Router } from 'express';
import { NotificationsController } from './notifications.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();
const controller = new NotificationsController();

router.use(authenticate);

router.get('/', (req, res, next) => controller.list(req, res, next));
router.get('/unread-count', (req, res, next) => controller.unreadCount(req, res, next));
router.patch('/read-all', (req, res, next) => controller.markAllRead(req, res, next));
router.patch('/:id/read', (req, res, next) => controller.markRead(req, res, next));
router.delete('/:id', (req, res, next) => controller.delete(req, res, next));

export { router as notificationsRoutes };
