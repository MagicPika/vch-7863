// =====================================================
// ⚠️ POST /api/admin/warning — выдать выговор
// DELETE /api/admin/warning?id=... — снять выговор
// =====================================================
import { prisma } from '../_lib/prisma.js';
import { getUserFromRequest, requireCommander } from '../_lib/auth.js';

export const config = { runtime: 'nodejs' };

export default async function handler(req: Request) {
  const url = new URL(req.url);

  // ====== СНЯТИЕ ВЫГОВОРА ======
  if (req.method === 'DELETE') {
    const denied = requireCommander(req);
    if (denied) return denied;

    const user = getUserFromRequest(req)!;
    const id = url.searchParams.get('id');
    if (!id) return new Response(JSON.stringify({ error: 'ID не указан' }), { status: 400 });

    try {
      await prisma.warning.update({
        where: { id },
        data: {
          isActive: false,
          removedAt: new Date(),
          removedBy: user.id,
          removedByName: user.displayName,
        },
      });
      return new Response(JSON.stringify({ ok: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
  }

  // ====== ВЫДАЧА ВЫГОВОРА ======
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const denied = requireCommander(req);
  if (denied) return denied;

  const user = getUserFromRequest(req)!;

  try {
    const body = await req.json();
    const { soldierId, type, reason } = body;

    if (!soldierId || !type || !reason) {
      return new Response(JSON.stringify({ error: 'soldierId, type, reason обязательны' }), { status: 400 });
    }

    const soldier = await prisma.soldier.findUnique({ where: { id: soldierId } });
    if (!soldier) {
      return new Response(JSON.stringify({ error: 'Солдат не найден' }), { status: 404 });
    }

    const warning = await prisma.warning.create({
      data: {
        soldierId,
        type,
        reason,
        issuedBy: user.id,
        issuedByName: user.displayName,
      },
    });

    return new Response(JSON.stringify({ ok: true, warning }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    console.error('Warning error:', e);
    return new Response(JSON.stringify({ error: 'Ошибка БД', details: e.message }), { status: 500 });
  }
}
