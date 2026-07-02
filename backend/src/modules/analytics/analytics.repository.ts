import { prisma } from '../../configs/database';
import { DashboardStats, VendorStats, RevenueDataPoint } from './analytics.types';
import { subDays, startOfDay, endOfDay } from 'date-fns';

export class AnalyticsRepository {
  async getAdminDashboardStats(): Promise<DashboardStats> {
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const sixtyDaysAgo = subDays(now, 60);

    const [
      currentRevenue,
      previousRevenue,
      currentOrders,
      previousOrders,
      currentUsers,
      previousUsers,
      totalVendors,
      pendingVendors,
      pendingProducts,
      activeProducts,
      gmvResult,
      totalUsers,
      revenueTimeSeries,
    ] = await Promise.all([
      prisma.order.aggregate({ _sum: { totalAmount: true }, where: { createdAt: { gte: thirtyDaysAgo }, paymentStatus: 'PAID' } }),
      prisma.order.aggregate({ _sum: { totalAmount: true }, where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo }, paymentStatus: 'PAID' } }),
      prisma.order.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.order.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
      prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo }, deletedAt: null } }),
      prisma.user.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo }, deletedAt: null } }),
      prisma.vendor.count({ where: { status: 'APPROVED' } }),
      prisma.vendor.count({ where: { status: 'PENDING' } }),
      prisma.product.count({ where: { status: 'PENDING_REVIEW', deletedAt: null } }),
      prisma.product.count({ where: { status: 'ACTIVE', deletedAt: null } }),
      prisma.order.aggregate({ _sum: { totalAmount: true }, where: { paymentStatus: 'PAID' } }),
      prisma.user.count({ where: { deletedAt: null } }),
      this.getRevenueTimeSeries(30),
    ]);

    const curRevenue = Number(currentRevenue._sum.totalAmount ?? 0);
    const prevRevenue = Number(previousRevenue._sum.totalAmount ?? 0);

    return {
      totalRevenue: curRevenue,
      totalOrders: currentOrders,
      totalUsers,
      totalVendors,
      gmv: Number(gmvResult._sum.totalAmount ?? 0),
      pendingVendors,
      pendingProducts,
      activeProducts,
      revenueGrowth: prevRevenue > 0 ? ((curRevenue - prevRevenue) / prevRevenue) * 100 : 0,
      orderGrowth: previousOrders > 0 ? ((currentOrders - previousOrders) / previousOrders) * 100 : 0,
      userGrowth: previousUsers > 0 ? ((currentUsers - previousUsers) / previousUsers) * 100 : 0,
      revenueTimeSeries,
    };
  }

  async getRevenueTimeSeries(days = 30): Promise<RevenueDataPoint[]> {
    const points: RevenueDataPoint[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const start = startOfDay(date);
      const end = endOfDay(date);

      const result = await prisma.order.aggregate({
        _sum: { totalAmount: true },
        _count: { id: true },
        where: { createdAt: { gte: start, lte: end }, paymentStatus: 'PAID' },
      });

      points.push({
        date: start.toISOString().split('T')[0]!,
        revenue: Number(result._sum.totalAmount ?? 0),
        orders: result._count.id,
      });
    }
    return points;
  }

  async getVendorStats(vendorId: string): Promise<VendorStats> {
    const [revenueResult, orderCount, productCount, topProducts] = await Promise.all([
      prisma.orderItem.aggregate({
        _sum: { totalPrice: true },
        where: { vendorId, order: { paymentStatus: 'PAID' } },
      }),
      prisma.orderItem.findMany({ where: { vendorId }, select: { orderId: true }, distinct: ['orderId'] }),
      prisma.product.count({ where: { vendorId, deletedAt: null } }),
      prisma.orderItem.groupBy({
        by: ['productName'],
        where: { vendorId, order: { paymentStatus: 'PAID' } },
        _sum: { totalPrice: true, quantity: true },
        orderBy: { _sum: { totalPrice: 'desc' } },
        take: 5,
      }),
    ]);

    const totalRevenue = Number(revenueResult._sum.totalPrice ?? 0);
    const totalOrders = orderCount.length;

    return {
      totalRevenue,
      totalOrders,
      totalProducts: productCount,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      topProducts: topProducts.map((p) => ({
        name: p.productName,
        sales: p._sum.quantity ?? 0,
        revenue: Number(p._sum.totalPrice ?? 0),
      })),
    };
  }
}
