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

// API для фотографий
export const photoAPI = {
  // Загрузить фотографию на сервер
  uploadPhoto: async (file) => {
    const formData = new FormData();
    formData.append('photo', file);
    
    try {
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      console.error('Ошибка загрузки на сервер:', error);
      throw error;
    }
  },
  
  // Удалить фотографию
  deletePhoto: async (photoId, photoData) => {
    try {
      await api.delete(`/photo/${photoId}`, {
        data: {
          storage: photoData.storage,
          path: photoData.path
        }
      });
    } catch (error) {
      console.error('Ошибка удаления фотографии:', error);
      throw error;
    }
  },
  
  // Получить URL фотографии
  getPhotoUrl: (path, storage = 'local') => {
    if (storage === 'cloudinary') {
      return path; // Cloudinary URL
    } else {
      // Локальный файл или Data URL
      return path.startsWith('data:') ? path : `/uploads/${path}`;
    }
  },
};

export default api;
