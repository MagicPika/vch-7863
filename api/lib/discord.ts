import { buildDiscordUser, DISCORD_CLIENT_ID, DISCORD_GUILD_ID } from '../../src/config/discord';
import { getRequestOrigin } from './http';

const DISCORD_API_BASE = 'https://discord.com/api';
const OAUTH_SCOPES = ['identify', 'guilds', 'guilds.members.read'];

export function getDiscordClientId() {
  return process.env.DISCORD_CLIENT_ID || DISCORD_CLIENT_ID;
}

export function getDiscordClientSecret() {
  const secret = process.env.DISCORD_CLIENT_SECRET;
  if (!secret) {
    throw new Error('DISCORD_CLIENT_SECRET is not configured');
  }
  return secret;
}

export function getDiscordGuildId() {
  return process.env.DISCORD_GUILD_ID || DISCORD_GUILD_ID;
}

export function getDiscordRedirectUri(req: any) {
  return process.env.DISCORD_REDIRECT_URI || `${getRequestOrigin(req)}/api/auth/callback`;
}

export function getDiscordAuthorizeUrl(req: any, state: string) {
  const url = new URL(`${DISCORD_API_BASE}/oauth2/authorize`);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', getDiscordClientId());
  url.searchParams.set('scope', OAUTH_SCOPES.join(' '));
  url.searchParams.set('redirect_uri', getDiscordRedirectUri(req));
  url.searchParams.set('state', state);
  url.searchParams.set('prompt', 'consent');
  return url.toString();
}

export async function exchangeCodeForToken(req: any, code: string) {
  const body = new URLSearchParams({
    client_id: getDiscordClientId(),
    client_secret: getDiscordClientSecret(),
    grant_type: 'authorization_code',
    code,
    redirect_uri: getDiscordRedirectUri(req),
  });

  const response = await fetch(`${DISCORD_API_BASE}/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error_description || data?.error || 'Failed to exchange Discord OAuth code');
  }

  return data as {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token?: string;
    scope: string;
  };
}

export async function fetchDiscordCurrentUser(accessToken: string) {
  const response = await fetch(`${DISCORD_API_BASE}/users/@me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || 'Failed to fetch Discord user');
  }

  return data as {
    id: string;
    username: string;
    global_name: string | null;
    avatar: string | null;
  };
}

export async function fetchDiscordGuildMember(accessToken: string, guildId = getDiscordGuildId()) {
  const response = await fetch(`${DISCORD_API_BASE}/users/@me/guilds/${guildId}/member`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as {
    nick: string | null;
    roles: string[];
  };
}

export async function fetchDiscordProfile(accessToken: string) {
  const user = await fetchDiscordCurrentUser(accessToken);
  const member = await fetchDiscordGuildMember(accessToken);

  const raw = {
    id: user.id,
    username: user.username,
    global_name: user.global_name,
    avatar: user.avatar,
    member: member
      ? {
          nick: member.nick,
          roles: member.roles,
        }
      : undefined,
  };

  const mapped = buildDiscordUser(raw);

  return {
    raw,
    mapped,
  };
}
