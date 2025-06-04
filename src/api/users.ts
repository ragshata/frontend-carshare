import axios from "axios";
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function getUserById(id: number) {
  const res = await axios.get(`${API_BASE}/users/${id}`);
  return res.data;
}
export async function updateProfile(payload: {
  telegram_id: number;
  first_name: string;
  last_name?: string;
  phone?: string;
  city?: string;
}) {
  return axios.patch(`${API_BASE}/me/`, payload);
}
// Обновить профиль по id (по /users/:id)
export async function updateProfileById(payload: {
  id: number;
  first_name: string;
  last_name?: string;
  phone?: string;
  city?: string;
}) {
  return axios.patch(`${API_BASE}/users/${payload.id}`, payload);
}
