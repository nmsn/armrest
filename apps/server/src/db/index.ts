import { drizzle as drizzleD1 } from 'drizzle-orm/d1';
import { drizzle as drizzleLibsql } from 'drizzle-orm/libsql';

import type { LocalBindings } from '../dev/create-local-bindings';
import * as schema from './schema';

type DbInstance = ReturnType<typeof drizzleD1> | ReturnType<typeof drizzleLibsql>;

export function getDb(env: { DB: D1Database } | LocalBindings): DbInstance {
  // Local development: use the provided localDb directly
  if ('localDb' in env) {
    return env.localDb;
  }

  // Production: use D1 binding (Cloudflare Workers) with drizzle-orm/d1
  const dbEnv = env as { DB: D1Database };
  return drizzleD1(dbEnv.DB, { schema });
}

export { schema };