import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

const globalForDb = globalThis as unknown as {
  db: ReturnType<typeof drizzle> | undefined;
};

export function getDb(env: { DB: D1Database }) {
  if (globalForDb.db) return globalForDb.db;
  globalForDb.db = drizzle(env.DB, { schema });
  return globalForDb.db;
}

export { schema };