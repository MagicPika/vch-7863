// =====================================================
// 🔐 Discord OAuth — старт авторизации
// =====================================================
// Перенаправляет пользователя на Discord для входа.
// =====================================================

export const config = {
  runtime: 'edge',
};

export default function handler(req: Request) {
  const url = new URL(req.url);

  const clientId = process.env.DISCORD_CLIENT_ID;
  if (!clientId) {
    return new Response('DISCORD_CLIENT_ID не настроен', { status: 500 });
  }

  // Куда Discord должен вернуть пользователя после входа
  const redirectUri = `${url.origin}/api/auth/callback`;

  // Запрашиваемые права:
  // - identify  — узнать имя, аватар
  // - guilds    — узнать список серверов
  // - guilds.members.read — узнать роли пользователя на нашем сервере
  const scope = 'identify guilds guilds.members.read';

  const discordUrl = new URL('https://discord.com/oauth2/authorize');
  discordUrl.searchParams.set('client_id', clientId);
  discordUrl.searchParams.set('redirect_uri', redirectUri);
  discordUrl.searchParams.set('response_type', 'code');
  discordUrl.searchParams.set('scope', scope);

  return Response.redirect(discordUrl.toString(), 302);
}
