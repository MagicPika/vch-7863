import { json } from '../lib/http';
import { requireSession } from '../lib/session';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.end('Method Not Allowed');
    return;
  }

  try {
    const session = await requireSession(req);
    if (!session) {
      json(res, 200, { user: null });
      return;
    }

    const roleIds = Array.isArray(session.user.roleIds) ? session.user.roleIds.map(String) : [];

    json(res, 200, {
      user: {
        id: session.user.discordId,
        username: session.user.username,
        global_name: session.user.globalName,
        avatar: session.user.avatar,
        member: session.user.isMember
          ? {
              nick: session.user.nickname,
              roles: roleIds,
            }
          : undefined,
      },
    });
  } catch (error) {
    console.error('/api/auth/me error', error);
    json(res, 500, { user: null, error: 'Internal server error' });
  }
}
