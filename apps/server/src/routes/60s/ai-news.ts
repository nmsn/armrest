// apps/server/src/routes/60s/ai-news.ts
import { Hono } from 'hono';

const router = new Hono();

router.get('/', async (c) => {
  const start = Date.now();
  try {
    const url = 'https://60s.viki.moe/v2/ai-news';
    const response = await fetch(url);

    if (!response.ok) {
      const duration = Date.now() - start;
      console.log(`[60s] GET /ai-news → ${response.status} (${duration}ms)`);
      return c.json({ data: null, error: `Upstream error: ${response.status}` });
    }

    const result = await response.json();
    const duration = Date.now() - start;
    console.log(`[60s] GET /ai-news → 200 (${duration}ms)`);

    if (result.code === 200 && result.data) {
      return c.json({
        data: {
          news: result.data.news || [],
          updateTime: result.data.date || new Date().toISOString().split('T')[0],
        },
        error: null,
      });
    }

    return c.json({ data: null, error: 'Invalid response format' });
  } catch (err) {
    const duration = Date.now() - start;
    console.log(`[60s] GET /ai-news → 500 (${duration}ms) ${err}`);
    return c.json({ data: null, error: String(err) });
  }
});

export { router as aiNewsRouter };