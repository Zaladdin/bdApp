import React, { useState } from 'react';
import { Mail } from 'lucide-react';

const YandexAuth = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleYandexAuth = () => {
    setIsLoading(true);
    setError('');

    // Проверяем наличие Client ID
    const clientId = process.env.REACT_APP_YANDEX_CLIENT_ID;
    if (!clientId || clientId === 'YOUR_YANDEX_CLIENT_ID') {
      setError('Client ID не настроен. Проверьте переменные окружения.');
      setIsLoading(false);
      return;
    }

    // Создаем URL для авторизации через Яндекс
    const redirectUri = encodeURIComponent(`${window.location.origin}/yandex-callback.html`);
    const authUrl = `https://oauth.yandex.ru/authorize?response_type=token&client_id=${clientId}&redirect_uri=${redirectUri}&scope=login:email+login:info`;

    // Открываем окно авторизации
    const authWindow = window.open(
      authUrl,
      'yandex_auth',
      'width=500,height=600,scrollbars=yes,resizable=yes'
    );

    // Слушаем сообщения от окна авторизации
    const messageListener = (event) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === 'YANDEX_AUTH_SUCCESS') {
        const { access_token } = event.data;
        fetchUserInfo(access_token);
        authWindow.close();
        window.removeEventListener('message', messageListener);
      } else if (event.data.type === 'YANDEX_AUTH_ERROR') {
        setError('Ошибка авторизации: ' + event.data.error);
        setIsLoading(false);
        authWindow.close();
        window.removeEventListener('message', messageListener);
      }
    };

    window.addEventListener('message', messageListener);

    // Проверяем, не закрыли ли окно
    const checkClosed = setInterval(() => {
      if (authWindow.closed) {
        clearInterval(checkClosed);
        setIsLoading(false);
        window.removeEventListener('message', messageListener);
      }
    }, 1000);
  };

  const fetchUserInfo = async (accessToken) => {
    try {
      const response = await fetch(`https://login.yandex.ru/info?format=json&oauth_token=${accessToken}`);
      const userInfo = await response.json();

      // Создаем пользователя в нашем формате
      const user = {
        id: userInfo.id,
        name: userInfo.real_name || userInfo.display_name || userInfo.login,
        email: userInfo.default_email,
        avatar: userInfo.default_avatar_id ? `https://avatars.yandex.net/get-yapic/${userInfo.default_avatar_id}/islands-200` : null,
        provider: 'yandex',
        yandexId: userInfo.id,
        createdAt: new Date().toISOString()
      };

      // Сохраняем пользователя
      const users = JSON.parse(localStorage.getItem('birthdayAppUsers') || '[]');
      const existingUserIndex = users.findIndex(u => u.yandexId === userInfo.id);
      
      if (existingUserIndex >= 0) {
        // Обновляем существующего пользователя
        users[existingUserIndex] = { ...users[existingUserIndex], ...user };
      } else {
        // Добавляем нового пользователя
        users.push(user);
      }
      
      localStorage.setItem('birthdayAppUsers', JSON.stringify(users));
      localStorage.setItem('birthdayAppCurrentUser', JSON.stringify(user));
      
      onLogin(user);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching user info:', error);
      setError('Ошибка получения информации о пользователе');
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-500 bg-opacity-20 border border-red-500 border-opacity-30 rounded-lg p-3">
          <p className="text-red-200 text-sm text-center">{error}</p>
        </div>
      )}
      
      <button
        onClick={handleYandexAuth}
        disabled={isLoading}
        className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
      >
        <Mail className="h-5 w-5" />
        <span>{isLoading ? 'Загрузка...' : 'Войти через Яндекс'}</span>
      </button>
      
      <div className="text-center">
        <p className="text-white text-xs opacity-60">
          Нажимая кнопку, вы соглашаетесь с условиями использования
        </p>
      </div>
    </div>
  );
};

export default YandexAuth;
