import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckIcon } from '@heroicons/react/24/solid';
import { AddressForm } from './AddressForm';
import { PaymentForm } from './PaymentForm';
import { OrderSummary } from './OrderSummary';
import { Spinner } from '../../../components/ui/Spinner';
import { Button } from '../../../components/ui/Button';
import { api } from '../../../utils/api';
import { useCartStore } from '../../../store/cart.store';
import type { AddressFormValues } from './AddressForm';
import type { CartSummary } from '../../../types/cart.types';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(import.meta.env['VITE_STRIPE_PUBLISHABLE_KEY'] as string);

interface CreateOrderResponse {
  orderId: string;
  orderNumber: string;
  clientSecret: string;
  amount: number;
}

type CheckoutStep = 'address' | 'payment';

export function CheckoutForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { clearLocalCart } = useCartStore();
  const [step, setStep] = useState<CheckoutStep>('address');
  const [shippingAddress, setShippingAddress] = useState<AddressFormValues | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderAmount, setOrderAmount] = useState(0);

  const { data: cart, isLoading: cartLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () =>
      api.get<CartSummary>('/cart').then((r) => r.data),
  });

  const createOrderMutation = useMutation({
    mutationFn: (address: AddressFormValues) =>
      api
        .post<CreateOrderResponse>('/orders', {
          shippingAddress: address,
          couponCode: cart?.coupon?.code,
        })
        .then((r) => r.data),
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
      setOrderId(data.orderId);
      setOrderAmount(data.amount);
      setStep('payment');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Failed to create order');
    },
  });

  const confirmOrderMutation = useMutation({
    mutationFn: (paymentIntentId: string) =>
      api
        .post(`/payments/confirm`, { orderId, paymentIntentId })
        .then((r) => r.data),
    onSuccess: () => {
      clearLocalCart();
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['vendor', 'orders'] });
      navigate({ to: '/order-success', search: { orderId: orderId! } });
    },
    onError: () => toast.error('Failed to confirm order. Please contact support.'),
  });

  function handleAddressSubmit(values: AddressFormValues) {
    setShippingAddress(values);
    createOrderMutation.mutate(values);
  }

  function handlePaymentSuccess(paymentIntentId: string) {
    confirmOrderMutation.mutate(paymentIntentId);
  }

  function handlePaymentError(message: string) {
    toast.error(message);
  }

  if (cartLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-surface-500 mb-4">Your cart is empty.</p>
        <Button onClick={() => navigate({ to: '/products', search: { q: undefined, categoryId: undefined, sort: undefined, featured: undefined, minPrice: undefined, maxPrice: undefined } })}>Browse Products</Button>
      </div>
    );
  }

  const steps: { key: CheckoutStep; label: string }[] = [
    { key: 'address', label: 'Shipping' },
    { key: 'payment', label: 'Payment' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10">
      {/* Left: Form */}
      <div className="space-y-8">
        {/* Step indicator */}
        <div className="flex items-center gap-3">
          {steps.map((s, i) => {
            const isPast = steps.indexOf({ key: step, label: '' } as (typeof steps)[0]) === -1
              ? false
              : steps.findIndex((st) => st.key === step) > i;
            const isCurrent = s.key === step;

            return (
              <div key={s.key} className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      isPast
                        ? 'bg-green-500 text-white'
                        : isCurrent
                        ? 'bg-primary-600 text-white'
                        : 'bg-surface-200 text-surface-500'
                    }`}
                  >
                    {isPast ? <CheckIcon className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={`text-sm font-medium ${isCurrent ? 'text-surface-900' : 'text-surface-500'}`}>
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className="w-12 h-px bg-surface-200" />
                )}
              </div>
            );
          })}
        </div>

        {/* Address step */}
        {step === 'address' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-surface-900">Shipping Address</h2>
            <AddressForm onSubmit={handleAddressSubmit} isLoading={createOrderMutation.isPending} />
            <Button
              form="address-form"
              type="submit"
              fullWidth
              size="lg"
              isLoading={createOrderMutation.isPending}
            >
              Continue to Payment
            </Button>
          </div>
        )}

        {/* Payment step */}
        {step === 'payment' && clientSecret && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-surface-900">Payment</h2>
              <button
                type="button"
                onClick={() => setStep('address')}
                className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
              >
                Edit address
              </button>
            </div>

            {shippingAddress && (
              <div className="p-4 bg-surface-50 rounded-xl text-sm">
                <p className="font-medium text-surface-900">
                  {shippingAddress.firstName} {shippingAddress.lastName}
                </p>
                <p className="text-surface-600">
                  {shippingAddress.addressLine1}, {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
                </p>
              </div>
            )}

            {clientSecret.startsWith('mock_') ? (
              /* Stripe not configured — demo mode bypass */
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                  <p className="font-semibold mb-1">Demo Mode — Stripe not configured</p>
                  <p>Click the button below to simulate a successful payment.</p>
                </div>
                <Button
                  fullWidth
                  size="lg"
                  isLoading={confirmOrderMutation.isPending}
                  onClick={() => handlePaymentSuccess(clientSecret)}
                >
                  Complete Order (Demo)
                </Button>
              </div>
            ) : (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: 'stripe',
                    variables: { colorPrimary: '#6366f1' },
                  },
                }}
              >
                <PaymentForm
                  clientSecret={clientSecret}
                  amount={orderAmount}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </Elements>
            )}
          </div>
        )}
      </div>

      {/* Right: Order summary */}
      <div className="lg:sticky lg:top-24 h-fit">
        <div className="p-6 bg-surface-50 rounded-2xl border border-surface-100">
          <h3 className="font-bold text-surface-900 mb-4">Order Summary</h3>
          <OrderSummary
            items={cart.items}
            summary={cart}
            couponCode={cart.coupon?.code}
          />
        </div>
      </div>
    </div>
  );
}
