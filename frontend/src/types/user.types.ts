export interface UserAddress {
  id: string;
  label: string | null;
  firstName: string;
  lastName: string;
  phone: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  avatarUrl: string | null;
  role: string;
  isEmailVerified: boolean;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
}
