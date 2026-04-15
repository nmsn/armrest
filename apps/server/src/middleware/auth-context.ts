import { createMiddleware } from 'hono/factory';

import { createAuth } from '../auth';
import type { AppEnv } from '../app/types';

export const authContextMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  // @ts-expect-error localDb is injected in dev mode only
  const authEnv = 'localDb' in c.env
    ? { localDb: c.env.localDb, ...c.env }
    : c.env;
  const auth = createAuth(authEnv);
  c.set('auth', auth);
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  c.set('userId', session?.user?.id ?? '');
  await next();
});