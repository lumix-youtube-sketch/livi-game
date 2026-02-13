import axios from 'axios';
import WebApp from '@twa-dev/sdk';

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_URL = isLocal 
  ? 'http://localhost:3000/api' 
  : 'https://livi-backend.onrender.com/api'; 

console.log('Using API URL:', API_URL);

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
export const createPet = (partnerId = null, name = 'Livi', shape = 'capsule') => {
  const user = WebApp.initDataUnsafe?.user || { id: '999' };
  return axios.post(`${API_URL}/pet/create`, {
    telegramId: user.id.toString(),
    partnerId,
    name,
    shape
  });
};

// Join Pet
export const joinPet = (petId) => {
  const user = WebApp.initDataUnsafe?.user || { id: '999' };
  return axios.post(`${API_URL}/pet/join`, {
    telegramId: user.id.toString(),
    petId
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

// Advanced Features
export const uploadTexture = (petId, file, type) => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('type', type);
  return axios.post(`${API_URL}/pet/${petId}/upload-texture`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const submitScore = (petId, score) => {
  const user = WebApp.initDataUnsafe?.user || { id: '999' };
  return axios.post(`${API_URL}/pet/${petId}/score`, { 
      score, 
      telegramId: user.id.toString() 
  });
};

export const claimQuest = (petId, questId) => {
    return axios.post(`${API_URL}/pet/${petId}/quest/claim`, { questId });
};
