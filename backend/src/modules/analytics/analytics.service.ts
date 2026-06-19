import { AnalyticsRepository } from './analytics.repository';
import { DashboardStats, VendorStats, RevenueDataPoint } from './analytics.types';
import { cache } from '../../configs/redis';
import { prisma } from '../../configs/database';
import { AppError } from '../../middlewares/error.middleware';

const repo = new AnalyticsRepository();

export class AnalyticsService {
  async getAdminDashboard(): Promise<DashboardStats> {
    const cacheKey = 'analytics:admin:dashboard';
    const cached = await cache.get<DashboardStats>(cacheKey);
    if (cached) return cached;

    const stats = await repo.getAdminDashboardStats();
    await cache.set(cacheKey, stats, 5 * 60); // 5 min cache
    return stats;
  }

  async getRevenueChart(days = 30): Promise<RevenueDataPoint[]> {
    const cacheKey = `analytics:revenue:${days}`;
    const cached = await cache.get<RevenueDataPoint[]>(cacheKey);
    if (cached) return cached;

    const data = await repo.getRevenueTimeSeries(days);
    await cache.set(cacheKey, data, 5 * 60);
    return data;
  }

  async getVendorDashboard(userId: string): Promise<VendorStats> {
    const vendor = await prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) throw AppError.notFound('Vendor profile');

    const cacheKey = `analytics:vendor:${vendor.id}`;
    const cached = await cache.get<VendorStats>(cacheKey);
    if (cached) return cached;

    const stats = await repo.getVendorStats(vendor.id);
    await cache.set(cacheKey, stats, 5 * 60);
    return stats;
  }
}
