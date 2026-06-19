import { CartRepository } from './cart.repository';
import { AddToCartInput, UpdateCartItemInput, CartSummary } from './cart.types';
import { AppError } from '../../middlewares/error.middleware';
import { prisma } from '../../configs/database';
import { addDays } from 'date-fns';
import { env } from '../../configs/env';
import { Decimal } from '@prisma/client/runtime/library';

const repo = new CartRepository();

function toNumber(value: Decimal | number): number {
  return typeof value === 'number' ? value : Number(value.toString());
}

export class CartService {
  private async getOrCreateCart(userId?: string, sessionId?: string) {
    if (userId) {
      const cart = await repo.findByUserId(userId);
      if (cart) return cart;
      return repo.createForUser(userId);
    }
    if (sessionId) {
      const cart = await repo.findBySessionId(sessionId);
      if (cart) return cart;
      return repo.createForGuest(sessionId, addDays(new Date(), env.CART_EXPIRY_DAYS));
    }
    throw AppError.badRequest('Either userId or sessionId is required');
  }

  async getCart(userId?: string, sessionId?: string): Promise<CartSummary> {
    const cart = await this.getOrCreateCart(userId, sessionId);
    return this.buildSummary(cart);
  }

  async addToCart(input: AddToCartInput, userId?: string, sessionId?: string): Promise<CartSummary> {
    const cart = await this.getOrCreateCart(userId, sessionId);

    // Validate product and get current price
    const product = await prisma.product.findUnique({
      where: { id: input.productId, status: 'ACTIVE', deletedAt: null },
      include: { inventory: true, variants: true },
    });

    if (!product) throw AppError.notFound('Product');

    let price = toNumber(product.price);
    let inStock = true;

    if (input.variantId) {
      const variant = product.variants.find((v) => v.id === input.variantId);
      if (!variant) throw AppError.notFound('Product variant');
      price = toNumber(variant.price);
      inStock = variant.stock > 0 || variant.stock >= input.quantity;
    } else if (product.inventory) {
      const available = product.inventory.quantity - product.inventory.reservedQuantity;
      inStock = available >= input.quantity;
    }

    if (!inStock && !((product.inventory?.allowBackorder) ?? false)) {
      throw AppError.badRequest('Insufficient stock');
    }

    await repo.addItem(cart.id, {
      productId: input.productId,
      variantId: input.variantId ?? null,
      quantity: input.quantity,
      price: price as unknown as Decimal,
    });

    const updatedCart = await this.getOrCreateCart(userId, sessionId);
    return this.buildSummary(updatedCart);
  }

  async updateCartItem(
    itemId: string,
    input: UpdateCartItemInput,
    userId?: string,
    sessionId?: string,
  ): Promise<CartSummary> {
    const item = await repo.findItemById(itemId);
    if (!item) throw AppError.notFound('Cart item');

    if (input.quantity <= 0) {
      await repo.removeItem(itemId);
    } else {
      await repo.updateItemQuantity(itemId, input.quantity);
    }

    const cart = await this.getOrCreateCart(userId, sessionId);
    return this.buildSummary(cart);
  }

  async removeFromCart(itemId: string, userId?: string, sessionId?: string): Promise<CartSummary> {
    const item = await repo.findItemById(itemId);
    if (!item) throw AppError.notFound('Cart item');
    await repo.removeItem(itemId);

    const cart = await this.getOrCreateCart(userId, sessionId);
    return this.buildSummary(cart);
  }

  async clearCart(userId?: string, sessionId?: string): Promise<void> {
    const cart = await this.getOrCreateCart(userId, sessionId);
    await repo.clearCart(cart.id);
  }

  async applyCoupon(couponCode: string, userId?: string, sessionId?: string): Promise<CartSummary> {
    const cart = await this.getOrCreateCart(userId, sessionId);

    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode, isActive: true },
    });

    if (!coupon) throw AppError.badRequest('Invalid coupon code');

    const now = new Date();
    if (coupon.startsAt && now < coupon.startsAt) throw AppError.badRequest('Coupon is not yet active');
    if (coupon.expiresAt && now > coupon.expiresAt) throw AppError.badRequest('Coupon has expired');
    if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) throw AppError.badRequest('Coupon usage limit reached');

    if (userId) {
      const userUsage = await prisma.couponUsage.count({
        where: { couponId: coupon.id, userId },
      });
      if (userUsage >= coupon.maxUsesPerUser) {
        throw AppError.badRequest('You have already used this coupon');
      }
    }

    const updatedCart = await repo.applyCoupon(cart.id, coupon.id);
    return this.buildSummary(updatedCart);
  }

  async removeCoupon(userId?: string, sessionId?: string): Promise<CartSummary> {
    const cart = await this.getOrCreateCart(userId, sessionId);
    const updatedCart = await repo.removeCoupon(cart.id);
    return this.buildSummary(updatedCart);
  }

  async mergeGuestCart(userId: string, sessionId: string): Promise<void> {
    await repo.mergeGuestCart(userId, sessionId);
  }

  private buildSummary(cart: Record<string, unknown>): CartSummary {
    const items = ((cart['items'] as unknown[]) ?? []) as Array<{
      id: string;
      productId: string;
      variantId: string | null;
      quantity: number;
      price: Decimal;
      product: {
        name: string;
        sku: string;
        images: Array<{ url: string }>;
        inventory: { quantity: number; reservedQuantity: number } | null;
      };
      variant: { name: string; sku: string; stock: number } | null;
    }>;

    const cartItems = items.map((item) => ({
      id: item.id,
      productId: item.productId,
      variantId: item.variantId ?? undefined,
      productName: item.product.name,
      variantName: item.variant?.name,
      imageUrl: item.product.images[0]?.url,
      price: toNumber(item.price),
      quantity: item.quantity,
      total: toNumber(item.price) * item.quantity,
      sku: item.variant?.sku ?? item.product.sku,
      inStock: item.variant
        ? item.variant.stock > 0
        : (item.product.inventory
          ? item.product.inventory.quantity - item.product.inventory.reservedQuantity > 0
          : false),
    }));

    const subtotal = cartItems.reduce((sum, i) => sum + i.total, 0);
    const couponData = cart['coupon'] as {
      id: string;
      code: string;
      type: string;
      value: Decimal;
      maxDiscountAmount: Decimal | null;
    } | null;

    let discountAmount = 0;
    if (couponData) {
      if (couponData.type === 'PERCENTAGE') {
        discountAmount = subtotal * (toNumber(couponData.value) / 100);
        if (couponData.maxDiscountAmount) {
          discountAmount = Math.min(discountAmount, toNumber(couponData.maxDiscountAmount));
        }
      } else if (couponData.type === 'FIXED_AMOUNT') {
        discountAmount = Math.min(toNumber(couponData.value), subtotal);
      }
    }

    const taxRate = env.PLATFORM_TAX_RATE / 100;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * taxRate;
    const shippingAmount =
      couponData?.type === 'FREE_SHIPPING' ? 0 : subtotal >= env.FREE_SHIPPING_THRESHOLD ? 0 : 5.99;
    const total = taxableAmount + taxAmount + shippingAmount;

    return {
      items: cartItems,
      subtotal: Math.round(subtotal * 100) / 100,
      discountAmount: Math.round(discountAmount * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      shippingAmount: Math.round(shippingAmount * 100) / 100,
      total: Math.round(total * 100) / 100,
      coupon: couponData
        ? {
            code: couponData.code,
            discountType: couponData.type,
            discountValue: toNumber(couponData.value),
          }
        : undefined,
      itemCount: cartItems.reduce((sum, i) => sum + i.quantity, 0),
    };
  }
}
