// apps/server/src/routes/60s/weather.ts
import { Hono } from 'hono';

const router = new Hono();

router.get('/', async (c) => {
  const city = c.req.query('city');
  if (!city) {
    return c.json({ data: null, error: 'Missing required parameter: city' }, 400);
  }

  const start = Date.now();
  try {
    const url = `https://60s.viki.moe/v2/weather?query=${encodeURIComponent(city)}`;
    const response = await fetch(url);

    if (!response.ok) {
      const duration = Date.now() - start;
      console.log(`[60s] GET /weather?city=${city} → ${response.status} (${duration}ms)`);
      return c.json({ data: null, error: `Upstream error: ${response.status}` });
    }

    const result = await response.json();
    const duration = Date.now() - start;
    console.log(`[60s] GET /weather?city=${city} → 200 (${duration}ms)`);

    if (result.code === 200 && result.data) {
      const location = result.data.location;
      const weatherData = result.data.weather;
      const airQuality = result.data.air_quality;

      return c.json({
        data: {
          city: location?.city || location?.name || city,
          temperature: weatherData?.temperature != null ? `${weatherData.temperature}°C` : '未知',
          weather: weatherData?.condition || '未知',
          wind: weatherData?.wind_direction && weatherData?.wind_power
            ? `${weatherData.wind_direction} ${weatherData.wind_power}级`
            : '未知',
          humidity: airQuality?.quality || airQuality?.aqi?.toString() || '未知',
          updateTime: weatherData?.updated || new Date().toLocaleString('zh-CN'),
        },
        error: null,
      });
    }

    return c.json({ data: null, error: 'Invalid response format' });
  } catch (err) {
    const duration = Date.now() - start;
    console.log(`[60s] GET /weather?city=${city} → 500 (${duration}ms) ${err}`);
    return c.json({ data: null, error: String(err) });
  }
});

export { router as weatherRouter };
