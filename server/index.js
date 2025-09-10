const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Создаем папку для загрузок если её нет
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Только изображения разрешены!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

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
    status: status || 'pending', // pending, confirmed, declined
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
    // Здесь можно добавить логику для получения превью ссылки
    const wishlistItem = {
      id: uuidv4(),
      url,
      title: title || 'Без названия',
      description: description || '',
      price: price || '',
      image: '', // Будет заполнено при получении превью
      selectedBy: [], // Массив ID гостей, которые выбрали этот подарок
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

// Фотографии
app.get('/api/photos', (req, res) => {
  res.json(eventData.photos);
});

app.post('/api/photos', upload.array('photos', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'Файлы не загружены' });
  }
  
  const uploadedPhotos = req.files.map(file => ({
    id: uuidv4(),
    filename: file.filename,
    originalName: file.originalname,
    path: `/uploads/${file.filename}`,
    uploadedAt: new Date().toISOString()
  }));
  
  eventData.photos.push(...uploadedPhotos);
  res.json(uploadedPhotos);
});

app.delete('/api/photos/:id', (req, res) => {
  const { id } = req.params;
  const photo = eventData.photos.find(p => p.id === id);
  
  if (!photo) {
    return res.status(404).json({ error: 'Фото не найдено' });
  }
  
  // Удаляем файл с диска
  const filePath = path.join(__dirname, photo.path);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  
  // Удаляем из массива
  eventData.photos = eventData.photos.filter(p => p.id !== id);
  res.json({ message: 'Фото удалено' });
});

// Обработка ошибок
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Файл слишком большой (максимум 5MB)' });
    }
  }
  res.status(500).json({ error: error.message });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
