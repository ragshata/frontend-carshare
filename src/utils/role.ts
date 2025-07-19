// src/utils/role.ts
import { useAuthStore } from '@/store/auth';

export function getUserRole(): 'driver' | 'passenger' {
  const auth = useAuthStore();
  return auth.user?.is_driver ? 'driver' : 'passenger';
}
