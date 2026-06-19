import { Router } from 'express';
import { ProductsController } from './products.controller';
import { authenticate, optionalAuthenticate } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/rbac.middleware';
import { validate, validateQuery, validateParams } from '../../middlewares/validate.middleware';
import { uploadMultiple } from '../../middlewares/upload.middleware';
import { uploadRateLimiter } from '../../middlewares/rateLimit.middleware';
import {
  createProductSchema,
  updateProductSchema,
  productListQuerySchema,
  adminProductActionSchema,
  updateInventorySchema,
} from './products.validator';
import { z } from 'zod';

const router = Router();
const controller = new ProductsController();

// Admin product list — must be BEFORE /:id wildcard
router.get('/admin', authenticate, requireRole('ADMIN'), validateQuery(productListQuerySchema), (req, res, next) => controller.list(req, res, next));

// Public
router.get('/', validateQuery(productListQuerySchema), (req, res, next) => controller.list(req, res, next));
router.get('/slug/:slug', (req, res, next) => controller.getBySlug(req, res, next));
router.get('/:id', (req, res, next) => controller.getOne(req, res, next));
router.get('/:id/related', (req, res, next) => controller.getRelated(req, res, next));

// Vendor
router.post('/', authenticate, requireRole('VENDOR'), validate(createProductSchema), (req, res, next) => controller.create(req, res, next));
router.patch('/:id', authenticate, requireRole('VENDOR'), validate(updateProductSchema), (req, res, next) => controller.update(req, res, next));
router.delete('/:id', authenticate, requireRole('VENDOR'), (req, res, next) => controller.delete(req, res, next));
router.post(
  '/:id/images',
  authenticate,
  requireRole('VENDOR'),
  uploadRateLimiter,
  uploadMultiple('images', 10),
  (req, res, next) => controller.uploadImages(req, res, next),
);
router.patch('/:id/inventory', authenticate, requireRole('VENDOR'), validate(updateInventorySchema), (req, res, next) => controller.updateInventory(req, res, next));

// Admin
router.post('/:id/moderate', authenticate, requireRole('ADMIN'), validate(adminProductActionSchema), (req, res, next) => controller.adminAction(req, res, next));
// Frontend sends PATCH — accept both methods
router.patch('/:id/moderate', authenticate, requireRole('ADMIN'), validate(adminProductActionSchema), (req, res, next) => controller.adminAction(req, res, next));

export { router as productsRoutes };
