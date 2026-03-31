// apps/server/src/routes/60s/quote.ts
import { Hono } from 'hono';

interface SixtyQuoteResponse {
  code: number;
  data?: { hitokoto?: string };
}

const router = new Hono();

router.get('/', async (c) => {
  const start = Date.now();
  try {
    const url = 'https://60s.viki.moe/v2/hitokoto';
    const response = await fetch(url);

    if (!response.ok) {
      const duration = Date.now() - start;
      console.log(`[60s] GET /quote → ${response.status} (${duration}ms)`);
      return c.json({ data: null, error: `Upstream error: ${response.status}` });
    }

    const result = await response.json() as SixtyQuoteResponse;
    const duration = Date.now() - start;
    console.log(`[60s] GET /quote → 200 (${duration}ms)`);

    if (result.code === 200 && result.data) {
      return c.json({
        data: {
          content: result.data.hitokoto || '暂无',
          author: '一言',
        },
        error: null,
      });
    }

    return c.json({ data: null, error: 'Invalid response format' });
  } catch (err) {
    const duration = Date.now() - start;
    console.log(`[60s] GET /quote → 500 (${duration}ms) ${err}`);
    return c.json({ data: null, error: String(err) });
  }
});

export { router as quoteRouter };