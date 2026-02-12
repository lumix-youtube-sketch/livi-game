import axios from 'axios';
import WebApp from '@twa-dev/sdk';

const API_URL = 'https://livi-backend.onrender.com/api'; 
// For local dev: 'http://localhost:3000/api'

// Auth & Init
export const login = async () => {
  const user = WebApp.initDataUnsafe?.user || { id: '999', first_name: 'DevUser', username: 'dev' };
  return axios.post(`${API_URL}/auth`, {
    telegramId: user.id.toString(),
    username: user.username,
    firstName: user.first_name
  });
};

// Create Pet
export const createPet = (partnerId = null, name = 'Livi') => {
  const user = WebApp.initDataUnsafe?.user || { id: '999' };
  return axios.post(`${API_URL}/pet/create`, {
    telegramId: user.id.toString(),
    partnerId,
    name
  });
};

// Actions
export const performAction = (petId, type) => {
  return axios.post(`${API_URL}/pet/${petId}/action`, { type });
};

// Shop
export const getShop = () => axios.get(`${API_URL}/shop`);

export const buyItem = (petId, itemId) => {
  return axios.post(`${API_URL}/pet/${petId}/buy`, { itemId });
};

export const equipItem = (petId, itemId, type) => {
  return axios.post(`${API_URL}/pet/${petId}/equip`, { itemId, type });
};
