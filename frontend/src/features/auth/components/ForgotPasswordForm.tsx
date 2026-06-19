import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '../../../utils/validators';
import { authService } from '../../../services/auth.service';
import toast from 'react-hot-toast';

export function ForgotPasswordForm() {
  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: (data: ForgotPasswordFormValues) => authService.forgotPassword(data),
    onSuccess: () => toast.success('Check your email for reset instructions'),
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  if (isSuccess) {
    return (
      <div className="text-center space-y-4">
        <div className="text-4xl">📧</div>
        <h2 className="text-xl font-bold text-surface-900">Check your email</h2>
        <p className="text-surface-500 text-sm">
          We've sent password reset instructions to your email address.
        </p>
        <Link to="/login" search={{ redirect: undefined }} className="text-primary-600 font-medium text-sm">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit((data) => mutate(data))} className="space-y-5">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-surface-900">Forgot password?</h1>
        <p className="text-surface-500 mt-1 text-sm">Enter your email to reset your password</p>
      </div>
      <Input label="Email address" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
      <Button type="submit" fullWidth isLoading={isPending}>Send Reset Link</Button>
      <p className="text-center text-sm text-surface-500">
        <Link to="/login" search={{ redirect: undefined }} className="text-primary-600 font-medium">Back to sign in</Link>
      </p>
    </form>
  );
}
