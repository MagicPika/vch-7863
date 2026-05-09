const DISCORD_API_BASE = 'https://discord.com/api';
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '1501861655028432996';
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID || '809037474771763240';
const { getRequestOrigin } = require('./http');

function getDiscordRedirectUri(req) {
  return process.env.DISCORD_REDIRECT_URI || `${getRequestOrigin(req)}/api/auth/callback`;
}

function getDiscordAuthorizeUrl(req, state) {
  const url = new URL(`${DISCORD_API_BASE}/oauth2/authorize`);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', DISCORD_CLIENT_ID);
  url.searchParams.set('scope', 'identify guilds guilds.members.read');
  url.searchParams.set('redirect_uri', getDiscordRedirectUri(req));
  url.searchParams.set('state', state);
  url.searchParams.set('prompt', 'consent');
  return url.toString();
}

async function exchangeCodeForToken(req, code) {
  const body = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    client_secret: process.env.DISCORD_CLIENT_SECRET || '',
    grant_type: 'authorization_code',
    code,
    redirect_uri: getDiscordRedirectUri(req),
  });

  const response = await fetch(`${DISCORD_API_BASE}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data && (data.error_description || data.error) || 'OAuth token exchange failed');
  return data;
}

async function fetchDiscordProfile(accessToken) {
  const userRes = await fetch(`${DISCORD_API_BASE}/users/@me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const user = await userRes.json();
  if (!userRes.ok) throw new Error(user && user.message || 'Failed to fetch Discord user');

  const memberRes = await fetch(`${DISCORD_API_BASE}/users/@me/guilds/${DISCORD_GUILD_ID}/member`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const member = memberRes.ok ? await memberRes.json() : null;

  return {
    raw: {
      id: user.id,
      username: user.username,
      global_name: user.global_name || null,
      avatar: user.avatar || null,
      member: member ? { nick: member.nick || null, roles: Array.isArray(member.roles) ? member.roles : [] } : undefined,
    },
  };
}

module.exports = { getDiscordAuthorizeUrl, exchangeCodeForToken, fetchDiscordProfile };