import { json } from '../lib/http';
import { prisma } from '../lib/prisma';
import { RANK_ROLES, DIVISION_ROLES, COMMANDER_ROLE_IDS } from '../../src/config/discord';

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID || '809037474771763240';
const MIGRATION_SECRET = process.env.MIGRATION_SECRET;

export default async function handler(req: any, res: any) {
  // Разрешаем POST и GET (GET для удобства открытия в браузере)
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.statusCode = 405;
    res.end('Method Not Allowed');
    return;
  }

  // Проверка секрета
  // Vercel Cron передаёт специальный заголовок
  const isVercelCron = req.headers['x-vercel-cron'] === '1';
  const secret = req.query?.secret || req.headers['x-migration-secret'];
  
  // Для ручного вызова нужен секрет, для cron - проверяем заголовок
  if (!isVercelCron && secret !== MIGRATION_SECRET) {
    json(res, 403, { error: 'Forbidden: invalid migration secret' });
    return;
  }

  if (!DISCORD_BOT_TOKEN) {
    json(res, 500, { error: 'DISCORD_BOT_TOKEN not configured' });
    return;
  }

  try {
    // Получаем всех участников сервера через Discord API
    const membersResponse = await fetch(
      `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members?limit=1000`,
      {
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
        },
      }
    );

    if (!membersResponse.ok) {
      const error = await membersResponse.json();
      throw new Error(error?.message || 'Failed to fetch guild members');
    }

    const members = await membersResponse.json() as Array<{
      user: {
        id: string;
        username: string;
        global_name: string | null;
        avatar: string | null;
      };
      nick: string | null;
      roles: string[];
      joined_at: string;
    }>;

    let created = 0;
    let updated = 0;
    let errors = 0;

    for (const member of members) {
      try {
        // Пропускаем ботов
        if (!member.user) continue;

        const roleIds = member.roles;

        // Определяем звание
        let rankName: string | null = null;
        let rankLevel: number | null = null;
        for (const [roleId, rank] of Object.entries(RANK_ROLES)) {
          if (roleIds.includes(roleId)) {
            if (!rankLevel || rank.level > rankLevel) {
              rankName = rank.name;
              rankLevel = rank.level;
            }
          }
        }

        // Определяем подразделение
        let divisionCode: string | null = null;
        let divisionName: string | null = null;
        for (const [roleId, div] of Object.entries(DIVISION_ROLES)) {
          if (roleIds.includes(roleId)) {
            divisionCode = div.code;
            divisionName = div.name;
            break;
          }
        }

        // Проверяем, является ли командиром
        const isCommander = roleIds.some(roleId => COMMANDER_ROLE_IDS.includes(roleId));

        // Аватар URL
        const avatarUrl = member.user.avatar
          ? `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.png?size=256`
          : `https://cdn.discordapp.com/embed/avatars/${parseInt(member.user.id) % 5}.png`;

        // Ищем или создаем пользователя
        const user = await prisma.user.upsert({
          where: { discordId: member.user.id },
          update: {
            username: member.user.username,
            globalName: member.user.global_name,
            avatar: member.user.avatar,
            avatarUrl,
            nickname: member.nick,
            roleIds,
            isMember: true,
            isCommander,
            rankName,
            rankLevel,
            divisionCode,
            divisionName,
            lastLoginAt: new Date(),
          },
          create: {
            discordId: member.user.id,
            username: member.user.username,
            globalName: member.user.global_name,
            avatar: member.user.avatar,
            avatarUrl,
            nickname: member.nick,
            roleIds,
            isMember: true,
            isCommander,
            rankName,
            rankLevel,
            divisionCode,
            divisionName,
          },
        });

        // Создаем или обновляем soldier
        const existingSoldier = await prisma.soldier.findFirst({
          where: { userId: user.id },
        });

        if (existingSoldier) {
          await prisma.soldier.update({
            where: { id: existingSoldier.id },
            data: {
              name: member.nick || member.user.global_name || member.user.username,
              rankId: rankLevel,
              division: divisionCode || 'Штаб В/Ч',
              discord: `@${member.user.username}`,
              avatar: avatarUrl,
              joinDate: new Date(member.joined_at),
            },
          });
          updated++;
        } else {
          await prisma.soldier.create({
            data: {
              userId: user.id,
              name: member.nick || member.user.global_name || member.user.username,
              rankId: rankLevel,
              division: divisionCode || 'Штаб В/Ч',
              discord: `@${member.user.username}`,
              avatar: avatarUrl,
              joinDate: new Date(member.joined_at),
              status: 'В СТРОЮ',
            },
          });
          created++;
        }
      } catch (err) {
        console.error('Error processing member:', member?.user?.id, err);
        errors++;
      }
    }

    const stats = {
      total: members.length,
      created,
      updated,
      errors,
    };

    // Если запрос из браузера (GET), показываем красивую HTML-страницу
    const acceptHeader = req.headers?.accept || '';
    const isBrowser = req.method === 'GET' && acceptHeader.includes('text/html');

    if (isBrowser) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.statusCode = 200;
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Синхронизация Discord — В/Ч №7863</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              background: #090e15;
              color: #e2e8f0;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
            }
            .container {
              background: #0f172a;
              border: 1px solid #1e293b;
              border-radius: 16px;
              padding: 32px;
              max-width: 400px;
              text-align: center;
            }
            .success { color: #22c55e; }
            .error { color: #ef4444; }
            .stat {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #1e293b;
            }
            .stat:last-child { border-bottom: none; }
            .badge {
              display: inline-block;
              background: #064e3b;
              color: #22c55e;
              padding: 4px 12px;
              border-radius: 9999px;
              font-size: 12px;
              font-weight: 600;
              margin-bottom: 16px;
            }
            h1 { margin: 0 0 8px; font-size: 20px; }
            p { color: #94a3b8; margin: 0 0 24px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="badge">✓ УСПЕШНО</div>
            <h1>Синхронизация завершена</h1>
            <p>Состав В/Ч №7863 обновлён из Discord</p>
            
            <div class="stat">
              <span>Всего участников:</span>
              <span class="success"><strong>${stats.total}</strong></span>
            </div>
            <div class="stat">
              <span>Создано профилей:</span>
              <span class="success"><strong>${stats.created}</strong></span>
            </div>
            <div class="stat">
              <span>Обновлено:</span>
              <span class="success"><strong>${stats.updated}</strong></span>
            </div>
            ${stats.errors > 0 ? `
            <div class="stat">
              <span>Ошибок:</span>
              <span class="error"><strong>${stats.errors}</strong></span>
            </div>
            ` : ''}
            
            <p style="margin-top: 24px; font-size: 12px;">
              <a href="/" style="color: #22c55e;">← Вернуться на сайт</a>
            </p>
          </div>
        </body>
        </html>
      `);
      return;
    }

    json(res, 200, { ok: true, stats });
  } catch (error) {
    console.error('/api/discord/sync-guild error', error);
    
    const acceptHeader = req.headers?.accept || '';
    const isBrowser = req.method === 'GET' && acceptHeader.includes('text/html');
    
    if (isBrowser) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.statusCode = 500;
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Ошибка — В/Ч №7863</title>
          <style>
            body {
              font-family: system-ui, sans-serif;
              background: #090e15;
              color: #e2e8f0;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
            }
            .container {
              background: #0f172a;
              border: 1px solid #ef4444;
              border-radius: 16px;
              padding: 32px;
              max-width: 400px;
              text-align: center;
            }
            .error { color: #ef4444; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="error">✗ Ошибка синхронизации</h1>
            <p>${error instanceof Error ? error.message : 'Неизвестная ошибка'}</p>
            <p><a href="/" style="color: #22c55e;">← На главную</a></p>
          </div>
        </body>
        </html>
      `);
      return;
    }

    json(res, 500, { 
      error: 'Failed to sync guild',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
