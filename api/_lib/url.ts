// =====================================================
// 🔗 Утилита для парсинга URL запроса
// =====================================================

export function parseRequestUrl(req: Request): URL {
  const url = req.url;

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return new URL(url);
  }

  const host = req.headers.get('host') || req.headers.get('x-forwarded-host') || 'localhost';
  const proto = req.headers.get('x-forwarded-proto') || 'https';
  return new URL(url, `${proto}://${host}`);
}
