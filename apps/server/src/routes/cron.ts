// apps/server/src/routes/cron.ts
import { Hono } from 'hono';
import { cleanExpired, setQuote, setHistory, setNews } from '../services/daily-cache';
import type { Env } from '../index';

const router = new Hono<{ Bindings: Env }>();

interface SixtyData { [key: string]: unknown; }

async function fetchSixtyData(url: string): Promise<SixtyData | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json() as { code: number; data?: SixtyData };
    if (data.code === 200 && data.data) return data.data;
    return null;
  } catch { return null; }
}

router.post('/fetch', async (c) => {
  const env = c.env;
  const start = Date.now();
  console.log('[cron] Starting daily data fetch');

  try {
    await cleanExpired(env);
    console.log('[cron] Cleaned expired data');

    const today = new Date().toISOString().split('T')[0];

    const [quoteData, historyData, newsData] = await Promise.all([
      fetchSixtyData('https://60s.viki.moe/v2/hitokoto'),
      fetchSixtyData('https://60s.viki.moe/v2/today-in-history'),
      fetchSixtyData('https://60s.viki.moe/v2/ai-news'),
    ]);

    if (quoteData?.hitokoto) {
      await setQuote(env, quoteData.hitokoto as string, '一言', today);
      console.log('[cron] Saved quote');
    }

    if (historyData?.events) {
      const events = (historyData.events as Array<{ year?: string; title?: string }>).map(e => ({ year: e.year || '', title: e.title || '' }));
      await setHistory(env, events, today);
      console.log('[cron] Saved history');
    }

    if (newsData?.news) {
      const news = (newsData.news as Array<{ title?: string; source?: string; url?: string }>).map(n => ({ title: n.title || '', source: n.source || '', url: n.url || '' }));
      await setNews(env, news, today);
      console.log('[cron] Saved news');
    }

    const duration = Date.now() - start;
    console.log(`[cron] Completed in ${duration}ms`);
    return c.json({ success: true, duration });
  } catch (err) {
    const duration = Date.now() - start;
    console.error(`[cron] Failed after ${duration}ms:`, err);
    return c.json({ success: false, error: String(err) }, 500);
  }
});

export { router as cronRouter };