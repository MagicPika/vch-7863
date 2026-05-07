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
    // Декодируем URL-safe base64 → UTF-8 → JSON
    let b64 = match[1].replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const jsonStr = new TextDecoder().decode(bytes);
    const user = JSON.parse(jsonStr);

    return new Response(JSON.stringify({ user }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ user: null }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
