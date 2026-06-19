import { User, UserAddress } from '@prisma/client';
import { UsersRepository } from './users.repository';
import { UpdateProfileInput, CreateAddressInput, UpdateAddressInput, AdminUpdateUserInput, UserListQuery } from './users.types';
import { AppError } from '../../middlewares/error.middleware';
import { uploadImage } from '../../utils/cloudinary';
import { PaginatedResult } from '../../types/common.types';

const repo = new UsersRepository();

export class UsersService {
  async getProfile(userId: string): Promise<Omit<User, 'password'>> {
    const user = await repo.findById(userId);
    if (!user) throw AppError.notFound('User');
    const { password: _pw, ...profile } = user;
    return profile as Omit<User, 'password'>;
  }

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<Omit<User, 'password'>> {
    const user = await repo.update(userId, input);
    const { password: _pw, ...profile } = user;
    return profile as Omit<User, 'password'>;
  }

  async uploadAvatar(userId: string, buffer: Buffer, mimetype: string): Promise<string> {
    const result = await uploadImage(buffer, 'avatars', {
      publicId: `avatar_${userId}`,
      width: 400,
      height: 400,
    });
    await repo.update(userId, { avatarUrl: result.url });
    return result.url;
  }

  async getAddresses(userId: string): Promise<UserAddress[]> {
    return repo.findAddresses(userId);
  }

  async createAddress(userId: string, input: CreateAddressInput): Promise<UserAddress> {
    return repo.createAddress(userId, input as Omit<UserAddress, 'id' | 'userId' | 'createdAt' | 'updatedAt'>);
  }

  async updateAddress(userId: string, addressId: string, input: UpdateAddressInput): Promise<UserAddress> {
    const address = await repo.findAddressById(addressId, userId);
    if (!address) throw AppError.notFound('Address');
    return repo.updateAddress(addressId, input);
  }

  async deleteAddress(userId: string, addressId: string): Promise<void> {
    const address = await repo.findAddressById(addressId, userId);
    if (!address) throw AppError.notFound('Address');
    await repo.deleteAddress(addressId);
  }

  // Admin operations
  async getAllUsers(query: UserListQuery): Promise<PaginatedResult<Omit<User, 'password'>>> {
    return repo.findAll(query);
  }

  async adminUpdateUser(userId: string, input: AdminUpdateUserInput): Promise<Omit<User, 'password'>> {
    const user = await repo.findById(userId);
    if (!user) throw AppError.notFound('User');
    const updated = await repo.update(userId, input);
    const { password: _pw, ...profile } = updated;
    return profile as Omit<User, 'password'>;
  }

  async deactivateUser(userId: string): Promise<void> {
    const user = await repo.findById(userId);
    if (!user) throw AppError.notFound('User');
    await repo.update(userId, { isActive: false });
  }
}
