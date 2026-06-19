import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from '@tanstack/react-router';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { registerSchema, type RegisterFormValues } from '../../../utils/validators';
import { useRegister } from '../hooks/useRegister';

export function RegisterForm() {
  const { mutate: register, isPending, error } = useRegister();
  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  return (
    <form onSubmit={handleSubmit((data) => register(data))} className="space-y-4" noValidate>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-surface-900">Create an account</h1>
        <p className="text-surface-500 mt-1 text-sm">Join thousands of customers and vendors</p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-danger-50 text-danger-700 text-sm">
          {(error as { message: string }).message}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Input label="First name" placeholder="John" error={errors.firstName?.message} {...formRegister('firstName')} />
        <Input label="Last name" placeholder="Doe" error={errors.lastName?.message} {...formRegister('lastName')} />
      </div>

      <Input label="Email address" type="email" placeholder="you@example.com" error={errors.email?.message} {...formRegister('email')} />
      <Input label="Password" type="password" placeholder="Min 8 chars, uppercase, number" error={errors.password?.message} {...formRegister('password')} />
      <Input label="Confirm password" type="password" placeholder="Repeat password" error={errors.confirmPassword?.message} {...formRegister('confirmPassword')} />

      <Button type="submit" fullWidth isLoading={isPending}>
        Create Account
      </Button>

      <p className="text-center text-sm text-surface-500">
        Already have an account?{' '}
        <Link to="/login" search={{ redirect: undefined }} className="text-primary-600 font-medium hover:text-primary-700">
          Sign in
        </Link>
      </p>
    </form>
  );
}
