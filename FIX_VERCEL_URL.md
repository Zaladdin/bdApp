# Исправление проблемы с URL в Vercel

## Проблема
После деплоя Vercel генерирует URL: `https://bd-ka4w6a0of-zaladdins-projects-27b94f93.vercel.app/`
И показывает ошибку 401 (Unauthorized) - проект настроен как приватный.

## Решение

### 1. Сделать проект публичным в панели Vercel

1. Откройте [vercel.com](https://vercel.com)
2. Войдите в свой аккаунт
3. Найдите проект `birthday-organizer` или `bd-ka4w6a0of`
4. Перейдите в **Settings** → **General**
5. В разделе **Visibility** выберите **Public**
6. Сохраните изменения

### 2. Настроить фиксированный URL

#### Вариант A: Через панель Vercel
1. В настройках проекта перейдите в **Domains**
2. Добавьте кастомный домен или используйте предложенный Vercel
3. Настройте DNS записи

#### Вариант B: Через Vercel CLI
```bash
# Войти в аккаунт
vercel login

# Связать проект
vercel link

# Деплой с фиксированным именем
vercel --prod --name birthday-organizer

# Или с alias
vercel --prod --alias birthday-app
```

### 3. Проверить переменные окружения

В панели Vercel → Settings → Environment Variables убедитесь, что настроены:
- `NODE_ENV=production`
- `CLOUDINARY_CLOUD_NAME=your_cloud_name`
- `CLOUDINARY_API_KEY=your_api_key`
- `CLOUDINARY_API_SECRET=your_api_secret`

### 4. Передеплоить проект

После изменения настроек:
```bash
# Деплой с обновленными настройками
vercel --prod

# Или через Git (если настроен auto-deploy)
git push origin main
```

### 5. Проверить результат

```bash
# Проверить работу приложения
npm run check-deploy https://your-new-url.vercel.app
```

## Ожидаемый результат

После исправления:
- ✅ Проект будет доступен публично
- ✅ URL будет стабильным
- ✅ API будет работать без ошибок 401
- ✅ Фотографии будут загружаться на Cloudinary

## Альтернативные решения

### Использовать Vercel Pro
- Платный план дает больше контроля над URL
- Возможность настройки кастомных доменов
- Стабильные URL без изменений

### Настроить кастомный домен
1. Купить домен (например, `yourdomain.com`)
2. Настроить DNS записи
3. Добавить домен в Vercel
4. Получить стабильный URL
