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
  is_driver?: boolean;
  car_number?: string;   
  car_brand?: string;   
}


export async function patchUserRole(id: number, isDriver: boolean, car_number?: string, car_brand?: string) {
  const payload: any = { is_driver: isDriver };
  if (car_number !== undefined) payload.car_number = car_number;
  if (car_brand !== undefined) payload.car_brand = car_brand;
  // PATCH /users/:id
  const res = await axios.patch(`${API_BASE}/users/${id}`, payload);
  return res.data;
}



export async function patchProfile(payload: PatchProfilePayload) {
  // Здесь telegram_id обязателен!
  if (!payload.telegram_id) {
    throw new Error("telegram_id обязателен для обновления профиля");
  }
  const res = await axios.patch(`${API_BASE}/me/`, payload);
  return res.data;
}

export async function updateProfileById(payload: {
  id: number;
  is_driver: boolean;
  // ... остальные поля если нужны
}) {
  // возвращаем только data
  const res = await axios.patch(`${API_BASE}/users/${payload.id}`, payload);
  return res.data; // <-- так!
}

export async function uploadCarPhoto(user_id: number, formData: FormData) {
  return axios.post(`${API_BASE}/upload/car_photo/${user_id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}