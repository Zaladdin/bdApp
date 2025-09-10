const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Временное хранилище данных (в реальном приложении используйте базу данных)
let eventData = {
  guests: [],
  wishlist: [],
  location: {
    name: '',
    address: '',
    date: '',
    time: ''
  },
  photos: []
};

// API Routes

// Получить все данные события
app.get('/api/event', (req, res) => {
  res.json(eventData);
});

// Гости
app.get('/api/guests', (req, res) => {
  res.json(eventData.guests);
});

app.post('/api/guests', (req, res) => {
  const { name, email, phone, status } = req.body;
  const guest = {
    id: uuidv4(),
    name,
    email,
    phone,
    status: status || 'pending',
    createdAt: new Date().toISOString()
  };
  eventData.guests.push(guest);
  res.json(guest);
});

app.put('/api/guests/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, phone, status } = req.body;
  const guestIndex = eventData.guests.findIndex(g => g.id === id);
  
  if (guestIndex === -1) {
    return res.status(404).json({ error: 'Гость не найден' });
  }
  
  eventData.guests[guestIndex] = {
    ...eventData.guests[guestIndex],
    name,
    email,
    phone,
    status
  };
  
  res.json(eventData.guests[guestIndex]);
});

app.delete('/api/guests/:id', (req, res) => {
  const { id } = req.params;
  eventData.guests = eventData.guests.filter(g => g.id !== id);
  res.json({ message: 'Гость удален' });
});

// Вишлист
app.get('/api/wishlist', (req, res) => {
  res.json(eventData.wishlist);
});

app.post('/api/wishlist', async (req, res) => {
  const { url, title, description, price } = req.body;
  
  try {
    const wishlistItem = {
      id: uuidv4(),
      url,
      title: title || 'Без названия',
      description: description || '',
      price: price || '',
      image: '',
      selectedBy: [],
      createdAt: new Date().toISOString()
    };
    
    eventData.wishlist.push(wishlistItem);
    res.json(wishlistItem);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при добавлении в вишлист' });
  }
});

app.put('/api/wishlist/:id/select', (req, res) => {
  const { id } = req.params;
  const { guestId } = req.body;
  
  const item = eventData.wishlist.find(w => w.id === id);
  if (!item) {
    return res.status(404).json({ error: 'Элемент вишлиста не найден' });
  }
  
  if (!item.selectedBy.includes(guestId)) {
    item.selectedBy.push(guestId);
  }
  
  res.json(item);
});

app.put('/api/wishlist/:id/deselect', (req, res) => {
  const { id } = req.params;
  const { guestId } = req.body;
  
  const item = eventData.wishlist.find(w => w.id === id);
  if (!item) {
    return res.status(404).json({ error: 'Элемент вишлиста не найден' });
  }
  
  item.selectedBy = item.selectedBy.filter(id => id !== guestId);
  res.json(item);
});

app.delete('/api/wishlist/:id', (req, res) => {
  const { id } = req.params;
  eventData.wishlist = eventData.wishlist.filter(w => w.id !== id);
  res.json({ message: 'Элемент вишлиста удален' });
});

// Место проведения
app.get('/api/location', (req, res) => {
  res.json(eventData.location);
});

app.put('/api/location', (req, res) => {
  const { name, address, date, time } = req.body;
  eventData.location = { name, address, date, time };
  res.json(eventData.location);
});

// Фотографии (упрощенная версия для Vercel)
app.get('/api/photos', (req, res) => {
  res.json(eventData.photos);
});

app.post('/api/photos', (req, res) => {
  // В Vercel загрузка файлов ограничена, поэтому используем заглушку
  const mockPhoto = {
    id: uuidv4(),
    filename: 'demo-photo.jpg',
    originalName: 'Демо фото',
    path: '/api/demo-photo',
    uploadedAt: new Date().toISOString()
  };
  
  eventData.photos.push(mockPhoto);
  res.json([mockPhoto]);
});

app.delete('/api/photos/:id', (req, res) => {
  const { id } = req.params;
  eventData.photos = eventData.photos.filter(p => p.id !== id);
  res.json({ message: 'Фото удалено' });
});

// Обработка ошибок
app.use((error, req, res, next) => {
  res.status(500).json({ error: error.message });
});

// Обработка всех методов для Vercel
app.all('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Экспорт для Vercel
module.exports = app;