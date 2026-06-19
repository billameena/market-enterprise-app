import { Cart, CartItem, Prisma } from '@prisma/client';
import { prisma } from '../../configs/database';

const cartInclude = {
  items: {
    include: {
      product: {
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          inventory: true,
        },
      },
      variant: true,
    },
  },
  coupon: true,
};

export class CartRepository {
  async findByUserId(userId: string): Promise<Cart | null> {
    return prisma.cart.findUnique({ where: { userId }, include: cartInclude });
  }

  async findBySessionId(sessionId: string): Promise<Cart | null> {
    return prisma.cart.findUnique({ where: { sessionId }, include: cartInclude });
  }

  async createForUser(userId: string): Promise<Cart> {
    return prisma.cart.create({
      data: { userId },
      include: cartInclude,
    });
  }

  async createForGuest(sessionId: string, expiresAt: Date): Promise<Cart> {
    return prisma.cart.create({
      data: { sessionId, expiresAt },
      include: cartInclude,
    });
  }

  async addItem(cartId: string, data: Omit<CartItem, 'id' | 'cartId' | 'createdAt' | 'updatedAt'>): Promise<CartItem> {
    return prisma.cartItem.upsert({
      where: {
        cartId_productId_variantId: {
          cartId,
          productId: data.productId,
          variantId: data.variantId ?? '',
        },
      },
      update: { quantity: { increment: data.quantity }, price: data.price },
      create: { cartId, ...data },
    });
  }

  async updateItemQuantity(itemId: string, quantity: number): Promise<CartItem> {
    return prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
  }

  async removeItem(itemId: string): Promise<void> {
    await prisma.cartItem.delete({ where: { id: itemId } });
  }

  async clearCart(cartId: string): Promise<void> {
    await prisma.cartItem.deleteMany({ where: { cartId } });
    await prisma.cart.update({ where: { id: cartId }, data: { couponId: null } });
  }

  async applyCoupon(cartId: string, couponId: string): Promise<Cart> {
    return prisma.cart.update({
      where: { id: cartId },
      data: { couponId },
      include: cartInclude,
    });
  }

  async removeCoupon(cartId: string): Promise<Cart> {
    return prisma.cart.update({
      where: { id: cartId },
      data: { couponId: null },
      include: cartInclude,
    });
  }

  async findItemById(itemId: string): Promise<CartItem | null> {
    return prisma.cartItem.findUnique({ where: { id: itemId } });
  }

  async mergeGuestCart(userId: string, sessionId: string): Promise<void> {
    const guestCart = await this.findBySessionId(sessionId);
    if (!guestCart) return;

    const userCart = await this.findByUserId(userId);
    if (!userCart) {
      await prisma.cart.update({
        where: { id: guestCart.id },
        data: { userId, sessionId: null, expiresAt: null },
      });
      return;
    }

    const guestItems = (guestCart as unknown as { items: CartItem[] }).items;
    for (const item of guestItems) {
      await this.addItem(userCart.id, {
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.price,
      });
    }

    await prisma.cart.delete({ where: { id: guestCart.id } });
  }
}
