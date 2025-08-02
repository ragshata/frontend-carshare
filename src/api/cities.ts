import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Получить список всех городов (дефолтные + добавленные пользователями)
 */
export async function getCities(): Promise<string[]> {
  const { data } = await axios.get(`${API_BASE}/cities/`);
  return data;
}

/**
 * Получить только пользовательские (добавленные) города
 */
export async function getCustomCities(): Promise<string[]> {
  const { data } = await axios.get(`${API_BASE}/cities/custom`);
  return data;
}

/**
 * Удалить пользовательский город по имени
 */
export async function deleteCityByName(name: string): Promise<void> {
  await axios.delete(`${API_BASE}/cities/${encodeURIComponent(name)}`);
}
