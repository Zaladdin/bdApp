import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000/api' 
  : '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// API для пользователей
export const userAPI = {
  // Получить данные пользователя
  getUser: (userId) => api.get(`/user/${userId}`),
  
  // Сохранить данные пользователя
  saveUser: (userId, userData) => api.post(`/user/${userId}`, userData),
};

// API для мероприятий
export const eventAPI = {
  // Получить мероприятие
  getEvent: (eventId) => api.get(`/event/${eventId}`),
  
  // Сохранить мероприятие
  saveEvent: (eventId, eventData) => api.post(`/event/${eventId}`, eventData),
  
  // Получить все мероприятия пользователя
  getUserEvents: (userId) => api.get(`/user/${userId}/events`),
  
  // Удалить мероприятие
  deleteEvent: (eventId) => api.delete(`/event/${eventId}`),
};

// API для фотографий
export const photoAPI = {
  // Загрузить фотографию
  uploadPhoto: (file) => {
    const formData = new FormData();
    formData.append('photo', file);
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Получить URL фотографии
  getPhotoUrl: (filename) => {
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5000' 
      : '';
    return `${baseUrl}/uploads/${filename}`;
  },
};

// API для проверки здоровья сервера
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;
