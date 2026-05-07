// =====================================================
// 🎖️ КОНФИГУРАЦИЯ DISCORD ИНТЕГРАЦИИ
// =====================================================
// Этот файл — единственное место, где нужно поменять настройки
// при переходе с тестового сервера на армейский.
//
// СЕЙЧАС: тестовый сервер (личный)
// ПОТОМ: армейский сервер В/Ч 7863
// =====================================================

/**
 * ID Discord-сервера, с которого тянем состав.
 * Для перехода на армейский — поменять только это значение.
 */
export const DISCORD_GUILD_ID = '809037474771763240';

/**
 * Public Client ID Discord-приложения.
 * Используется для OAuth-входа.
 * Это публичная информация — можно держать в коде.
 */
export const DISCORD_CLIENT_ID = '1501861655028432996';

/**
 * Соответствие "Discord-роль → Звание".
 * level — числовой уровень для сортировки (выше = старше по званию).
 *
 * Чтобы добавить новое звание:
 * 1. Создаёте роль в Discord
 * 2. Копируете её ID
 * 3. Добавляете строку сюда
 */
export const RANK_ROLES: Record<string, { name: string; level: number }> = {
  '1501865936586543135': { name: 'Рядовой', level: 1 },
  '1501866025036021871': { name: 'Сержант', level: 3 },
  '1501866072108957696': { name: 'Капитан', level: 7 },
  '1501866196935381123': { name: 'Генерал армии', level: 15 },

  // Когда переедем на армейский — заменим эти ID на ID ролей с боевого сервера
  // Например: '1234567890': { name: 'Полковник', level: 12 },
};

/**
 * Соответствие "Discord-роль → Подразделение".
 * code — короткий код подразделения (тот же, что в DIVISIONS из mockData).
 */
export const DIVISION_ROLES: Record<string, { code: string; name: string }> = {
  '1501866239444910140': { code: 'Штаб В/Ч',  name: 'Штаб воинской части' },
  '1501866348601413643': { code: 'ВП',         name: 'Военная полиция' },
  '1501866433452441660': { code: '12-й бат.',  name: '12-й батальон Мотострелков' },

  // Когда переедем на армейский — добавим остальные:
  // '...': { code: '9-я рота', name: '9-я рота специального назначения ВВС' },
  // '...': { code: 'Военкомат', name: 'Военный комиссариат' },
  // '...': { code: 'МТО', name: '101-й батальон МТО' },
  // '...': { code: 'Академия', name: 'Военная академия ВС РФ' },
};

/**
 * Список ID ролей "Командование" — у них доступ к админке.
 * Если у пользователя есть хотя бы одна из этих ролей — он командир.
 */
export const COMMANDER_ROLE_IDS: string[] = [
  '1501866196935381123', // Тест-Генерал
  // Добавить ID ролей "Полковник", "Зам командира" и т.д. когда переедем
];

/**
 * Информация о пользователе после авторизации через Discord.
 */
export interface DiscordUser {
  id: string;
  username: string;
  globalName: string | null;
  avatar: string | null;
  avatarUrl: string;
  // Данные с сервера (если состоит в нашем GUILD_ID):
  isMember: boolean;
  nickname: string | null;
  roleIds: string[];
  // Вычисленные на основе ролей:
  rank: { name: string; level: number } | null;
  division: { code: string; name: string } | null;
  isCommander: boolean;
  // Удобное отображаемое имя:
  displayName: string;
}

/**
 * Преобразует "сырые" данные от Discord в наш формат DiscordUser.
 */
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

  // Находим высшее звание из ролей пользователя
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

  // Командир?
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
