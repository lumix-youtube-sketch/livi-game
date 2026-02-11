import axios from 'axios';
import WebApp from '@twa-dev/sdk';

// На Render мы передадим этот URL через переменные окружения
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  // Attach Telegram Init Data for Auth
  if (WebApp.initData) {
    config.headers.Authorization = WebApp.initData;
  } else {
    // Fallback for local browser testing without Telegram
    // In backend .env set SKIP_AUTH=true
    config.headers.Authorization = 'mock_init_data'; 
  }
  return config;
});

export const login = () => api.post('/auth');
export const joinPair = (targetUserId) => api.post('/pair/join', { targetUserId });
export const performAction = (type) => api.post('/pet/action', { type });
export const uploadClothing = (formData) => api.post('/pet/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

export default api;