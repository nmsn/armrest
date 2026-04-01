// apps/server/src/routes/60s/history.ts
import { Hono } from 'hono';
import { getHistory, setHistory } from '../../services/daily-cache';
import type { Env } from '../../index';

interface SixtyHistoryResponse {
  code: number;
  data?: { items?: Array<{ year?: string; title?: string }>; date?: string };
}

const router = new Hono<{ Bindings: Env }>();

router.get('/', async (c) => {
  const env = c.env;
  const start = Date.now();

  // 1. 尝试从缓存读取
  const cached = await getHistory(env);
  if (cached) {
    const duration = Date.now() - start;
    console.log(`[60s] GET /history (cache hit) → 200 (${duration}ms)`);
    return c.json({ data: { events: cached.events, date: cached.date }, error: null });
  }

  // 2. 缓存未命中，回退到 60s API
  console.log(`[60s] GET /history (cache miss) → fetching upstream`);
  try {
    const response = await fetch('https://60s.viki.moe/v2/today-in-history');
    if (!response.ok) {
      const duration = Date.now() - start;
      console.log(`[60s] GET /history → ${response.status} (${duration}ms)`);
      return c.json({ data: null, error: `Upstream error: ${response.status}` });
    }

    const result = await response.json() as SixtyHistoryResponse;
    const duration = Date.now() - start;
    console.log(`[60s] GET /history → 200 (${duration}ms)`);

    if (result.code === 200 && result.data?.items) {
      const today = result.data.date || new Date().toISOString().split('T')[0];
      const events = result.data.items.map((e: { year?: string; title?: string }) => ({ year: e.year || '', title: e.title || '' }));

      // 异步更新缓存
      setTimeout(async () => {
        try {
          await setHistory(env, events, today);
          console.log(`[60s] History cached for today`);
        } catch (e) { console.error('[60s] Failed to cache history:', e); }
      }, 0);

      return c.json({ data: { events, date: today }, error: null });
    }

    return c.json({ data: null, error: 'Invalid response format' });
  } catch (err) {
    const duration = Date.now() - start;
    console.log(`[60s] GET /history → 500 (${duration}ms) ${err}`);
    return c.json({ data: null, error: String(err) });
  }
});

export { router as historyRouter };