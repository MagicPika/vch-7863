const { redirect } = require('../lib/http');
const { clearSessionCookie } = require('../lib/session');

module.exports = async function handler(req, res) {
  clearSessionCookie(res);
  redirect(res, '/');
};