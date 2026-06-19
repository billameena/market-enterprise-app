export interface AddToCartInput {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface UpdateCartItemInput {
  quantity: number;
}

export interface ApplyCouponInput {
  couponCode: string;
}

export interface CartSummary {
  items: CartItemDetail[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  shippingAmount: number;
  total: number;
  coupon?: {
    code: string;
    discountType: string;
    discountValue: number;
  };
  itemCount: number;
}

export interface CartItemDetail {
  id: string;
  productId: string;
  variantId?: string;
  productName: string;
  variantName?: string;
  imageUrl?: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  total: number;
  sku: string;
  inStock: boolean;
}
