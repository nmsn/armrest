import { Hono } from 'hono';

const router = new Hono();

router.get('/weather', async (c) => {
  const { latitude, longitude } = c.req.query();
  if (!latitude || !longitude) {
    return c.json({ error: 'Missing latitude or longitude' }, 400);
  }

  const apiKey = c.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return c.json({ error: 'Weather API not configured' }, 500);
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
  const response = await fetch(url);
  const data = await response.json();

  return c.json(data);
});

router.get('/quote', async (c) => {
  const response = await fetch('https://api.xygeng.cn/one');
  const data = await response.json();
  return c.json(data);
});

export { router as weatherRouter };
