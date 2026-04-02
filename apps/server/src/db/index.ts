import { drizzle as drizzleD1 } from 'drizzle-orm/d1';
import { drizzle as drizzleLibsql } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';

import * as schema from './schema';

// Use a union type that accommodates both D1 and libsql database instances
// This allows the same getDb function to work in both local (libsql) and production (D1) modes
type DbInstance = ReturnType<typeof drizzleD1> | ReturnType<typeof drizzleLibsql>;

const globalForDb = globalThis as unknown as {
  db: DbInstance | undefined;
};

export function getDb(env: { DB: D1Database } | { local: true }): DbInstance {
  if (globalForDb.db) return globalForDb.db;

  // Check if we're using local development
  if ('local' in env && env.local === true) {
    // Local: use libsql client with drizzle-orm/libsql
    const client = createClient({ url: 'file:./dev.db' });
    globalForDb.db = drizzleLibsql(client, { schema });
  } else {
    // Production: use D1 binding (Cloudflare Workers) with drizzle-orm/d1
    const dbEnv = env as { DB: D1Database };
    globalForDb.db = drizzleD1(dbEnv.DB, { schema });
  }

  return globalForDb.db;
}

export { schema };