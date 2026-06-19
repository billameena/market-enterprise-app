import { Product, ProductInventory, Prisma } from '@prisma/client';
import { prisma } from '../../configs/database';
import { PaginatedResult } from '../../types/common.types';
import { buildPaginatedResult, parsePaginationQuery } from '../../utils/pagination';
import { ProductListQuery } from './products.types';

const productInclude = {
  category: true,
  images: { orderBy: { displayOrder: 'asc' as const } },
  variants: {
    include: { attributeValues: { include: { attribute: true } } },
  },
  inventory: true,
  tags: { include: { tag: true } },
  vendor: { select: { id: true, businessName: true, rating: true } },
  store: { select: { id: true, name: true, slug: true } },
};

async function getCategoryDescendantIds(categoryId: string): Promise<string[]> {
  const all: string[] = [categoryId];
  const children = await prisma.category.findMany({
    where: { parentId: categoryId, isActive: true },
    select: { id: true },
  });
  for (const child of children) {
    const descendants = await getCategoryDescendantIds(child.id);
    all.push(...descendants);
  }
  return all;
}

export class ProductsRepository {
  async findById(id: string): Promise<Product | null> {
    return prisma.product.findUnique({
      where: { id, deletedAt: null },
      include: productInclude,
    });
  }

  async findBySlug(slug: string): Promise<Product | null> {
    return prisma.product.findFirst({
      where: { slug, deletedAt: null, status: 'ACTIVE' },
      include: productInclude,
    });
  }

  async create(data: Prisma.ProductCreateInput): Promise<Product> {
    return prisma.product.create({ data, include: productInclude });
  }

  async update(id: string, data: Prisma.ProductUpdateInput): Promise<Product> {
    return prisma.product.update({ where: { id }, data, include: productInclude });
  }

  async softDelete(id: string): Promise<void> {
    await prisma.product.update({ where: { id }, data: { deletedAt: new Date(), status: 'ARCHIVED' } });
  }

  async findAll(query: ProductListQuery): Promise<PaginatedResult<Product>> {
    const { skip, take, page, pageSize } = parsePaginationQuery(query);

    // Expand categoryId to include all descendant subcategories
    const categoryIds = query.categoryId
      ? await getCategoryDescendantIds(query.categoryId)
      : null;

    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      ...(query.status ? { status: query.status } : { status: 'ACTIVE' }),
      ...(categoryIds && { categoryId: { in: categoryIds } }),
      ...(query.vendorId && { vendorId: query.vendorId }),
      ...(query.storeId && { storeId: query.storeId }),
      ...(query.isFeatured !== undefined && { isFeatured: query.isFeatured }),
      ...(query.minPrice !== undefined || query.maxPrice !== undefined
        ? {
            price: {
              ...(query.minPrice && { gte: query.minPrice }),
              ...(query.maxPrice && { lte: query.maxPrice }),
            },
          }
        : {}),
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' as const } },
          { description: { contains: query.search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: query.sortBy ? { [query.sortBy]: query.sortOrder ?? 'desc' } : { createdAt: 'desc' },
        include: {
          category: true,
          images: { where: { isPrimary: true }, take: 1 },
          inventory: true,
          vendor: { select: { id: true, businessName: true } },
          store: { select: { id: true, name: true, slug: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return buildPaginatedResult(products as Product[], total, page, pageSize);
  }

  async updateInventory(productId: string, quantity: number): Promise<ProductInventory> {
    return prisma.productInventory.upsert({
      where: { productId },
      update: { quantity },
      create: { productId, sku: `INV-${productId}`, quantity },
    });
  }

  async findRelated(productId: string, categoryId: string, limit = 8): Promise<Product[]> {
    const categoryIds = await getCategoryDescendantIds(categoryId);
    return prisma.product.findMany({
      where: { categoryId: { in: categoryIds }, status: 'ACTIVE', deletedAt: null, NOT: { id: productId } },
      take: limit,
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        inventory: true,
      },
      orderBy: { totalSold: 'desc' },
    }) as unknown as Product[];
  }
}
