import { UserRole } from '@prisma/client';

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface CreateAddressInput {
  label?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface UpdateAddressInput extends Partial<CreateAddressInput> {}

export interface AdminUpdateUserInput {
  role?: UserRole;
  isActive?: boolean;
}

export interface UserListQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: UserRole;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
