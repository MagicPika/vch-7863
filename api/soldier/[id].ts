// =====================================================
// 📋 GET /api/soldier/[id] — получить полный профиль
// =====================================================
import { prisma } from '../_lib/prisma.js';
import { getUserFromRequest } from '../_lib/auth.js';

export const config = { runtime: 'nodejs' };

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const segments = url.pathname.split('/').filter(Boolean);
  const id = segments[segments.length - 1];

  if (!id) {
    return new Response(JSON.stringify({ error: 'ID не указан' }), { status: 400 });
  }

  const viewer = getUserFromRequest(req);

  try {
    const soldier = await prisma.soldier.findUnique({
      where: { id },
      include: {
        awards: { orderBy: { awardedAt: 'desc' } },
        warnings: { orderBy: { issuedAt: 'desc' } },
        history: { orderBy: { changedAt: 'desc' } },
        diplomas: { orderBy: { issuedAt: 'desc' } },
      },
    });

    if (!soldier) {
      return new Response(JSON.stringify({ error: 'Не найден' }), { status: 404 });
    }

    // Скрываем личные заметки от посторонних (только командир или сам владелец)
    const canSeePrivate = viewer?.id === soldier.id || viewer?.isCommander;
    const responseData = {
      ...soldier,
      notes: canSeePrivate ? soldier.notes : null,
      warnings: canSeePrivate ? soldier.warnings : soldier.warnings.filter(w => w.isActive),
      canEdit: viewer?.isCommander ?? false,
      isOwn: viewer?.id === soldier.id,
    };

    return new Response(JSON.stringify(responseData), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    console.error('Soldier fetch error:', e);
    return new Response(JSON.stringify({ error: 'Ошибка БД', details: e.message }), { status: 500 });
  }
}
