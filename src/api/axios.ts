import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
});

// Подставляем telegram_id в заголовки
api.interceptors.request.use((config) => {
  const telegramId = localStorage.getItem('telegram_id');
  if (telegramId) {
    config.headers['X-Telegram-ID'] = telegramId;
  }
  return config;
});

export default api;
