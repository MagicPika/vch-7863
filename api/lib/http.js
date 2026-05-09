function parseCookies(req) {
  const header = req && req.headers && req.headers.cookie;
  if (!header) return {};
  return String(header)
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((acc, part) => {
      const index = part.indexOf('=');
      if (index === -1) return acc;
      const key = decodeURIComponent(part.slice(0, index));
      const value = decodeURIComponent(part.slice(index + 1));
      acc[key] = value;
      return acc;
    }, {});
}

function serializeCookie(name, value, options = {}) {
  const parts = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`];
  parts.push(`Path=${options.path || '/'}`);
  if (typeof options.maxAge === 'number') parts.push(`Max-Age=${Math.max(0, Math.floor(options.maxAge))}`);
  if (options.expires) parts.push(`Expires=${options.expires.toUTCString()}`);
  if (options.httpOnly) parts.push('HttpOnly');
  if (options.secure) parts.push('Secure');
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
  return parts.join('; ');
}

function appendSetCookie(res, cookie) {
  const existing = res.getHeader && res.getHeader('Set-Cookie');
  if (!existing) {
    res.setHeader('Set-Cookie', cookie);
    return;
  }
  const next = Array.isArray(existing) ? existing.concat(cookie) : [String(existing), cookie];
  res.setHeader('Set-Cookie', next);
}

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function redirect(res, location, status = 302) {
  res.statusCode = status;
  res.setHeader('Location', location);
  res.end();
}

function getRequestOrigin(req) {
  const proto = (req && req.headers && req.headers['x-forwarded-proto']) || 'https';
  const host = (req && req.headers && (req.headers['x-forwarded-host'] || req.headers.host)) || 'localhost:3000';
  return `${proto}://${host}`;
}

module.exports = { parseCookies, serializeCookie, appendSetCookie, json, redirect, getRequestOrigin };