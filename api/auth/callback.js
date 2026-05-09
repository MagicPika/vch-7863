const { exchangeCodeForToken, fetchDiscordProfile } = require('../lib/discord');
const { getRequestOrigin, redirect } = require('../lib/http');
const { clearOauthStateCookie, readOauthState, setSessionCookie, generateRandomToken } = require('../lib/session');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.end('Method Not Allowed');
    return;
  }

  const origin = getRequestOrigin(req);
  try {
    const code = req.query && req.query.code;
    const state = req.query && req.query.state;
    const storedState = readOauthState(req);

    if (!code || !state || !storedState || state !== storedState) {
      clearOauthStateCookie(res);
      redirect(res, `${origin}/?auth=error`);
      return;
    }

    const token = await exchangeCodeForToken(req, String(code));
    const { raw } = await fetchDiscordProfile(token.access_token);

    clearOauthStateCookie(res);
    setSessionCookie(res, Buffer.from(JSON.stringify({
      id: raw.id,
      username: raw.username,
      global_name: raw.global_name,
      avatar: raw.avatar,
      member: raw.member,
      sid: generateRandomToken(12),
    })).toString('base64'));

    redirect(res, `${origin}/?auth=success`);
  } catch (error) {
    console.error('OAuth callback error', error);
    clearOauthStateCookie(res);
    redirect(res, `${origin}/?auth=error`);
  }
};