import type { Context, Next } from 'hono';

import type { Auth } from '../auth';

export async function authMiddleware(c: Context, next: Next, auth: Auth) {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  c.set('userId', session.user.id);
  c.set('session', session);

  await next();
}
