import { Order, Prisma } from '@prisma/client';
import { prisma } from '../../configs/database';
import { PaginatedResult } from '../../types/common.types';
import { buildPaginatedResult, parsePaginationQuery } from '../../utils/pagination';
import { OrderListQuery } from './orders.types';

const orderInclude = {
  items: {
    include: {
      product: { include: { images: { where: { isPrimary: true }, take: 1 } } },
      variant: true,
    },
  },
  shippingAddress: true,
  payments: true,
  statusHistory: { orderBy: { createdAt: 'desc' as const } },
  coupon: true,
};

export class OrdersRepository {
  async findById(id: string): Promise<Order | null> {
    return prisma.order.findUnique({ where: { id }, include: orderInclude });
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    return prisma.order.findUnique({ where: { orderNumber }, include: orderInclude });
  }

  async findAll(query: OrderListQuery, filters: Prisma.OrderWhereInput = {}): Promise<PaginatedResult<Order>> {
    const { skip, take, page, pageSize } = parsePaginationQuery(query);
    const where: Prisma.OrderWhereInput = {
      ...filters,
      ...(query.status && { status: query.status }),
      ...(query.search && {
        OR: [
          { orderNumber: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
      ...(query.dateFrom || query.dateTo
        ? {
            createdAt: {
              ...(query.dateFrom && { gte: new Date(query.dateFrom) }),
              ...(query.dateTo && { lte: new Date(query.dateTo) }),
            },
          }
        : {}),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          items: { take: 3 },
          shippingAddress: true,
          payments: { take: 1 },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return buildPaginatedResult(orders as Order[], total, page, pageSize);
  }

  async create(data: Prisma.OrderCreateInput): Promise<Order> {
    return prisma.order.create({ data, include: orderInclude });
  }

  async update(id: string, data: Prisma.OrderUpdateInput): Promise<Order> {
    return prisma.order.update({ where: { id }, data, include: orderInclude });
  }

  async addStatusHistory(orderId: string, status: string, comment?: string, changedBy?: string): Promise<void> {
    await prisma.orderStatusHistory.create({
      data: { orderId, status: status as import('@prisma/client').OrderStatus, comment, changedBy },
    });
  }
}
