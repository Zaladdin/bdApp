# Настройка базы данных для продакшена

## Текущее состояние

Сейчас приложение использует файловое хранение (`server/data.json`) для локальной разработки. Для продакшена на Vercel это не подходит, так как файлы теряются при каждом перезапуске.

## Рекомендуемые решения

### 1. Supabase (Рекомендуется)

**Преимущества:**
- Бесплатный план с 500MB
- PostgreSQL база данных
- Встроенная аутентификация
- Простая интеграция

**Настройка:**
1. Создайте аккаунт на [supabase.com](https://supabase.com)
2. Создайте новый проект
3. Получите URL и API ключ
4. Добавьте переменные окружения в Vercel:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 2. MongoDB Atlas

**Преимущества:**
- Бесплатный план с 512MB
- NoSQL база данных
- Простая интеграция

**Настройка:**
1. Создайте аккаунт на [mongodb.com](https://mongodb.com)
2. Создайте кластер
3. Получите connection string
4. Добавьте переменную окружения в Vercel:
   ```
   MONGODB_URI=your_mongodb_connection_string
   ```

### 3. PlanetScale (MySQL)

**Преимущества:**
- Бесплатный план с 1GB
- MySQL база данных
- Автоматическое масштабирование

## Миграция с файлового хранения

### Шаг 1: Установка зависимостей

```bash
npm install @supabase/supabase-js
# или
npm install mongodb
# или
npm install mysql2
```

### Шаг 2: Создание модуля базы данных

Создайте файл `server/database.js` с выбранной базой данных.

### Шаг 3: Обновление сервера

Замените функции `readData()` и `writeData()` на вызовы к базе данных.

### Шаг 4: Настройка переменных окружения

Добавьте переменные окружения в Vercel:
1. Перейдите в настройки проекта
2. Выберите "Environment Variables"
3. Добавьте необходимые переменные

## Пример миграции для Supabase

```javascript
// server/database.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const readData = async () => {
  try {
    const { data: users } = await supabase.from('users').select('*');
    const { data: events } = await supabase.from('events').select('*');
    
    return {
      users: users.reduce((acc, user) => ({ ...acc, [user.id]: user.data }), {}),
      events: events.reduce((acc, event) => ({ ...acc, [event.id]: event.data }), {})
    };
  } catch (error) {
    console.error('Error reading data:', error);
    return { users: {}, events: {} };
  }
};

const writeData = async (data) => {
  try {
    // Обновляем пользователей
    for (const [userId, userData] of Object.entries(data.users)) {
      await supabase
        .from('users')
        .upsert({ id: userId, data: userData, updated_at: new Date().toISOString() });
    }
    
    // Обновляем мероприятия
    for (const [eventId, eventData] of Object.entries(data.events)) {
      await supabase
        .from('events')
        .upsert({ id: eventId, data: eventData, updated_at: new Date().toISOString() });
    }
    
    return true;
  } catch (error) {
    console.error('Error writing data:', error);
    return false;
  }
};

module.exports = { readData, writeData };
```

## Схема базы данных

### Таблица users
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Таблица events
```sql
CREATE TABLE events (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Проверка работы

После настройки базы данных:
1. Запустите тест: `node test-api.js`
2. Проверьте, что данные сохраняются в базе
3. Перезапустите сервер и убедитесь, что данные загружаются

## Мониторинг

- Supabase: Dashboard с метриками
- MongoDB Atlas: Cloud Monitoring
- PlanetScale: Insights dashboard
