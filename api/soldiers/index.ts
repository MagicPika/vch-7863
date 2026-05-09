import { json } from '../lib/http';
import { prisma } from '../lib/prisma';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.end('Method Not Allowed');
    return;
  }

  try {
    const soldiers = await prisma.soldier.findMany({
      orderBy: [
        { rankId: 'desc' },
        { name: 'asc' },
      ],
      include: {
        user: {
          select: {
            id: true,
            username: true,
            discordId: true,
            avatarUrl: true,
            isMember: true,
            rankName: true,
            divisionCode: true,
          },
        },
        _count: {
          select: {
            awards: true,
            warnings: true,
          },
        },
      },
    });

    const mapped = soldiers.map((s) => ({
      id: s.id,
      name: s.name,
      rankId: s.rankId,
      division: s.division,
      position: s.position,
      discord: s.discord,
      status: s.status,
      warnings: s.warningsCount,
      medalsCount: s._count.awards,
      joinDate: s.joinDate?.toISOString().split('T')[0] ?? '—',
      avatar: s.avatar ?? s.user?.avatarUrl ?? `https://placehold.co/100/1e40af/ffffff?text=${s.name.charAt(0)}`,
      userId: s.userId,
      isMember: s.user?.isMember ?? false,
    }));

    json(res, 200, { soldiers: mapped });
  } catch (error) {
    console.error('/api/soldiers error', error);
    json(res, 500, { error: 'Failed to fetch soldiers' });
  }
}
