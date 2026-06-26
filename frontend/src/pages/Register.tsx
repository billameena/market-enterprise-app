import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from '@tanstack/react-router';
import { registerSchema } from '../utils/validators';
import { useAuthMutations } from '../features/auth/hooks/useAuthMutations';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import type { z } from 'zod';

type RegisterValues = z.infer<typeof registerSchema>;

export function Register() {
  const navigate = useNavigate();
  const { registerMutation } = useAuthMutations();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  function onSubmit(values: RegisterValues) {
    registerMutation.mutate(values, {
      onSuccess: () => navigate({ to: '/login', search: { redirect: undefined } }),
    });
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-black text-surface-900">Create your account</h1>
        <p className="text-surface-500 mt-1">Join thousands of shoppers and vendors</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First Name"
            {...register('firstName')}
            error={errors.firstName?.message}
            autoFocus
          />
          <Input
            label="Last Name"
            {...register('lastName')}
            error={errors.lastName?.message}
          />
        </div>

        <Input
          label="Email Address"
          type="email"
          {...register('email')}
          error={errors.email?.message}
          autoComplete="email"
        />

        <Input
          label="Password"
          type="password"
          {...register('password')}
          error={errors.password?.message}
          autoComplete="new-password"
        />

        <Input
          label="Confirm Password"
          type="password"
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
          autoComplete="new-password"
        />

        <Button type="submit" fullWidth size="lg" isLoading={registerMutation.isPending}>
          Create Account
        </Button>

        <p className="text-xs text-center text-surface-400">
          By creating an account you agree to our{' '}
          <a href="#" className="text-primary-600 hover:underline">Terms of Service</a>{' '}
          and{' '}
          <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>.
        </p>
      </form>

      <p className="text-center text-sm text-surface-500 mt-6">
        Already have an account?{' '}
        <Link to="/login" search={{ redirect: undefined }} className="text-primary-600 hover:text-primary-700 font-semibold">
          Sign in
        </Link>
      </p>
    </div>
  );
}
