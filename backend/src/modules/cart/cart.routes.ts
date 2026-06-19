import { Router } from 'express';
import { CartController } from './cart.controller';
import { optionalAuthenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { z } from 'zod';

const router = Router();
const controller = new CartController();

const addItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional(),
  quantity: z.number().int().min(1).max(100),
});

const updateItemSchema = z.object({
  quantity: z.number().int().min(0).max(100),
});

const applyCouponSchema = z.object({
  couponCode: z.string().min(1).max(50).toUpperCase(),
});

// All cart routes support optional auth (guests via x-session-id header)
router.use(optionalAuthenticate);

router.get('/', (req, res, next) => controller.getCart(req, res, next));
router.post('/items', validate(addItemSchema), (req, res, next) => controller.addItem(req, res, next));
router.patch('/items/:itemId', validate(updateItemSchema), (req, res, next) => controller.updateItem(req, res, next));
router.delete('/items/:itemId', (req, res, next) => controller.removeItem(req, res, next));
router.delete('/', (req, res, next) => controller.clearCart(req, res, next));
router.post('/coupon', validate(applyCouponSchema), (req, res, next) => controller.applyCoupon(req, res, next));
router.delete('/coupon', (req, res, next) => controller.removeCoupon(req, res, next));

export { router as cartRoutes };
