import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';

const schema = z
  .object({
    password: z
      .string()
      .min(8, 'Minimum 8 characters')
      .regex(/[A-Z]/, 'Must contain uppercase')
      .regex(/[0-9]/, 'Must contain a number')
      .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetValues = z.infer<typeof schema>;

export function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useSearch({ from: '/auth/reset-password' }) as { token: string };

  const { register, handleSubmit, formState: { errors } } = useForm<ResetValues>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: ({ password }: ResetValues) =>
      authService.resetPassword({ token, password }),
    onSuccess: () => {
      toast.success('Password reset successfully. Please sign in.');
      navigate({ to: '/login', search: { redirect: undefined } });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Reset link is invalid or expired');
    },
  });

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-black text-surface-900">Set new password</h1>
        <p className="text-surface-500 mt-1 text-sm">
          Choose a strong password for your account.
        </p>
      </div>

      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
        <Input
          label="New Password"
          type="password"
          {...register('password')}
          error={errors.password?.message}
          autoFocus
          autoComplete="new-password"
        />
        <Input
          label="Confirm New Password"
          type="password"
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
          autoComplete="new-password"
        />
        <Button type="submit" fullWidth size="lg" isLoading={mutation.isPending}>
          Reset Password
        </Button>
      </form>
    </div>
  );
}
