import { describe, expect, it } from 'vitest';

import { createApp } from '../app/create-app';
import { createMockBindings } from '../testing/mock-bindings';

describe('bookmarks API', () => {
  describe('unauthenticated access', () => {
    it('returns 401 when no user is authenticated', async () => {
      const app = createApp();
      const bindings = createMockBindings();
      const response = await app.request('/api/bookmarks', null, bindings);
      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/bookmarks validation', () => {
    it('rejects missing required fields', async () => {
      const app = createApp();
      const bindings = createMockBindings();
      const response = await app.request('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }, bindings);
      expect(response.status).toBe(400);
    });

    it('rejects invalid url format', async () => {
      const app = createApp();
      const bindings = createMockBindings();
      const response = await app.request('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          folderId: 'folder-123',
          name: 'My Bookmark',
          url: 'not-a-valid-url',
        }),
      }, bindings);
      expect(response.status).toBe(400);
    });
  });
});