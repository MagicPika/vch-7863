// =====================================================
// 📋 GET /api/soldier/list — список всех зарегистрированных
// =====================================================
import { prisma } from '../_lib/prisma.js';

export const config = { runtime: 'nodejs' };

export default async function handler(_req: Request) {
  try {
    const soldiers = await prisma.soldier.findMany({
      orderBy: [{ rankName: 'desc' }, { joinDate: 'asc' }],
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        rankName: true,
        divisionCode: true,
        position: true,
        joinDate: true,
        status: true,
        _count: {
          select: { awards: true, warnings: true, diplomas: true },
        },
      },
    });

    return new Response(JSON.stringify({ soldiers }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    console.error('List error:', e);
    return new Response(JSON.stringify({ error: 'Ошибка БД', details: e.message }), { status: 500 });
  }
}
