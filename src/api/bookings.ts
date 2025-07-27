import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Тип бронирования (Booking)
export interface Booking {
  id: number;
  trip_id: number;
  user_id: number;
  // можно добавить trip?: Trip если хочешь досконально
}

export async function getBookingsByTrip(trip_id: number) {
  const res = await axios.get(`${API_BASE}/bookings/`, { params: { trip_id } });
  return res.data; // [{id, user: {...}, status, ...}]
}

// Получить мои бронирования (user_id можно брать из store)
export async function getBookings(user_id: number): Promise<Booking[]> {
  const res = await axios.get(`${API_BASE}/bookings/`, { params: { user_id } });
  return res.data;
}

// Забронировать поездку
export async function bookTrip(trip_id: number, user_id: number): Promise<Booking> {
  const response = await axios.post(`${API_BASE}/bookings/`, {
    trip_id,
    user_id
  });
  return response.data;
}

// Отменить бронирование
export async function deleteBooking(id: number) {
  return axios.delete(`${API_BASE}/bookings/${id}`);
}

// Подтвердить бронирование
export async function confirmBooking(booking_id: number) {
  return axios.post(`${API_BASE}/bookings/${booking_id}/confirm`);
}

// Отклонить бронирование
export async function rejectBooking(booking_id: number) {
  return axios.post(`${API_BASE}/bookings/${booking_id}/reject`);
}

// Явное создание брони (если где-то используешь)
export async function createBooking(payload: { trip_id: number, user_id: number, status?: string }) {
  const res = await axios.post(`${API_BASE}/bookings/`, payload);
  return res.data;
}

export async function getMyBookings(user_id: number) {
  const res = await axios.get(`${API_BASE}/bookings/`, { params: { user_id } });
  return res.data;
}

export async function cancelBooking(bookingId: number, userId: number) {
  return axios.delete(`${API_BASE}/bookings/${bookingId}/cancel`, {
    params: { user_id: userId }
  });
}

