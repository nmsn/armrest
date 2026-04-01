/**
 * Local development server using SQLite directly
 * Run with: pnpm dev:sqlite
 */
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { eq } from 'drizzle-orm';

import * as schema from './db/schema';
import { cronRouter } from './routes/cron';

const client = createClient({ url: 'file:./dev.db' });
const db = drizzle(client, { schema });

// Ensure local dev user exists
async function initLocalUser() {
  const localUserId = 'local-user';
  const existing = await db.select().from(schema.users).where(eq(schema.users.id, localUserId)).get();
  if (!existing) {
    await db.insert(schema.users).values({
      id: localUserId,
      name: 'Local Developer',
      email: 'local@dev.local',
    });
    console.log('Created local dev user');
  }
}

const app = new Hono();

// Simple CORS for local development
app.use('/*', cors({
  origin: ['chrome-extension://*', 'http://localhost:*', 'http://127.0.0.1:*'],
  credentials: true,
}));

app.get('/', (c) => c.json({ status: 'ok', version: '1.0.0', mode: 'local-dev' }));

// Mock auth endpoints for local development
app.get('/auth/session', (c) => {
  // For local dev, return a mock session or empty
  return c.json({ user: null });
});

app.post('/auth/sign-out', (c) => {
  return c.json({ success: true });
});

// Bookmark endpoints using local SQLite
app.get('/api/bookmarks', async (c) => {
  const userId = c.req.header('x-user-id') || 'local-user';
  const bookmarks = await db.select().from(schema.bookmarks).all();
  return c.json(bookmarks);
});

app.post('/api/bookmarks', async (c) => {
  const body = await c.req.json();
  const id = crypto.randomUUID();
  await db.insert(schema.bookmarks).values({
    id,
    userId: 'local-user',
    folderId: body.folderId,
    name: body.name,
    url: body.url,
    logo: body.logo,
    description: body.description,
    color: body.color,
    position: body.position || 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return c.json({ id, ...body });
});

app.delete('/api/bookmarks/:id', async (c) => {
  const id = c.req.param('id');
  await db.delete(schema.bookmarks).where(eq(schema.bookmarks.id, id));
  return c.json({ success: true });
});

// Weather proxy
app.get('/api/weather', async (c) => {
  const { latitude, longitude } = c.req.query();
  if (!latitude || !longitude) {
    return c.json({ error: 'Missing latitude or longitude' }, 400);
  }
  // Return mock weather for local dev
  return c.json({
    temp: 20,
    description: 'Cloudy',
    location: 'Local Development'
  });
});

// Quote endpoint
app.get('/api/quote', async (c) => {
  return c.json({
    hitokoto: 'Local development quote',
    from: 'Development Mode'
  });
});

// Cron endpoint for local dev (uses SQLite directly)
app.post('/internal/cron/fetch', async (c) => {
  const { cleanExpired, setQuote, setHistory, setNews } = await import('./services/daily-cache');

  const start = Date.now();
  console.log('[cron] Starting daily data fetch (local dev)');

  try {
    // Use local SQLite via { local: true }
    await cleanExpired({ local: true } as any);
    console.log('[cron] Cleaned expired data');

    const today = new Date().toISOString().split('T')[0];

    const [quoteRes, historyRes, newsRes] = await Promise.all([
      fetch('https://60s.viki.moe/v2/hitokoto'),
      fetch('https://60s.viki.moe/v2/today-in-history'),
      fetch('https://60s.viki.moe/v2/ai-news'),
    ]);

    const [quoteData, historyData, newsData] = await Promise.all([
      quoteRes.json() as Promise<{ data?: { hitokoto?: string } }>,
      historyRes.json() as Promise<{ data?: { items?: Array<{ year?: string; title?: string }> } }>,
      newsRes.json() as Promise<{ data?: { news: Array<{ title?: string; source?: string; url?: string }> } }>,
    ]);

    if (quoteData?.data?.hitokoto) {
      await setQuote({ local: true } as any, quoteData.data.hitokoto, today);
      console.log('[cron] Saved quote');
    }

    if (historyData?.data?.items) {
      const events = historyData.data.items.map((e: { year?: string; title?: string }) => ({ year: e.year || '', title: e.title || '' }));
      await setHistory({ local: true } as any, events, today);
      console.log('[cron] Saved history');
    }

    if (newsData?.data?.news && (newsData.data.news as Array<{ title?: string }>).length > 0) {
      const news = newsData.data.news.map((n: { title?: string; source?: string; url?: string }) => ({ title: n.title || '', source: n.source || '', url: n.url || '' }));
      await setNews({ local: true } as any, news, today);
      console.log('[cron] Saved news');
    } else {
      console.log('[cron] No news data available (API returned empty)');
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

// POST /api/bookmarks/sync - batch sync
app.post('/api/bookmarks/sync', async (c) => {
  const body = await c.req.json();
  const userId = 'local-user';

  // Delete existing bookmarks and insert new ones
  await db.delete(schema.bookmarks).all();

  for (const bookmark of body.bookmarks || []) {
    await db.insert(schema.bookmarks).values({
      id: crypto.randomUUID(),
      userId,
      folderId: bookmark.folderId,
      name: bookmark.name,
      url: bookmark.url,
      logo: bookmark.logo,
      description: bookmark.description,
      color: bookmark.color,
      position: bookmark.position || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  return c.json({ success: true });
});

// 60s test page (direct local SQLite queries, bypasses daily-cache service)
app.get('/api/60s/test', async (c) => {
  const today = new Date().toISOString().split('T')[0];
  const quoteRows = await db.select().from(schema.dailyQuotes).where(eq(schema.dailyQuotes.date, today)).all();
  const historyRows = await db.select().from(schema.dailyHistory).where(eq(schema.dailyHistory.date, today)).all();
  const newsRows = await db.select().from(schema.dailyAiNews).where(eq(schema.dailyAiNews.date, today)).all();

  const quoteData = quoteRows[0];
  const historyData = historyRows[0];
  const newsData = newsRows[0];

  const quoteHtml = quoteData
    ? `<blockquote>"${quoteData.content}"</blockquote>`
    : '<p>暂无一言数据</p>';

  const events = historyData ? JSON.parse(historyData.events) : [];
  const historyHtml = events.length
    ? `<ul>${events.map((e: { year?: string; title?: string }) => `<li><strong>${e.year}</strong> ${e.title}</li>`).join('')}</ul>`
    : '<p>暂无历史上的今天数据</p>';

  const news = newsData ? JSON.parse(newsData.news) : [];
  const newsHtml = news.length
    ? `<ul>${news.map((n: { title?: string; source?: string; url?: string }) => `<li><a href="${n.url}" target="_blank">${n.title}</a> <span>${n.source}</span></li>`).join('')}</ul>`
    : '<p>暂无AI新闻数据</p>';

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>60s 测试</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.6; }
    h1 { text-align: center; color: #333; }
    section { margin-bottom: 32px; border: 1px solid #eee; border-radius: 8px; padding: 20px; }
    h2 { margin-top: 0; color: #555; border-bottom: 1px solid #eee; padding-bottom: 8px; }
    blockquote { font-size: 1.2em; text-align: center; margin: 0; padding: 16px; background: #f9f9f9; border-radius: 8px; }
    cite { display: block; margin-top: 8px; font-size: 0.85em; color: #888; font-style: normal; }
    ul { padding-left: 20px; }
    li { margin-bottom: 6px; }
    li strong { color: #e67e22; }
    span { color: #888; font-size: 0.85em; }
    a { color: #3498db; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .refresh { text-align: center; margin-top: 32px; display: flex; gap: 12px; justify-content: center; align-items: center; }
    .refresh a, .refresh button { background: #3498db; color: #fff; padding: 10px 24px; border-radius: 6px; cursor: pointer; font-size: 14px; }
    .refresh button:disabled { background: #aaa; cursor: not-allowed; }
  </style>
</head>
<body>
  <h1>📅 60s 每日数据</h1>

  <section>
    <h2>💬 一言</h2>
    ${quoteHtml}
  </section>

  <section>
    <h2>📆 历史上的今天</h2>
    ${historyHtml}
  </section>

  <section>
    <h2>🤖 AI 科技新闻</h2>
    ${newsHtml}
  </section>

  <div class="refresh">
    <button id="fetchBtn">📥 拉取并写入数据库</button>
    <a href="/api/60s/test">🔄 刷新</a>
  </div>
  <div id="status" style="text-align:center; margin-top:16px; min-height:24px; font-size:14px;"></div>
  <script>
    document.getElementById('fetchBtn').addEventListener('click', async () => {
      const btn = document.getElementById('fetchBtn');
      const status = document.getElementById('status');
      btn.disabled = true;
      btn.textContent = '写入中...';
      status.textContent = '';
      try {
        const res = await fetch('/internal/cron/fetch', { method: 'POST' });
        const result = await res.json();
        if (result.success) {
          status.textContent = '✅ 写入成功，耗时 ' + result.duration + 'ms';
          status.style.color = 'green';
          location.reload();
        } else {
          status.textContent = '❌ 写入失败: ' + result.error;
          status.style.color = 'red';
          btn.disabled = false;
          btn.textContent = '📥 拉取并写入数据库';
        }
      } catch (e) {
        status.textContent = '❌ 请求失败: ' + e;
        status.style.color = 'red';
        btn.disabled = false;
        btn.textContent = '📥 拉取并写入数据库';
      }
    });
  </script>
</body>
</html>`;

  return c.html(html);
});

const port = 3001;

// Initialize local user and start server
initLocalUser().then(() => {
  serve({
    fetch: app.fetch,
    port,
  }, (info) => {
    console.log(`Local dev server running on http://localhost:${info.port}`);
  });
});
