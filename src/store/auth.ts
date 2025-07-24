import { defineStore } from 'pinia';

// Опиши интерфейс, чтобы избежать ошибок
interface User {
  id: number;
  telegram_id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  phone?: string;
  photo_url?: string;
  is_driver?: boolean;
  registered_at?: string;
  city?: string; // <-- Добавь эту строку
  active_driver?: boolean;
  car_number?: string;
  car_brand?: string;
  car_photo_url?: string;
  driver_trial_end?: string | null ;
  subscription_end?: string;
  // можно добавить другие поля по необходимости
}

export const useAuthStore = defineStore('auth', {
  state: (): { user: User } => ({
    user: {
      id: 0,
      telegram_id: 0,
      first_name: '',
      last_name: '',
      username: '',
      phone: '',
      photo_url: '',
      is_driver: false,
      registered_at: '',
    }
  }),

  actions: {
    setUser(user: Partial<User>) {
      // присваиваем только существующие поля (без потери типизации)
      this.user = { ...this.user, ...user };
    },
    setPhotoUrl(url: string) {
      this.user.photo_url = url;
      localStorage.setItem('tg_user_photo_url', url);
    }
  }
});
