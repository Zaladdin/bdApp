// Vercel Serverless Function для работы с мероприятиями
const fs = require('fs');
const path = require('path');

// Файл для хранения данных (в реальном проекте лучше использовать базу данных)
const dataFile = path.join(process.cwd(), 'data', 'events.json');

// Создаем папку data если её нет
const dataDir = path.dirname(dataFile);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Функция для чтения данных
const readData = () => {
  try {
    if (fs.existsSync(dataFile)) {
      const data = fs.readFileSync(dataFile, 'utf8');
      return JSON.parse(data);
    }
    return { events: {}, users: {} };
  } catch (error) {
    console.error('Error reading data:', error);
    return { events: {}, users: {} };
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

export default function handler(req, res) {
  // Настройка CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { method } = req;

  try {
    if (method === 'GET') {
      // Получить все мероприятия пользователя
      const { userId } = req.query;
      const data = readData();
      
      if (userId) {
        const userEvents = Object.entries(data.events || {})
          .filter(([id, event]) => event.ownerId === userId)
          .map(([id, event]) => ({ id, ...event }));
        
        res.status(200).json(userEvents);
      } else {
        res.status(200).json(data.events || {});
      }
    } else if (method === 'POST') {
      // Сохранить мероприятие
      const { eventId, eventData } = req.body;
      
      if (!eventId || !eventData) {
        return res.status(400).json({ error: 'Missing eventId or eventData' });
      }

      const data = readData();
      data.events[eventId] = {
        ...eventData,
        lastUpdated: new Date().toISOString()
      };

      if (writeData(data)) {
        res.status(200).json({ success: true });
      } else {
        res.status(500).json({ error: 'Failed to save event' });
      }
    } else if (method === 'DELETE') {
      // Удалить мероприятие
      const { eventId } = req.query;
      
      if (!eventId) {
        return res.status(400).json({ error: 'Missing eventId' });
      }

      const data = readData();
      delete data.events[eventId];

      if (writeData(data)) {
        res.status(200).json({ success: true });
      } else {
        res.status(500).json({ error: 'Failed to delete event' });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
