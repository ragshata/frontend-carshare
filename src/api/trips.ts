import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Тип поездки (Trip) — если хочешь строгость, вынеси в types.ts
export interface Trip {
  id: number;
  from_city: string;
  to_city: string;
  date: string;
  time: string;
  price: number;
  seats: number;
  driver_id: number;
  status: string;
  // другие поля по модели
}

// Поиск поездок с фильтрами
export async function searchTrips(params: {
  from_city?: string;
  to_city?: string;
  date?: string;
  date_from?: string;
  date_to?: string;
  status?: string;
  maxPrice?: string | number;
}): Promise<Trip[]> {
  const res = await axios.get(`${API_BASE}/trips`, { params });
  return res.data;
}

export async function createTrip(trip: {
  from_: string;
  to: string;
  date: string;
  time: string;
  seats: number;
  price: number;
  owner_id: number;
  status?: string;
}) {
  const res = await axios.post(`${API_BASE}/trips/`, trip);
  return res.data;
}
export async function getTripById(id: number) {
  const res = await axios.get(`${API_BASE}/trips/${id}`);
  return res.data;
}

// Получить все поездки водителя
export async function getMyTrips(driver_id: number): Promise<Trip[]> {
  const res = await axios.get(`${API_BASE}/trips`, { params: { driver_id } });
  return res.data;
}

// Удалить поездку
export async function deleteTrip(id: number): Promise<void> {
  await axios.delete(`${API_BASE}/trips/${id}`);
}

// Опубликовать поездку из черновика (пример, уточни эндпоинт)
export async function publishTrip(id: number): Promise<void> {
  await axios.patch(`${API_BASE}/trips/${id}/publish`);
}


export async function getTrip(id: number) {
  const res = await axios.get(`${API_BASE}/trips/${id}`);
  return res.data;
}

export async function updateTrip(payload: {
  id: number;
  from_: string;
  to: string;
  date: string;
  time: string;
  seats: number;
  price: number;
}) {
  return axios.patch(`${API_BASE}/trips/${payload.id}`, payload);
}