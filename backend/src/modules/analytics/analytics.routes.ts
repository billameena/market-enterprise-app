import { Router } from 'express';
import { AnalyticsController } from './analytics.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/rbac.middleware';

const router = Router();
const controller = new AnalyticsController();

router.use(authenticate);

router.get('/admin/dashboard', requireRole('ADMIN'), (req, res, next) => controller.adminDashboard(req, res, next));
router.get('/admin/revenue', requireRole('ADMIN'), (req, res, next) => controller.revenueChart(req, res, next));
router.get('/vendor/dashboard', requireRole('VENDOR'), (req, res, next) => controller.vendorDashboard(req, res, next));

export { router as analyticsRoutes };
