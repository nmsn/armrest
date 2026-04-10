import { describe, expect, it } from 'vitest';

import { createApp } from './app/create-app';
import { createMockBindings } from './testing/mock-bindings';

describe('local dev app', () => {
  it('can boot with local bindings', async () => {
    const app = createApp();
    const bindings = createMockBindings();
    const response = await app.request('/', null, bindings);
    expect(response.status).toBe(200);
  });
});