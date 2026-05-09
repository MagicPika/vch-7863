type CookieOptions = {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'Lax' | 'Strict' | 'None';
  path?: string;
  maxAge?: number;
  expires?: Date;
};

export function parseCookies(req: any): Record<string, string> {
  const header = req?.headers?.cookie;
  if (!header) return {};

  return String(header)
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, part) => {
      const index = part.indexOf('=');
      if (index === -1) return acc;
      const key = decodeURIComponent(part.slice(0, index));
      const value = decodeURIComponent(part.slice(index + 1));
      acc[key] = value;
      return acc;
    }, {});
}

export function serializeCookie(name: string, value: string, options: CookieOptions = {}) {
  const parts = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`];

  parts.push(`Path=${options.path ?? '/'}`);

  if (typeof options.maxAge === 'number') {
    parts.push(`Max-Age=${Math.max(0, Math.floor(options.maxAge))}`);
  }

  if (options.expires) {
    parts.push(`Expires=${options.expires.toUTCString()}`);
  }

  if (options.httpOnly) parts.push('HttpOnly');
  if (options.secure) parts.push('Secure');
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);

  return parts.join('; ');
}

export function appendSetCookie(res: any, cookie: string) {
  const existing = res.getHeader?.('Set-Cookie');
  if (!existing) {
    res.setHeader('Set-Cookie', cookie);
    return;
  }

  const next = Array.isArray(existing) ? [...existing, cookie] : [String(existing), cookie];
  res.setHeader('Set-Cookie', next);
}

export function json(res: any, status: number, payload: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

export function redirect(res: any, location: string, status = 302) {
  res.statusCode = status;
  res.setHeader('Location', location);
  res.end();
}

export function getRequestOrigin(req: any) {
  const proto = req?.headers?.['x-forwarded-proto'] || 'http';
  const host = req?.headers?.['x-forwarded-host'] || req?.headers?.host || 'localhost:3000';
  return `${proto}://${host}`;
}

export async function readJsonBody<T = Record<string, unknown>>(req: any): Promise<T> {
  if (req.body && typeof req.body === 'object') {
    return req.body as T;
  }

  const raw = await new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer | string) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8') || '{}'));
    req.on('error', reject);
  });

  try {
    return JSON.parse(raw || '{}') as T;
  } catch {
    return {} as T;
  }
}
