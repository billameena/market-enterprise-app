import { Category } from '@prisma/client';
import { CategoriesRepository } from './categories.repository';
import { CreateCategoryInput, UpdateCategoryInput } from './categories.types';
import { AppError } from '../../middlewares/error.middleware';
import { cache } from '../../configs/redis';

const repo = new CategoriesRepository();

export class CategoriesService {
  async getCategoryTree(): Promise<Category[]> {
    const cacheKey = 'category:tree';
    const cached = await cache.get<Category[]>(cacheKey);
    if (cached) return cached;

    const tree = await repo.findRoots();
    await cache.set(cacheKey, tree, 60 * 60); // 1 hour
    return tree;
  }

  async getCategory(id: string): Promise<Category> {
    const category = await repo.findById(id);
    if (!category) throw AppError.notFound('Category');
    return category;
  }

  async getCategoryBySlug(slug: string): Promise<Category> {
    const category = await repo.findBySlug(slug);
    if (!category) throw AppError.notFound('Category');
    return category;
  }

  async createCategory(input: CreateCategoryInput): Promise<Category> {
    if (input.parentId) {
      const parent = await repo.findById(input.parentId);
      if (!parent) throw AppError.notFound('Parent category');
    }

    const category = await repo.create({
      name: input.name,
      slug: input.slug,
      description: input.description,
      displayOrder: input.displayOrder ?? 0,
      metaTitle: input.metaTitle,
      metaDescription: input.metaDescription,
      ...(input.parentId ? { parent: { connect: { id: input.parentId } } } : {}),
    });

    await cache.del('category:tree');
    return category;
  }

  async updateCategory(id: string, input: UpdateCategoryInput): Promise<Category> {
    const category = await repo.findById(id);
    if (!category) throw AppError.notFound('Category');

    const updated = await repo.update(id, input);
    await cache.del('category:tree');
    return updated;
  }

  async deleteCategory(id: string): Promise<void> {
    const category = await repo.findById(id);
    if (!category) throw AppError.notFound('Category');
    await repo.delete(id);
    await cache.del('category:tree');
  }
}
