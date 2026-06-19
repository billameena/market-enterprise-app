import { CheckIcon } from '@heroicons/react/24/solid';
import type { OrderStatus as OrderStatusType } from '../../../types/order.types';

interface OrderStatusProps {
  status: OrderStatusType;
  showTimeline?: boolean;
  updatedAt?: string;
}

const ORDER_STEPS: { status: OrderStatusType; label: string }[] = [
  { status: 'PENDING', label: 'Placed' },
  { status: 'CONFIRMED', label: 'Confirmed' },
  { status: 'PROCESSING', label: 'Processing' },
  { status: 'SHIPPED', label: 'Shipped' },
  { status: 'DELIVERED', label: 'Delivered' },
];

const STATUS_COLORS: Record<OrderStatusType, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-indigo-100 text-indigo-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-orange-100 text-orange-800',
  PAYMENT_FAILED: 'bg-red-100 text-red-800',
  COMPLETED: 'bg-green-100 text-green-800',
};

export function OrderStatus({ status, showTimeline = false }: OrderStatusProps) {
  const isCancelled = status === 'CANCELLED' || status === 'REFUNDED' || status === 'PAYMENT_FAILED';
  const currentStepIndex = ORDER_STEPS.findIndex((s) => s.status === status);

  if (!showTimeline) {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status]}`}>
        {status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' ')}
      </span>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${STATUS_COLORS[status]}`}>
          {status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' ')}
        </span>
      </div>

      {!isCancelled && (
        <div className="flex items-center">
          {ORDER_STEPS.map((step, i) => {
            const isDone = currentStepIndex > i;
            const isCurrent = currentStepIndex === i;

            return (
              <div key={step.status} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isDone
                        ? 'bg-green-500 text-white'
                        : isCurrent
                        ? 'bg-primary-600 text-white ring-4 ring-primary-100'
                        : 'bg-surface-200 text-surface-500'
                    }`}
                  >
                    {isDone ? <CheckIcon className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={`text-xs mt-1 font-medium whitespace-nowrap ${
                    isCurrent ? 'text-primary-700' : isDone ? 'text-green-700' : 'text-surface-400'
                  }`}>
                    {step.label}
                  </span>
                </div>
                {i < ORDER_STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 -mt-4 ${isDone ? 'bg-green-400' : 'bg-surface-200'}`} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
