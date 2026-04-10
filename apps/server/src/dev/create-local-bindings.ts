import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

import * as schema from '../db/schema';

export interface LocalBindings {
  readonly localDb: ReturnType<typeof drizzle>;
}

export const createLocalBindings = (): LocalBindings => {
  const client = createClient({ url: 'file:./dev.db' });
  return { localDb: drizzle(client, { schema }) };
};
