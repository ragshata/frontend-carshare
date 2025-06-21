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


export async function patchProfile(payload: any) {
  const res = await axios.patch(`${API_BASE}/me/`, payload, { withCredentials: true });
  return res.data;
}
