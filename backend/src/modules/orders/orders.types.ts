import { OrderStatus } from '@prisma/client';

export interface ShippingAddressInput {
  firstName: string;
  lastName: string;
  phone?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface CreateOrderInput {
  shippingAddress: ShippingAddressInput;
  couponCode?: string;
  notes?: string;
  paymentMethod?: string;
}

export interface CreateOrderResult {
  orderId: string;
  orderNumber: string;
  clientSecret: string;
  amount: number;
}

export interface UpdateOrderStatusInput {
  status: OrderStatus;
  comment?: string;
  trackingNumber?: string;
  trackingUrl?: string;
}

export interface OrderListQuery {
  page?: number;
  pageSize?: number;
  status?: OrderStatus;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}
