// src/api/admin-trips.ts
import axios from "axios";
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Получить все поездки (для админки)
export async function getAllTrips() {
  const res = await axios.get(`${API_BASE}/trips/`);
  return res.data;
}

// Получить аналитику для админки (кол-во поездок и бронирований)
export async function getAdminStats() {
  // Пример: /admin/stats (реализуй такой эндпоинт на бэке)
  const res = await axios.get(`${API_BASE}/admin/stats`);
  return res.data;
}

// (Опционально) Получить все отзывы (для модерирования отзывов)
export async function getAllReviews() {
  const res = await axios.get(`${API_BASE}/reviews/`);
  return res.data;
}
