import { Request, Response, NextFunction } from 'express';
import { PaymentsService } from './payments.service';
import { sendSuccess, sendCreated } from '../../utils/response';

const service = new PaymentsService();

export class PaymentsController {
  async createIntent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await service.createPaymentIntent(req.user!.id, req.body);
      sendCreated(res, result);
    } catch (e) { next(e); }
  }

  async webhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sig = req.headers['stripe-signature'] as string;
      await service.handleWebhook(req.body as Buffer, sig);
      res.json({ received: true });
    } catch (e) { next(e); }
  }

  async confirm(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await service.confirmPayment(req.user!.id, req.body);
      sendSuccess(res, null, 'Payment confirmed');
    } catch (e) { next(e); }
  }

  async refund(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await service.initiateRefund(req.user!.id, req.body);
      sendSuccess(res, null, 'Refund initiated');
    } catch (e) { next(e); }
  }
}
