import { redirect } from '../lib/http';
import { destroySession } from '../lib/session';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.end('Method Not Allowed');
    return;
  }

  try {
    await destroySession(req, res);
    redirect(res, '/');
  } catch (error) {
    console.error('/api/auth/logout error', error);
    redirect(res, '/');
  }
}
