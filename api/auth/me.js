const { json, parseCookies } = require('../lib/http');
const { SESSION_COOKIE_NAME } = require('../lib/session');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.end('Method Not Allowed');
    return;
  }

  try {
    const cookies = parseCookies(req);
    const raw = cookies[SESSION_COOKIE_NAME];
    if (!raw) {
      json(res, 200, { user: null });
      return;
    }
    const user = JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
    json(res, 200, { user });
  } catch (error) {
    console.error('/api/auth/me error', error);
    json(res, 200, { user: null });
  }
};