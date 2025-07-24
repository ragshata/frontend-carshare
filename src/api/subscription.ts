import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Получить список тарифов
export async function getTariffs() {
  const res = await axios.get(`${API_BASE}/tariffs`);
  return res.data;
}

// Начать пробный период
export async function startDriverTrial(userId: number) {
  const res = await axios.post(`${API_BASE}/subscriptions/trial`, null, {
    params: { user_id: userId },
  });
  return res.data;
}

// Купить тариф
export async function buyTariff(userId: number, tariffId: number) {
  const res = await axios.post(`${API_BASE}/subscriptions/buy`, null, {
    params: {
      user_id: userId,
      tariff_id: tariffId,
    },
  });
  return res.data;
}
