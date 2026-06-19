import { Request, Response, NextFunction } from 'express';
import { UsersService } from './users.service';
import { sendSuccess, sendCreated, sendNoContent } from '../../utils/response';

const service = new UsersService();

export class UsersController {
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await service.getProfile(req.user!.id);
      sendSuccess(res, user);
    } catch (e) { next(e); }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await service.updateProfile(req.user!.id, req.body);
      sendSuccess(res, user, 'Profile updated');
    } catch (e) { next(e); }
  }

  async uploadAvatar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) throw new Error('No file provided');
      const url = await service.uploadAvatar(req.user!.id, req.file.buffer, req.file.mimetype);
      sendSuccess(res, { avatarUrl: url }, 'Avatar updated');
    } catch (e) { next(e); }
  }

  async getAddresses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const addresses = await service.getAddresses(req.user!.id);
      sendSuccess(res, addresses);
    } catch (e) { next(e); }
  }

  async createAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const address = await service.createAddress(req.user!.id, req.body);
      sendCreated(res, address, 'Address added');
    } catch (e) { next(e); }
  }

  async updateAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const address = await service.updateAddress(req.user!.id, req.params['id']!, req.body);
      sendSuccess(res, address, 'Address updated');
    } catch (e) { next(e); }
  }

  async deleteAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await service.deleteAddress(req.user!.id, req.params['id']!);
      sendNoContent(res);
    } catch (e) { next(e); }
  }

  // Admin
  async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await service.getAllUsers(req.query as never);
      sendSuccess(res, result.items, 'Users fetched', 200, result.meta);
    } catch (e) { next(e); }
  }

  async adminUpdateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await service.adminUpdateUser(req.params['id']!, req.body);
      sendSuccess(res, user, 'User updated');
    } catch (e) { next(e); }
  }
}
