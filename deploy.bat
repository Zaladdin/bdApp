@echo off
REM Скрипт для деплоя на Vercel с правильными настройками

echo 🚀 Начинаем деплой на Vercel...

REM Проверяем, установлен ли Vercel CLI
where vercel >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Vercel CLI не установлен. Установите: npm i -g vercel
    pause
    exit /b 1
)

REM Проверяем авторизацию
vercel whoami >nul 2>nul
if %errorlevel% neq 0 (
    echo 🔐 Входим в Vercel...
    vercel login
)

REM Собираем проект
echo 📦 Собираем проект...
call npm run build

REM Деплой с публичным доступом
echo 🌐 Деплоим с публичным доступом...
vercel --prod --public --name birthday-organizer

echo ✅ Деплой завершен!
echo 🔗 Проверьте URL в выводе выше
echo 🧪 Для проверки запустите: npm run check-deploy ^<URL^>
pause
