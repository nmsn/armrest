import { describe, expect, it } from 'vitest';

import { createApp } from '../app/create-app';
import { createMockBindings } from '../testing/mock-bindings';

describe('60s API', () => {
  describe('GET /api/60s/weather validation', () => {
    it('returns 400 when city parameter is missing', async () => {
      const app = createApp();
      const bindings = createMockBindings();
      const response = await app.request('/api/60s/weather', null, bindings);
      // The route returns 400 for missing city parameter
      const body = await response.json();
      expect(response.status).toBe(400);
      expect(body.data).toBeNull();
      expect(body.error).toContain('Missing required parameter');
    });

    it('returns 200 with error body when city is provided but upstream fails', async () => {
      const app = createApp();
      const bindings = createMockBindings();
      // Use an unreachable/invalid city that will cause upstream to fail
      const response = await app.request('/api/60s/weather?city=nonexistent-city-xyz', null, bindings);
      // The route returns 200 with error body for upstream failures
      const body = await response.json();
      expect(response.status).toBe(200);
      expect(body.data).toBeNull();
      expect(body.error).toBeTruthy();
    });
  });
});