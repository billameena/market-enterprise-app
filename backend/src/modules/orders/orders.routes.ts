import { Router } from 'express';
import { OrdersController } from './orders.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/rbac.middleware';
import { validate, validateQuery } from '../../middlewares/validate.middleware';
import { z } from 'zod';
import { OrderStatus } from '@prisma/client';

const router = Router();
const controller = new OrdersController();

const shippingAddressSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: z.string().optional(),
  addressLine1: z.string().min(1).max(255),
  addressLine2: z.string().optional(),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  postalCode: z.string().min(1).max(20),
  country: z.string().min(1).max(100),
});

const createOrderSchema = z.object({
  shippingAddress: shippingAddressSchema,
  couponCode: z.string().optional(),
  notes: z.string().max(500).optional(),
});

const updateStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  comment: z.string().max(500).optional(),
  trackingNumber: z.string().optional(),
  trackingUrl: z.string().url().optional(),
  carrier: z.string().optional(),
});

router.use(authenticate);

router.post('/', validate(createOrderSchema), (req, res, next) => controller.create(req, res, next));
router.get('/me', (req, res, next) => controller.getMyOrders(req, res, next));
router.get('/:id', (req, res, next) => controller.getOne(req, res, next));
router.post('/:id/cancel', (req, res, next) => controller.cancelOrder(req, res, next));

// Admin / vendor
router.get('/', requireRole('ADMIN'), (req, res, next) => controller.getAllOrders(req, res, next));
router.patch('/:id/status', requireRole('VENDOR'), validate(updateStatusSchema), (req, res, next) => controller.updateStatus(req, res, next));

export { router as ordersRoutes };
