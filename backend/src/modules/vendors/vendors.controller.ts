import { Request, Response, NextFunction } from 'express';
import { VendorsService } from './vendors.service';
import { sendSuccess, sendCreated } from '../../utils/response';

const service = new VendorsService();

export class VendorsController {
  async apply(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const vendor = await service.applyForVendor(req.user!.id, req.body);
      sendCreated(res, vendor, 'Vendor application submitted');
    } catch (e) { next(e); }
  }

  async getMyProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const vendor = await service.getMyVendorProfile(req.user!.id);
      sendSuccess(res, vendor);
    } catch (e) { next(e); }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const vendor = await service.updateVendorProfile(req.user!.id, req.body);
      sendSuccess(res, vendor, 'Profile updated');
    } catch (e) { next(e); }
  }

  async getPublicProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const vendor = await service.getPublicVendorProfile(req.params['id']!);
      sendSuccess(res, vendor);
    } catch (e) { next(e); }
  }

  async createStore(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const store = await service.createStore(req.user!.id, req.body);
      sendCreated(res, store, 'Store created');
    } catch (e) { next(e); }
  }

  async updateStore(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const store = await service.updateStore(req.user!.id, req.body);
      sendSuccess(res, store, 'Store updated');
    } catch (e) { next(e); }
  }

  async getMyStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await service.getMyStats(req.user!.id);
      sendSuccess(res, stats);
    } catch (e) { next(e); }
  }

  async getMyProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await service.getMyProducts(req.user!.id, req.query as { page?: number; limit?: number });
      sendSuccess(res, result);
    } catch (e) { next(e); }
  }

  async getMyOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await service.getMyOrders(req.user!.id, req.query as never);
      sendSuccess(res, result);
    } catch (e) { next(e); }
  }

  async getMyAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const period = (req.query['period'] as string) ?? '30d';
      const result = await service.getMyAnalytics(req.user!.id, period);
      sendSuccess(res, result);
    } catch (e) { next(e); }
  }

  async getAllVendors(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await service.getAllVendors(req.query as never);
      sendSuccess(res, result.items, 'Vendors fetched', 200, result.meta);
    } catch (e) { next(e); }
  }

  async adminAction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const vendor = await service.adminAction(req.params['id']!, req.body);
      sendSuccess(res, vendor, 'Action applied');
    } catch (e) { next(e); }
  }
}
