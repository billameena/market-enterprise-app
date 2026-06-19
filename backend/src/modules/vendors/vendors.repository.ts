import { Vendor, Store, Prisma } from '@prisma/client';
import { prisma } from '../../configs/database';
import { PaginatedResult } from '../../types/common.types';
import { buildPaginatedResult, parsePaginationQuery } from '../../utils/pagination';
import { VendorListQuery } from './vendors.types';

export class VendorsRepository {
  async findByUserId(userId: string): Promise<Vendor | null> {
    return prisma.vendor.findUnique({ where: { userId }, include: { store: true } });
  }

  async findById(id: string): Promise<Vendor | null> {
    return prisma.vendor.findUnique({ where: { id }, include: { store: true, user: { select: { email: true, firstName: true, lastName: true } } } });
  }

  async create(data: Prisma.VendorCreateInput): Promise<Vendor> {
    return prisma.vendor.create({ data });
  }

  async update(id: string, data: Prisma.VendorUpdateInput): Promise<Vendor> {
    return prisma.vendor.update({ where: { id }, data });
  }

  async findAll(query: VendorListQuery): Promise<PaginatedResult<Vendor>> {
    const { skip, take, page, pageSize } = parsePaginationQuery(query);
    const where: Prisma.VendorWhereInput = {
      ...(query.search && {
        OR: [
          { businessName: { contains: query.search, mode: 'insensitive' } },
          { businessEmail: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
      ...(query.status && { status: query.status }),
    };

    const [vendors, total] = await Promise.all([
      prisma.vendor.findMany({
        where,
        skip,
        take,
        orderBy: query.sortBy ? { [query.sortBy]: query.sortOrder ?? 'desc' } : { createdAt: 'desc' },
        include: { store: true, user: { select: { email: true, firstName: true, lastName: true } } },
      }),
      prisma.vendor.count({ where }),
    ]);

    return buildPaginatedResult(vendors, total, page, pageSize);
  }

  // Store
  async findStoreByVendorId(vendorId: string): Promise<Store | null> {
    return prisma.store.findUnique({ where: { vendorId } });
  }

  async findStoreBySlug(slug: string): Promise<Store | null> {
    return prisma.store.findUnique({ where: { slug } });
  }

  async createStore(data: Prisma.StoreCreateInput): Promise<Store> {
    return prisma.store.create({ data });
  }

  async updateStore(id: string, data: Prisma.StoreUpdateInput): Promise<Store> {
    return prisma.store.update({ where: { id }, data });
  }
}
