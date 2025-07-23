import axios from "axios";
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Получить всех пользователей
export async function getAllUsers() {
  const res = await axios.get(`${API_BASE}/users/`);
  return res.data;
}

// Обновить роль
export async function updateUserRole(id: number, is_driver: boolean) {
  return axios.patch(`${API_BASE}/users/${id}`, { is_driver });
}

// Обновить active_driver
export async function updateUserActiveDriver(id: number, active_driver: boolean) {
  return axios.patch(`${API_BASE}/users/${id}`, { active_driver });
}

// Удалить пользователя
export async function deleteUser(id: number) {
  return axios.delete(`${API_BASE}/users/${id}`);
}

// Удалить всю базу (например, /users/delete_all)
export async function deleteDatabased() {
  return axios.delete(`${API_BASE}/users/delete_all`);
}

export async function patchUser(id: number, data: any, telegram_id: number) {
  const res = await axios.patch(`${API_BASE}/admin/users/${id}?telegram_id=${telegram_id}`, data);
  return res.data;
}

export async function deleteUserByTelegramId(telegram_id: number) {
  console.log('Отправка запроса на удаление:', telegram_id);
  return axios.delete(`${API_BASE}/users/by_telegram/${telegram_id}`);
}
