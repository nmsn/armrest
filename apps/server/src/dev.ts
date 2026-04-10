/**
 * Local development server using SQLite directly
 * Run with: pnpm dev:sqlite
 */
import { logger } from 'hono/logger';
import { eq } from 'drizzle-orm';

import { createApp } from './app/create-app';
import { createLocalBindings } from './dev/create-local-bindings';
import { registerLocalRoutes } from './dev/register-local-routes';
import * as schema from './db/schema';

const localBindings = createLocalBindings();

// Ensure local dev user exists
async function initLocalUser() {
  const localUserId = 'local-user';
  const existing = await localBindings.localDb
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, localUserId))
    .get();
  if (!existing) {
    await localBindings.localDb.insert(schema.users).values({
      id: localUserId,
      name: 'Local Developer',
      email: 'local@dev.local',
    });
    console.log('Created local dev user');
  }
}

const app = createApp();

// Request logging middleware
app.use('/*', logger());

// Register local-only routes (mock auth, geocode)
registerLocalRoutes(app, localBindings);

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
    } catch (err: NodeJS.ErrnoException) {
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
