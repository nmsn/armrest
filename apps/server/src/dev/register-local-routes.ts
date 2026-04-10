import type { Hono } from 'hono';

import type { LocalBindings } from './create-local-bindings';
import type { AppBindings, AppVariables } from '../app/types';

type LocalApp = Hono<{ Bindings: AppBindings; Variables: AppVariables }>;

export const registerLocalRoutes = (app: LocalApp, _bindings: LocalBindings): void => {
  // Mock auth endpoints for local development
  app.get('/auth/session', (c) => {
    return c.json({ user: null });
  });

  app.post('/auth/sign-out', (c) => {
    return c.json({ success: true });
  });

  // Geocode endpoint for local dev (proxies to BigDataCloud)
  app.get('/api/geocode', async (c) => {
    const lat = c.req.query('lat');
    const lon = c.req.query('lon');

    if (!lat || !lon) {
      return c.json({ data: null, error: 'Missing required parameters: lat, lon' }, 400);
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      return c.json({ data: null, error: 'Invalid coordinates: lat and lon must be numbers' }, 400);
    }

    if (latitude < -90 || latitude > 90) {
      return c.json({ data: null, error: 'Invalid latitude: must be between -90 and 90' }, 400);
    }

    if (longitude < -180 || longitude > 180) {
      return c.json({ data: null, error: 'Invalid longitude: must be between -180 and 180' }, 400);
    }

    try {
      const url = new URL('https://api.bigdatacloud.net/data/reverse-geocode-client');
      url.searchParams.append('latitude', latitude.toString());
      url.searchParams.append('longitude', longitude.toString());
      url.searchParams.append('localityLanguage', 'zh');

      const response = await fetch(url.toString());

      if (!response.ok) {
        return c.json({ data: null, error: `Upstream error: ${response.status}` });
      }

      const result = await response.json() as {
        city?: string;
        locality?: string;
        countryName?: string;
        principalSubdivision?: string;
      };

      return c.json({
        data: {
          city: result.city || result.locality || result.principalSubdivision || result.countryName || '',
          locality: result.locality || '',
          countryName: result.countryName || '',
          principalSubdivision: result.principalSubdivision || '',
        },
        error: null,
      });
    } catch (err) {
      return c.json({ data: null, error: String(err) });
    }
  });
};
