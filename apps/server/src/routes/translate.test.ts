import { describe, expect, it } from 'vitest';

import { createApp } from '../app/create-app';
import { createMockBindings } from '../testing/mock-bindings';

describe('translate API', () => {
  describe('POST /api/translate validation', () => {
    it('rejects missing text field', async () => {
      const app = createApp();
      const bindings = createMockBindings();
      const response = await app.request('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: 'en' }),
      }, bindings);
      expect(response.status).toBe(400);
    });

    it('rejects empty text string', async () => {
      const app = createApp();
      const bindings = createMockBindings();
      const response = await app.request('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: '', to: 'en' }),
      }, bindings);
      expect(response.status).toBe(400);
    });

    it('rejects whitespace-only text string', async () => {
      const app = createApp();
      const bindings = createMockBindings();
      const response = await app.request('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: '   ', to: 'en' }),
      }, bindings);
      expect(response.status).toBe(400);
    });
  });
});