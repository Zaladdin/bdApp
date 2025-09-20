# Настройка Vercel для деплоя

## Проблемы, которые были исправлены:

1. ✅ **Missing public directory** - создана папка `build`
2. ✅ **Conflicting functions and builds** - удален конфликтующий `functions`
3. ✅ **Missing build script** - исправлен импорт `userAPI`
4. ✅ **Environment variables** - добавлены в `vercel.json`

## Настройка переменных окружения в Vercel Dashboard:

### Способ 1: Через Vercel Dashboard (Рекомендуется)

1. Перейдите в ваш проект на [vercel.com](https://vercel.com)
2. Откройте **Settings** → **Environment Variables**
3. Добавьте следующие переменные:

```
NODE_ENV = production
CLOUDINARY_CLOUD_NAME = dhlq16alb
CLOUDINARY_API_KEY = 232257195741972
CLOUDINARY_API_SECRET = 9Fy1dqGgHrUf29SmBM3wI5J6568
SUPABASE_URL = https://jtpnkwlxplycfcwzrrro.supabase.co
SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0cG5rd2x4cGx5Y2Zjd3pycnJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MDQ0NDEsImV4cCI6MjA3Mzk4MDQ0MX0.VFhFG1yPYHYN1eMiVFOLHkhN8O5jvCyMZkDVpd_7BwI
```

4. Нажмите **Save** для каждой переменной
5. Перезапустите деплой

### Способ 2: Через Vercel CLI

```bash
# Установите Vercel CLI
npm i -g vercel

# Логиньтесь
vercel login

# Установите переменные окружения
vercel env add CLOUDINARY_CLOUD_NAME
vercel env add CLOUDINARY_API_KEY
vercel env add CLOUDINARY_API_SECRET
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY

# Деплой
vercel --prod
```

## Проверка деплоя:

1. **Проверьте логи** в Vercel Dashboard → Functions
2. **Проверьте переменные** в Settings → Environment Variables
3. **Проверьте API** - откройте `https://your-domain.vercel.app/api/health`

## Если все еще есть ошибки:

### 1. Очистите кэш Vercel:
```bash
vercel --prod --force
```

### 2. Проверьте Supabase таблицы:
- Убедитесь, что выполнили SQL скрипт из `supabase-schema.sql`
- Проверьте, что таблицы `users` и `events` созданы

### 3. Проверьте логи сервера:
- В Vercel Dashboard → Functions → View Function Logs
- Ищите ошибки подключения к Supabase

## Структура проекта для Vercel:

```
BDApp/
├── build/                 # React build (создается npm run build)
├── server/
│   ├── index.js          # API сервер
│   └── database-supabase.js
├── src/                  # React приложение
├── vercel.json          # Конфигурация Vercel
└── package.json
```

## Команды для локальной разработки:

```bash
# Сборка React приложения
npm run build

# Запуск сервера локально
cd server && node index.js

# Запуск всего приложения
npm run dev
```

## Команды для деплоя:

```bash
# Сборка и деплой
npm run build
vercel --prod

# Или через Git (автоматически)
git push origin main
```
