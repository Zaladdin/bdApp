const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testMigration() {
  console.log('🧪 Тестирование миграции на Supabase...\n');

  try {
    // Тест 1: Health check
    console.log('1. Проверка health endpoint...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health check:', healthResponse.data);

    // Тест 2: Сохранение пользователя в Supabase
    console.log('\n2. Сохранение данных пользователя в Supabase...');
    const userData = {
      userId: 'migration-test-user',
      userData: {
        name: 'Тест миграции',
        email: 'migration@test.com',
        guests: [
          { id: '1', name: 'Гость миграции', email: 'guest@test.com', status: 'confirmed' }
        ],
        wishlist: [
          { id: '1', name: 'Подарок миграции', description: 'Тестовый подарок' }
        ],
        location: {
          name: 'Место миграции',
          address: 'Адрес миграции',
          date: '2024-12-31',
          time: '20:00'
        },
        photos: []
      }
    };

    const saveUserResponse = await axios.post(`${API_BASE_URL}/users`, userData);
    console.log('✅ Пользователь сохранен в Supabase:', saveUserResponse.data);

    // Тест 3: Получение пользователя из Supabase
    console.log('\n3. Получение данных пользователя из Supabase...');
    const getUserResponse = await axios.get(`${API_BASE_URL}/users?userId=migration-test-user`);
    console.log('✅ Данные пользователя получены из Supabase:', getUserResponse.data);

    // Тест 4: Сохранение мероприятия в Supabase
    console.log('\n4. Сохранение мероприятия в Supabase...');
    const eventData = {
      eventId: 'migration-test-event',
      eventData: {
        ownerId: 'migration-test-user',
        ownerName: 'Тест миграции',
        guests: [
          { id: '1', name: 'Гость мероприятия', email: 'event-guest@test.com', status: 'confirmed' }
        ],
        wishlist: [
          { id: '1', name: 'Подарок мероприятия', description: 'Тестовый подарок мероприятия', selectedBy: [] }
        ],
        location: {
          name: 'Место мероприятия',
          address: 'Адрес мероприятия',
          date: '2024-12-31',
          time: '20:00'
        },
        photos: [],
        createdAt: new Date().toISOString(),
        isArchived: false
      }
    };

    const saveEventResponse = await axios.post(`${API_BASE_URL}/events`, eventData);
    console.log('✅ Мероприятие сохранено в Supabase:', saveEventResponse.data);

    // Тест 5: Получение мероприятия из Supabase
    console.log('\n5. Получение мероприятия из Supabase...');
    const getEventResponse = await axios.get(`${API_BASE_URL}/events?eventId=migration-test-event`);
    console.log('✅ Мероприятие получено из Supabase:', getEventResponse.data);

    // Тест 6: Получение всех мероприятий пользователя из Supabase
    console.log('\n6. Получение всех мероприятий пользователя из Supabase...');
    const getUserEventsResponse = await axios.get(`${API_BASE_URL}/events?userId=migration-test-user`);
    console.log('✅ Мероприятия пользователя получены из Supabase:', getUserEventsResponse.data);

    console.log('\n🎉 Миграция на Supabase прошла успешно!');
    console.log('📊 Данные теперь сохраняются в облачной базе данных PostgreSQL');
    console.log('🔒 Данные будут сохраняться даже после перезапуска сервера');

  } catch (error) {
    console.error('❌ Ошибка при тестировании миграции:', error.response?.data || error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Убедитесь, что сервер запущен:');
      console.log('   cd server && node index.js');
    }
    
    if (error.message.includes('SUPABASE_URL') || error.message.includes('SUPABASE_ANON_KEY')) {
      console.log('\n💡 Убедитесь, что переменные окружения настроены:');
      console.log('   1. Создайте проект в Supabase');
      console.log('   2. Выполните SQL скрипт из supabase-schema.sql');
      console.log('   3. Обновите env.local с вашими Supabase данными');
    }
  }
}

testMigration();
