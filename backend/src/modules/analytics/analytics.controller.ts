import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from './analytics.service';
import { sendSuccess } from '../../utils/response';

const service = new AnalyticsService();

export class AnalyticsController {
  async adminDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      sendSuccess(res, await service.getAdminDashboard());
    } catch (e) { next(e); }
  }

  async revenueChart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const days = parseInt(req.query['days'] as string) || 30;
      sendSuccess(res, await service.getRevenueChart(days));
    } catch (e) { next(e); }
  }

  async vendorDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      sendSuccess(res, await service.getVendorDashboard(req.user!.id));
    } catch (e) { next(e); }
  }
}
