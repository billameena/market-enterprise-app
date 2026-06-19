import { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { LockClosedIcon } from '@heroicons/react/24/solid';
import { Button } from '../../../components/ui/Button';

interface PaymentFormProps {
  clientSecret: string;
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  onError: (message: string) => void;
}

export function PaymentForm({ amount, onSuccess, onError }: Omit<PaymentFormProps, 'clientSecret'> & { clientSecret?: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (error) {
        onError(error.message ?? 'Payment failed. Please try again.');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id);
      } else {
        onError('Payment was not completed. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement
        options={{
          layout: 'tabs',
          paymentMethodOrder: ['card', 'apple_pay', 'google_pay'],
        }}
      />

      <div className="flex items-center gap-2 text-xs text-surface-500">
        <LockClosedIcon className="w-3.5 h-3.5 text-green-500" />
        <span>Your payment information is encrypted and secure.</span>
      </div>

      <Button
        type="submit"
        fullWidth
        size="lg"
        isLoading={isProcessing || !stripe}
        disabled={isProcessing || !stripe}
      >
        Pay ${amount.toFixed(2)}
      </Button>
    </form>
  );
}
