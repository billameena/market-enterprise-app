import { CheckoutForm } from '../features/checkout/components/CheckoutForm';

export function Checkout() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-surface-900">Checkout</h1>
      <CheckoutForm />
    </div>
  );
}
