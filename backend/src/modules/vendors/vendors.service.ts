import { Vendor, Store, UserRole } from '@prisma/client';
import { VendorsRepository } from './vendors.repository';
import {
  CreateVendorApplicationInput,
  UpdateVendorProfileInput,
  CreateStoreInput,
  UpdateStoreInput,
  AdminApproveVendorInput,
  VendorListQuery,
} from './vendors.types';
import { AppError } from '../../middlewares/error.middleware';
import { prisma } from '../../configs/database';
import { emailQueue } from '../../jobs/email.job';
import { PaginatedResult } from '../../types/common.types';

const repo = new VendorsRepository();

export class VendorsService {
  async applyForVendor(userId: string, input: CreateVendorApplicationInput): Promise<Vendor> {
    const existing = await repo.findByUserId(userId);
    if (existing) throw AppError.conflict('You already have a vendor application');

    const emailTaken = await prisma.vendor.findFirst({ where: { businessEmail: input.businessEmail } });
    if (emailTaken) throw AppError.conflict('Business email is already in use');

    const vendor = await repo.create({
      user: { connect: { id: userId } },
      businessName: input.businessName,
      businessEmail: input.businessEmail,
      businessPhone: input.businessPhone,
      description: input.description,
      taxId: input.taxId,
    });

    await prisma.user.update({ where: { id: userId }, data: { role: UserRole.VENDOR } });

    return vendor;
  }

  async getMyVendorProfile(userId: string): Promise<Vendor> {
    const vendor = await repo.findByUserId(userId);
    if (!vendor) throw AppError.notFound('Vendor profile');
    return vendor;
  }

  async updateVendorProfile(userId: string, input: UpdateVendorProfileInput): Promise<Vendor> {
    const vendor = await repo.findByUserId(userId);
    if (!vendor) throw AppError.notFound('Vendor profile');
    return repo.update(vendor.id, input);
  }

  async getPublicVendorProfile(vendorId: string): Promise<Vendor> {
    const vendor = await repo.findById(vendorId);
    if (!vendor) throw AppError.notFound('Vendor');
    return vendor;
  }

  // Store management
  async createStore(userId: string, input: CreateStoreInput): Promise<Store> {
    const vendor = await repo.findByUserId(userId);
    if (!vendor) throw AppError.notFound('Vendor profile');
    if (vendor.status !== 'APPROVED') throw AppError.forbidden('Vendor not approved yet');

    const existing = await repo.findStoreByVendorId(vendor.id);
    if (existing) throw AppError.conflict('You already have a store');

    const slugTaken = await repo.findStoreBySlug(input.slug);
    if (slugTaken) throw AppError.conflict('Store slug is already taken');

    return repo.createStore({
      vendor: { connect: { id: vendor.id } },
      ...input,
    });
  }

  async updateStore(userId: string, input: UpdateStoreInput): Promise<Store> {
    const vendor = await repo.findByUserId(userId);
    if (!vendor) throw AppError.notFound('Vendor profile');

    const store = await repo.findStoreByVendorId(vendor.id);
    if (!store) throw AppError.notFound('Store');

    if (input.slug && input.slug !== store.slug) {
      const slugTaken = await repo.findStoreBySlug(input.slug);
      if (slugTaken) throw AppError.conflict('Store slug is already taken');
    }

    return repo.updateStore(store.id, input);
  }

  async getMyStats(userId: string) {
    const vendor = await repo.findByUserId(userId);
    if (!vendor) throw AppError.notFound('Vendor profile');

    const [totalProducts, orderItemAgg] = await Promise.all([
      prisma.product.count({ where: { vendorId: vendor.id, deletedAt: null } }),
      prisma.orderItem.aggregate({
        where: { vendorId: vendor.id },
        _sum: { totalPrice: true },
        _count: { id: true },
      }),
    ]);

    const totalRevenue = Number(orderItemAgg._sum.totalPrice ?? 0);
    const totalOrders = orderItemAgg._count.id;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return { totalProducts, totalOrders, totalRevenue, averageOrderValue };
  }

  async getMyProducts(userId: string, query: { page?: number; limit?: number }) {
    const vendor = await repo.findByUserId(userId);
    if (!vendor) throw AppError.notFound('Vendor profile');

    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: { vendorId: vendor.id, deletedAt: null },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          images: { take: 1, orderBy: { displayOrder: 'asc' } },
          category: { select: { id: true, name: true } },
          inventory: { select: { quantity: true } },
        },
      }),
      prisma.product.count({ where: { vendorId: vendor.id, deletedAt: null } }),
    ]);

    return { products, total, pages: Math.ceil(total / limit), page };
  }

  async getMyOrders(userId: string, query: { page?: number; limit?: number; status?: string }) {
    const vendor = await repo.findByUserId(userId);
    if (!vendor) throw AppError.notFound('Vendor profile');

    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const skip = (page - 1) * limit;

    const where = {
      items: { some: { vendorId: vendor.id } },
      ...(query.status && { status: query.status as never }),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: { where: { vendorId: vendor.id }, select: { id: true, productName: true, quantity: true, unitPrice: true, totalPrice: true, status: true } },
          user: { select: { firstName: true, lastName: true, email: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return { orders, total, pages: Math.ceil(total / limit), page };
  }

  async getMyAnalytics(userId: string, period = '30d') {
    const vendor = await repo.findByUserId(userId);
    if (!vendor) throw AppError.notFound('Vendor profile');

    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const items = await prisma.orderItem.findMany({
      where: { vendorId: vendor.id, createdAt: { gte: since } },
      select: { createdAt: true, totalPrice: true, quantity: true, productName: true },
      orderBy: { createdAt: 'asc' },
    });

    // Group revenue by date
    const revenueByDate = new Map<string, { revenue: number; orders: number }>();
    for (let i = 0; i < days; i++) {
      const d = new Date(since);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      revenueByDate.set(key, { revenue: 0, orders: 0 });
    }
    for (const item of items) {
      const key = item.createdAt.toISOString().slice(0, 10);
      const existing = revenueByDate.get(key) ?? { revenue: 0, orders: 0 };
      existing.revenue += Number(item.totalPrice);
      existing.orders += 1;
      revenueByDate.set(key, existing);
    }
    const revenue = Array.from(revenueByDate.entries()).map(([date, v]) => ({ date, ...v }));

    // Top 5 products by revenue
    const productMap = new Map<string, { name: string; revenue: number; units: number }>();
    for (const item of items) {
      const existing = productMap.get(item.productName) ?? { name: item.productName, revenue: 0, units: 0 };
      existing.revenue += Number(item.totalPrice);
      existing.units += item.quantity;
      productMap.set(item.productName, existing);
    }
    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return { revenue, topProducts, period };
  }

  // Admin
  async getAllVendors(query: VendorListQuery): Promise<PaginatedResult<Vendor>> {
    return repo.findAll(query);
  }

  async adminAction(vendorId: string, input: AdminApproveVendorInput): Promise<Vendor> {
    const vendor = await repo.findById(vendorId);
    if (!vendor) throw AppError.notFound('Vendor');

    const updateData: Parameters<typeof repo.update>[1] = {};

    if (input.action === 'approve') {
      updateData.status = 'APPROVED';
      updateData.isVerified = true;
      updateData.verifiedAt = new Date();
      if (input.commissionRate !== undefined) {
        updateData.commissionRate = input.commissionRate;
      }
    } else if (input.action === 'reject') {
      updateData.status = 'REJECTED';
      updateData.rejectionReason = input.reason;
    } else if (input.action === 'suspend') {
      updateData.status = 'SUSPENDED';
      updateData.rejectionReason = input.reason;
    }

    const updated = await repo.update(vendorId, updateData);

    await emailQueue.add(`vendor-${input.action}`, {
      vendorId,
      action: input.action,
      reason: input.reason,
    });

    return updated;
  }
}
