require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
// Пытаемся загрузить Supabase, если не получается - используем файловое хранение
let readData, writeData;
try {
  const supabase = require('./database-supabase');
  readData = supabase.readData;
  writeData = supabase.writeData;
  console.log('Using Supabase database');
} catch (error) {
  console.log('Supabase not available, using file storage:', error.message);
  
  // Fallback к файловому хранению
  const dataFile = path.join(__dirname, 'data.json');
  
  readData = async () => {
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
  
  writeData = async (data) => {
    try {
      fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error('Error writing data:', error);
      return false;
    }
  };
}

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

// Функции readData и writeData теперь импортируются из database-supabase.js

// API Routes

// Получить данные пользователя
app.get('/api/users', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    const data = await readData();
    const userData = data.users[userId] || null;
    res.json(userData);
  } catch (error) {
    console.error('Error getting user data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Сохранить данные пользователя
app.post('/api/users', async (req, res) => {
  try {
    const { userId, userData } = req.body;
    if (!userId || !userData) {
      return res.status(400).json({ error: 'userId and userData are required' });
    }
    
    const data = await readData();
    data.users[userId] = {
      ...userData,
      lastUpdated: new Date().toISOString()
    };
    
    const success = await writeData(data);
    if (success) {
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
app.get('/api/events', async (req, res) => {
  try {
    const { eventId, userId } = req.query;
    
    if (eventId) {
      // Получить конкретное мероприятие
      const data = await readData();
      const event = data.events[eventId] || null;
      res.json(event);
    } else if (userId) {
      // Получить все мероприятия пользователя
      const data = await readData();
      const userEvents = Object.entries(data.events)
        .filter(([id, event]) => event.ownerId === userId)
        .map(([id, event]) => ({ id, ...event }));
      
      res.json(userEvents);
    } else {
      res.status(400).json({ error: 'eventId or userId is required' });
    }
  } catch (error) {
    console.error('Error getting events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Сохранить мероприятие
app.post('/api/events', async (req, res) => {
  try {
    const { eventId, eventData } = req.body;
    if (!eventId || !eventData) {
      return res.status(400).json({ error: 'eventId and eventData are required' });
    }
    
    const data = await readData();
    data.events[eventId] = {
      ...eventData,
      lastUpdated: new Date().toISOString()
    };
    
    const success = await writeData(data);
    if (success) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: 'Failed to save event' });
    }
  } catch (error) {
    console.error('Error saving event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Удалить мероприятие
app.delete('/api/events', async (req, res) => {
  try {
    const { eventId } = req.query;
    if (!eventId) {
      return res.status(400).json({ error: 'eventId is required' });
    }
    
    const data = await readData();
    delete data.events[eventId];
    
    const success = await writeData(data);
    if (success) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: 'Failed to delete event' });
    }
  } catch (error) {
    console.error('Error deleting event:', error);
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