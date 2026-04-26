import type { AppBindings } from '../app/types';

function createMockD1Database(): D1Database {
  const stmt = {
    bind: () => stmt,
    all: async () => ({ results: [] }),
    run: async () => ({ success: true }),
    first: async () => null,
    raw: async () => [],
  };
  return {
    prepare: () => stmt,
    batch: async () => [],
    exec: async () => ({ count: 0, duration: 0 }),
  } as unknown as D1Database;
}

export const createMockBindings = (): AppBindings => ({
  DB: createMockD1Database(),
  GITHUB_CLIENT_ID: 'mock-client-id',
  GITHUB_CLIENT_SECRET: 'mock-client-secret',
  BETTER_AUTH_SECRET: 'mock-secret',
  NODE_ENV: 'test',
  OPENWEATHER_API_KEY: 'mock-api-key',
});
