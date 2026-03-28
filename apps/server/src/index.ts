import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createAuth } from './auth';
import { authRouter } from './routes/auth';
import { bookmarksRouter } from './routes/bookmarks';
import { weatherRouter } from './routes/weather';
import { syncRouter } from './routes/sync';

export interface Env {
  DB: D1Database;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  BETTER_AUTH_SECRET: string;
  NODE_ENV: string;
}

const app = new Hono<{ Bindings: Env }>();

app.use('/*', cors({
  origin: ['chrome-extension://*', 'http://localhost:*'],
  credentials: true,
}));

app.get('/', (c) => c.json({ status: 'ok', version: '1.0.0' }));

const auth = createAuth({
  DB: c.env.DB,
  GITHUB_CLIENT_ID: c.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: c.env.GITHUB_CLIENT_SECRET,
  BETTER_AUTH_SECRET: c.env.BETTER_AUTH_SECRET,
  NODE_ENV: c.env.NODE_ENV,
});

// better-auth 需要统一的 handler 处理所有 HTTP 方法
app.all('/auth/*', async (c) => {
  return auth.handler()(c.req.raw, { env: c.env });
});

app.route('/auth', authRouter(auth));
app.route('/api/bookmarks', bookmarksRouter);
app.route('/api/bookmarks/sync', syncRouter);
app.route('/api', weatherRouter);

export default app;