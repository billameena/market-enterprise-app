import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from '@tanstack/react-router';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().email('Valid email required'),
});

export function ForgotPassword() {
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string }>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (data: { email: string }) => authService.forgotPassword(data),
    onSuccess: () => setSent(true),
    onError: () => toast.error('Failed to send reset email'),
  });

  if (sent) {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircleIcon className="w-9 h-9 text-green-500" />
        </div>
        <h2 className="text-xl font-bold text-surface-900 mb-2">Check your email</h2>
        <p className="text-surface-500 text-sm mb-6">
          We've sent a password reset link to your email address.
        </p>
        <Link to="/login" search={{ redirect: undefined }} className="text-primary-600 hover:text-primary-700 font-semibold text-sm">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-black text-surface-900">Forgot your password?</h1>
        <p className="text-surface-500 mt-1 text-sm">
          Enter your email and we'll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          {...register('email')}
          error={errors.email?.message}
          autoFocus
        />
        <Button type="submit" fullWidth size="lg" isLoading={mutation.isPending}>
          Send Reset Link
        </Button>
      </form>

      <p className="text-center text-sm text-surface-500 mt-6">
        <Link to="/login" search={{ redirect: undefined }} className="text-primary-600 hover:text-primary-700 font-semibold">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
