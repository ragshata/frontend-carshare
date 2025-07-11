import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Тип поездки (Trip)
export interface Trip {
  id: number;
  from_: string;
  to: string;
  date: string;
  time: string;
  price: number;
  seats: number;
  owner_id: number;
  status: string;
  created_at?: string;
  car_number?: string;
  car_brand?: string;
  description?: string;
}

// Завершить поездку
export async function finishTrip(id: number): Promise<void> {
  await axios.patch(`${API_BASE}/trips/${id}/finish`);
}

// Поиск поездок с фильтрами
export async function searchTrips(params: {
  from_?: string;
  to?: string;
  date?: string;
  date_from?: string;
  date_to?: string;
  status?: string;
  maxPrice?: string | number;
}): Promise<Trip[]> {
  const res = await axios.get(`${API_BASE}/trips/`, { params });
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
  description?: string;
}) {
  const res = await axios.post(`${API_BASE}/trips/`, trip);
  return res.data;
}

export async function getTripById(id: number) {
  const res = await axios.get(`${API_BASE}/trips/${id}`);
  return res.data;
}

export async function getMyTrips(owner_id: number): Promise<Trip[]> {
  const res = await axios.get(`${API_BASE}/trips/`, { params: { driver_id: owner_id } });
  return res.data;
}

export async function deleteTrip(id: number): Promise<void> {
  await axios.delete(`${API_BASE}/trips/${id}`);
}

export async function publishTrip(id: number): Promise<void> {
  await axios.patch(`${API_BASE}/trips/${id}/publish`);
}

export async function getTrip(id: number) {
  const res = await axios.get(`${API_BASE}/trips/${id}`);
  return res.data;
}

// Оставляем только одну функцию редактирования!
export async function updateTrip(tripId: number, data: Partial<Trip>) {
  const res = await axios.patch(`${API_BASE}/trips/${tripId}`, data);
  return res.data;
}
