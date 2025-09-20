const axios = require('axios');

const API_BASE_URL = 'https://bd-app-umber.vercel.app/api';

async function testServerAPI() {
  console.log('🧪 Тестирование API на продакшн сервере...\n');

  try {
    // Тест 1: Health check
    console.log('1. Проверка health endpoint...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health check:', healthResponse.data);

    // Тест 2: Сохранение тестового пользователя
    console.log('\n2. Сохранение тестового пользователя...');
    const testUserId = 'test-sync-user-' + Date.now();
    const userData = {
      userId: testUserId,
      userData: {
        name: 'Тест синхронизации',
        email: 'sync@test.com',
        guests: [
          { id: '1', name: 'Гость с ноутбука', email: 'laptop@test.com', status: 'confirmed' }
        ],
        wishlist: [],
        location: { name: '', address: '', date: '', time: '' },
        photos: []
      }
    };

    const saveUserResponse = await axios.post(`${API_BASE_URL}/users`, userData);
    console.log('✅ Пользователь сохранен на сервере:', saveUserResponse.data);

    // Тест 3: Получение данных пользователя
    console.log('\n3. Получение данных пользователя с сервера...');
    const getUserResponse = await axios.get(`${API_BASE_URL}/users?userId=${testUserId}`);
    console.log('✅ Данные пользователя получены с сервера:', getUserResponse.data);

    // Тест 4: Проверка гостей
    if (getUserResponse.data && getUserResponse.data.guests) {
      console.log('\n4. Проверка гостей:');
      console.log('Количество гостей:', getUserResponse.data.guests.length);
      getUserResponse.data.guests.forEach((guest, index) => {
        console.log(`  Гость ${index + 1}: ${guest.name} (${guest.email}) - ${guest.status}`);
      });
    }

    console.log('\n🎉 API работает корректно!');
    console.log('📱 Теперь откройте приложение на мобильном и войдите с тем же пользователем');
    console.log(`👤 ID пользователя для теста: ${testUserId}`);

  } catch (error) {
    console.error('❌ Ошибка при тестировании API:', error.response?.data || error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.log('\n💡 Проблема с DNS. Проверьте URL сервера.');
    } else if (error.response?.status === 404) {
      console.log('\n💡 API endpoint не найден. Проверьте конфигурацию Vercel.');
    } else if (error.response?.status === 500) {
      console.log('\n💡 Ошибка сервера. Проверьте логи в Vercel Dashboard.');
    }
  }
}

testServerAPI();
