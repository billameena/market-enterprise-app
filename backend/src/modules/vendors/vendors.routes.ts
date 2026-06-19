import { Router } from 'express';
import { VendorsController } from './vendors.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/rbac.middleware';
import { validate, validateQuery } from '../../middlewares/validate.middleware';
import {
  createVendorSchema,
  updateVendorSchema,
  createStoreSchema,
  updateStoreSchema,
  adminVendorActionSchema,
  vendorListQuerySchema,
} from './vendors.validator';

const router = Router();
const controller = new VendorsController();

// Public
router.get('/:id/profile', (req, res, next) => controller.getPublicProfile(req, res, next));

// Authenticated
router.use(authenticate);

router.post('/apply', validate(createVendorSchema), (req, res, next) => controller.apply(req, res, next));
router.get('/me', requireRole('VENDOR'), (req, res, next) => controller.getMyProfile(req, res, next));
router.get('/me/stats', requireRole('VENDOR'), (req, res, next) => controller.getMyStats(req, res, next));
router.get('/me/products', requireRole('VENDOR'), (req, res, next) => controller.getMyProducts(req, res, next));
router.get('/me/orders', requireRole('VENDOR'), (req, res, next) => controller.getMyOrders(req, res, next));
router.get('/me/analytics', requireRole('VENDOR'), (req, res, next) => controller.getMyAnalytics(req, res, next));
router.patch('/me', requireRole('VENDOR'), validate(updateVendorSchema), (req, res, next) => controller.updateProfile(req, res, next));
router.post('/me/store', requireRole('VENDOR'), validate(createStoreSchema), (req, res, next) => controller.createStore(req, res, next));
router.patch('/me/store', requireRole('VENDOR'), validate(updateStoreSchema), (req, res, next) => controller.updateStore(req, res, next));

// Admin
router.get('/admin', requireRole('ADMIN'), validateQuery(vendorListQuerySchema), (req, res, next) => controller.getAllVendors(req, res, next));
router.get('/', requireRole('ADMIN'), validateQuery(vendorListQuerySchema), (req, res, next) => controller.getAllVendors(req, res, next));
router.post('/:id/action', requireRole('ADMIN'), validate(adminVendorActionSchema), (req, res, next) => controller.adminAction(req, res, next));
// Frontend calls PATCH /vendors/:id/moderate with uppercase action — normalise and delegate
router.patch('/:id/moderate', requireRole('ADMIN'), (req, res, next) => {
  req.body = { ...req.body, action: String(req.body.action ?? '').toLowerCase() };
  void controller.adminAction(req, res, next);
});

export { router as vendorsRoutes };
