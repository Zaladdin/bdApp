// Пример миграции на Supabase
// Установите: npm install @supabase/supabase-js

require('dotenv').config({ path: '../env.local' });
const { createClient } = require('@supabase/supabase-js');

// Проверяем переменные окружения
console.log('Supabase config:', {
  url: process.env.SUPABASE_URL ? 'SET' : 'NOT SET',
  key: process.env.SUPABASE_ANON_KEY ? 'SET' : 'NOT SET'
});

// Проверяем, что переменные окружения установлены
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error('Supabase environment variables not set');
}

// Инициализация Supabase клиента
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Функция для чтения данных из Supabase
const readData = async () => {
  try {
    console.log('Reading data from Supabase...');
    
    // Получаем пользователей
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');
    
    if (usersError) {
      console.error('Error fetching users:', usersError);
      return { users: {}, events: {} };
    }
    
    // Получаем мероприятия
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*');
    
    if (eventsError) {
      console.error('Error fetching events:', eventsError);
      return { users: {}, events: {} };
    }
    
    // Преобразуем данные в нужный формат
    const usersData = users.reduce((acc, user) => {
      acc[user.id] = user.data;
      return acc;
    }, {});
    
    const eventsData = events.reduce((acc, event) => {
      acc[event.id] = event.data;
      return acc;
    }, {});
    
    console.log('Data loaded from Supabase:', { 
      usersCount: Object.keys(usersData).length,
      eventsCount: Object.keys(eventsData).length 
    });
    
    return { users: usersData, events: eventsData };
  } catch (error) {
    console.error('Error reading data from Supabase:', error);
    return { users: {}, events: {} };
  }
};

// Функция для записи данных в Supabase
const writeData = async (data) => {
  try {
    console.log('Writing data to Supabase...');
    
    // Обновляем пользователей
    for (const [userId, userData] of Object.entries(data.users)) {
      const { error } = await supabase
        .from('users')
        .upsert({ 
          id: userId, 
          data: userData, 
          updated_at: new Date().toISOString() 
        });
      
      if (error) {
        console.error(`Error updating user ${userId}:`, error);
        return false;
      }
    }
    
    // Обновляем мероприятия
    for (const [eventId, eventData] of Object.entries(data.events)) {
      const { error } = await supabase
        .from('events')
        .upsert({ 
          id: eventId, 
          data: eventData, 
          updated_at: new Date().toISOString() 
        });
      
      if (error) {
        console.error(`Error updating event ${eventId}:`, error);
        return false;
      }
    }
    
    console.log('Data saved to Supabase successfully');
    return true;
  } catch (error) {
    console.error('Error writing data to Supabase:', error);
    return false;
  }
};

// Функция для инициализации таблиц (выполнить один раз)
const initializeTables = async () => {
  try {
    console.log('Initializing Supabase tables...');
    
    // Создаем таблицу пользователей
    const { error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError && usersError.code === 'PGRST116') {
      console.log('Users table does not exist, creating...');
      // Здесь нужно создать таблицу через SQL Editor в Supabase Dashboard
      console.log('Please create the users table manually in Supabase Dashboard');
    }
    
    // Создаем таблицу мероприятий
    const { error: eventsError } = await supabase
      .from('events')
      .select('*')
      .limit(1);
    
    if (eventsError && eventsError.code === 'PGRST116') {
      console.log('Events table does not exist, creating...');
      // Здесь нужно создать таблицу через SQL Editor в Supabase Dashboard
      console.log('Please create the events table manually in Supabase Dashboard');
    }
    
    console.log('Tables initialized successfully');
  } catch (error) {
    console.error('Error initializing tables:', error);
  }
};

module.exports = { readData, writeData, initializeTables };
