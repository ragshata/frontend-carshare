import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function authByTelegram(user: {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}) {
  const res = await axios.post(`${API_BASE}/auth/telegram`, {
    telegram_id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    username: user.username,
    photo_url: user.photo_url // <-- обязательно!
  });

  return res.data; // { access_token, user }
}

// Типизация для профиля
export interface PatchProfilePayload {
  telegram_id: number;
  first_name?: string;
  last_name?: string;
  phone?: string;
  city?: string;
  photo_url?: string;
}

export async function patchProfile(payload: PatchProfilePayload) {
  // Здесь telegram_id обязателен!
  if (!payload.telegram_id) {
    throw new Error("telegram_id обязателен для обновления профиля");
  }
  const res = await axios.patch(`${API_BASE}/me/`, payload);
  return res.data;
}
