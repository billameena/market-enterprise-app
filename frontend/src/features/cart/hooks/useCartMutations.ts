import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cartService } from '../../../services/cart.service';
import { useCartStore } from '../../../store/cart.store';
import toast from 'react-hot-toast';

export function useCartMutations() {
  const queryClient = useQueryClient();
  const { setCart } = useCartStore();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['cart'] });

  const addItemMutation = useMutation({
    mutationFn: ({ productId, quantity, variantId }: { productId: string; quantity: number; variantId?: string }) =>
      cartService.addItem(productId, quantity, variantId),
    onSuccess: (data) => {
      setCart(data);
      invalidate();
      toast.success('Added to cart');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Failed to add item');
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartService.updateItem(itemId, quantity),
    onSuccess: (data) => {
      setCart(data);
      invalidate();
    },
    onError: () => toast.error('Failed to update item'),
  });

  const removeItemMutation = useMutation({
    mutationFn: cartService.removeItem,
    onSuccess: (data) => {
      setCart(data);
      invalidate();
      toast.success('Item removed');
    },
    onError: () => toast.error('Failed to remove item'),
  });

  const clearCartMutation = useMutation({
    mutationFn: cartService.clearCart,
    onSuccess: () => {
      invalidate();
      toast.success('Cart cleared');
    },
    onError: () => toast.error('Failed to clear cart'),
  });

  const applyCouponMutation = useMutation({
    mutationFn: cartService.applyCoupon,
    onSuccess: (data) => {
      setCart(data);
      invalidate();
      toast.success('Coupon applied!');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Invalid coupon');
    },
  });

  const removeCouponMutation = useMutation({
    mutationFn: cartService.removeCoupon,
    onSuccess: (data) => {
      setCart(data);
      invalidate();
      toast.success('Coupon removed');
    },
    onError: () => toast.error('Failed to remove coupon'),
  });

  return {
    addItemMutation,
    updateItemMutation,
    removeItemMutation,
    clearCartMutation,
    applyCouponMutation,
    removeCouponMutation,
  };
}
