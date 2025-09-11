import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3000/api' 
  : '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// API для пользователей
export const userAPI = {
  // Получить данные пользователя
  getUser: (userId) => api.get(`/users?userId=${userId}`),
  
  // Сохранить данные пользователя
  saveUser: (userId, userData) => api.post('/users', { userId, userData }),
};

// API для мероприятий
export const eventAPI = {
  // Получить все мероприятия пользователя
  getUserEvents: (userId) => api.get(`/events?userId=${userId}`),
  
  // Сохранить мероприятие
  saveEvent: (eventId, eventData) => api.post('/events', { eventId, eventData }),
  
  // Удалить мероприятие
  deleteEvent: (eventId) => api.delete(`/events?eventId=${eventId}`),
};

// API для фотографий (пока используем localStorage)
export const photoAPI = {
  // Загрузить фотографию (локально)
  uploadPhoto: (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const photoData = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          originalName: file.name,
          path: e.target.result,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString()
        };
        resolve({ data: photoData });
      };
      reader.readAsDataURL(file);
    });
  },
  
  // Получить URL фотографии
  getPhotoUrl: (path) => path,
};

export default api;
