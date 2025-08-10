// src/composables/profileGate.ts
import { useAuthStore } from '@/store/auth';

export type Role = 'passenger' | 'driver';

export function checkProfileComplete(role: Role) {
  const { user } = useAuthStore();
  const missing: string[] = [];

  if (!user?.first_name) missing.push('first_name');
  if (!user?.phone)      missing.push('phone');
  if (!user?.gender)     missing.push('gender');

  if (role === 'driver') {
    if (!user?.car_brand)     missing.push('car_brand');
    if (!user?.car_number)    missing.push('car_number');
    if (!user?.car_photo_url) missing.push('car_photo_url');
  }

  return { ok: missing.length === 0, missing };
}
