import crypto from 'node:crypto';
import { json, readJsonBody } from '../lib/http';
import { prisma } from '../lib/prisma';

function generateApplicationCode() {
  const suffix = crypto.randomInt(1000, 9999);
  return `РФ-7863-${suffix}`;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end('Method Not Allowed');
    return;
  }

  try {
    const body = await readJsonBody<{
      name?: string;
      confirmed?: boolean;
    }>(req);

    const name = body.name?.trim();
    if (!name) {
      json(res, 400, { ok: false, error: 'Укажите имя и фамилию.' });
      return;
    }

    if (!body.confirmed) {
      json(res, 400, { ok: false, error: 'Подтвердите соответствие минимальным требованиям.' });
      return;
    }

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS recruit_applications (
        id TEXT PRIMARY KEY,
        application_code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'new',
        confirmed BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const existing = await prisma.$queryRawUnsafe<Array<{ id: string; application_code: string; created_at: Date }>>(
      `SELECT id, application_code, created_at
       FROM recruit_applications
       WHERE name = $1 AND created_at > NOW() - INTERVAL '24 hours'
       ORDER BY created_at DESC
       LIMIT 1`,
      name,
    );

    if (existing.length > 0) {
      json(res, 200, {
        ok: true,
        reused: true,
        application: {
          id: existing[0].id,
          code: existing[0].application_code,
          createdAt: existing[0].created_at,
        },
      });
      return;
    }

    const id = crypto.randomUUID();
    let code = generateApplicationCode();

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const duplicate = await prisma.$queryRawUnsafe<Array<{ application_code: string }>>(
        `SELECT application_code FROM recruit_applications WHERE application_code = $1 LIMIT 1`,
        code,
      );
      if (duplicate.length === 0) break;
      code = generateApplicationCode();
    }

    const inserted = await prisma.$queryRawUnsafe<Array<{ id: string; application_code: string; created_at: Date }>>(
      `INSERT INTO recruit_applications (id, application_code, name, status, confirmed)
       VALUES ($1, $2, $3, 'new', $4)
       RETURNING id, application_code, created_at`,
      id,
      code,
      name,
      true,
    );

    json(res, 200, {
      ok: true,
      application: {
        id: inserted[0].id,
        code: inserted[0].application_code,
        createdAt: inserted[0].created_at,
      },
    });
  } catch (error) {
    console.error('/api/recruit/apply error', error);
    json(res, 500, { ok: false, error: 'Не удалось сохранить заявку.' });
  }
}
