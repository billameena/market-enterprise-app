import { Request, Response, NextFunction } from 'express';
import { OrdersService } from './orders.service';
import { sendSuccess, sendCreated } from '../../utils/response';

const service = new OrdersService();

export class OrdersController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await service.createOrder(req.user!.id, req.body);
      sendCreated(res, result, 'Order placed successfully');
    } catch (e) { next(e); }
  }

  async getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await service.getOrder(req.params['id']!, req.user?.id);
      sendSuccess(res, order);
    } catch (e) { next(e); }
  }

  async getMyOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await service.getUserOrders(req.user!.id, req.query as never);
      sendSuccess(res, result.items, 'Orders fetched', 200, result.meta);
    } catch (e) { next(e); }
  }

  async getAllOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await service.getAllOrders(req.query as never);
      sendSuccess(res, result.items, 'Orders fetched', 200, result.meta);
    } catch (e) { next(e); }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await service.updateOrderStatus(req.params['id']!, req.body, req.user!.id);
      sendSuccess(res, order, 'Order status updated');
    } catch (e) { next(e); }
  }

  async cancelOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await service.cancelOrder(req.params['id']!, req.user!.id, req.body.reason);
      sendSuccess(res, order, 'Order cancelled');
    } catch (e) { next(e); }
  }
}
