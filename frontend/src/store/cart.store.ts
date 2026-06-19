import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, CartSummary } from '../types/cart.types';

interface CartStore {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  total: number;
  coupon: CartSummary['coupon'] | undefined;
  isLoading: boolean;
  isOpen: boolean;

  // Actions
  setCart: (summary: CartSummary) => void;
  setLoading: (loading: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  clearLocalCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      itemCount: 0,
      subtotal: 0,
      total: 0,
      coupon: undefined,
      isLoading: false,
      isOpen: false,

      setCart: (summary) =>
        set({
          items: summary.items,
          itemCount: summary.itemCount,
          subtotal: summary.subtotal,
          total: summary.total,
          coupon: summary.coupon,
        }),

      setLoading: (loading) => set({ isLoading: loading }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      clearLocalCart: () =>
        set({
          items: [],
          itemCount: 0,
          subtotal: 0,
          total: 0,
          coupon: undefined,
        }),
    }),
    {
      name: 'cart-store',
      partialize: (state) => ({
        items: state.items,
        itemCount: state.itemCount,
        subtotal: state.subtotal,
        total: state.total,
      }),
    },
  ),
);
