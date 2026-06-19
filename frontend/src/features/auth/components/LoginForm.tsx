import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from '@tanstack/react-router';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { loginSchema, type LoginFormValues } from '../../../utils/validators';
import { useLogin } from '../hooks/useLogin';

export function LoginForm() {
  const { mutate: login, isPending, error } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <form onSubmit={handleSubmit((data) => login(data))} className="space-y-5" noValidate>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-surface-900">Welcome back</h1>
        <p className="text-surface-500 mt-1 text-sm">Sign in to your account</p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-danger-50 text-danger-700 text-sm">
          {(error as { message: string }).message}
        </div>
      )}

      <Input
        label="Email address"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        {...register('email')}
      />

      <div>
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />
        <div className="flex justify-end mt-1">
          <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">
            Forgot password?
          </Link>
        </div>
      </div>

      <Button type="submit" fullWidth isLoading={isPending}>
        Sign in
      </Button>

      <p className="text-center text-sm text-surface-500">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary-600 font-medium hover:text-primary-700">
          Create account
        </Link>
      </p>
    </form>
  );
}
