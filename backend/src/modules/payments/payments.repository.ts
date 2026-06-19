import { Payment, PaymentRefund, Prisma } from '@prisma/client';
import { prisma } from '../../configs/database';

export class PaymentsRepository {
  async findByOrderId(orderId: string): Promise<Payment | null> {
    return prisma.payment.findFirst({ where: { orderId }, include: { refunds: true } });
  }

  async findByStripeId(intentId: string): Promise<Payment | null> {
    return prisma.payment.findUnique({ where: { stripePaymentIntentId: intentId }, include: { order: true } });
  }

  async create(data: Prisma.PaymentCreateInput): Promise<Payment> {
    return prisma.payment.create({ data });
  }

  async update(id: string, data: Prisma.PaymentUpdateInput): Promise<Payment> {
    return prisma.payment.update({ where: { id }, data });
  }

  async createRefund(data: Prisma.PaymentRefundCreateInput): Promise<PaymentRefund> {
    return prisma.paymentRefund.create({ data });
  }
}
