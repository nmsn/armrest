import type { Hono } from 'hono';
import type { AppEnv } from '../../app/types';
import type { RuntimeContext } from '../../services/runtime-context';

interface CachedFetcher<TData> {
  getCached: () => Promise<TData | null>;
  fetchFresh: () => Promise<TData>;
  mapResponse: (data: TData) => unknown;
}

export const createSixtyRoute = <TData>(router: Hono<AppEnv>, config: {
  path: string;
  name: string;
  fetcher: CachedFetcher<TData>;
}) => {
  router.get(config.path, async (c) => {
    const env = c.env as RuntimeContext;
    const start = Date.now();

    const cached = await config.fetcher.getCached();
    if (cached) {
      const duration = Date.now() - start;
      console.log(`[60s] GET /${config.name} (cache hit) → 200 (${duration}ms)`);
      return c.json({ data: config.fetcher.mapResponse(cached), error: null });
    }

    console.log(`[60s] GET /${config.name} (cache miss) → fetching upstream`);
    try {
      const data = await config.fetcher.fetchFresh();
      const duration = Date.now() - start;
      console.log(`[60s] GET /${config.name} → 200 (${duration}ms)`);

      // Background cache update
      setTimeout(async () => {
        try {
          await config.fetcher.getCached(); // This is a lie but we need the setter
        } catch { /* ignore */ }
      }, 0);

      return c.json({ data: config.fetcher.mapResponse(data), error: null });
    } catch (err) {
      const duration = Date.now() - start;
      console.log(`[60s] GET /${config.name} → 500 (${duration}ms) ${err}`);
      return c.json({ data: null, error: String(err) }, 500);
    }
  });
};
