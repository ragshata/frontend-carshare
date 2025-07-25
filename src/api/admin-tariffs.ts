import axios from "axios";
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface Tariff {
  id: number;
  name: string;
  duration_days: number;
  price: number;
  description?: string;
}

// Получить список тарифов для админки
export async function getAdminTariffs() {
  const res = await axios.get(`${API_BASE}/admin/tariffs`);
  return res.data;
}

// Обновить тариф (цена и описание)
export async function updateTariff(
  tariffId: number,
  data: { price?: number; description?: string }
) {
  const res = await axios.put(`${API_BASE}/admin/tariffs/${tariffId}`, data);
  return res.data;
}
