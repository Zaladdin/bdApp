# Руководство по миграции на базу данных

## Текущее состояние

✅ **Исправлено:** API endpoints теперь работают корректно
✅ **Исправлено:** Данные сохраняются на сервер
✅ **Исправлено:** Данные загружаются с сервера при входе

## Что нужно сделать для продакшена

### 1. Выберите базу данных

**Рекомендуется Supabase** (бесплатно, 500MB, PostgreSQL)

### 2. Настройте Supabase

1. Перейдите на [supabase.com](https://supabase.com)
2. Создайте новый проект
3. В SQL Editor выполните скрипт из `supabase-schema.sql`
4. Получите URL и API ключ из Settings > API

### 3. Настройте переменные окружения

В Vercel Dashboard:
1. Перейдите в Settings > Environment Variables
2. Добавьте:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 4. Обновите сервер

Замените в `server/index.js`:

```javascript
// Замените эти строки:
const dataFile = path.join(__dirname, 'data.json');

const readData = () => {
  // ... существующий код
};

const writeData = (data) => {
  // ... существующий код
};

// На эти:
const { readData, writeData } = require('./database-supabase');
```

### 5. Установите зависимости

```bash
npm install @supabase/supabase-js
```

### 6. Протестируйте

```bash
node test-api.js
```

## Альтернативные базы данных

### MongoDB Atlas

1. Создайте кластер на [mongodb.com](https://mongodb.com)
2. Получите connection string
3. Добавьте переменную: `MONGODB_URI=your_connection_string`
4. Используйте `server/database-mongodb.js` (создать по аналогии)

### PlanetScale (MySQL)

1. Создайте базу на [planetscale.com](https://planetscale.com)
2. Получите connection string
3. Добавьте переменную: `DATABASE_URL=your_connection_string`
4. Используйте `server/database-mysql.js` (создать по аналогии)

## Проверка работы

После миграции:

1. **Локально:**
   ```bash
   npm run dev
   # Откройте http://localhost:3000
   # Добавьте гостя, проверьте консоль браузера
   ```

2. **На сервере:**
   ```bash
   node test-api.js
   # Должно показать успешное сохранение
   ```

3. **В базе данных:**
   - Проверьте, что данные появились в таблицах
   - Перезапустите сервер
   - Убедитесь, что данные загружаются

## Откат

Если что-то пошло не так, вернитесь к файловому хранению:

```javascript
// В server/index.js верните:
const dataFile = path.join(__dirname, 'data.json');

const readData = () => {
  try {
    if (fs.existsSync(dataFile)) {
      const data = fs.readFileSync(dataFile, 'utf8');
      return JSON.parse(data);
    }
    return { users: {}, events: {} };
  } catch (error) {
    console.error('Error reading data:', error);
    return { users: {}, events: {} };
  }
};

const writeData = (data) => {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing data:', error);
    return false;
  }
};
```

## Мониторинг

- **Supabase:** Dashboard > Table Editor
- **MongoDB Atlas:** Database > Browse Collections
- **PlanetScale:** Database > Tables

## Поддержка

Если возникли проблемы:
1. Проверьте логи в Vercel Dashboard
2. Проверьте переменные окружения
3. Убедитесь, что база данных доступна
4. Проверьте права доступа к таблицам
