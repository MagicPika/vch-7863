import { json } from '../lib/http';
import { requireSession } from '../lib/session';
import { syncSoldierForUser } from '../lib/soldiers';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end('Method Not Allowed');
    return;
  }

  try {
    const session = await requireSession(req);
    if (!session) {
      json(res, 401, { ok: false, error: 'Unauthorized' });
      return;
    }

    const soldier = await syncSoldierForUser({
      id: session.user.id,
      username: session.user.username,
      globalName: session.user.globalName,
      avatar: session.user.avatar,
      avatarUrl: session.user.avatarUrl,
      nickname: session.user.nickname,
      rankName: session.user.rankName,
      divisionCode: session.user.divisionCode,
    });

    json(res, 200, { ok: true, soldier });
  } catch (error) {
    console.error('/api/soldier/sync error', error);
    json(res, 500, { ok: false, error: 'Failed to sync soldier' });
  }
}
