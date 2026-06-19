import { CouponType } from '@prisma/client';

export interface CreateCouponInput {
  code: string;
  name: string;
  description?: string;
  type: CouponType;
  value: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  maxUses?: number;
  maxUsesPerUser?: number;
  isActive?: boolean;
  startsAt?: string;
  expiresAt?: string;
}

export interface UpdateCouponInput extends Partial<CreateCouponInput> {}

export interface ValidateCouponInput {
  code: string;
  orderAmount: number;
}

export interface CouponListQuery {
  page?: number;
  pageSize?: number;
  isActive?: boolean;
  search?: string;
}
