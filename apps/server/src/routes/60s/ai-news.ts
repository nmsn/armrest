// apps/server/src/routes/60s/ai-news.ts
import { Hono } from 'hono';

import { getNews, setNews } from '../../services/daily-cache';
import { defer } from '../../services/defer';
import type { RuntimeContext } from '../../services/runtime-context';
import type { AppEnv } from '../../app/types';

interface SixtyNewsResponse {
  code: number;
  data?: { news?: Array<{ title?: string; source?: string; url?: string }>; date?: string };
}

const router = new Hono<AppEnv>();

router.get('/', async (c) => {
  // env resolved from context
  const env = c.env as RuntimeContext;
  const start = Date.now();

  // 1. 尝试从缓存读取
  const cached = await getNews(env);
  if (cached) {
    const duration = Date.now() - start;
    console.log(`[60s] GET /ai-news (cache hit) → 200 (${duration}ms)`);
    return c.json({ data: { news: cached.news, date: cached.date }, error: null });
  }

  // 2. 缓存未命中，回退到 60s API
  console.log(`[60s] GET /ai-news (cache miss) → fetching upstream`);
  try {
    const response = await fetch('https://60s.viki.moe/v2/ai-news');
    if (!response.ok) {
      const duration = Date.now() - start;
      console.log(`[60s] GET /ai-news → ${response.status} (${duration}ms)`);
      return c.json({ data: null, error: `Upstream error: ${response.status}` });
    }

    const result = await response.json() as SixtyNewsResponse;
    const duration = Date.now() - start;
    console.log(`[60s] GET /ai-news → 200 (${duration}ms)`);

    if (result.code === 200 && result.data?.news) {
      const today = result.data.date || new Date().toISOString().split('T')[0];
      const news = result.data.news.map(n => ({ title: n.title || '', source: n.source || '', url: n.url || '' }));

      // 异步更新缓存
      defer(c.executionCtx, setNews(env, news, today));

      return c.json({ data: { news, date: today }, error: null });
    }

    return c.json({ data: null, error: 'Invalid response format' });
  } catch (err) {
    const duration = Date.now() - start;
    console.log(`[60s] GET /ai-news → 500 (${duration}ms) ${err}`);
    return c.json({ data: null, error: String(err) });
  }
});

export { router as aiNewsRouter };