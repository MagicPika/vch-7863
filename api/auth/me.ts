// =====================================================
// 🔐 Discord OAuth — получить данные текущего пользователя
// =====================================================
// Возвращает данные пользователя из cookie (если он залогинен)
// или null (если нет).
// =====================================================

export const config = {
  runtime: 'edge',
};

export default function handler(req: Request) {
  const cookieHeader = req.headers.get('cookie') || '';
  const match = cookieHeader.match(/vch7863_user=([^;]+)/);

  if (!match) {
    return new Response(JSON.stringify({ user: null }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const decoded = atob(match[1]);
    const user = JSON.parse(decoded);

    return new Response(JSON.stringify({ user }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ user: null }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
