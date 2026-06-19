import { Review, ReviewReply, Prisma } from '@prisma/client';
import { prisma } from '../../configs/database';
import { PaginatedResult } from '../../types/common.types';
import { buildPaginatedResult, parsePaginationQuery } from '../../utils/pagination';
import { ReviewListQuery } from './reviews.types';

export class ReviewsRepository {
  async findById(id: string): Promise<Review | null> {
    return prisma.review.findUnique({ where: { id }, include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } }, replies: true } });
  }

  async findByProductId(productId: string, query: ReviewListQuery): Promise<PaginatedResult<Review>> {
    const { skip, take, page, pageSize } = parsePaginationQuery(query);
    const where: Prisma.ReviewWhereInput = {
      productId,
      isApproved: true,
      ...(query.rating && { rating: query.rating }),
    };

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take,
        orderBy: query.sortBy ? { [query.sortBy]: query.sortOrder ?? 'desc' } : { createdAt: 'desc' },
        include: {
          user: { select: { firstName: true, lastName: true, avatarUrl: true } },
          replies: true,
        },
      }),
      prisma.review.count({ where }),
    ]);

    return buildPaginatedResult(reviews as Review[], total, page, pageSize);
  }

  async findByUserId(userId: string): Promise<Review[]> {
    return prisma.review.findMany({ where: { userId }, include: { product: { select: { name: true, images: { where: { isPrimary: true }, take: 1 } } } } });
  }

  async create(data: Prisma.ReviewCreateInput): Promise<Review> {
    return prisma.review.create({ data });
  }

  async update(id: string, data: Prisma.ReviewUpdateInput): Promise<Review> {
    return prisma.review.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await prisma.review.delete({ where: { id } });
  }

  async createReply(data: Prisma.ReviewReplyCreateInput): Promise<ReviewReply> {
    return prisma.reviewReply.create({ data });
  }

  async findExistingReview(userId: string, productId: string): Promise<Review | null> {
    return prisma.review.findUnique({ where: { userId_productId: { userId, productId } } });
  }

  async updateProductRating(productId: string): Promise<void> {
    const agg = await prisma.review.aggregate({
      where: { productId, isApproved: true },
      _avg: { rating: true },
      _count: { id: true },
    });
    await prisma.product.update({
      where: { id: productId },
      data: {
        averageRating: agg._avg.rating ?? 0,
        totalReviews: agg._count.id,
      },
    });
  }
}
