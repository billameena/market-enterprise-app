import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { orderService } from '../../../services/order.service';
import { useSocket } from '../../../hooks/useSocket';
import { useQueryClient } from '@tanstack/react-query';

export function useOrder(orderId: string) {
  const queryClient = useQueryClient();
  const { on, joinRoom, EVENTS } = useSocket();

  const query = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderService.getOrderById(orderId),
    enabled: Boolean(orderId),
  });

  useEffect(() => {
    if (!orderId) return;
    joinRoom(orderId);

    const off = on(EVENTS.ORDER_STATUS_CHANGED, (data: unknown) => {
      const event = data as { orderId: string; status: string };
      if (event.orderId === orderId) {
        queryClient.invalidateQueries({ queryKey: ['order', orderId] });
        queryClient.invalidateQueries({ queryKey: ['orders'] });
      }
    });

    return off;
  }, [orderId, joinRoom, on, EVENTS.ORDER_STATUS_CHANGED, queryClient]);

  return query;
}
