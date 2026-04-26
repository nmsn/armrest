import { createMiddleware } from 'hono/factory';
import { eq } from 'drizzle-orm';

import type { AppEnv } from '../app/types';
import { getDb } from '../db';
import { users } from '../db/schema';

const localUserId = 'local-user';

async function ensureLocalUser(env: AppEnv['Bindings']) {
  const db = getDb({ DB: env.DB });
  const existing = await db.select().from(users).where(eq(users.id, localUserId)).get();
  if (!existing) {
    await db.insert(users).values({
      id: localUserId,
      name: 'Local Developer',
      email: 'local@dev.local',
    });
  }
}

export const authContextMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  // In test mode, don't set default user — let routes exercise auth checks
  if (c.env.NODE_ENV !== 'test') {
    await ensureLocalUser(c.env);
    c.set('userId', localUserId);
  }
  await next();
});