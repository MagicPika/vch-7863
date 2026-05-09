// =====================================================
// 🎖️ КОНФИГУРАЦИЯ DISCORD ИНТЕГРАЦИИ
// =====================================================

/** ID Discord-сервера */
export const DISCORD_GUILD_ID = '809037474771763240';

/** Public Client ID Discord-приложения */
export const DISCORD_CLIENT_ID = '1501861655028432996';

/** URL портала ЕИС */
export const STAFF_PORTAL_URL = '/staff';

/** Соответствие "Discord-роль → Звание" */
export const RANK_ROLES: Record<string, { name: string; level: number }> = {
  '1501865936586543135': { name: 'Рядовой', level: 1 },
  '1501866025036021871': { name: 'Сержант', level: 3 },
  '1501866072108957696': { name: 'Капитан', level: 7 },
  '1501866196935381123': { name: 'Генерал армии', level: 15 },
};

/** Соответствие "Discord-роль → Подразделение" */
export const DIVISION_ROLES: Record<string, { code: string; name: string }> = {
  '1501866239444910140': { code: 'Штаб В/Ч', name: 'Штаб воинской части' },
  '1501866348601413643': { code: 'ВП', name: 'Военная полиция' },
  '1501866433452441660': { code: '12-й бат.', name: '12-й батальон Мотострелков' },
};

/** ID ролей "Командование" */
export const COMMANDER_ROLE_IDS: string[] = [
  '1501866196935381123',
];

/** Информация о пользователе Discord */
export interface DiscordUser {
  id: string;
  username: string;
  globalName: string | null;
  avatar: string | null;
  avatarUrl: string;
  isMember: boolean;
  nickname: string | null;
  roleIds: string[];
  rank: { name: string; level: number } | null;
  division: { code: string; name: string } | null;
  isCommander: boolean;
  displayName: string;
}

/** Преобразует данные от Discord в формат DiscordUser */
export function buildDiscordUser(raw: {
  id: string;
  username: string;
  global_name: string | null;
  avatar: string | null;
  member?: {
    nick: string | null;
    roles: string[];
  };
}): DiscordUser {
  const avatarUrl = raw.avatar
    ? `https://cdn.discordapp.com/avatars/${raw.id}/${raw.avatar}.png?size=256`
    : `https://cdn.discordapp.com/embed/avatars/${parseInt(raw.id) % 5}.png`;

  const roleIds = raw.member?.roles ?? [];

  // Находим высшее звание
  let topRank: { name: string; level: number } | null = null;
  for (const rid of roleIds) {
    const r = RANK_ROLES[rid];
    if (r && (!topRank || r.level > topRank.level)) {
      topRank = r;
    }
  }

  // Находим подразделение
  let division: { code: string; name: string } | null = null;
  for (const rid of roleIds) {
    const d = DIVISION_ROLES[rid];
    if (d) {
      division = d;
      break;
    }
  }

  // Проверка на командира
  const isCommander = roleIds.some(rid => COMMANDER_ROLE_IDS.includes(rid));
  const displayName = raw.member?.nick || raw.global_name || raw.username;

  return {
    id: raw.id,
    username: raw.username,
    globalName: raw.global_name,
    avatar: raw.avatar,
    avatarUrl,
    isMember: !!raw.member,
    nickname: raw.member?.nick ?? null,
    roleIds,
    rank: topRank,
    division,
    isCommander,
    displayName,
  };
}
