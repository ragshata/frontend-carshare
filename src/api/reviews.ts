import axios from "axios";
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
// Получить отзывы о водителе
export async function getDriverReviews(driver_id: number) {
  const res = await axios.get(`${API_BASE}/reviews/driver/${driver_id}/`); // <- слэш ок!
  return res.data;
}

// Оставить отзыв (ДОБАВЬ СЛЭШ)
export async function createReview(payload: {
  trip_id: number,
  author_id: number,
  driver_id: number,
  rating: number,
  text?: string
}) {
  return axios.post(`${API_BASE}/reviews/`, payload); // <- обязательно слэш!
}