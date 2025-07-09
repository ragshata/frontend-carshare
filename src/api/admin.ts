import axios from "axios";
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function getAdminUsers(params: any) {
  const res = await axios.get(`${API_BASE}/admin/users`, { params });
  return res.data;
}
export async function patchUser(id: number, data: any, telegram_id: number) {
  const res = await axios.patch(`${API_BASE}/admin/users/${id}?telegram_id=${telegram_id}`, data);
  return res.data;
}
