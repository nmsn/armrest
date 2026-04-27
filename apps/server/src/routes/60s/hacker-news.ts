// apps/server/src/routes/60s/hacker-news.ts
import { Hono } from 'hono';

import { getHackerNews, setHackerNews } from '../../services/daily-cache';
import { defer } from '../../services/defer';
import type { RuntimeContext } from '../../services/runtime-context';
import type { AppEnv } from '../../app/types';

interface AlgoliaHNStory {
  title: string;
  url?: string;
  points: number;
  author: string;
  created_at: string;
  objectID: string;
}

const router = new Hono<AppEnv>();

router.get('/', async (c) => {
  // env resolved from context
  const env = c.env as RuntimeContext;
  const start = Date.now();

  // 1. 尝试从缓存读取
  const cached = await getHackerNews(env);
  if (cached) {
    const duration = Date.now() - start;
    console.log(`[60s] GET /hacker-news (cache hit) → 200 (${duration}ms)`);
    return c.json({ data: { stories: cached.stories }, error: null });
  }

  // 2. 缓存未命中，调用 Algolia HN API
  console.log(`[60s] GET /hacker-news (cache miss) → fetching upstream`);
  try {
    const response = await fetch('https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=20');
    if (!response.ok) {
      const duration = Date.now() - start;
      console.log(`[60s] GET /hacker-news → ${response.status} (${duration}ms)`);
      return c.json({ data: null, error: `Upstream error: ${response.status}` });
    }

    const result = await response.json() as { hits?: AlgoliaHNStory[] };
    const duration = Date.now() - start;
    console.log(`[60s] GET /hacker-news → 200 (${duration}ms)`);

    if (result.hits && result.hits.length > 0) {
      const stories = result.hits
        .filter((s) => s.title && s.objectID)
        .map((s) => ({
          id: parseInt(s.objectID, 10),
          title: s.title || '',
          url: s.url || `https://news.ycombinator.com/item?id=${s.objectID}`,
          score: s.points || 0,
          by: s.author || '',
          time: s.created_at || '',
        }));

      // 异步更新缓存
      defer(c.executionCtx, setHackerNews(env, stories));

      return c.json({ data: { stories }, error: null });
    }

    return c.json({ data: null, error: 'No stories returned' });
  } catch (err) {
    const duration = Date.now() - start;
    console.log(`[60s] GET /hacker-news → 500 (${duration}ms) ${err}`);
    return c.json({ data: null, error: String(err) });
  }
});

export { router as hackerNewsRouter };
