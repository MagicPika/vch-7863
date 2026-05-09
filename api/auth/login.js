const { getDiscordAuthorizeUrl } = require('../lib/discord');
const { redirect } = require('../lib/http');
const { generateRandomToken, setOauthStateCookie } = require('../lib/session');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.end('Method Not Allowed');
    return;
  }

  try {
    const state = generateRandomToken(16);
    setOauthStateCookie(res, state);
    redirect(res, getDiscordAuthorizeUrl(req, state));
  } catch (error) {
    console.error('OAuth login init error', error);
    redirect(res, '/?auth=error');
  }
};
