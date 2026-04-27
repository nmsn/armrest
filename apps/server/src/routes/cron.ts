// apps/server/src/routes/cron.ts
import { Hono } from 'hono';

import { cleanExpired, setQuote, setHistory, setNews, getQuote, getHistory, getNews } from '../services/daily-cache';
import type { AppEnv } from '../app/types';

const router = new Hono<AppEnv>();

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

interface HistoryItem { year?: string; title?: string; description?: string; }
interface NewsItem { title?: string; source?: string; url?: string; }

router.post('/fetch', async (c) => {
  const env = c.env;
  const start = Date.now();
  console.log('[cron] Starting daily data fetch');

  try {
    await cleanExpired(env);
    console.log('[cron] Cleaned expired data');

    const today = new Date().toISOString().split('T')[0];

    const tasks: Promise<void>[] = [];

    const existingQuote = await getQuote(env);
    if (existingQuote) {
      console.log('[cron] Quote already exists for today, skipping');
    } else {
      tasks.push(
        fetchSixtyData('https://60s.viki.moe/v2/hitokoto').then(async (quoteData) => {
          if (quoteData?.hitokoto) {
            await setQuote(env, quoteData.hitokoto as string, today);
            console.log('[cron] Saved quote');
          }
        }),
      );
    }

    const existingHistory = await getHistory(env);
    if (existingHistory) {
      console.log('[cron] History already exists for today, skipping');
    } else {
      tasks.push(
        fetchSixtyData('https://60s.viki.moe/v2/today-in-history').then(async (historyData) => {
          if (historyData?.items) {
            const events = (historyData.items as Array<HistoryItem>).map(e => ({ year: e.year || '', title: e.title || '' }));
            await setHistory(env, events, today);
            console.log('[cron] Saved history');
          }
        }),
      );
    }

    const existingNews = await getNews(env);
    if (existingNews) {
      console.log('[cron] News already exists for today, skipping');
    } else {
      tasks.push(
        fetchSixtyData('https://60s.viki.moe/v2/ai-news').then(async (newsData) => {
          if (newsData?.news && (newsData.news as Array<NewsItem>).length > 0) {
            const news = (newsData.news as Array<NewsItem>).map(n => ({ title: n.title || '', source: n.source || '', url: n.url || '' }));
            await setNews(env, news, today);
            console.log('[cron] Saved news');
          } else {
            console.log('[cron] No news data available (API returned empty)');
          }
        }),
      );
    }

    await Promise.all(tasks);

    const duration = Date.now() - start;
    console.log(`[cron] Completed in ${duration}ms`);
    return c.json({ success: true, duration, skipped: { quote: !!existingQuote, history: !!existingHistory, news: !!existingNews } });
  } catch (err) {
    const duration = Date.now() - start;
    console.error(`[cron] Failed after ${duration}ms:`, err);
    return c.json({ success: false, error: String(err) }, 500);
  }
});

export { router as cronRouter };