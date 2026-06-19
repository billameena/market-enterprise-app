import { Router } from 'express';
import { CategoriesController } from './categories.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/rbac.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { z } from 'zod';

const router = Router();
const controller = new CategoriesController();

const createCategorySchema = z.object({
  name: z.string().min(1).max(100).trim(),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().max(1000).optional(),
  parentId: z.string().cuid().optional(),
  displayOrder: z.number().int().optional(),
  metaTitle: z.string().max(255).optional(),
  metaDescription: z.string().max(500).optional(),
});

router.get('/tree', (req, res, next) => controller.getTree(req, res, next));
router.get('/slug/:slug', (req, res, next) => controller.getBySlug(req, res, next));
router.get('/:id', (req, res, next) => controller.getOne(req, res, next));
router.post('/', authenticate, requireRole('ADMIN'), validate(createCategorySchema), (req, res, next) => controller.create(req, res, next));
router.patch('/:id', authenticate, requireRole('ADMIN'), validate(createCategorySchema.partial()), (req, res, next) => controller.update(req, res, next));
router.delete('/:id', authenticate, requireRole('ADMIN'), (req, res, next) => controller.delete(req, res, next));

export { router as categoriesRoutes };
