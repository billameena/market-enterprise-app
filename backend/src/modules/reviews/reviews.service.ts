import { Review } from '@prisma/client';
import { ReviewsRepository } from './reviews.repository';
import { CreateReviewInput, UpdateReviewInput, CreateReviewReplyInput, ReviewListQuery } from './reviews.types';
import { AppError } from '../../middlewares/error.middleware';
import { prisma } from '../../configs/database';
import { PaginatedResult } from '../../types/common.types';

const repo = new ReviewsRepository();

export class ReviewsService {
  async createReview(userId: string, input: CreateReviewInput): Promise<Review> {
    const existing = await repo.findExistingReview(userId, input.productId);
    if (existing) throw AppError.conflict('You have already reviewed this product');

    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId: input.productId,
        order: { userId, status: { in: ['DELIVERED', 'COMPLETED'] } },
      },
    });

    const review = await repo.create({
      user: { connect: { id: userId } },
      product: { connect: { id: input.productId } },
      rating: input.rating,
      title: input.title,
      content: input.content,
      isVerified: !!hasPurchased,
    });

    await repo.updateProductRating(input.productId);
    return review;
  }

  async getProductReviews(productId: string, query: ReviewListQuery): Promise<PaginatedResult<Review>> {
    return repo.findByProductId(productId, query);
  }

  async updateReview(userId: string, reviewId: string, input: UpdateReviewInput): Promise<Review> {
    const review = await repo.findById(reviewId);
    if (!review) throw AppError.notFound('Review');
    if ((review as unknown as { userId: string }).userId !== userId) throw AppError.forbidden('Access denied');

    const updated = await repo.update(reviewId, input);
    await repo.updateProductRating((review as unknown as { productId: string }).productId);
    return updated;
  }

  async deleteReview(userId: string, reviewId: string): Promise<void> {
    const review = await repo.findById(reviewId);
    if (!review) throw AppError.notFound('Review');
    if ((review as unknown as { userId: string }).userId !== userId) throw AppError.forbidden('Access denied');

    await repo.delete(reviewId);
    await repo.updateProductRating((review as unknown as { productId: string }).productId);
  }

  async replyToReview(vendorUserId: string, reviewId: string, input: CreateReviewReplyInput) {
    const review = await repo.findById(reviewId);
    if (!review) throw AppError.notFound('Review');

    const vendor = await prisma.vendor.findUnique({ where: { userId: vendorUserId } });
    if (!vendor) throw AppError.forbidden('Vendor access required');

    return repo.createReply({
      review: { connect: { id: reviewId } },
      vendorId: vendor.id,
      content: input.content,
    });
  }
}
