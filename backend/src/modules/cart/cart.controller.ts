import { Request, Response, NextFunction } from 'express';
import { CartService } from './cart.service';
import { sendSuccess, sendNoContent } from '../../utils/response';

const service = new CartService();

export class CartController {
  private getCartIdentifiers(req: Request): { userId?: string; sessionId?: string } {
    return {
      userId: req.user?.id,
      sessionId: req.headers['x-session-id'] as string | undefined,
    };
  }

  async getCart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, sessionId } = this.getCartIdentifiers(req);
      const cart = await service.getCart(userId, sessionId);
      sendSuccess(res, cart);
    } catch (e) { next(e); }
  }

  async addItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, sessionId } = this.getCartIdentifiers(req);
      const cart = await service.addToCart(req.body, userId, sessionId);
      sendSuccess(res, cart, 'Item added to cart');
    } catch (e) { next(e); }
  }

  async updateItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, sessionId } = this.getCartIdentifiers(req);
      const cart = await service.updateCartItem(req.params['itemId']!, req.body, userId, sessionId);
      sendSuccess(res, cart, 'Cart updated');
    } catch (e) { next(e); }
  }

  async removeItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, sessionId } = this.getCartIdentifiers(req);
      const cart = await service.removeFromCart(req.params['itemId']!, userId, sessionId);
      sendSuccess(res, cart, 'Item removed');
    } catch (e) { next(e); }
  }

  async clearCart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, sessionId } = this.getCartIdentifiers(req);
      await service.clearCart(userId, sessionId);
      sendNoContent(res);
    } catch (e) { next(e); }
  }

  async applyCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, sessionId } = this.getCartIdentifiers(req);
      const cart = await service.applyCoupon(req.body.couponCode, userId, sessionId);
      sendSuccess(res, cart, 'Coupon applied');
    } catch (e) { next(e); }
  }

  async removeCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, sessionId } = this.getCartIdentifiers(req);
      const cart = await service.removeCoupon(userId, sessionId);
      sendSuccess(res, cart, 'Coupon removed');
    } catch (e) { next(e); }
  }
}
