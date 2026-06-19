import { Router } from 'express';
import { prisma } from '../configs/database';
import { sendSuccess } from '../utils/response';

export const homeRoutes = Router();

homeRoutes.get('/', async (_req, res, next) => {
  try {
    const [featuredProducts, newArrivals, categories, banners] = await Promise.all([
      prisma.product.findMany({
        where: { status: 'ACTIVE', isFeatured: true, deletedAt: null },
        include: {
          images: { orderBy: { displayOrder: 'asc' } },
          store: { select: { name: true, slug: true } },
          inventory: { select: { quantity: true, reservedQuantity: true } },
        },
        orderBy: { totalSold: 'desc' },
        take: 8,
      }),
      prisma.product.findMany({
        where: { status: 'ACTIVE', deletedAt: null },
        include: {
          images: { orderBy: { displayOrder: 'asc' } },
          store: { select: { name: true, slug: true } },
          inventory: { select: { quantity: true, reservedQuantity: true } },
        },
        orderBy: { publishedAt: 'desc' },
        take: 8,
      }),
      prisma.category.findMany({
        where: { isActive: true, parentId: null },
        orderBy: { displayOrder: 'asc' },
        take: 6,
      }),
      prisma.banner.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: 'asc' },
      }),
    ]);

    sendSuccess(res, { featuredProducts, newArrivals, categories, banners });
  } catch (e) {
    next(e);
  }
});
