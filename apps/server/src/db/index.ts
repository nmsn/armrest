import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';

import * as schema from './schema';

const globalForDb = globalThis as unknown as {
  db: ReturnType<typeof drizzle> | undefined;
};

export function getDb(env: { DB: D1Database } | { local: true }) {
  if (globalForDb.db) return globalForDb.db;

  // Check if we're using local development
  if ('local' in env && env.local === true) {
    const client = createClient({ url: 'file:./dev.db' });
    globalForDb.db = drizzle(client, { schema });
  } else {
    // Production: use D1 binding (Cloudflare Workers)
    const dbEnv = env as { DB: D1Database };
    globalForDb.db = drizzle(dbEnv.DB, { schema });
  }

  return globalForDb.db;
}

export { schema };