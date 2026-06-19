import { Router } from 'express';
import express from 'express';
import { PaymentsController } from './payments.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { z } from 'zod';

const router = Router();
const controller = new PaymentsController();

// Stripe webhook needs raw body
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  (req, res, next) => controller.webhook(req, res, next),
);

// Authenticated routes
router.use(authenticate);

router.post(
  '/intent',
  validate(z.object({ orderId: z.string().min(1) })),
  (req, res, next) => controller.createIntent(req, res, next),
);

router.post(
  '/confirm',
  validate(z.object({
    orderId: z.string().min(1),
    paymentIntentId: z.string().min(1),
  })),
  (req, res, next) => controller.confirm(req, res, next),
);

router.post(
  '/refund',
  validate(z.object({
    orderId: z.string().min(1),
    amount: z.number().positive().optional(),
    reason: z.string().max(500).optional(),
  })),
  (req, res, next) => controller.refund(req, res, next),
);

export { router as paymentsRoutes };
