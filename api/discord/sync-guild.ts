import { json } from '../lib/http';
import { prisma } from '../lib/prisma';
import { RANK_ROLES, DIVISION_ROLES, COMMANDER_ROLE_IDS } from '../../src/config/discord';

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID || '809037474771763240';
const MIGRATION_SECRET = process.env.MIGRATION_SECRET;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
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

    json(res, 200, {
      ok: true,
      stats: {
        total: members.length,
        created,
        updated,
        errors,
      },
    });
  } catch (error) {
    console.error('/api/discord/sync-guild error', error);
    json(res, 500, { 
      error: 'Failed to sync guild',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
