// Vercel Serverless Function для работы с пользователями
const fs = require('fs');
const path = require('path');

// Файл для хранения данных
const dataFile = path.join(process.cwd(), 'data', 'users.json');

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
    return {};
  } catch (error) {
    console.error('Error reading data:', error);
    return {};
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
      // Получить данные пользователя
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ error: 'Missing userId' });
      }

      const data = readData();
      const userData = data[userId] || null;
      
      res.status(200).json(userData);
    } else if (method === 'POST') {
      // Сохранить данные пользователя
      const { userId, userData } = req.body;
      
      if (!userId || !userData) {
        return res.status(400).json({ error: 'Missing userId or userData' });
      }

      const data = readData();
      data[userId] = {
        ...userData,
        lastUpdated: new Date().toISOString()
      };

      if (writeData(data)) {
        res.status(200).json({ success: true });
      } else {
        res.status(500).json({ error: 'Failed to save user data' });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
