// apps/server/src/routes/60s/it-news.ts
import { Hono } from 'hono';

import { getItNews, setItNews } from '../../services/daily-cache';
import type { RuntimeContext } from '../../services/runtime-context';
import type { AppEnv } from '../../app/types';

interface SixtyItNewsResponse {
  code: number;
  data?: Array<{
    title?: string;
    description?: string;
    link?: string;
    created?: string;
    created_at?: number;
  }>;
  message?: string;
}

const router = new Hono<AppEnv>();

router.get('/', async (c) => {
  // env resolved from context
  const env = c.env as RuntimeContext;
  const start = Date.now();

  // 1. 尝试从缓存读取
  const cached = await getItNews(env);
  if (cached) {
    const duration = Date.now() - start;
    console.log(`[60s] GET /it-news (cache hit) → 200 (${duration}ms)`);
    return c.json({ data: { news: cached.news }, error: null });
  }

  // 2. 缓存未命中，回退到 60s API
  console.log(`[60s] GET /it-news (cache miss) → fetching upstream`);
  try {
    const response = await fetch('https://60s.viki.moe/v2/it-news');
    if (!response.ok) {
      const duration = Date.now() - start;
      console.log(`[60s] GET /it-news → ${response.status} (${duration}ms)`);
      return c.json({ data: null, error: `Upstream error: ${response.status}` });
    }

    const result = await response.json() as SixtyItNewsResponse;
    const duration = Date.now() - start;
    console.log(`[60s] GET /it-news → 200 (${duration}ms)`);

    if (result.code === 200 && result.data) {
      const today = new Date().toISOString().split('T')[0];
      const news = result.data.map((n) => ({
        title: n.title || '',
        description: n.description || '',
        link: n.link || '',
      }));

      // 异步更新缓存
      setTimeout(async () => {
        try {
          await setItNews(env, news, today);
          console.log(`[60s] IT news cached for today`);
        } catch (e) { console.error('[60s] Failed to cache it-news:', e); }
      }, 0);

      return c.json({ data: { news }, error: null });
    }

    return c.json({ data: null, error: 'Invalid response format' });
  } catch (err) {
    const duration = Date.now() - start;
    console.log(`[60s] GET /it-news → 500 (${duration}ms) ${err}`);
    return c.json({ data: null, error: String(err) });
  }
});

export { router as itNewsRouter };
