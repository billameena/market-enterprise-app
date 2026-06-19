export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  productName: string;
  variantName?: string;
  imageUrl?: string;
  price: number;
  quantity: number;
  total: number;
  sku: string;
  inStock: boolean;
}

export interface CartSummary {
  items: CartItem[];
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

export interface CartState {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  total: number;
  isLoading: boolean;
}
