import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { createAuth } from './auth';
import { authRouter } from './routes/auth';
import { bookmarksRouter } from './routes/bookmarks';
import { weatherRouter } from './routes/weather';
import { syncRouter } from './routes/sync';
import { sixtyRouter } from './routes/60s';
import { geocodeRouter } from './routes/geocode';
import { faviconRouter } from './routes/favicon';
import { metadataRouter } from './routes/metadata';
import { cronRouter } from './routes/cron';
import { translateRouter } from './routes/translate';
import { dictionaryRouter } from './routes/dictionary';
import type { Auth } from './auth';

export interface Env {
  DB: D1Database;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  BETTER_AUTH_SECRET: string;
  NODE_ENV: string;
  OPENWEATHER_API_KEY: string;
}

type AppVariables = {
  auth: Auth;
  userId: string;
};

const app = new Hono<{ Bindings: Env; Variables: AppVariables }>();

app.use('/*', cors({
  origin: ['chrome-extension://*', 'http://localhost:*'],
  credentials: true,
}));

// Middleware to create auth instance and extract userId from session
app.use('/*', async (c, next) => {
  const auth = createAuth(c.env);
  c.set('auth', auth);
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  c.set('userId', session?.user?.id ?? '');
  await next();
});

app.get('/', (c) => c.json({ status: 'ok', version: '1.0.0' }));

app.all('/auth/*', async (c) => {
  const auth = c.get('auth');
  return auth.handler(c.req.raw);
});

/* eslint-disable @typescript-eslint/no-explicit-any */
app.route('/auth', authRouter() as unknown as Hono<any, any, any>);
app.route('/api/bookmarks', bookmarksRouter as unknown as Hono<any, any, any>);
app.route('/api/bookmarks/sync', syncRouter as unknown as Hono<any, any, any>);
app.route('/api', weatherRouter as unknown as Hono<any, any, any>);
app.route('/api/60s', sixtyRouter as unknown as Hono<any, any, any>);
app.route('/api', geocodeRouter as unknown as Hono<any, any, any>);
app.route('/api', faviconRouter as unknown as Hono<any, any, any>);
app.route('/api', metadataRouter as unknown as Hono<any, any, any>);
app.route('/internal/cron', cronRouter as unknown as Hono<any, any, any>);
app.route('/api/cron', cronRouter as unknown as Hono<any, any, any>);
app.route('/api/translate', translateRouter as unknown as Hono<any, any, any>);
app.route('/api/dictionary', dictionaryRouter as unknown as Hono<any, any, any>);
/* eslint-enable @typescript-eslint/no-explicit-any */

export default app;