import axios from 'axios';
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function getCities() {
  const { data } = await axios.get(`${API_BASE}/cities/`);
  return data;
}
