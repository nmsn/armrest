/**
 * Local development server using SQLite directly
 * Run with: pnpm dev:sqlite
 */
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { eq } from 'drizzle-orm';

import * as schema from './db/schema';
import { cronRouter } from './routes/cron';
import { translate, saveTranslation, getTodayTranslations } from './services/translation';
import { sixtyRouter } from './routes/60s';

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

// Request logging middleware
app.use('/*', logger());

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

// POST /api/translate - translate text
app.post('/api/translate', async (c) => {
  const body = await c.req.json<{ text?: string; from?: string; to?: string }>();

  if (!body.text) {
    return c.json({ success: false, error: 'text is required' }, 400);
  }

  const result = await translate({ local: true } as any, {
    text: body.text,
    from: body.from,
    to: body.to,
  });

  if (!result) {
    return c.json({ success: false, error: 'Translation failed' }, 500);
  }

  const userId = 'local-user';
  await saveTranslation(
    { local: true } as any,
    userId,
    result.source.text,
    result.source.type,
    result.source.typeDesc,
    result.source.pronounce,
    result.target.text,
    result.target.type,
    result.target.typeDesc,
    result.target.pronounce,
  );

  return c.json({ success: true, data: result });
});

// GET /api/translate/history
app.get('/api/translate/history', async (c) => {
  const userId = 'local-user';
  const rows = await getTodayTranslations({ local: true } as any, userId);
  return c.json({ success: true, data: rows });
});

// Mount sixtyRouter for local dev
app.route('/api/60s', sixtyRouter);

// Geocode endpoint
app.get('/api/geocode', async (c) => {
  const lat = c.req.query('lat');
  const lon = c.req.query('lon');

  if (!lat || !lon) {
    return c.json({ data: null, error: 'Missing required parameters: lat, lon' }, 400);
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);

  if (isNaN(latitude) || isNaN(longitude)) {
    return c.json({ data: null, error: 'Invalid coordinates: lat and lon must be numbers' }, 400);
  }

  if (latitude < -90 || latitude > 90) {
    return c.json({ data: null, error: 'Invalid latitude: must be between -90 and 90' }, 400);
  }

  if (longitude < -180 || longitude > 180) {
    return c.json({ data: null, error: 'Invalid longitude: must be between -180 and 180' }, 400);
  }

  try {
    const url = new URL('https://api.bigdatacloud.net/data/reverse-geocode-client');
    url.searchParams.append('latitude', latitude.toString());
    url.searchParams.append('longitude', longitude.toString());
    url.searchParams.append('localityLanguage', 'zh');

    const response = await fetch(url.toString());

    if (!response.ok) {
      return c.json({ data: null, error: `Upstream error: ${response.status}` });
    }

    const result = await response.json() as {
      city?: string;
      locality?: string;
      countryName?: string;
      principalSubdivision?: string;
    };

    return c.json({
      data: {
        city: result.city || result.locality || result.principalSubdivision || result.countryName || '',
        locality: result.locality || '',
        countryName: result.countryName || '',
        principalSubdivision: result.principalSubdivision || '',
      },
      error: null,
    });
  } catch (err) {
    return c.json({ data: null, error: String(err) });
  }
});

// Initialize local user and start server
initLocalUser().then(async () => {
  const defaultPort = 3001;
  let port = defaultPort;
  const maxAttempts = 10;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const { createAdaptorServer } = await import('@hono/node-server');
    const server = createAdaptorServer({ fetch: app.fetch });

    try {
      // Wrap listen in a Promise that resolves on success or rejects on EADDRINUSE
      const serverInfo = await new Promise<{ port: number }>((resolve, reject) => {
        server.on('error', (err: NodeJS.ErrnoException) => {
          if (err.code === 'EADDRINUSE') {
            server.close();
            reject(err);
          } else {
            server.close();
            reject(err);
          }
        });
        server.listen(port, () => {
          resolve({ port });
        });
      });

      const portNote = serverInfo.port !== defaultPort ? ` (default ${defaultPort} was busy)` : '';
      console.log('');
      console.log('  🏠 Armrest Server (Local Dev)');
      console.log(`  🌐 http://localhost:${serverInfo.port}${portNote}`);
      console.log(`  📋 API Docs:`);
      console.log(`     - GET  /api/60s/test          60s 测试页面`);
      console.log(`     - POST /internal/cron/fetch   执行定时任务`);
      console.log(`     - GET  /api/translate/history 翻译历史`);
      console.log('');
      return;
    } catch (err: any) {
      if (err.code === 'EADDRINUSE') {
        console.log(`  ⚠ Port ${port} is in use, trying ${port + 1}...`);
        port++;
        continue;
      }
      throw err;
    }
  }

  throw new Error(`No available port found after ${maxAttempts} attempts`);
});
