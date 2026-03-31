// apps/server/src/routes/geocode.ts
import { Hono } from 'hono';

const router = new Hono();

router.get('/geocode', async (c) => {
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

  const start = Date.now();
  try {
    const url = new URL('https://api.bigdatacloud.net/data/reverse-geocode-client');
    url.searchParams.append('latitude', latitude.toString());
    url.searchParams.append('longitude', longitude.toString());
    url.searchParams.append('localityLanguage', 'zh');

    const response = await fetch(url.toString());

    if (!response.ok) {
      const duration = Date.now() - start;
      console.log(`[geocode] GET /geocode?lat=${lat}&lon=${lon} → ${response.status} (${duration}ms)`);
      return c.json({ data: null, error: `Upstream error: ${response.status}` });
    }

    const result = await response.json();
    const duration = Date.now() - start;
    console.log(`[geocode] GET /geocode?lat=${lat}&lon=${lon} → 200 (${duration}ms)`);

    const cityName = result.city || result.locality || '';

    return c.json({
      data: {
        city: cityName || result.principalSubdivision || result.countryName || '',
        locality: result.locality || '',
        countryName: result.countryName || '',
        principalSubdivision: result.principalSubdivision || '',
      },
      error: null,
    });
  } catch (err) {
    const duration = Date.now() - start;
    console.log(`[geocode] GET /geocode?lat=${lat}&lon=${lon} → 500 (${duration}ms) ${err}`);
    return c.json({ data: null, error: String(err) });
  }
});

export { router as geocodeRouter };