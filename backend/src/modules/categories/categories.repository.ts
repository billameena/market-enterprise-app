import { Category, Prisma } from '@prisma/client';
import { prisma } from '../../configs/database';

export class CategoriesRepository {
  async findAll(): Promise<Category[]> {
    return prisma.category.findMany({
      where: { isActive: true },
      include: { children: { where: { isActive: true } } },
      orderBy: [{ parentId: 'asc' }, { displayOrder: 'asc' }],
    });
  }

  async findRoots(): Promise<Category[]> {
    return prisma.category.findMany({
      where: { isActive: true, parentId: null },
      include: {
        children: {
          where: { isActive: true },
          include: { children: { where: { isActive: true } } },
          orderBy: { displayOrder: 'asc' },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async findById(id: string): Promise<Category | null> {
    return prisma.category.findUnique({ where: { id }, include: { children: true, parent: true } });
  }

  async findBySlug(slug: string): Promise<Category | null> {
    return prisma.category.findUnique({ where: { slug }, include: { children: { where: { isActive: true } } } });
  }

  async create(data: Prisma.CategoryCreateInput): Promise<Category> {
    return prisma.category.create({ data });
  }

  async update(id: string, data: Prisma.CategoryUpdateInput): Promise<Category> {
    return prisma.category.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await prisma.category.update({ where: { id }, data: { isActive: false } });
  }
}
