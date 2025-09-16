// Скрипт для проверки деплоя
const axios = require('axios');

async function checkDeployment() {
  const baseUrl = process.argv[2] || 'https://your-app.vercel.app';
  
  console.log(`Проверяем деплой по адресу: ${baseUrl}`);
  
  try {
    // Проверяем главную страницу
    console.log('🔍 Проверяем главную страницу...');
    const mainResponse = await axios.get(baseUrl, { 
      timeout: 10000,
      validateStatus: function (status) {
        return status < 500; // Принимаем любые статусы меньше 500
      }
    });
    
    if (mainResponse.status === 200) {
      console.log('✅ Главная страница загружается: OK');
    } else if (mainResponse.status === 401) {
      console.log('⚠️  Главная страница требует авторизации (401)');
      console.log('   Это может означать, что проект настроен как приватный');
    } else {
      console.log(`⚠️  Главная страница: статус ${mainResponse.status}`);
    }
    
    // Проверяем API
    console.log('🔍 Проверяем API...');
    try {
      const healthResponse = await axios.get(`${baseUrl}/api/health`, { 
        timeout: 10000,
        validateStatus: function (status) {
          return status < 500;
        }
      });
      
      if (healthResponse.status === 200) {
        console.log('✅ API работает:', healthResponse.data);
      } else {
        console.log(`⚠️  API: статус ${healthResponse.status}`);
      }
    } catch (apiError) {
      console.log('⚠️  API недоступен:', apiError.message);
    }
    
    console.log('\n📋 Результат проверки:');
    console.log(`📱 URL приложения: ${baseUrl}`);
    console.log(`🔗 API endpoint: ${baseUrl}/api/health`);
    
    if (mainResponse.status === 401) {
      console.log('\n💡 Рекомендации:');
      console.log('1. Проверьте настройки приватности в панели Vercel');
      console.log('2. Убедитесь, что проект настроен как публичный');
      console.log('3. Проверьте переменные окружения в Vercel');
    }
    
  } catch (error) {
    console.error('❌ Ошибка при проверке деплоя:', error.message);
    console.log('\nВозможные причины:');
    console.log('1. URL неправильный или приложение не развернуто');
    console.log('2. Сервер не запущен');
    console.log('3. Проблемы с CORS');
    console.log('4. Неправильная конфигурация Vercel');
    console.log('5. Проект настроен как приватный');
  }
}

checkDeployment();
