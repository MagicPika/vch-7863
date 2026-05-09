import crypto from 'node:crypto';
import { prisma } from './prisma';
import { appendSetCookie, parseCookies, serializeCookie } from './http';

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'vch7863_session';
const OAUTH_STATE_COOKIE_NAME = 'vch7863_oauth_state';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;
const OAUTH_STATE_MAX_AGE = 60 * 10;

function isSecureCookie() {
  return process.env.NODE_ENV === 'production';
}

export function generateRandomToken(size = 32) {
  return crypto.randomBytes(size).toString('hex');
}

export function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function setOauthStateCookie(res: any, state: string) {
  appendSetCookie(
    res,
    serializeCookie(OAUTH_STATE_COOKIE_NAME, state, {
      httpOnly: true,
      sameSite: 'Lax',
      secure: isSecureCookie(),
      path: '/',
      maxAge: OAUTH_STATE_MAX_AGE,
    }),
  );
}

export function clearOauthStateCookie(res: any) {
  appendSetCookie(
    res,
    serializeCookie(OAUTH_STATE_COOKIE_NAME, '', {
      httpOnly: true,
      sameSite: 'Lax',
      secure: isSecureCookie(),
      path: '/',
      maxAge: 0,
      expires: new Date(0),
    }),
  );
}

export function readOauthState(req: any) {
  const cookies = parseCookies(req);
  return cookies[OAUTH_STATE_COOKIE_NAME] || null;
}

export async function createUserSession(res: any, userId: string) {
  const rawToken = generateRandomToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);

  await prisma.session.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  appendSetCookie(
    res,
    serializeCookie(SESSION_COOKIE_NAME, rawToken, {
      httpOnly: true,
      sameSite: 'Lax',
      secure: isSecureCookie(),
      path: '/',
      maxAge: SESSION_MAX_AGE,
      expires: expiresAt,
    }),
  );

  return { rawToken, expiresAt };
}

export async function destroySession(req: any, res: any) {
  const cookies = parseCookies(req);
  const rawToken = cookies[SESSION_COOKIE_NAME];

  if (rawToken) {
    await prisma.session.deleteMany({
      where: {
        tokenHash: hashToken(rawToken),
      },
    });
  }

  appendSetCookie(
    res,
    serializeCookie(SESSION_COOKIE_NAME, '', {
      httpOnly: true,
      sameSite: 'Lax',
      secure: isSecureCookie(),
      path: '/',
      maxAge: 0,
      expires: new Date(0),
    }),
  );
}

export async function getSession(req: any) {
  const cookies = parseCookies(req);
  const rawToken = cookies[SESSION_COOKIE_NAME];
  if (!rawToken) return null;

  const session = await prisma.session.findUnique({
    where: {
      tokenHash: hashToken(rawToken),
    },
    include: {
      user: true,
    },
  });

  if (!session) return null;

  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  return session;
}

export async function requireSession(req: any) {
  const session = await getSession(req);
  if (!session) {
    return null;
  }
  return session;
}

export { SESSION_COOKIE_NAME, OAUTH_STATE_COOKIE_NAME, SESSION_MAX_AGE };
