# Безопасность Discord Token

## ⚠️ ВАЖНО: Discord Bot Token = ключ от вашего сервера

Если токен утек:
- Злоумышленник получит доступ к серверу
- Может читать сообщения
- Может изменять роли
- Может удалять каналы

## Как защитить токен

### 1. Хранение в Vercel (рекомендуется)

**НИКОГДА не пишите токен в код!**

1. Vercel Dashboard → ваш проект
2. Settings → Environment Variables
3. Добавьте:
   - Name: `DISCORD_BOT_TOKEN`
   - Value: ваш токен
   - Environment: Production (и Preview если нужно)
4. Сохраните

Теперь токен доступен только серверной части.

### 2. Ротация токена (если подозреваете утечку)

1. Discord Developer Portal → ваше приложение → Bot
2. Click "Reset Token"
3. Скопируйте новый
4. Обновите в Vercel Environment Variables
5. Перезадеплойте

### 3. Минимальные права бота

В Discord Developer Portal → Bot:

Включите только необходимые intents:
- ✅ SERVER MEMBERS INTENT (читать участников)
- ❌ PRESENCE INTENT (не нужен)
- ❌ MESSAGE CONTENT INTENT (не нужен)

### 4. Ограничение IP (если возможно)

Некоторые хостинги позволяют ограничить IP для API запросов.
Vercel использует динамические IP, поэтому это не применимо.

### 5. Мониторинг использования

Проверяйте логи в Discord Developer Portal:
- Bot → Analytics
- Смотрите на необычную активность

## Что делать если токен утек

1. **Немедленно** сбросьте токен в Discord Developer Portal
2. Проверьте Audit Log сервера на подозрительные действия
3. Обновите токен в Vercel
4. Перезадеплойте
5. Проверьте, не добавил ли кто-то посторонних ботов

## Безопасность MIGRATION_SECRET

`MIGRATION_SECRET` защищает endpoint `/api/discord/sync-guild`:

### Генерация секрета
```bash
# Linux/Mac
openssl rand -base64 32

# Или онлайн-генератор
# https://1password.com/password-generator/
# Выберите длину 32+, символы + цифры
```

### Использование
```bash
# Правильно - через header
curl -X POST \
  -H "x-migration-secret: ваш_секрет_здесь" \
  https://your-site.vercel.app/api/discord/sync-guild

# Или через query (менее безопасно, видно в логах)
curl -X POST \
  "https://your-site.vercel.app/api/discord/sync-guild?secret=ваш_секрет_здесь"
```

### Хранение
- Храните в Vercel Environment Variables
- Не коммитьте в git
- Не показывайте в чатах
- Меняйте раз в несколько месяцев

## Проверка безопасности

Перед деплоем убедитесь:
- [ ] В коде нет захардкоженных токенов
- [ ] `.env` файлы в `.gitignore`
- [ ] Все секреты в Vercel Environment Variables
- [ ] Bot имеет минимальные права
- [ ] MIGRATION_SECRET сложный и уникальный
