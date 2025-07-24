import axios from "axios";
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function startDriverTrial(user_id: number) {
  const res = await axios.post(`${API_BASE}/start_driver_trial`, { user_id });
  return res.data;
}
