// Vercel API endpoint для пользователей
const { readData, writeData } = require('../server/database-supabase');

export default async function handler(req, res) {
  // Включаем CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      // Получить данные пользователя
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }
      
      const data = await readData();
      const userData = data.users[userId] || null;
      res.json(userData);
    } else if (req.method === 'POST') {
      // Сохранить данные пользователя
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
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in users API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
