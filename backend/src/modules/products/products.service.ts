import { Product } from '@prisma/client';
import { ProductsRepository } from './products.repository';
import {
  CreateProductInput,
  UpdateProductInput,
  ProductListQuery,
  AdminProductActionInput,
  UpdateInventoryInput,
} from './products.types';
import { AppError } from '../../middlewares/error.middleware';
import { generateSKU } from '../../utils/sku';
import { uploadImage } from '../../utils/cloudinary';
import { cache } from '../../configs/redis';
import { prisma } from '../../configs/database';
import { PaginatedResult } from '../../types/common.types';

const repo = new ProductsRepository();

function buildSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export class ProductsService {
  async createProduct(userId: string, input: CreateProductInput): Promise<Product> {
    const vendor = await prisma.vendor.findUnique({ where: { userId }, include: { store: true } });
    if (!vendor) throw AppError.forbidden('Vendor profile required');
    if (vendor.status !== 'APPROVED') throw AppError.forbidden('Vendor not approved');
    if (!vendor.store) throw AppError.forbidden('Store required before adding products');

    const slug = buildSlug(input.name);
    const sku = generateSKU(input.name);

    const product = await repo.create({
      vendor: { connect: { id: vendor.id } },
      store: { connect: { id: vendor.store.id } },
      category: { connect: { id: input.categoryId } },
      name: input.name,
      slug: `${slug}-${Date.now()}`,
      sku,
      description: input.description,
      shortDescription: input.shortDescription,
      price: input.price,
      comparePrice: input.comparePrice,
      costPrice: input.costPrice,
      weight: input.weight,
      isDigital: input.isDigital,
      requiresShipping: input.requiresShipping,
      metaTitle: input.metaTitle,
      metaDescription: input.metaDescription,
      status: 'PENDING_REVIEW',
      inventory: {
        create: {
          sku: `INV-${sku}`,
          quantity: input.inventory ?? 0,
        },
      },
    });

    return product;
  }

  async getProduct(identifier: string): Promise<Product> {
    const cacheKey = `product:${identifier}`;
    const cached = await cache.get<Product>(cacheKey);
    if (cached) return cached;

    const product = await (identifier.includes('-')
      ? repo.findBySlug(identifier)
      : repo.findById(identifier));

    if (!product) throw AppError.notFound('Product');

    await cache.set(cacheKey, product, 30 * 60);
    return product;
  }

  async listProducts(query: ProductListQuery): Promise<PaginatedResult<Product>> {
    return repo.findAll(query);
  }

  async updateProduct(userId: string, productId: string, input: UpdateProductInput): Promise<Product> {
    const product = await repo.findById(productId);
    if (!product) throw AppError.notFound('Product');

    const vendor = await prisma.vendor.findUnique({ where: { userId } });
    if (!vendor || (product as unknown as { vendorId: string }).vendorId !== vendor.id) {
      throw AppError.forbidden('You can only update your own products');
    }

    const { inventory, ...productFields } = input;
    await cache.del(`product:${productId}`);
    const updated = await repo.update(productId, { ...productFields, status: 'PENDING_REVIEW' });

    if (inventory !== undefined) {
      await repo.updateInventory(productId, inventory);
    }

    return updated;
  }

  async deleteProduct(userId: string, productId: string): Promise<void> {
    const product = await repo.findById(productId);
    if (!product) throw AppError.notFound('Product');

    const vendor = await prisma.vendor.findUnique({ where: { userId } });
    if (!vendor || (product as unknown as { vendorId: string }).vendorId !== vendor.id) {
      throw AppError.forbidden('You can only delete your own products');
    }

    await repo.softDelete(productId);
    await cache.del(`product:${productId}`);
  }

  async uploadProductImages(
    userId: string,
    productId: string,
    files: Express.Multer.File[],
  ): Promise<void> {
    const product = await repo.findById(productId);
    if (!product) throw AppError.notFound('Product');

    const vendor = await prisma.vendor.findUnique({ where: { userId } });
    if (!vendor || (product as unknown as { vendorId: string }).vendorId !== vendor.id) {
      throw AppError.forbidden('Unauthorized');
    }

    await Promise.all(
      files.map(async (file, index) => {
        const result = await uploadImage(file.buffer, `products/${productId}`);
        await prisma.productImage.create({
          data: {
            productId,
            url: result.url,
            displayOrder: index,
            isPrimary: index === 0,
            width: result.width,
            height: result.height,
          },
        });
      }),
    );

    await cache.del(`product:${productId}`);
  }

  async adminAction(productId: string, input: AdminProductActionInput): Promise<Product> {
    const product = await repo.findById(productId);
    if (!product) throw AppError.notFound('Product');

    const status = input.action === 'approve' ? 'ACTIVE' : 'REJECTED';
    const updated = await repo.update(productId, {
      status,
      rejectionReason: input.action === 'reject' ? input.reason : null,
      publishedAt: input.action === 'approve' ? new Date() : null,
    });

    await cache.del(`product:${productId}`);
    return updated;
  }

  async getRelatedProducts(productId: string): Promise<Product[]> {
    const product = await repo.findById(productId);
    if (!product) throw AppError.notFound('Product');
    return repo.findRelated(productId, (product as unknown as { categoryId: string }).categoryId);
  }

  async updateInventory(productId: string, input: UpdateInventoryInput): Promise<void> {
    await repo.updateInventory(productId, input.quantity);
    await cache.del(`product:${productId}`);
  }
}
