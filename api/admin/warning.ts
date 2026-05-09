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
      type?: string;
      reason?: string;
    }>(req);

    if (!body.soldierId || !body.reason?.trim()) {
      json(res, 400, { ok: false, error: 'soldierId and reason are required' });
      return;
    }

    const soldier = await ensureSoldierById(body.soldierId);
    if (!soldier) {
      json(res, 404, { ok: false, error: 'Soldier not found' });
      return;
    }

    const warning = await prisma.warning.create({
      data: {
        soldierId: soldier.id,
        type: body.type?.trim() || 'выговор',
        reason: body.reason.trim(),
        issuedByUserId: session.user.id,
      },
    });

    await prisma.soldier.update({
      where: { id: soldier.id },
      data: {
        warningsCount: {
          increment: 1,
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        actorUserId: session.user.id,
        soldierId: soldier.id,
        action: 'warning.create',
        payload: {
          warningId: warning.id,
          type: warning.type,
        },
      },
    });

    json(res, 200, { ok: true, warning });
  } catch (error) {
    console.error('/api/admin/warning error', error);
    json(res, 500, { ok: false, error: 'Failed to create warning' });
  }
}
