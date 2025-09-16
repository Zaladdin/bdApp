#!/bin/bash

# Скрипт для деплоя на Vercel с правильными настройками

echo "🚀 Начинаем деплой на Vercel..."

# Проверяем, установлен ли Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI не установлен. Установите: npm i -g vercel"
    exit 1
fi

# Проверяем авторизацию
if ! vercel whoami &> /dev/null; then
    echo "🔐 Входим в Vercel..."
    vercel login
fi

# Собираем проект
echo "📦 Собираем проект..."
npm run build

# Деплой с публичным доступом
echo "🌐 Деплоим с публичным доступом..."
vercel --prod --public --name birthday-organizer

echo "✅ Деплой завершен!"
echo "🔗 Проверьте URL в выводе выше"
echo "🧪 Для проверки запустите: npm run check-deploy <URL>"
