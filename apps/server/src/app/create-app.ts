import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { authContextMiddleware } from '../middleware/auth-context';
import { bookmarksRouter } from '../routes/bookmarks';
import { weatherRouter } from '../routes/weather';
import { syncRouter } from '../routes/sync';
import { sixtyRouter } from '../routes/60s';
import { geocodeRouter } from '../routes/geocode';
import { faviconRouter } from '../routes/favicon';
import { metadataRouter } from '../routes/metadata';
import { cronRouter } from '../routes/cron';
import { translateRouter } from '../routes/translate';
import type { AppEnv } from './types';

export const createApp = (env?: Partial<AppEnv['Bindings']>): Hono<AppEnv> => {
  const app = new Hono<AppEnv>();

  app.use('/*', cors({ origin: ['chrome-extension://*', 'http://localhost:*'], credentials: true }));

  // Inject env bindings for local development / testing
  if (env) {
    app.use('/*', async (c, next) => {
      c.env = {
        ...c.env,
        ...env,
      } as AppEnv['Bindings'];
      await next();
    });
  }

  app.use('/*', authContextMiddleware);

  app.get('/', (c) => c.json({ status: 'ok', version: '1.0.0' }));
  app.route('/api/bookmarks', bookmarksRouter);
  app.route('/api/bookmarks/sync', syncRouter);
  app.route('/api', weatherRouter);
  app.route('/api/60s', sixtyRouter);
  app.route('/api', geocodeRouter);
  app.route('/api', faviconRouter);
  app.route('/api', metadataRouter);
  app.route('/internal/cron', cronRouter);
  app.route('/api/cron', cronRouter);
  app.route('/api/translate', translateRouter);

  return app;
};