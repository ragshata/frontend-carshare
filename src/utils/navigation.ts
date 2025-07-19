import type { Router } from 'vue-router';
import { useAuthStore } from '@/store/auth';

export function useSmartBack(router: Router) {
  const auth = useAuthStore();
  if (auth.user?.is_driver) {
    router.replace('/driver');
  } else {
    router.replace('/passenger');
  }
}
