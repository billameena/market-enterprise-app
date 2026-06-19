import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validate } from '../../middlewares/validate.middleware';
import { authenticate } from '../../middlewares/auth.middleware';
import { authRateLimiter, strictRateLimiter } from '../../middlewares/rateLimit.middleware';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  changePasswordSchema,
} from './auth.validator';
import { z } from 'zod';

const router = Router();
const controller = new AuthController();

// Public routes
router.post(
  '/register',
  authRateLimiter,
  validate(registerSchema),
  (req, res, next) => controller.register(req, res, next),
);

router.post(
  '/login',
  authRateLimiter,
  validate(loginSchema),
  (req, res, next) => controller.login(req, res, next),
);

router.post(
  '/refresh',
  validate(refreshTokenSchema),
  (req, res, next) => controller.refreshTokens(req, res, next),
);

router.post(
  '/verify-email',
  validate(verifyEmailSchema),
  (req, res, next) => controller.verifyEmail(req, res, next),
);

router.post(
  '/resend-verification',
  strictRateLimiter,
  validate(z.object({ email: z.string().email() })),
  (req, res, next) => controller.resendVerification(req, res, next),
);

router.post(
  '/forgot-password',
  strictRateLimiter,
  validate(forgotPasswordSchema),
  (req, res, next) => controller.forgotPassword(req, res, next),
);

router.post(
  '/reset-password',
  validate(resetPasswordSchema),
  (req, res, next) => controller.resetPassword(req, res, next),
);

// Protected routes (require authentication)
router.post(
  '/logout',
  authenticate,
  (req, res, next) => controller.logout(req, res, next),
);

router.post(
  '/logout-all',
  authenticate,
  (req, res, next) => controller.logoutAllDevices(req, res, next),
);

router.put(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  (req, res, next) => controller.changePassword(req, res, next),
);

export { router as authRoutes };
