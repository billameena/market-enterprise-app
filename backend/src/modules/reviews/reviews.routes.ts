import { Router } from 'express';
import { ReviewsController } from './reviews.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { z } from 'zod';

const router = Router();
const controller = new ReviewsController();

const createReviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(200).optional(),
  content: z.string().max(2000).optional(),
});

router.get('/product/:productId', (req, res, next) => controller.getProductReviews(req, res, next));
router.post('/', authenticate, validate(createReviewSchema), (req, res, next) => controller.create(req, res, next));
router.patch('/:id', authenticate, validate(createReviewSchema.partial()), (req, res, next) => controller.update(req, res, next));
router.delete('/:id', authenticate, (req, res, next) => controller.delete(req, res, next));
router.post('/:id/reply', authenticate, validate(z.object({ content: z.string().min(1).max(2000) })), (req, res, next) => controller.reply(req, res, next));

export { router as reviewsRoutes };
