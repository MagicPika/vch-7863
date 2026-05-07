// =====================================================
// 🔐 Discord OAuth — обработка возврата от Discord
// =====================================================
// Discord перенаправляет сюда с кодом авторизации.
// Мы обмениваем код на токен, получаем данные пользователя,
// сохраняем в защищённую cookie и возвращаем на сайт.
// =====================================================

export const config = {
  runtime: 'edge',
};

const GUILD_ID = '809037474771763240'; // ID Discord-сервера

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return Response.redirect(`${url.origin}/?auth=cancelled`, 302);
  }

  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return new Response('Discord-приложение не настроено', { status: 500 });
  }

  const redirectUri = `${url.origin}/api/auth/callback`;

  try {
    // 1. Обмениваем код на access_token
    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }).toString(),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      console.error('Token exchange failed:', err);
      return Response.redirect(`${url.origin}/?auth=error`, 302);
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token as string;

    // 2. Получаем данные пользователя
    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userRes.ok) {
      return Response.redirect(`${url.origin}/?auth=error`, 302);
    }

    const userData = await userRes.json();

    // 3. Получаем данные пользователя на нашем сервере (роли и ник)
    let memberData = null;
    try {
      const memberRes = await fetch(
        `https://discord.com/api/users/@me/guilds/${GUILD_ID}/member`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (memberRes.ok) {
        memberData = await memberRes.json();
      }
    } catch (e) {
      // Если не состоит на сервере — memberData останется null
    }

    // 4. Формируем итоговый объект для сохранения
    const fullUser = {
      id: userData.id,
      username: userData.username,
      global_name: userData.global_name,
      avatar: userData.avatar,
      member: memberData
        ? {
            nick: memberData.nick,
            roles: memberData.roles ?? [],
          }
        : undefined,
      authorizedAt: Date.now(),
    };

    // 5. Сохраняем в HttpOnly cookie на 7 дней
    // Кодируем в UTF-8 → base64 (URL-safe), чтобы поддерживать кириллицу
    const jsonStr = JSON.stringify(fullUser);
    const utf8Bytes = new TextEncoder().encode(jsonStr);
    let binary = '';
    utf8Bytes.forEach(b => { binary += String.fromCharCode(b); });
    const cookieValue = btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    const cookie = [
      `vch7863_user=${cookieValue}`,
      'Path=/',
      'HttpOnly',
      'Secure',
      'SameSite=Lax',
      `Max-Age=${60 * 60 * 24 * 7}`, // 7 дней
    ].join('; ');

    return new Response(null, {
      status: 302,
      headers: {
        'Set-Cookie': cookie,
        Location: `${url.origin}/?auth=success`,
      },
    });
  } catch (err) {
    console.error('OAuth callback error:', err);
    return Response.redirect(`${url.origin}/?auth=error`, 302);
  }
}
