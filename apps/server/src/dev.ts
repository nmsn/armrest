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
