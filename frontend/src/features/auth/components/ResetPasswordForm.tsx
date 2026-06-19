import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { resetPasswordSchema, type ResetPasswordFormValues } from '../../../utils/validators';
import { authService } from '../../../services/auth.service';
import toast from 'react-hot-toast';

export function ResetPasswordForm() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/auth/reset-password' }) as { token?: string };
  const token = search.token ?? '';

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ResetPasswordFormValues) =>
      authService.resetPassword({ token, password: data.password }),
    onSuccess: () => {
      toast.success('Password reset successfully. Please sign in.');
      void navigate({ to: '/login', search: { redirect: undefined } });
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  return (
    <form onSubmit={handleSubmit((data) => mutate(data))} className="space-y-5">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-surface-900">Reset password</h1>
        <p className="text-surface-500 mt-1 text-sm">Enter your new password</p>
      </div>
      <Input label="New password" type="password" placeholder="Min 8 chars" error={errors.password?.message} {...register('password')} />
      <Input label="Confirm password" type="password" placeholder="Repeat password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
      <Button type="submit" fullWidth isLoading={isPending}>Reset Password</Button>
    </form>
  );
}
