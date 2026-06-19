import { Request, Response, NextFunction } from 'express';
import { CategoriesService } from './categories.service';
import { sendSuccess, sendCreated, sendNoContent } from '../../utils/response';

const service = new CategoriesService();

export class CategoriesController {
  async getTree(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      sendSuccess(res, await service.getCategoryTree());
    } catch (e) { next(e); }
  }

  async getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      sendSuccess(res, await service.getCategory(req.params['id']!));
    } catch (e) { next(e); }
  }

  async getBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      sendSuccess(res, await service.getCategoryBySlug(req.params['slug']!));
    } catch (e) { next(e); }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      sendCreated(res, await service.createCategory(req.body), 'Category created');
    } catch (e) { next(e); }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      sendSuccess(res, await service.updateCategory(req.params['id']!, req.body), 'Category updated');
    } catch (e) { next(e); }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await service.deleteCategory(req.params['id']!);
      sendNoContent(res);
    } catch (e) { next(e); }
  }
}
