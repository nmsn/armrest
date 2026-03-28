import { Hono } from 'hono';
import type { Auth } from '../auth';

export function authRouter(auth: Auth) {
  const app = new Hono();

  app.get('/session', async (c) => {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });
    if (!session) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    return c.json(session);
  });

  app.get('/sign-out', async (c) => {
    await auth.api.signOut({
      headers: c.req.raw.headers,
    });
    return c.json({ success: true });
  });

  return app;
}
