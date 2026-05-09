import { createUserSession, clearOauthStateCookie, readOauthState } from '../lib/session';
import { exchangeCodeForToken, fetchDiscordProfile } from '../lib/discord';
import { getRequestOrigin, redirect } from '../lib/http';
import { prisma } from '../lib/prisma';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.end('Method Not Allowed');
    return;
  }

  const origin = getRequestOrigin(req);
  const fail = (reason: string) => {
    console.error('Discord callback failed:', reason);
    clearOauthStateCookie(res);
    redirect(res, `${origin}/?auth=error`);
  };

  try {
    const code = req.query?.code;
    const state = req.query?.state;
    const storedState = readOauthState(req);

    if (!code || !state || !storedState || state !== storedState) {
      fail('Invalid OAuth state or missing code');
      return;
    }

    const token = await exchangeCodeForToken(req, String(code));
    const { raw, mapped } = await fetchDiscordProfile(token.access_token);

    const user = await prisma.user.upsert({
      where: {
        discordId: raw.id,
      },
      update: {
        username: raw.username,
        globalName: raw.global_name,
        avatar: raw.avatar,
        avatarUrl: mapped.avatarUrl,
        nickname: mapped.nickname,
        roleIds: mapped.roleIds,
        isMember: mapped.isMember,
        isCommander: mapped.isCommander,
        rankName: mapped.rank?.name ?? null,
        rankLevel: mapped.rank?.level ?? null,
        divisionCode: mapped.division?.code ?? null,
        divisionName: mapped.division?.name ?? null,
        lastLoginAt: new Date(),
      },
      create: {
        discordId: raw.id,
        username: raw.username,
        globalName: raw.global_name,
        avatar: raw.avatar,
        avatarUrl: mapped.avatarUrl,
        nickname: mapped.nickname,
        roleIds: mapped.roleIds,
        isMember: mapped.isMember,
        isCommander: mapped.isCommander,
        rankName: mapped.rank?.name ?? null,
        rankLevel: mapped.rank?.level ?? null,
        divisionCode: mapped.division?.code ?? null,
        divisionName: mapped.division?.name ?? null,
        lastLoginAt: new Date(),
      },
    });

    clearOauthStateCookie(res);
    await createUserSession(res, user.id);
    redirect(res, `${origin}/?auth=success`);
  } catch (error) {
    console.error('OAuth callback error', error);
    fail(error instanceof Error ? error.message : 'Unknown error');
  }
}
