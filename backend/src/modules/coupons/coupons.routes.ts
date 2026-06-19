import { Router } from 'express';
import { CouponsController } from './coupons.controller';
import { authenticate, optionalAuthenticate } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/rbac.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { z } from 'zod';
import { CouponType } from '@prisma/client';

const router = Router();
const controller = new CouponsController();

const createCouponSchema = z.object({
  code: z.string().min(3).max(50).toUpperCase(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  type: z.nativeEnum(CouponType),
  value: z.number().positive(),
  minOrderAmount: z.number().positive().optional(),
  maxDiscountAmount: z.number().positive().optional(),
  maxUses: z.number().int().positive().optional(),
  maxUsesPerUser: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
  startsAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
});

router.post(
  '/validate',
  optionalAuthenticate,
  validate(z.object({ code: z.string(), orderAmount: z.number().positive() })),
  (req, res, next) => controller.validate(req, res, next),
);

router.use(authenticate);
router.get('/', requireRole('ADMIN'), (req, res, next) => controller.list(req, res, next));
router.post('/', requireRole('ADMIN'), validate(createCouponSchema), (req, res, next) => controller.create(req, res, next));
router.patch('/:id', requireRole('ADMIN'), validate(createCouponSchema.partial()), (req, res, next) => controller.update(req, res, next));
router.post('/:id/deactivate', requireRole('ADMIN'), (req, res, next) => controller.deactivate(req, res, next));
router.delete('/:id', requireRole('ADMIN'), (req, res, next) => controller.delete(req, res, next));

export { router as couponsRoutes };
