import { createMiddleware } from 'hono/factory';
import { createAuth } from '../auth';
import type { AppEnv } from '../app/types';

export const authContextMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const auth = createAuth(c.env);
  c.set('auth', auth);
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  c.set('userId', session?.user?.id ?? '');
  await next();
});