import { useParams } from '@tanstack/react-router';
import { OrderDetail } from '../features/orders/components/OrderDetail';

export function OrderDetailPage() {
  const { orderId } = useParams({ from: '/main/orders/$orderId' });
  return (
    <div>
      <OrderDetail orderId={orderId} />
    </div>
  );
}
