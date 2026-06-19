import { useLogin } from './useLogin';
import { useRegister } from './useRegister';

export function useAuthMutations() {
  const loginMutation = useLogin();
  const registerMutation = useRegister();

  return { loginMutation, registerMutation };
}
