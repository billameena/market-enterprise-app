import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { authService } from '../../../services/auth.service';
import { useAuthStore } from '../../../store/auth.store';
import { useCartStore } from '../../../store/cart.store';
import toast from 'react-hot-toast';
import type { LoginFormValues } from '../../../utils/validators';

export function useLogin() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { clearLocalCart } = useCartStore();

  return useMutation({
    mutationFn: (credentials: LoginFormValues) => authService.login(credentials),
    onSuccess: (data) => {
      setAuth(data.user, data.tokens);
      clearLocalCart(); // Will be populated from server
      toast.success(`Welcome back, ${data.user.firstName}!`);

      // Redirect based on role
      if (data.user.role === 'ADMIN' || data.user.role === 'SUPER_ADMIN') {
        void navigate({ to: '/admin' });
      } else if (data.user.role === 'VENDOR') {
        void navigate({ to: '/vendor/dashboard' });
      } else {
        void navigate({ to: '/' });
      }
    },
    onError: (error: { message: string }) => {
      toast.error(error.message ?? 'Login failed');
    },
  });
}
