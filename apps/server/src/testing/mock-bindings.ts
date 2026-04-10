import type { AppBindings } from '../app/types';

export const createMockBindings = (): AppBindings => ({
  DB: {} as D1Database,
  GITHUB_CLIENT_ID: 'mock-client-id',
  GITHUB_CLIENT_SECRET: 'mock-client-secret',
  BETTER_AUTH_SECRET: 'mock-secret',
  NODE_ENV: 'test',
  OPENWEATHER_API_KEY: 'mock-api-key',
});
