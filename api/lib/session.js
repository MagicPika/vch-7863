const crypto = require('node:crypto');
const { appendSetCookie, parseCookies, serializeCookie } = require('./http');

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'vch7863_session';
const OAUTH_STATE_COOKIE_NAME = 'vch7863_oauth_state';

function isSecureCookie() {
  return process.env.NODE_ENV === 'production';
}

function generateRandomToken(size = 32) {
  return crypto.randomBytes(size).toString('hex');
}

function setOauthStateCookie(res, state) {
  appendSetCookie(res, serializeCookie(OAUTH_STATE_COOKIE_NAME, state, {
    httpOnly: true,
    sameSite: 'Lax',
    secure: isSecureCookie(),
    path: '/',
    maxAge: 600,
  }));
}

function clearOauthStateCookie(res) {
  appendSetCookie(res, serializeCookie(OAUTH_STATE_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'Lax',
    secure: isSecureCookie(),
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  }));
}

function readOauthState(req) {
  const cookies = parseCookies(req);
  return cookies[OAUTH_STATE_COOKIE_NAME] || null;
}

function setSessionCookie(res, value) {
  appendSetCookie(res, serializeCookie(SESSION_COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: 'Lax',
    secure: isSecureCookie(),
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  }));
}

function clearSessionCookie(res) {
  appendSetCookie(res, serializeCookie(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'Lax',
    secure: isSecureCookie(),
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  }));
}

module.exports = {
  SESSION_COOKIE_NAME,
  generateRandomToken,
  setOauthStateCookie,
  clearOauthStateCookie,
  readOauthState,
  setSessionCookie,
  clearSessionCookie,
};