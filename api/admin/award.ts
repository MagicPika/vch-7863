// =====================================================
// 🎖️ POST /api/admin/award — выдать награду
// DELETE /api/admin/award?id=... — удалить награду
// =====================================================
import { prisma } from '../_lib/prisma.js';
import { getUserFromRequest, requireCommander } from '../_lib/auth.js';

export const config = { runtime: 'nodejs' };

export default async function handler(req: Request) {
  const url = new URL(req.url);

  // ====== УДАЛЕНИЕ ======
  if (req.method === 'DELETE') {
    const denied = requireCommander(req);
    if (denied) return denied;

    const id = url.searchParams.get('id');
    if (!id) return new Response(JSON.stringify({ error: 'ID не указан' }), { status: 400 });

    try {
      await prisma.award.delete({ where: { id } });
      return new Response(JSON.stringify({ ok: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
  }

  // ====== ВЫДАЧА ======
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const denied = requireCommander(req);
  if (denied) return denied;

  const user = getUserFromRequest(req)!;

  try {
    const body = await req.json();
    const { soldierId, name, description, icon, color } = body;

    if (!soldierId || !name) {
      return new Response(JSON.stringify({ error: 'soldierId и name обязательны' }), { status: 400 });
    }

    // Проверим что солдат существует
    const soldier = await prisma.soldier.findUnique({ where: { id: soldierId } });
    if (!soldier) {
      return new Response(JSON.stringify({ error: 'Солдат не найден. Он должен сначала войти на сайт.' }), { status: 404 });
    }

    const award = await prisma.award.create({
      data: {
        soldierId,
        name,
        description: description || null,
        icon: icon || 'medal',
        color: color || 'amber',
        awardedBy: user.id,
        awardedByName: user.displayName,
      },
    });

    return new Response(JSON.stringify({ ok: true, award }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    console.error('Award error:', e);
    return new Response(JSON.stringify({ error: 'Ошибка БД', details: e.message }), { status: 500 });
  }
}
