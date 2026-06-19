import Stripe from 'stripe';
import { Order, OrderStatus } from '@prisma/client';
import { OrdersRepository } from './orders.repository';
import { CreateOrderInput, CreateOrderResult, UpdateOrderStatusInput, OrderListQuery } from './orders.types';
import { CartService } from '../cart/cart.service';
import { AppError } from '../../middlewares/error.middleware';
import { prisma } from '../../configs/database';
import { env } from '../../configs/env';
import { generateOrderNumber } from '../../utils/crypto';
import { emailQueue } from '../../jobs/email.job';
import { notificationQueue } from '../../jobs/notification.job';
import { emitToUser } from '../../configs/socket';
import { PaginatedResult } from '../../types/common.types';

const stripe = new Stripe(env.STRIPE_SECRET_KEY ?? 'sk_test_placeholder', {
  apiVersion: '2023-10-16',
});

function isStripeConfigured(): boolean {
  const key = env.STRIPE_SECRET_KEY ?? '';
  return key.startsWith('sk_') && key.length > 40;
}

const repo = new OrdersRepository();
const cartService = new CartService();

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED', 'PAYMENT_FAILED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: ['COMPLETED', 'REFUNDED'],
  COMPLETED: ['REFUNDED'],
  CANCELLED: [],
  REFUNDED: [],
  PAYMENT_FAILED: ['PENDING'],
};

export class OrdersService {
  async createOrder(userId: string, input: CreateOrderInput): Promise<CreateOrderResult> {
    const cartSummary = await cartService.getCart(userId);
    if (cartSummary.items.length === 0) {
      throw AppError.badRequest('Cart is empty');
    }

    // Resolve vendorId for each cart item from the product record
    const productIds = [...new Set(cartSummary.items.map((i) => i.productId))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, vendorId: true },
    });
    const vendorByProduct = new Map(products.map((p) => [p.id, p.vendorId ?? 'unknown']));

    const orderNumber = generateOrderNumber();
    const addr = input.shippingAddress;

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId,
          orderNumber,
          subtotal: cartSummary.subtotal,
          discountAmount: cartSummary.discountAmount,
          taxAmount: cartSummary.taxAmount,
          shippingAmount: cartSummary.shippingAmount,
          totalAmount: cartSummary.total,
          notes: input.notes,
          shippingAddress: {
            create: {
              firstName: addr.firstName,
              lastName: addr.lastName,
              phone: addr.phone,
              addressLine1: addr.addressLine1,
              addressLine2: addr.addressLine2,
              city: addr.city,
              state: addr.state,
              postalCode: addr.postalCode,
              country: addr.country,
            },
          },
          items: {
            create: cartSummary.items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              vendorId: vendorByProduct.get(item.productId) ?? 'unknown',
              productName: item.productName,
              variantName: item.variantName,
              sku: item.sku,
              imageUrl: item.imageUrl,
              quantity: item.quantity,
              unitPrice: item.price,
              totalPrice: item.total,
            })),
          },
          statusHistory: {
            create: { status: 'PENDING', changedBy: userId },
          },
        },
        include: { items: true, shippingAddress: true },
      });

      // Reserve inventory
      for (const item of cartSummary.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
        } else {
          await tx.productInventory.updateMany({
            where: { productId: item.productId },
            data: { reservedQuantity: { increment: item.quantity } },
          });
        }
      }

      // Clear cart
      const cart = await tx.cart.findUnique({ where: { userId } });
      if (cart) {
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
        await tx.cart.update({ where: { id: cart.id }, data: { couponId: null } });
      }

      return newOrder;
    });

    // Create Stripe PaymentIntent (or return a mock secret when keys are not configured)
    const amountInCents = Math.round(Number(cartSummary.total) * 100);
    let clientSecret: string;

    if (isStripeConfigured()) {
      const intent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: env.STRIPE_CURRENCY ?? 'usd',
        metadata: { orderId: order.id, orderNumber, userId },
      });
      clientSecret = intent.client_secret!;

      await prisma.payment.create({
        data: {
          orderId: order.id,
          method: 'STRIPE',
          status: 'PENDING',
          amount: cartSummary.total,
          currency: (env.STRIPE_CURRENCY ?? 'usd').toUpperCase(),
          stripePaymentIntentId: intent.id,
        },
      });
    } else {
      // Stripe not configured — return a recognisable mock secret the frontend handles directly
      clientSecret = `mock_${order.id}`;
      await prisma.payment.create({
        data: {
          orderId: order.id,
          method: 'STRIPE',
          status: 'PENDING',
          amount: cartSummary.total,
          currency: 'USD',
          stripePaymentIntentId: `mock_${order.id}`,
        },
      });
    }

    // Background notifications
    try {
      await emailQueue.add('send-order-confirmation', { orderId: order.id, userId });
    } catch { /* not critical */ }
    try {
      await notificationQueue.add('in-app-notification', {
        userId,
        type: 'ORDER_PLACED',
        title: 'Order Placed',
        body: `Your order ${orderNumber} has been placed successfully`,
        metadata: { orderId: order.id },
      });
    } catch { /* not critical */ }
    try {
      emitToUser(userId, 'order:created', { orderId: order.id, orderNumber });
    } catch { /* not critical */ }

    return {
      orderId: order.id,
      orderNumber,
      clientSecret,
      amount: Number(cartSummary.total),
    };
  }

  async getOrder(orderId: string, userId?: string): Promise<Order> {
    const order = await repo.findById(orderId);
    if (!order) throw AppError.notFound('Order');

    if (userId && (order as unknown as { userId: string }).userId !== userId) {
      throw AppError.forbidden('Access denied');
    }

    return order;
  }

  async getUserOrders(userId: string, query: OrderListQuery): Promise<PaginatedResult<Order>> {
    return repo.findAll(query, { userId });
  }

  async getAllOrders(query: OrderListQuery): Promise<PaginatedResult<Order>> {
    return repo.findAll(query);
  }

  async getVendorOrders(vendorId: string, query: OrderListQuery): Promise<PaginatedResult<Order>> {
    return repo.findAll(query, {
      items: { some: { vendorId } },
    });
  }

  async updateOrderStatus(
    orderId: string,
    input: UpdateOrderStatusInput,
    changedBy: string,
  ): Promise<Order> {
    const order = await repo.findById(orderId);
    if (!order) throw AppError.notFound('Order');

    const currentStatus = (order as unknown as { status: OrderStatus }).status;
    const allowedTransitions = VALID_TRANSITIONS[currentStatus];

    if (!allowedTransitions.includes(input.status)) {
      throw AppError.badRequest(
        `Cannot transition order from ${currentStatus} to ${input.status}`,
      );
    }

    const updateData: Record<string, unknown> = { status: input.status };
    if (input.status === 'SHIPPED') updateData['shippedAt'] = new Date();
    if (input.status === 'DELIVERED') updateData['deliveredAt'] = new Date();
    if (input.status === 'COMPLETED') updateData['completedAt'] = new Date();
    if (input.status === 'CANCELLED') updateData['cancelledAt'] = new Date();

    const updated = await repo.update(orderId, updateData);
    await repo.addStatusHistory(orderId, input.status, input.comment, changedBy);

    const orderUserId = (order as unknown as { userId: string }).userId;

    await notificationQueue.add('in-app-notification', {
      userId: orderUserId,
      type: `ORDER_${input.status}`,
      title: `Order ${input.status.replace('_', ' ')}`,
      body: `Your order #${(order as unknown as { orderNumber: string }).orderNumber} is now ${input.status.toLowerCase().replace('_', ' ')}`,
      metadata: { orderId },
    });

    try {
      emitToUser(orderUserId, 'order:status_changed', { orderId, status: input.status });
    } catch {
      // Socket not critical
    }

    return updated;
  }

  async cancelOrder(orderId: string, userId: string, reason?: string): Promise<Order> {
    const order = await repo.findById(orderId);
    if (!order) throw AppError.notFound('Order');

    const orderUserId = (order as unknown as { userId: string }).userId;
    if (orderUserId !== userId) throw AppError.forbidden('Access denied');

    const currentStatus = (order as unknown as { status: OrderStatus }).status;
    if (!['PENDING', 'CONFIRMED'].includes(currentStatus)) {
      throw AppError.badRequest('Order cannot be cancelled at this stage');
    }

    const updated = await repo.update(orderId, {
      status: 'CANCELLED',
      cancelReason: reason,
      cancelledAt: new Date(),
    });

    await repo.addStatusHistory(orderId, 'CANCELLED', reason, userId);

    return updated;
  }
}
