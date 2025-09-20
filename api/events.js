// Vercel API endpoint для мероприятий
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
      // Получить мероприятие или все мероприятия пользователя
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
    } else if (req.method === 'POST') {
      // Сохранить мероприятие
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
    } else if (req.method === 'DELETE') {
      // Удалить мероприятие
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
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in events API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
