import { getDiscordAuthorizeUrl } from '../lib/discord';
import { redirect } from '../lib/http';
import { generateRandomToken, setOauthStateCookie } from '../lib/session';

export default async function handler(req: any, res: any) {
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
}
