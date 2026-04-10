import { describe, expect, it } from 'vitest';
import { createApp } from './app/create-app';

describe('local dev app', () => {
  it('can boot with local bindings', async () => {
    const app = createApp();
    const response = await app.request('/');
    expect(response.status).toBe(200);
  });
});
