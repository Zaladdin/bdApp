import React, { useEffect } from 'react';
import { Mail } from 'lucide-react';

const YandexAuth = ({ onLogin }) => {
  useEffect(() => {
    // Загружаем Яндекс ID SDK
    const script = document.createElement('script');
    script.src = 'https://yastatic.net/s3/passport-sdk/autofill/v1/sdk-suggest-with-polyfills-latest.js';
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      // Инициализируем Яндекс ID
      if (window.YaAuthSuggest) {
        window.YaAuthSuggest.init({
          client_id: process.env.REACT_APP_YANDEX_CLIENT_ID || 'YOUR_YANDEX_CLIENT_ID',
          response_type: 'token',
          redirect_uri: window.location.origin
        }, window.location.origin, {
          view: 'button',
          parentId: 'yandex-auth-button',
          buttonView: 'main',
          buttonTheme: 'light',
          buttonSize: 'm',
          buttonBorderRadius: 8
        })
        .then((result) => {
          // Успешная авторизация
          console.log('Yandex auth success:', result);
          
          // Получаем информацию о пользователе
          fetch(`https://login.yandex.ru/info?format=json&oauth_token=${result.access_token}`)
            .then(response => response.json())
            .then(userInfo => {
              console.log('User info:', userInfo);
              
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
            })
            .catch(error => {
              console.error('Error fetching user info:', error);
            });
        })
        .catch((error) => {
          console.error('Yandex auth error:', error);
        });
      }
    };

    return () => {
      // Очистка при размонтировании
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [onLogin]);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-white opacity-80 mb-4">Или войдите через</p>
      </div>
      
      <div className="flex justify-center">
        <div 
          id="yandex-auth-button"
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-all duration-200 flex items-center space-x-2 cursor-pointer"
        >
          <Mail className="h-5 w-5" />
          <span>Яндекс</span>
        </div>
      </div>
      
      <div className="text-center">
        <p className="text-white text-xs opacity-60">
          Нажимая кнопку, вы соглашаетесь с условиями использования
        </p>
      </div>
    </div>
  );
};

export default YandexAuth;
