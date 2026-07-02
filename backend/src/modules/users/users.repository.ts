import { User, UserAddress, Prisma } from '@prisma/client';
import { prisma } from '../../configs/database';
import { PaginatedResult } from '../../types/common.types';
import { buildPaginatedResult, parsePaginationQuery } from '../../utils/pagination';
import { UserListQuery } from './users.types';

export class UsersRepository {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id, deletedAt: null } });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({ where: { id }, data });
  }

  async findAll(query: UserListQuery): Promise<PaginatedResult<Omit<User, 'password'>>> {
    const { skip, take, page, pageSize } = parsePaginationQuery(query);

    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(query.search && {
        OR: [
          { email: { contains: query.search, mode: 'insensitive' } },
          { firstName: { contains: query.search, mode: 'insensitive' } },
          { lastName: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
      ...(query.role && { role: query.role }),
      ...(query.isActive !== undefined && { isActive: query.isActive }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: query.sortBy
          ? { [query.sortBy]: query.sortOrder ?? 'desc' }
          : { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          avatarUrl: true,
          role: true,
          isEmailVerified: true,
          isActive: true,
          isLocked: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
          password: false,
          emailVerificationToken: false,
          passwordResetToken: false,
          _count: { select: { orders: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return buildPaginatedResult(users as unknown as Omit<User, 'password'>[], total, page, pageSize);
  }

  async softDelete(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  // Addresses
  async findAddresses(userId: string): Promise<UserAddress[]> {
    return prisma.userAddress.findMany({ where: { userId }, orderBy: { isDefault: 'desc' } });
  }

  async findAddressById(id: string, userId: string): Promise<UserAddress | null> {
    return prisma.userAddress.findFirst({ where: { id, userId } });
  }

  async createAddress(userId: string, data: Omit<UserAddress, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<UserAddress> {
    if (data.isDefault) {
      await prisma.userAddress.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    return prisma.userAddress.create({ data: { ...data, userId } });
  }

  async updateAddress(id: string, data: Partial<UserAddress>): Promise<UserAddress> {
    if (data.isDefault) {
      const address = await prisma.userAddress.findUnique({ where: { id } });
      if (address) {
        await prisma.userAddress.updateMany({
          where: { userId: address.userId },
          data: { isDefault: false },
        });
      }
    }
    return prisma.userAddress.update({ where: { id }, data });
  }

  async deleteAddress(id: string): Promise<void> {
    await prisma.userAddress.delete({ where: { id } });
  }
}
