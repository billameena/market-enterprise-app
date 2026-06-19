import { Coupon, Prisma } from '@prisma/client';
import { prisma } from '../../configs/database';
import { PaginatedResult } from '../../types/common.types';
import { buildPaginatedResult, parsePaginationQuery } from '../../utils/pagination';
import { CouponListQuery } from './coupons.types';

export class CouponsRepository {
  async findByCode(code: string): Promise<Coupon | null> {
    return prisma.coupon.findUnique({ where: { code } });
  }

  async findById(id: string): Promise<Coupon | null> {
    return prisma.coupon.findUnique({ where: { id } });
  }

  async findAll(query: CouponListQuery): Promise<PaginatedResult<Coupon>> {
    const { skip, take, page, pageSize } = parsePaginationQuery(query);
    const where: Prisma.CouponWhereInput = {
      ...(query.isActive !== undefined && { isActive: query.isActive }),
      ...(query.search && {
        OR: [
          { code: { contains: query.search, mode: 'insensitive' } },
          { name: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      prisma.coupon.count({ where }),
    ]);

    return buildPaginatedResult(coupons, total, page, pageSize);
  }

  async create(data: Prisma.CouponCreateInput): Promise<Coupon> {
    return prisma.coupon.create({ data });
  }

  async update(id: string, data: Prisma.CouponUpdateInput): Promise<Coupon> {
    return prisma.coupon.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await prisma.coupon.delete({ where: { id } });
  }
}
