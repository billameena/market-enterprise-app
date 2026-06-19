import { Request, Response, NextFunction } from 'express';
import { ProductsService } from './products.service';
import { sendSuccess, sendCreated, sendNoContent } from '../../utils/response';

const service = new ProductsService();

export class ProductsController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await service.createProduct(req.user!.id, req.body);
      sendCreated(res, product, 'Product created');
    } catch (e) { next(e); }
  }

  async getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await service.getProduct(req.params['id']!);
      sendSuccess(res, product);
    } catch (e) { next(e); }
  }

  async getBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await service.getProduct(req.params['slug']!);
      sendSuccess(res, product);
    } catch (e) { next(e); }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await service.listProducts(req.query as never);
      sendSuccess(res, result.items, 'Products fetched', 200, result.meta);
    } catch (e) { next(e); }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await service.updateProduct(req.user!.id, req.params['id']!, req.body);
      sendSuccess(res, product, 'Product updated');
    } catch (e) { next(e); }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await service.deleteProduct(req.user!.id, req.params['id']!);
      sendNoContent(res);
    } catch (e) { next(e); }
  }

  async uploadImages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const files = req.files as Express.Multer.File[];
      await service.uploadProductImages(req.user!.id, req.params['id']!, files);
      sendSuccess(res, null, 'Images uploaded');
    } catch (e) { next(e); }
  }

  async adminAction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await service.adminAction(req.params['id']!, req.body);
      sendSuccess(res, product, 'Action applied');
    } catch (e) { next(e); }
  }

  async getRelated(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const products = await service.getRelatedProducts(req.params['id']!);
      sendSuccess(res, products);
    } catch (e) { next(e); }
  }

  async updateInventory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await service.updateInventory(req.params['id']!, req.body);
      sendSuccess(res, null, 'Inventory updated');
    } catch (e) { next(e); }
  }
}
