import { Hono } from 'hono';
import type { Auth } from '../auth';

export function authRouter() {
  const app = new Hono<{ Variables: { auth: Auth } }>();

  app.get('/session', async (c) => {
    const auth = c.get('auth');
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });
    if (!session) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    return c.json(session);
  });

  app.get('/sign-out', async (c) => {
    const auth = c.get('auth');
    await auth.api.signOut({
      headers: c.req.raw.headers,
    });
    return c.json({ success: true });
  });

  return app;
}