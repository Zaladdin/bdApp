// Скрипт для проверки деплоя
const axios = require('axios');

async function checkDeployment() {
  const baseUrl = process.argv[2] || 'https://your-app.vercel.app';
  
  console.log(`Проверяем деплой по адресу: ${baseUrl}`);
  
  try {
    // Проверяем API
    const healthResponse = await axios.get(`${baseUrl}/api/health`);
    console.log('✅ API работает:', healthResponse.data);
    
    // Проверяем главную страницу
    const mainResponse = await axios.get(baseUrl);
    console.log('✅ Главная страница загружается:', mainResponse.status === 200 ? 'OK' : 'ERROR');
    
    console.log('\n🎉 Деплой успешен!');
    console.log(`📱 URL приложения: ${baseUrl}`);
    console.log(`🔗 API endpoint: ${baseUrl}/api/health`);
    
  } catch (error) {
    console.error('❌ Ошибка при проверке деплоя:', error.message);
    console.log('\nВозможные причины:');
    console.log('1. URL неправильный или приложение не развернуто');
    console.log('2. Сервер не запущен');
    console.log('3. Проблемы с CORS');
    console.log('4. Неправильная конфигурация Vercel');
  }
}

checkDeployment();
