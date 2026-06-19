import { Router } from 'express';
import { UsersController } from './users.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/rbac.middleware';
import { validate, validateQuery } from '../../middlewares/validate.middleware';
import { uploadSingle } from '../../middlewares/upload.middleware';
import {
  updateProfileSchema,
  createAddressSchema,
  updateAddressSchema,
  adminUpdateUserSchema,
  userListQuerySchema,
} from './users.validator';

const router = Router();
const controller = new UsersController();

// All user routes require authentication
router.use(authenticate);

// Profile
router.get('/me', (req, res, next) => controller.getProfile(req, res, next));
router.patch('/me', validate(updateProfileSchema), (req, res, next) => controller.updateProfile(req, res, next));
router.post('/me/avatar', uploadSingle('avatar'), (req, res, next) => controller.uploadAvatar(req, res, next));

// Addresses
router.get('/me/addresses', (req, res, next) => controller.getAddresses(req, res, next));
router.post('/me/addresses', validate(createAddressSchema), (req, res, next) => controller.createAddress(req, res, next));
router.patch('/me/addresses/:id', validate(updateAddressSchema), (req, res, next) => controller.updateAddress(req, res, next));
router.delete('/me/addresses/:id', (req, res, next) => controller.deleteAddress(req, res, next));

// Admin routes
router.get('/', requireRole('ADMIN'), validateQuery(userListQuerySchema), (req, res, next) => controller.getAllUsers(req, res, next));
router.patch('/:id', requireRole('ADMIN'), validate(adminUpdateUserSchema), (req, res, next) => controller.adminUpdateUser(req, res, next));

export { router as usersRoutes };
