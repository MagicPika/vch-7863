// =====================================================
// 🔄 POST /api/soldier/sync — синхронизация профиля с Discord
// =====================================================
// Вызывается автоматически после входа.
// Создаёт запись солдата если её нет, или обновляет данные.
// =====================================================
import { prisma } from '../_lib/prisma.js';
import { getUserFromRequest } from '../_lib/auth.js';

export const config = { runtime: 'nodejs' };

// Соответствие ролей (как в config/discord.ts)
const RANK_ROLES: Record<string, { name: string; level: number }> = {
  '1501865936586543135': { name: 'Рядовой', level: 1 },
  '1501866025036021871': { name: 'Сержант', level: 3 },
  '1501866072108957696': { name: 'Капитан', level: 7 },
  '1501866196935381123': { name: 'Генерал армии', level: 15 },
};

const DIVISION_ROLES: Record<string, string> = {
  '1501866239444910140': 'Штаб В/Ч',
  '1501866348601413643': 'ВП',
  '1501866433452441660': '12-й бат.',
};

export default async function handler(req: Request) {
  const user = getUserFromRequest(req);

  if (!user || !user.isMember) {
    return new Response(JSON.stringify({ error: 'Не авторизован' }), { status: 401 });
  }

  // Определяем звание и подразделение по ролям
  let rankName: string | null = null;
  let topLevel = -1;
  for (const rid of user.roleIds) {
    const r = RANK_ROLES[rid];
    if (r && r.level > topLevel) {
      topLevel = r.level;
      rankName = r.name;
    }
  }

  let divisionCode: string | null = null;
  for (const rid of user.roleIds) {
    if (DIVISION_ROLES[rid]) {
      divisionCode = DIVISION_ROLES[rid];
      break;
    }
  }

  const avatarUrl = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`
    : `https://cdn.discordapp.com/embed/avatars/${parseInt(user.id) % 5}.png`;

  try {
    // Upsert: создать если нет, обновить если есть
    const existing = await prisma.soldier.findUnique({ where: { id: user.id } });

    const soldier = await prisma.soldier.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatar: avatarUrl,
        rankName,
        divisionCode,
      },
      update: {
        username: user.username,
        displayName: user.displayName,
        avatar: avatarUrl,
        rankName,
        divisionCode,
      },
    });

    // Если звание изменилось — записать в историю
    if (existing && existing.rankName !== rankName && rankName) {
      await prisma.rankChange.create({
        data: {
          soldierId: user.id,
          fromRank: existing.rankName,
          toRank: rankName,
          reason: 'Автоматически из Discord-роли',
        },
      });
    } else if (!existing && rankName) {
      // Первое присвоение
      await prisma.rankChange.create({
        data: {
          soldierId: user.id,
          fromRank: null,
          toRank: rankName,
          reason: 'Первое присвоение',
        },
      });
    }

    return new Response(JSON.stringify({ ok: true, soldier }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    console.error('Sync error:', e);
    return new Response(JSON.stringify({ error: 'Ошибка БД', details: e.message }), { status: 500 });
  }
}
