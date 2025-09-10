# 🚀 Деплой приложения

## GitHub Pages (Статический фронтенд)

### 1. Подготовка для GitHub Pages

```bash
# Сборка React приложения
cd client
npm run build
cd ..
```

### 2. Настройка GitHub Actions

Создайте файл `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: |
        npm install
        cd client && npm install
        
    - name: Build
      run: |
        cd client && npm run build
        
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      if: github.ref == 'refs/heads/main'
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./client/build
```

## Vercel (Рекомендуется)

### 1. Установка Vercel CLI
```bash
npm install -g vercel
```

### 2. Создание vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    },
    {
      "src": "server/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/client/build/$1"
    }
  ]
}
```

### 3. Деплой
```bash
vercel --prod
```

## Netlify

### 1. Создание netlify.toml
```toml
[build]
  publish = "client/build"
  command = "cd client && npm run build"

[[redirects]]
  from = "/api/*"
  to = "https://your-backend-url.herokuapp.com/api/:splat"
  status = 200
```

## Heroku (Полное приложение)

### 1. Создание Procfile
```
web: node server/index.js
```

### 2. Настройка package.json
```json
{
  "scripts": {
    "start": "node server/index.js",
    "heroku-postbuild": "cd client && npm install && npm run build"
  }
}
```

### 3. Деплой
```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

## Railway

### 1. Создание railway.json
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node server/index.js",
    "healthcheckPath": "/api/event"
  }
}
```

## Render

### 1. Настройка в Render Dashboard
- Build Command: `cd client && npm install && npm run build`
- Start Command: `node server/index.js`
- Environment: Node.js

## Локальный деплой

### 1. Сборка для продакшена
```bash
# Установка зависимостей
npm install
cd client && npm install && cd ..

# Сборка фронтенда
cd client && npm run build && cd ..

# Запуск сервера
node server/index.js
```

### 2. Использование PM2 для продакшена
```bash
npm install -g pm2
pm2 start server/index.js --name "birthday-organizer"
pm2 startup
pm2 save
```
