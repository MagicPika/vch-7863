// =====================================================
// 🔐 Discord OAuth — выход
// =====================================================
// Удаляет cookie с данными пользователя.
// =====================================================

export const config = {
  runtime: 'edge',
};

export default function handler(req: Request) {
  const url = new URL(req.url);

  const expiredCookie = [
    'vch7863_user=',
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    'Max-Age=0',
  ].join('; ');

  return new Response(null, {
    status: 302,
    headers: {
      'Set-Cookie': expiredCookie,
      Location: `${url.origin}/?auth=loggedout`,
    },
  });
}
