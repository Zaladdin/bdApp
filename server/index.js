require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();
const PORT = process.env.PORT || 5000;

// Cloudinary configuration
console.log('Cloudinary config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? '***' + process.env.CLOUDINARY_API_KEY.slice(-4) : 'NOT SET',
  api_secret: process.env.CLOUDINARY_API_SECRET ? '***' + process.env.CLOUDINARY_API_SECRET.slice(-4) : 'NOT SET'
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files (для тестовой страницы)
app.use(express.static(path.join(__dirname, '..')));

// Создаем папки если их нет (для локального fallback)
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Настройка Cloudinary storage для multer
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'birthday-app-photos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 1200, height: 1200, crop: 'limit' }] // Автоматическое сжатие
  }
});

// Fallback storage для локального хранения
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Выбираем storage в зависимости от наличия Cloudinary конфигурации
const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET;
const storage = isCloudinaryConfigured ? cloudinaryStorage : localStorage;

console.log('Storage mode:', isCloudinaryConfigured ? 'CLOUDINARY' : 'LOCAL');

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Файл для хранения данных
const dataFile = path.join(__dirname, 'data.json');

// Функция для чтения данных
const readData = () => {
  try {
    if (fs.existsSync(dataFile)) {
      const data = fs.readFileSync(dataFile, 'utf8');
      return JSON.parse(data);
    }
    return { users: {}, events: {} };
  } catch (error) {
    console.error('Error reading data:', error);
    return { users: {}, events: {} };
  }
};

// Функция для записи данных
const writeData = (data) => {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing data:', error);
    return false;
  }
};

// API Routes

// Получить данные пользователя
app.get('/api/user/:userId', (req, res) => {
  try {
    const data = readData();
    const userData = data.users[req.params.userId] || null;
    res.json(userData);
  } catch (error) {
    console.error('Error getting user data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Сохранить данные пользователя
app.post('/api/user/:userId', (req, res) => {
  try {
    const data = readData();
    data.users[req.params.userId] = {
      ...req.body,
      lastUpdated: new Date().toISOString()
    };
    
    if (writeData(data)) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: 'Failed to save data' });
    }
  } catch (error) {
    console.error('Error saving user data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Получить мероприятие
app.get('/api/event/:eventId', (req, res) => {
  try {
    const data = readData();
    const event = data.events[req.params.eventId] || null;
    res.json(event);
  } catch (error) {
    console.error('Error getting event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Сохранить мероприятие
app.post('/api/event/:eventId', (req, res) => {
  try {
    const data = readData();
    data.events[req.params.eventId] = {
      ...req.body,
      lastUpdated: new Date().toISOString()
    };
    
    if (writeData(data)) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: 'Failed to save event' });
    }
  } catch (error) {
    console.error('Error saving event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Получить все мероприятия пользователя
app.get('/api/user/:userId/events', (req, res) => {
  try {
    const data = readData();
    const userEvents = Object.entries(data.events)
      .filter(([id, event]) => event.ownerId === req.params.userId)
      .map(([id, event]) => ({ id, ...event }));
    
    res.json(userEvents);
  } catch (error) {
    console.error('Error getting user events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Загрузить фотографию
app.post('/api/upload', upload.single('photo'), (req, res) => {
  try {
    console.log('Upload request received');
    console.log('File info:', req.file);
    console.log('Environment check:', {
      cloud_name: !!process.env.CLOUDINARY_CLOUD_NAME,
      api_key: !!process.env.CLOUDINARY_API_KEY,
      api_secret: !!process.env.CLOUDINARY_API_SECRET
    });

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Проверяем, используем ли мы Cloudinary или локальное хранилище
    const isUsingCloudinary = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET;

    console.log('Using storage:', isUsingCloudinary ? 'CLOUDINARY' : 'LOCAL');

    const photoData = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: isUsingCloudinary ? req.file.path : `/uploads/${req.file.filename}`,
      size: req.file.size,
      type: req.file.mimetype,
      uploadedAt: new Date().toISOString(),
      storage: isUsingCloudinary ? 'cloudinary' : 'local'
    };

    console.log('Photo data:', photoData);
    res.json(photoData);
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Получить фотографию
app.get('/uploads/:filename', (req, res) => {
  try {
    const filePath = path.join(uploadsDir, req.params.filename);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    console.error('Error serving file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Удалить фотографию
app.delete('/api/photo/:photoId', async (req, res) => {
  try {
    const { photoId } = req.params;
    const { storage, path } = req.body;

    if (storage === 'cloudinary') {
      // Удаляем из Cloudinary
      const publicId = path.split('/').pop().split('.')[0]; // Извлекаем public_id из URL
      await cloudinary.uploader.destroy(`birthday-app-photos/${publicId}`);
    } else {
      // Удаляем локальный файл
      const filename = path.split('/').pop();
      const filePath = path.join(uploadsDir, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Удалить мероприятие
app.delete('/api/event/:eventId', (req, res) => {
  try {
    const data = readData();
    delete data.events[req.params.eventId];
    
    if (writeData(data)) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: 'Failed to delete event' });
    }
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});