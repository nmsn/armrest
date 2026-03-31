// apps/server/src/routes/60s/quote.ts
import { Hono } from 'hono';
import { getQuote, setQuote } from '../../services/daily-cache';
import type { Env } from '../../index';

interface SixtyQuoteResponse { code: number; data?: { hitokoto?: string }; }

const router = new Hono<{ Bindings: Env }>();

router.get('/', async (c) => {
  const env = c.env;
  const start = Date.now();

  // 1. 尝试从缓存读取
  const cached = await getQuote(env);
  if (cached) {
    const duration = Date.now() - start;
    console.log(`[60s] GET /quote (cache hit) → 200 (${duration}ms)`);
    return c.json({ data: { content: cached.content, author: cached.author, date: cached.date }, error: null });
  }

  // 2. 缓存未命中，回退到 60s API
  console.log(`[60s] GET /quote (cache miss) → fetching upstream`);
  try {
    const response = await fetch('https://60s.viki.moe/v2/hitokoto');
    if (!response.ok) {
      const duration = Date.now() - start;
      console.log(`[60s] GET /quote → ${response.status} (${duration}ms)`);
      return c.json({ data: null, error: `Upstream error: ${response.status}` });
    }

    const result = await response.json() as SixtyQuoteResponse;
    const duration = Date.now() - start;
    console.log(`[60s] GET /quote → 200 (${duration}ms)`);

    if (result.code === 200 && result.data?.hitokoto) {
      const today = new Date().toISOString().split('T')[0];
      // 异步更新缓存
      setTimeout(async () => {
        try {
          await setQuote(env, result.data!.hitokoto!, '一言', today);
          console.log(`[60s] Quote cached for today`);
        } catch (e) { console.error('[60s] Failed to cache quote:', e); }
      }, 0);

      return c.json({ data: { content: result.data.hitokoto, author: '一言', date: today }, error: null });
    }

    return c.json({ data: null, error: 'Invalid response format' });
  } catch (err) {
    const duration = Date.now() - start;
    console.log(`[60s] GET /quote → 500 (${duration}ms) ${err}`);
    return c.json({ data: null, error: String(err) });
  }
});

export { router as quoteRouter };