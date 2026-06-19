export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'PAYMENT_FAILED';

export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  shippingAmount: number;
  totalAmount: number;
  currency: string;
  notes: string | null;
  cancelReason: string | null;
  items: OrderItem[];
  shippingAddress: ShippingAddress | null;
  statusHistory: OrderStatusHistory[];
  payments: Payment[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  variantName: string | null;
  sku: string;
  imageUrl: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  trackingNumber: string | null;
  status: OrderStatus;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  phone: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderStatusHistory {
  id: string;
  status: OrderStatus;
  comment: string | null;
  createdAt: string;
}

export interface Payment {
  id: string;
  method: string;
  status: PaymentStatus;
  amount: number;
  paidAt: string | null;
}
