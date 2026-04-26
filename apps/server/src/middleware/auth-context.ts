import { createMiddleware } from 'hono/factory';

import type { AppEnv } from '../app/types';

export const authContextMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  // Auth not yet implemented — use local dev user ID
  c.set('userId', 'local-user');
  await next();
});