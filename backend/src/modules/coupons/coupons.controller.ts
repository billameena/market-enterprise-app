import { Request, Response, NextFunction } from 'express';
import { CouponsService } from './coupons.service';
import { sendSuccess, sendCreated, sendNoContent } from '../../utils/response';

const service = new CouponsService();

export class CouponsController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      sendCreated(res, await service.createCoupon(req.body), 'Coupon created');
    } catch (e) { next(e); }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await service.getAllCoupons(req.query as never);
      sendSuccess(res, result.items, 'Coupons fetched', 200, result.meta);
    } catch (e) { next(e); }
  }

  async validate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await service.validateCoupon(req.body, req.user?.id);
      sendSuccess(res, result);
    } catch (e) { next(e); }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      sendSuccess(res, await service.updateCoupon(req.params['id']!, req.body), 'Coupon updated');
    } catch (e) { next(e); }
  }

  async deactivate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      sendSuccess(res, await service.deactivateCoupon(req.params['id']!), 'Coupon deactivated');
    } catch (e) { next(e); }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await service.deleteCoupon(req.params['id']!);
      sendNoContent(res);
    } catch (e) { next(e); }
  }
}
