// apps/server/src/routes/60s/bing.ts
import { Hono } from 'hono';

const router = new Hono();

router.get('/', async (c) => {
  const start = Date.now();
  try {
    const url = 'https://60s.viki.moe/v2/bing';
    const response = await fetch(url);

    if (!response.ok) {
      const duration = Date.now() - start;
      console.log(`[60s] GET /bing → ${response.status} (${duration}ms)`);
      return c.json({ data: null, error: `Upstream error: ${response.status}` });
    }

    const result = await response.json();
    const duration = Date.now() - start;
    console.log(`[60s] GET /bing → 200 (${duration}ms)`);

    if (result.code === 200 && result.data) {
      return c.json({
        data: {
          image: result.data.image || '',
          copyright: result.data.copyright || '',
          startdate: result.data.startdate || '',
          url: result.data.url || '',
        },
        error: null,
      });
    }

    return c.json({ data: null, error: 'Invalid response format' });
  } catch (err) {
    const duration = Date.now() - start;
    console.log(`[60s] GET /bing → 500 (${duration}ms) ${err}`);
    return c.json({ data: null, error: String(err) });
  }
});

export { router as bingRouter };