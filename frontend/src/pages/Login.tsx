import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { loginSchema } from '../utils/validators';
import { useAuthMutations } from '../features/auth/hooks/useAuthMutations';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import type { z } from 'zod';

type LoginValues = z.infer<typeof loginSchema>;

export function Login() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/auth/login' }) as { redirect?: string };
  const { loginMutation } = useAuthMutations();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  function onSubmit(values: LoginValues) {
    loginMutation.mutate(values, {
      onSuccess: () => navigate({ to: (search.redirect as '/') ?? '/' }),
    });
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-black text-surface-900">Welcome back</h1>
        <p className="text-surface-500 mt-1">Sign in to your account to continue</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          {...register('email')}
          error={errors.email?.message}
          autoComplete="email"
          autoFocus
        />
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-surface-700">Password</label>
            <Link to="/forgot-password" className="text-xs text-primary-600 hover:text-primary-700 transition-colors">
              Forgot password?
            </Link>
          </div>
          <input
            {...register('password')}
            type="password"
            autoComplete="current-password"
            className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.password ? 'border-danger-300' : 'border-surface-200'
            }`}
          />
          {errors.password && (
            <p className="text-xs text-danger-600 mt-1">{errors.password.message}</p>
          )}
        </div>

        <Button type="submit" fullWidth size="lg" isLoading={loginMutation.isPending}>
          Sign In
        </Button>
      </form>

      <p className="text-center text-sm text-surface-500 mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold">
          Create one
        </Link>
      </p>
    </div>
  );
}
