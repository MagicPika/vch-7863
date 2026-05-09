import { json, readJsonBody } from '../lib/http';
import { requireSession } from '../lib/session';
import { ensureSoldierById } from '../lib/soldiers';
import { prisma } from '../lib/prisma';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end('Method Not Allowed');
    return;
  }

  try {
    const session = await requireSession(req);
    if (!session?.user?.isCommander) {
      json(res, 403, { ok: false, error: 'Forbidden' });
      return;
    }

    const body = await readJsonBody<{
      soldierId?: string;
      name?: string;
      description?: string | null;
      icon?: string | null;
      color?: string | null;
    }>(req);

    if (!body.soldierId || !body.name?.trim()) {
      json(res, 400, { ok: false, error: 'soldierId and name are required' });
      return;
    }

    const soldier = await ensureSoldierById(body.soldierId);
    if (!soldier) {
      json(res, 404, { ok: false, error: 'Soldier not found' });
      return;
    }

    const award = await prisma.award.create({
      data: {
        soldierId: soldier.id,
        name: body.name.trim(),
        description: body.description ?? null,
        icon: body.icon ?? null,
        color: body.color ?? null,
        issuedByUserId: session.user.id,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorUserId: session.user.id,
        soldierId: soldier.id,
        action: 'award.create',
        payload: {
          awardId: award.id,
          name: award.name,
        },
      },
    });

    json(res, 200, { ok: true, award });
  } catch (error) {
    console.error('/api/admin/award error', error);
    json(res, 500, { ok: false, error: 'Failed to create award' });
  }
}
