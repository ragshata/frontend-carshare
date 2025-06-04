import axios from "axios";
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Получить отзывы о водителе
export async function getDriverReviews(driver_id: number) {
  const res = await axios.get(`${API_BASE}/reviews/driver/${driver_id}`);
  return res.data;
}

// Оставить отзыв
export async function createReview(payload: {
  trip_id: number,
  author_id: number,
  driver_id: number,
  rating: number,
  text?: string
}) {
  return axios.post(`${API_BASE}/reviews`, payload);
}
