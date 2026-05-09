# Деплой на Vercel

## 1. Подготовка

### Создайте проект на Vercel
```bash
npm i -g vercel
vercel login
vercel
```

## 2. Переменные окружения

В Vercel Dashboard → Project Settings → Environment Variables добавьте:

### Обязательные
```
DATABASE_URL=postgresql://...
DISCORD_CLIENT_ID=1501861655028432996
DISCORD_CLIENT_SECRET=ваш_секрет
DISCORD_GUILD_ID=809037474771763240
DISCORD_BOT_TOKEN=ваш_bot_token
MIGRATION_SECRET=сложный_секрет_для_синхронизации
```

### Опциональные
```
DISCORD_REDIRECT_URI=https://your-domain.vercel.app/api/auth/callback
SESSION_COOKIE_NAME=vch7863_session
```

## 3. База данных

### Вариант A: Vercel Postgres (рекомендуется)
1. Vercel Dashboard → Storage → Create Database
2. Выберите Postgres
3. Подключите к проекту
4. Скопируйте `DATABASE_URL` в env variables

### Вариант B: Prisma Postgres
1. app.prisma.io → Create Project
2. Получите connection string
3. Добавьте в `DATABASE_URL`

## 4. Настройка Discord

### OAuth2 App
1. https://discord.com/developers/applications
2. Ваше приложение → OAuth2
3. Redirects: добавьте `https://your-domain.vercel.app/api/auth/callback`

### Bot Token
1. Bot → Add Bot
2. Reset Token → скопируйте
3. Включите intents:
   - SERVER MEMBERS INTENT
   - MESSAGE CONTENT INTENT (опционально)

## 5. Синхронизация Discord (очень просто)

После деплоя просто откройте ссылку в браузере:

```
https://ваш-сайт.vercel.app/api/discord/sync-guild?secret=ВАШ_SECRET
```

**Всё!** Страница покажет результат:
- Сколько участников найдено
- Сколько профилей создано
- Сколько обновлено

### Когда синхронизировать:
- После деплоя (первичная загрузка)
- Когда кто-то получил новую роль/звание
- Когда кто-то пришёл/ушёл с сервера

### Никакого терминала!
Просто откройте ссылку в браузере — это всё что нужно.

## 7. Безопасность

**ОБЯЗАТЕЛЬНО прочтите:** [SECURITY.md](./SECURITY.md)

Кратко:
- Все секреты только в Vercel Environment Variables
- НИКОГДА не коммитьте токены в git
- Используйте сложный MIGRATION_SECRET

## 8. Проверка

Откройте сайт и проверьте:
1. Вход через Discord работает
2. Личный состав загружается из БД
3. Звания и подразделения определяются автоматически

## Устранение неполадок

### Ошибка: "Database connection failed"
- Проверьте `DATABASE_URL`
- Убедитесь, что IP не заблокирован

### Ошибка: "Invalid client credentials"
- Проверьте `DISCORD_CLIENT_SECRET`
- Убедитесь, что redirect URI совпадает

### Ошибка: "Forbidden: invalid migration secret"
- Проверьте `MIGRATION_SECRET`
- Убедитесь, что передаёте через header или query параметр

### Ручная синхронизация не работает
- Используйте `x-migration-secret` header
- Или `?secret=` query параметр
