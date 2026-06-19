import { Request, Response, NextFunction } from 'express';
import { ReviewsService } from './reviews.service';
import { sendSuccess, sendCreated, sendNoContent } from '../../utils/response';

const service = new ReviewsService();

export class ReviewsController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      sendCreated(res, await service.createReview(req.user!.id, req.body), 'Review submitted');
    } catch (e) { next(e); }
  }

  async getProductReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await service.getProductReviews(req.params['productId']!, req.query as never);
      sendSuccess(res, result.items, 'Reviews fetched', 200, result.meta);
    } catch (e) { next(e); }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      sendSuccess(res, await service.updateReview(req.user!.id, req.params['id']!, req.body), 'Review updated');
    } catch (e) { next(e); }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await service.deleteReview(req.user!.id, req.params['id']!);
      sendNoContent(res);
    } catch (e) { next(e); }
  }

  async reply(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      sendCreated(res, await service.replyToReview(req.user!.id, req.params['id']!, req.body), 'Reply posted');
    } catch (e) { next(e); }
  }
}
