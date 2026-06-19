import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCartStore } from '../store/cart.store';
import { cartService } from '../services/cart.service';
import toast from 'react-hot-toast';

export function useCart() {
  const queryClient = useQueryClient();
  const { items, itemCount, total, setCart, openCart, closeCart, isOpen } = useCartStore();

  const { isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const cart = await cartService.getCart();
      setCart(cart);
      return cart;
    },
    staleTime: 1000 * 60 * 2, // 2 min
  });

  const addItemMutation = useMutation({
    mutationFn: ({ productId, quantity, variantId }: { productId: string; quantity: number; variantId?: string }) =>
      cartService.addItem(productId, quantity, variantId),
    onSuccess: (cart) => {
      setCart(cart);
      queryClient.setQueryData(['cart'], cart);
      toast.success('Added to cart');
      openCart();
    },
    onError: () => toast.error('Failed to add item to cart'),
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartService.updateItem(itemId, quantity),
    onSuccess: (cart) => {
      setCart(cart);
      queryClient.setQueryData(['cart'], cart);
    },
    onError: () => toast.error('Failed to update cart'),
  });

  const removeItemMutation = useMutation({
    mutationFn: (itemId: string) => cartService.removeItem(itemId),
    onSuccess: (cart) => {
      setCart(cart);
      queryClient.setQueryData(['cart'], cart);
      toast.success('Item removed');
    },
    onError: () => toast.error('Failed to remove item'),
  });

  return {
    items,
    itemCount,
    total,
    isLoading,
    isOpen,
    openCart,
    closeCart,
    addItem: addItemMutation.mutate,
    updateItem: updateItemMutation.mutate,
    removeItem: removeItemMutation.mutate,
    isAdding: addItemMutation.isPending,
    isRemoving: removeItemMutation.isPending,
  };
}
