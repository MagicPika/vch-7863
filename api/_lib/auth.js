// =====================================================
// 🔐 Утилиты авторизации для API endpoints
// =====================================================

const COMMANDER_ROLE_IDS = [
  '1501866196935381123', // Тест-Генерал (тестовый сервер)
  // Когда переедем на армейский — добавим сюда ID ролей командования
];

const GUILD_ID = '809037474771763240';

export interface AuthUser {
  id: string;
  username: string;
  globalName: string | null;
  avatar: string | null;
  isMember: boolean;
  nickname: string | null;
  roleIds: string[];
  isCommander: boolean;
  displayName: string;
  guildId: string;
}

/**
 * Извлекает данные пользователя из cookie запроса.
 * Возвращает null если не авторизован или cookie повреждена.
 */
export function getUserFromRequest(req: Request): AuthUser | null {
  const cookieHeader = req.headers.get('cookie') || '';
  const match = cookieHeader.match(/vch7863_user=([^;]+)/);

  if (!match) return null;

  try {
    let b64 = match[1].replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const jsonStr = new TextDecoder().decode(bytes);
    const raw = JSON.parse(jsonStr);

    const roleIds = raw.member?.roles ?? [];
    const isCommander = roleIds.some((rid: string) => COMMANDER_ROLE_IDS.includes(rid));

    return {
      id: raw.id,
      username: raw.username,
      globalName: raw.global_name,
      avatar: raw.avatar,
      isMember: !!raw.member,
      nickname: raw.member?.nick ?? null,
      roleIds,
      isCommander,
      displayName: raw.member?.nick || raw.global_name || raw.username,
      guildId: GUILD_ID,
    };
  } catch {
    return null;
  }
}

/**
 * Проверка прав командования. Возвращает Response с ошибкой
 * если пользователь не командир, или null если всё ок.
 */
export function requireCommander(req: Request): Response | null {
  const user = getUserFromRequest(req);
  if (!user || !user.isMember) {
    return new Response(JSON.stringify({ error: 'Не авторизован' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  if (!user.isCommander) {
    return new Response(JSON.stringify({ error: 'Только для командования' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return null;
}
