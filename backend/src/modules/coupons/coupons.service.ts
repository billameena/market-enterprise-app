import { Coupon } from '@prisma/client';
import { CouponsRepository } from './coupons.repository';
import { CreateCouponInput, UpdateCouponInput, ValidateCouponInput, CouponListQuery } from './coupons.types';
import { AppError } from '../../middlewares/error.middleware';
import { PaginatedResult } from '../../types/common.types';

const repo = new CouponsRepository();

export class CouponsService {
  async createCoupon(input: CreateCouponInput, vendorId?: string): Promise<Coupon> {
    const existing = await repo.findByCode(input.code.toUpperCase());
    if (existing) throw AppError.conflict('Coupon code already exists');

    return repo.create({
      code: input.code.toUpperCase(),
      name: input.name,
      description: input.description,
      type: input.type,
      value: input.value,
      minOrderAmount: input.minOrderAmount,
      maxDiscountAmount: input.maxDiscountAmount,
      maxUses: input.maxUses,
      maxUsesPerUser: input.maxUsesPerUser ?? 1,
      isActive: input.isActive ?? true,
      startsAt: input.startsAt ? new Date(input.startsAt) : undefined,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
      ...(vendorId ? { vendor: { connect: { id: vendorId } } } : {}),
    });
  }

  async getAllCoupons(query: CouponListQuery): Promise<PaginatedResult<Coupon>> {
    return repo.findAll(query);
  }

  async validateCoupon(input: ValidateCouponInput, userId?: string): Promise<{ valid: boolean; discountAmount: number; coupon: Coupon }> {
    const coupon = await repo.findByCode(input.code.toUpperCase());
    if (!coupon || !(coupon as unknown as { isActive: boolean }).isActive) {
      throw AppError.badRequest('Invalid coupon code');
    }

    const now = new Date();
    if ((coupon as unknown as { startsAt: Date | null }).startsAt && now < (coupon as unknown as { startsAt: Date }).startsAt) {
      throw AppError.badRequest('Coupon is not yet active');
    }
    if ((coupon as unknown as { expiresAt: Date | null }).expiresAt && now > (coupon as unknown as { expiresAt: Date }).expiresAt) {
      throw AppError.badRequest('Coupon has expired');
    }

    const maxUses = (coupon as unknown as { maxUses: number | null }).maxUses;
    const currentUses = (coupon as unknown as { currentUses: number }).currentUses;
    if (maxUses && currentUses >= maxUses) {
      throw AppError.badRequest('Coupon usage limit reached');
    }

    const minOrderAmount = Number((coupon as unknown as { minOrderAmount: unknown }).minOrderAmount ?? 0);
    if (minOrderAmount && input.orderAmount < minOrderAmount) {
      throw AppError.badRequest(`Minimum order amount of $${minOrderAmount} required for this coupon`);
    }

    let discountAmount = 0;
    const couponValue = Number((coupon as unknown as { value: unknown }).value);
    const couponType = (coupon as unknown as { type: string }).type;

    if (couponType === 'PERCENTAGE') {
      discountAmount = input.orderAmount * (couponValue / 100);
      const maxDiscount = (coupon as unknown as { maxDiscountAmount: unknown }).maxDiscountAmount;
      if (maxDiscount) discountAmount = Math.min(discountAmount, Number(maxDiscount));
    } else if (couponType === 'FIXED_AMOUNT') {
      discountAmount = Math.min(couponValue, input.orderAmount);
    }

    return { valid: true, discountAmount, coupon };
  }

  async updateCoupon(id: string, input: UpdateCouponInput): Promise<Coupon> {
    const coupon = await repo.findById(id);
    if (!coupon) throw AppError.notFound('Coupon');
    return repo.update(id, input);
  }

  async deactivateCoupon(id: string): Promise<Coupon> {
    return repo.update(id, { isActive: false });
  }

  async deleteCoupon(id: string): Promise<void> {
    const coupon = await repo.findById(id);
    if (!coupon) throw AppError.notFound('Coupon');
    await repo.delete(id);
  }
}
