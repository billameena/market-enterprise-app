import Stripe from 'stripe';
import { Payment } from '@prisma/client';
import { PaymentsRepository } from './payments.repository';
import { CreatePaymentIntentInput, RefundInput } from './payments.types';
import { AppError } from '../../middlewares/error.middleware';
import { prisma } from '../../configs/database';
import { env } from '../../configs/env';
import { emailQueue } from '../../jobs/email.job';
import { notificationQueue } from '../../jobs/notification.job';
import { emitToUser } from '../../configs/socket';
import { logger } from '../../configs/logger';

const stripe = new Stripe(env.STRIPE_SECRET_KEY ?? 'sk_test_placeholder', {
  apiVersion: '2023-10-16',
});

const repo = new PaymentsRepository();

export class PaymentsService {
  async createPaymentIntent(userId: string, input: CreatePaymentIntentInput): Promise<{ clientSecret: string; paymentIntentId: string }> {
    const order = await prisma.order.findFirst({
      where: { id: input.orderId, userId },
    });

    if (!order) throw AppError.notFound('Order');
    if ((order as unknown as { paymentStatus: string }).paymentStatus === 'PAID') {
      throw AppError.conflict('Order is already paid');
    }

    const amountInCents = Math.round(Number(order.totalAmount) * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: env.STRIPE_CURRENCY,
      metadata: {
        orderId: order.id,
        orderNumber: (order as unknown as { orderNumber: string }).orderNumber,
        userId,
      },
    });

    await repo.create({
      order: { connect: { id: order.id } },
      method: 'STRIPE',
      status: 'PENDING',
      amount: order.totalAmount,
      currency: env.STRIPE_CURRENCY.toUpperCase(),
      stripePaymentIntentId: paymentIntent.id,
    });

    return {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
    };
  }

  async handleWebhook(rawBody: Buffer, signature: string): Promise<void> {
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        env.STRIPE_WEBHOOK_SECRET ?? 'whsec_placeholder',
      );
    } catch (err) {
      logger.error('Webhook signature verification failed', { error: err });
      throw AppError.badRequest('Invalid webhook signature');
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
        break;
      case 'charge.refunded':
        await this.handleRefund(event.data.object as Stripe.Charge);
        break;
      default:
        logger.info('Unhandled webhook event', { type: event.type });
    }
  }

  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const payment = await repo.findByStripeId(paymentIntent.id);
    if (!payment) return;

    await repo.update(payment.id, {
      status: 'PAID',
      stripeChargeId: paymentIntent.latest_charge as string,
      paidAt: new Date(),
    });

    const orderId = (payment as unknown as { orderId: string }).orderId;
    await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: 'PAID', status: 'CONFIRMED' },
    });

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (order) {
      const userId = (order as unknown as { userId: string }).userId;
      await emailQueue.add('send-order-confirmation', { orderId, userId });
      await notificationQueue.add('in-app-notification', {
        userId,
        type: 'PAYMENT_SUCCESS',
        title: 'Payment Successful',
        body: `Payment for order #${(order as unknown as { orderNumber: string }).orderNumber} confirmed`,
        metadata: { orderId },
      });
      try {
        emitToUser(userId, 'payment:confirmed', { orderId });
      } catch {
        // Not critical
      }
    }
  }

  private async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const payment = await repo.findByStripeId(paymentIntent.id);
    if (!payment) return;

    await repo.update(payment.id, {
      status: 'FAILED',
      failureReason: paymentIntent.last_payment_error?.message,
    });

    const orderId = (payment as unknown as { orderId: string }).orderId;
    await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: 'FAILED', status: 'PAYMENT_FAILED' },
    });
  }

  private async handleRefund(charge: Stripe.Charge): Promise<void> {
    logger.info('Handling refund for charge', { chargeId: charge.id });
  }

  async confirmPayment(userId: string, input: { orderId: string; paymentIntentId: string }): Promise<void> {
    const order = await prisma.order.findFirst({
      where: { id: input.orderId, userId },
      include: { payments: true },
    });
    if (!order) throw AppError.notFound('Order');

    const payments = (order as unknown as { payments: { id: string; stripePaymentIntentId: string; status: string }[] }).payments;
    const payment = payments.find((p) => p.stripePaymentIntentId === input.paymentIntentId);
    if (!payment) throw AppError.notFound('Payment record');

    if (payment.status === 'PAID') return; // already confirmed

    await repo.update(payment.id, { status: 'PAID', paidAt: new Date() });
    await prisma.order.update({
      where: { id: input.orderId },
      data: { paymentStatus: 'PAID', status: 'CONFIRMED' },
    });

    try {
      await notificationQueue.add('in-app-notification', {
        userId,
        type: 'PAYMENT_SUCCESS',
        title: 'Payment Confirmed',
        body: `Payment for order #${(order as unknown as { orderNumber: string }).orderNumber} confirmed`,
        metadata: { orderId: input.orderId },
      });
      emitToUser(userId, 'payment:confirmed', { orderId: input.orderId });
    } catch { /* not critical */ }
  }

  async initiateRefund(userId: string, input: RefundInput): Promise<void> {
    const order = await prisma.order.findFirst({
      where: { id: input.orderId },
      include: { payments: true },
    });

    if (!order) throw AppError.notFound('Order');

    const payment = (order as unknown as { payments: Payment[] }).payments[0];
    if (!payment || (payment as unknown as { status: string }).status !== 'PAID') {
      throw AppError.badRequest('Order has no completed payment to refund');
    }

    const stripePaymentIntentId = (payment as unknown as { stripePaymentIntentId: string }).stripePaymentIntentId;
    const amountInCents = input.amount ? Math.round(input.amount * 100) : undefined;

    const refund = await stripe.refunds.create({
      payment_intent: stripePaymentIntentId,
      ...(amountInCents && { amount: amountInCents }),
      reason: 'requested_by_customer',
    });

    await repo.createRefund({
      payment: { connect: { id: payment.id } },
      amount: input.amount ?? Number(order.totalAmount),
      reason: input.reason,
      status: 'PROCESSED',
      stripeRefundId: refund.id,
      processedAt: new Date(),
    });
  }
}
