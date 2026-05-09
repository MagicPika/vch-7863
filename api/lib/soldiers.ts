import { prisma } from './prisma';
import { INITIAL_SOLDIERS, RANKS } from '../../src/data/mockData';

type UserPayload = {
  id: string;
  username: string;
  globalName: string | null;
  avatar: string | null;
  avatarUrl: string | null;
  nickname: string | null;
  rankName: string | null;
  divisionCode: string | null;
};

export function resolveRankIdByName(rankName: string | null | undefined) {
  if (!rankName) return null;
  const rank = RANKS.find((item) => item.name === rankName);
  return rank?.id ?? null;
}

export function findSeedSoldierForUser(user: Pick<UserPayload, 'username' | 'globalName'>) {
  const normalizedGlobal = user.globalName?.trim().toLowerCase() || '';

  return (
    INITIAL_SOLDIERS.find((soldier) => soldier.discord?.replace('@', '') === user.username) ||
    INITIAL_SOLDIERS.find((soldier) =>
      normalizedGlobal.length > 1 ? soldier.name.toLowerCase().includes(normalizedGlobal) : false,
    ) ||
    null
  );
}

export async function ensureSoldierById(soldierId: string) {
  const existing = await prisma.soldier.findUnique({ where: { id: soldierId } });
  if (existing) return existing;

  const seeded = INITIAL_SOLDIERS.find((item) => item.id === soldierId);
  if (!seeded) return null;

  return prisma.soldier.create({
    data: {
      id: seeded.id,
      name: seeded.name,
      rankId: seeded.rankId,
      division: seeded.division,
      position: seeded.position ?? null,
      discord: seeded.discord ?? null,
      status: seeded.status,
      warningsCount: seeded.warnings,
      joinDate: seeded.joinDate ? new Date(seeded.joinDate) : null,
      avatar: seeded.avatar,
    },
  });
}

export async function syncSoldierForUser(user: UserPayload) {
  const seeded = findSeedSoldierForUser(user);
  const existing = await prisma.soldier.findFirst({
    where: {
      OR: [
        { userId: user.id },
        { discord: `@${user.username}` },
        ...(seeded ? [{ id: seeded.id }] : []),
      ],
    },
  });

  const soldierId = existing?.id || seeded?.id || `discord-${user.username.toLowerCase()}`;
  const rankId = existing?.rankId ?? seeded?.rankId ?? resolveRankIdByName(user.rankName);
  const division = existing?.division ?? seeded?.division ?? user.divisionCode ?? 'Штаб В/Ч';
  const joinDate = existing?.joinDate ?? (seeded?.joinDate ? new Date(seeded.joinDate) : new Date());

  const data = {
    id: soldierId,
    userId: user.id,
    name: seeded?.name || user.globalName || user.nickname || user.username,
    rankId,
    division,
    position: existing?.position ?? seeded?.position ?? null,
    discord: `@${user.username}`,
    status: existing?.status ?? seeded?.status ?? 'В СТРОЮ',
    warningsCount: existing?.warningsCount ?? seeded?.warnings ?? 0,
    joinDate,
    avatar: user.avatarUrl || existing?.avatar || seeded?.avatar || null,
  };

  if (existing) {
    return prisma.soldier.update({
      where: { id: existing.id },
      data,
    });
  }

  return prisma.soldier.create({ data });
}
