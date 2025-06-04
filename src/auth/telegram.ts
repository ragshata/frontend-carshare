import { authByTelegram } from '@/api/auth';
import { useAuthStore } from '@/store/auth';

export async function authorizeViaTelegram(user) {
  const auth = useAuthStore();
  const res = await authByTelegram(user);
  if (res.user) {
    auth.setUser(res.user);
  }
  // сохранить токен если нужно:
  if (res.access_token) {
    localStorage.setItem('access_token', res.access_token);
  }
  return res;
}
