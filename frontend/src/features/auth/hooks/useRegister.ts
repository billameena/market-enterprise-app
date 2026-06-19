import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { authService } from '../../../services/auth.service';
import toast from 'react-hot-toast';
import type { RegisterFormValues } from '../../../utils/validators';

export function useRegister() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (credentials: RegisterFormValues) =>
      authService.register({
        email: credentials.email,
        password: credentials.password,
        firstName: credentials.firstName,
        lastName: credentials.lastName,
        phone: credentials.phone,
      }),
    onSuccess: (data) => {
      toast.success(data.message);
      void navigate({ to: '/login', search: { redirect: undefined } });
    },
    onError: (error: { message: string }) => {
      toast.error(error.message ?? 'Registration failed');
    },
  });
}
