# Инструкции по развертыванию

## Проблема с изменяющимися ссылками

После деплоя на Vercel URL может изменяться по следующим причинам:

### 1. Автоматически генерируемые URL
- Vercel генерирует новый URL при каждом деплое
- Формат: `https://your-app-name-xxx.vercel.app`
- Это нормальное поведение для бесплатного плана

### 2. Решения для фиксации URL

#### Вариант A: Настройка кастомного домена
1. В панели Vercel перейдите в Settings → Domains
2. Добавьте ваш домен (например, `yourdomain.com`)
3. Настройте DNS записи согласно инструкциям Vercel

#### Вариант B: Использование Vercel CLI для фиксации
```bash
# Установите Vercel CLI
npm i -g vercel

# Войдите в аккаунт
vercel login

# Свяжите проект с существующим
vercel link

# Деплой с фиксированным URL
vercel --prod
```

#### Вариант C: Настройка в package.json
```json
{
  "vercel": {
    "name": "birthday-organizer",
    "alias": "your-fixed-url"
  }
}
```

### 3. Проверка текущего URL
После деплоя проверьте:
1. URL в панели Vercel
2. URL в терминале после `vercel --prod`
3. URL в настройках проекта

### 4. Настройка переменных окружения
Убедитесь, что в Vercel настроены:
- `NODE_ENV=production`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### 5. Проверка работы API
После деплоя проверьте:
- `https://your-app.vercel.app/api/health` - должен вернуть статус OK
- Загрузка фотографий должна работать через Cloudinary
