# Server Standards Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring `apps/server` in line with Hono + TypeScript best practices by removing unsafe type casts, unifying runtime bootstrapping, restructuring feature routes, and adding request-level tests.

**Architecture:** Keep a single typed Hono app definition that works for both Workers and local Node development. Split runtime concerns from feature concerns: shared app factory, shared middleware, feature-oriented routes, and thin services/adapters. Standardize request validation and response/error shapes so routes stop re-implementing the same logic.

**Tech Stack:** Hono, TypeScript, Zod, Drizzle ORM, Better Auth, Vitest, Cloudflare Workers, @hono/node-server

---

## Current Review Summary

`apps/server` is functional, but several patterns are drifting away from the `hono` and `hono-typescript` conventions:

- `apps/server/src/index.ts:54-66` uses repeated `as unknown as Hono<any, any, any>` casts, which hides type incompatibilities instead of fixing router boundaries.
- `apps/server/src/dev.ts:35-340` duplicates a large amount of production routing and embeds local-only behavior directly in the runtime entrypoint, making it easy for dev/prod behavior to drift.
- `apps/server/src/routes/translate.ts:7-50` and multiple `60s` routes parse request bodies or query params inline instead of validating via `zValidator`.
- `apps/server/src/db/index.ts:15-29` and several routes/services rely on `{ local: true } as unknown as Env` / `as any`, which means the environment contract is not modeled cleanly.
- `apps/server/src/middleware/auth.ts:5-17` is not implemented as reusable typed Hono middleware and is currently unused by the main app.
- `apps/server/src/routes/60s/*.ts` repeats the same fetch-cache-log-response pattern in many files, increasing maintenance cost.
- `apps/server/src/routes/60s/test.ts` is the only test-like artifact under `apps/server`; there are no automated request-level tests.

## Target File Structure

This refactor should move the server toward a feature-oriented structure while keeping churn reasonable:

```text
apps/server/
  src/
    app/
      create-app.ts
      env.ts
      types.ts
    middleware/
      auth-context.ts
      require-user.ts
      error-handler.ts
    routes/
      auth/
        index.ts
      bookmarks/
        index.ts
        validators.ts
      sync/
        index.ts
        validators.ts
      translate/
        index.ts
        validators.ts
      sixty/
        index.ts
        route-factory.ts
      external/
        weather.ts
        geocode.ts
        metadata.ts
        favicon.ts
      cron/
        index.ts
    services/
      bookmark-service.ts
      translation-service.ts
      daily-cache-service.ts
    testing/
      create-test-app.ts
    index.ts
    dev.ts
```

Notes:

- Keep `db/` and `auth/` in place unless a later task needs a targeted split.
- Do not do a big-bang rewrite of every route. Move files incrementally behind stable exports.
- Preserve existing endpoints and response payloads unless a task explicitly changes them.

### Task 1: Create a Typed App Shell and Remove Unsafe Router Casts

**Files:**
- Create: `apps/server/src/app/env.ts`
- Create: `apps/server/src/app/types.ts`
- Create: `apps/server/src/app/create-app.ts`
- Create: `apps/server/src/middleware/auth-context.ts`
- Modify: `apps/server/src/index.ts`
- Modify: `apps/server/src/routes/auth.ts`
- Modify: `apps/server/src/routes/bookmarks.ts`
- Modify: `apps/server/src/routes/sync.ts`
- Modify: `apps/server/src/routes/translate.ts`
- Modify: `apps/server/src/routes/cron.ts`
- Modify: `apps/server/src/routes/60s/index.ts`
- Test: `apps/server/src/index.test.ts`

- [ ] **Step 1: Write the failing bootstrap test**

```ts
import { describe, expect, it } from 'vitest';
import app from './index';

describe('server bootstrap', () => {
  it('responds to GET / with health data', async () => {
    const response = await app.request('/');
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: 'ok', version: '1.0.0' });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @armrest/server test -- --run apps/server/src/index.test.ts`
Expected: FAIL because test tooling does not exist yet, or because the app export is not test-ready.

- [ ] **Step 3: Add shared app types and a factory**

```ts
// apps/server/src/app/types.ts
import type { Auth } from '../auth';

export interface AppBindings {
  readonly DB: D1Database;
  readonly GITHUB_CLIENT_ID: string;
  readonly GITHUB_CLIENT_SECRET: string;
  readonly BETTER_AUTH_SECRET: string;
  readonly NODE_ENV: string;
  readonly OPENWEATHER_API_KEY: string;
}

export interface AppVariables {
  readonly auth: Auth;
  readonly userId: string;
}

export interface AppEnv {
  Bindings: AppBindings;
  Variables: AppVariables;
}
```

```ts
// apps/server/src/middleware/auth-context.ts
import { createMiddleware } from 'hono/factory';
import { createAuth } from '../auth';
import type { AppEnv } from '../app/types';

export const authContextMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const auth = createAuth(c.env);
  c.set('auth', auth);
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  c.set('userId', session?.user?.id ?? '');
  await next();
});
```

```ts
// apps/server/src/app/create-app.ts
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { authContextMiddleware } from '../middleware/auth-context';
import { authRouter } from '../routes/auth';
import { bookmarksRouter } from '../routes/bookmarks';
import { syncRouter } from '../routes/sync';
import { translateRouter } from '../routes/translate';
import { cronRouter } from '../routes/cron';
import { sixtyRouter } from '../routes/60s';
import type { AppEnv } from './types';

export const createApp = (): Hono<AppEnv> => {
  const app = new Hono<AppEnv>();

  app.use('/*', cors({ origin: ['chrome-extension://*', 'http://localhost:*'], credentials: true }));
  app.use('/*', authContextMiddleware);

  app.get('/', (c) => c.json({ status: 'ok', version: '1.0.0' }));
  app.route('/auth', authRouter);
  app.route('/api/bookmarks', bookmarksRouter);
  app.route('/api/bookmarks/sync', syncRouter);
  app.route('/api/translate', translateRouter);
  app.route('/internal/cron', cronRouter);
  app.route('/api/cron', cronRouter);
  app.route('/api/60s', sixtyRouter);

  return app;
};
```

- [ ] **Step 4: Update route modules to use the shared `AppEnv` type**

Run through each router and replace local ad-hoc generics such as:

```ts
const router = new Hono<{ Bindings: Env; Variables: { userId: string } }>();
```

with:

```ts
import type { AppEnv } from '../app/types';

const router = new Hono<AppEnv>();
```

Then remove every `as unknown as Hono<any, any, any>` from `apps/server/src/index.ts`.

- [ ] **Step 5: Run the bootstrap test and lint**

Run: `pnpm --filter @armrest/server test -- --run apps/server/src/index.test.ts`
Expected: PASS

Run: `pnpm --filter @armrest/server lint`
Expected: PASS or only pre-existing warnings unrelated to this task

- [ ] **Step 6: Commit**

```bash
git add apps/server/src/app apps/server/src/middleware/auth-context.ts apps/server/src/index.ts apps/server/src/routes/auth.ts apps/server/src/routes/bookmarks.ts apps/server/src/routes/sync.ts apps/server/src/routes/translate.ts apps/server/src/routes/cron.ts apps/server/src/routes/60s/index.ts apps/server/src/index.test.ts
git commit -m "refactor(server): add typed app factory"
```

### Task 2: Unify Local Dev and Worker Bootstrapping

**Files:**
- Create: `apps/server/src/dev/create-local-bindings.ts`
- Create: `apps/server/src/dev/register-local-routes.ts`
- Modify: `apps/server/src/dev.ts`
- Modify: `apps/server/src/app/create-app.ts`
- Modify: `apps/server/src/db/index.ts`
- Test: `apps/server/src/dev.test.ts`

- [ ] **Step 1: Write the failing local-dev parity test**

```ts
import { describe, expect, it } from 'vitest';
import { createApp } from './app/create-app';

describe('local dev app', () => {
  it('can boot with local bindings', async () => {
    const app = createApp();
    const response = await app.request('/');
    expect(response.status).toBe(200);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @armrest/server test -- --run apps/server/src/dev.test.ts`
Expected: FAIL because local bindings/runtime wiring are not isolated yet.

- [ ] **Step 3: Extract runtime-specific code out of `src/dev.ts`**

Create a local bindings adapter instead of faking `Env` with casts:

```ts
// apps/server/src/dev/create-local-bindings.ts
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from '../db/schema';

export interface LocalBindings {
  readonly localDb: ReturnType<typeof drizzle>;
}

export const createLocalBindings = (): LocalBindings => {
  const client = createClient({ url: 'file:./dev.db' });
  return { localDb: drizzle(client, { schema }) };
};
```

Use a helper in `src/db/index.ts` that receives a runtime adapter object instead of `{ local: true } as any`.

- [ ] **Step 4: Make `src/dev.ts` compose the shared app**

Keep only:

```ts
const app = createApp();
app.use('/*', logger());
registerLocalRoutes(app, createLocalBindings());
serve({ fetch: app.fetch, port });
```

Move local-only mock endpoints (`/auth/session`, `/auth/sign-out`, test page, and local seed/init) into small helpers so the file stops owning business logic.

- [ ] **Step 5: Run parity tests and smoke-check**

Run: `pnpm --filter @armrest/server test -- --run apps/server/src/dev.test.ts`
Expected: PASS

Run: `pnpm --filter @armrest/server dev:sqlite`
Expected: local server starts and logs a localhost URL without route duplication in `src/dev.ts`

- [ ] **Step 6: Commit**

```bash
git add apps/server/src/dev apps/server/src/dev.ts apps/server/src/app/create-app.ts apps/server/src/db/index.ts apps/server/src/dev.test.ts
git commit -m "refactor(server): share app between worker and local dev"
```

### Task 3: Restructure Routes Around Features and Add Request Validators

**Files:**
- Create: `apps/server/src/routes/bookmarks/index.ts`
- Create: `apps/server/src/routes/bookmarks/validators.ts`
- Create: `apps/server/src/routes/sync/index.ts`
- Create: `apps/server/src/routes/sync/validators.ts`
- Create: `apps/server/src/routes/translate/index.ts`
- Create: `apps/server/src/routes/translate/validators.ts`
- Create: `apps/server/src/routes/external/weather.ts`
- Create: `apps/server/src/routes/external/geocode.ts`
- Create: `apps/server/src/routes/external/metadata.ts`
- Create: `apps/server/src/routes/cron/index.ts`
- Modify: `apps/server/src/routes/bookmarks.ts`
- Modify: `apps/server/src/routes/sync.ts`
- Modify: `apps/server/src/routes/translate.ts`
- Modify: `apps/server/src/routes/weather.ts`
- Modify: `apps/server/src/routes/geocode.ts`
- Modify: `apps/server/src/routes/metadata.ts`
- Modify: `apps/server/src/routes/cron.ts`
- Modify: `apps/server/src/app/create-app.ts`
- Test: `apps/server/src/routes/translate/index.test.ts`
- Test: `apps/server/src/routes/bookmarks/index.test.ts`

- [ ] **Step 1: Write failing validation tests**

```ts
import { describe, expect, it } from 'vitest';
import app from '../../index';

describe('translate validation', () => {
  it('rejects missing text', async () => {
    const response = await app.request('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: 'en' }),
    });
    expect(response.status).toBe(400);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @armrest/server test -- --run apps/server/src/routes/translate/index.test.ts apps/server/src/routes/bookmarks/index.test.ts`
Expected: FAIL because route validation still lives inline or is missing for some inputs.

- [ ] **Step 3: Move schemas into dedicated validator files**

```ts
// apps/server/src/routes/translate/validators.ts
import { z } from 'zod';

export const translateBodySchema = z.object({
  text: z.string().trim().min(1),
  from: z.string().optional(),
  to: z.string().optional(),
});
```

```ts
// apps/server/src/routes/external/geocode.ts
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const geocodeQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
});
```

Use `c.req.valid('json')` and `c.req.valid('query')` rather than manual parsing where possible.

- [ ] **Step 4: Re-export new feature folders and keep compatibility**

During the transition, existing flat files may temporarily become re-export shims:

```ts
// apps/server/src/routes/translate.ts
export { translateRouter } from './translate/index';
```

This allows a staged directory migration without breaking imports all at once.

- [ ] **Step 5: Run validation tests and lint**

Run: `pnpm --filter @armrest/server test -- --run apps/server/src/routes/translate/index.test.ts apps/server/src/routes/bookmarks/index.test.ts`
Expected: PASS

Run: `pnpm --filter @armrest/server lint`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/server/src/routes apps/server/src/app/create-app.ts
git commit -m "refactor(server): organize routes by feature"
```

### Task 4: Normalize Services and Runtime Adapters

**Files:**
- Create: `apps/server/src/services/bookmark-service.ts`
- Create: `apps/server/src/services/translation-service.ts`
- Create: `apps/server/src/services/daily-cache-service.ts`
- Create: `apps/server/src/services/runtime-context.ts`
- Modify: `apps/server/src/services/bookmark.ts`
- Modify: `apps/server/src/services/translation.ts`
- Modify: `apps/server/src/services/daily-cache.ts`
- Modify: `apps/server/src/db/index.ts`
- Modify: `apps/server/src/routes/60s/ai-news.ts`
- Modify: `apps/server/src/routes/60s/history.ts`
- Modify: `apps/server/src/routes/60s/quote.ts`
- Modify: `apps/server/src/routes/60s/it-news.ts`
- Modify: `apps/server/src/routes/60s/hacker-news.ts`
- Modify: `apps/server/src/routes/cron/index.ts`
- Test: `apps/server/src/services/translation-service.test.ts`
- Test: `apps/server/src/routes/60s/index.test.ts`

- [ ] **Step 1: Write failing tests for runtime-safe service access**

```ts
import { describe, expect, it } from 'vitest';
import { normalizeLanguageCode } from './translation-service';

describe('normalizeLanguageCode', () => {
  it('maps zh to zh-CHS', () => {
    expect(normalizeLanguageCode('zh')).toBe('zh-CHS');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @armrest/server test -- --run apps/server/src/services/translation-service.test.ts apps/server/src/routes/60s/index.test.ts`
Expected: FAIL because shared helpers/factories do not exist yet.

- [ ] **Step 3: Replace class-heavy and cast-heavy service code with typed functional modules**

```ts
// apps/server/src/services/runtime-context.ts
export interface RuntimeContext {
  readonly db: ReturnType<typeof getDb>;
  readonly now: () => Date;
  readonly fetch: typeof fetch;
}
```

```ts
// apps/server/src/services/bookmark-service.ts
export const createBookmarkService = (context: RuntimeContext) => ({
  list: async (userId: string) => context.db.select().from(schema.bookmarks).where(eq(schema.bookmarks.userId, userId)),
  create: async (input: CreateBookmarkInput) => { /* ... */ },
  update: async (id: string, userId: string, input: UpdateBookmarkInput) => { /* ... */ },
  remove: async (id: string, userId: string) => { /* ... */ },
});
```

Keep old filenames as re-export adapters until all imports are migrated.

- [ ] **Step 4: Add a small route factory for `60s` cache-backed routes**

Create a helper that centralizes:

```ts
type CachedFetcher<TData> = {
  getCached: () => Promise<TData | null>;
  fetchFresh: () => Promise<TData>;
  persistFresh: (data: TData) => Promise<void>;
  mapResponse: (data: TData) => unknown;
};
```

Use it to remove repeated `cache hit / cache miss / fetch / setTimeout / log / return c.json(...)` code from the `60s` route files.

- [ ] **Step 5: Run service and route tests**

Run: `pnpm --filter @armrest/server test -- --run apps/server/src/services/translation-service.test.ts apps/server/src/routes/60s/index.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/server/src/services apps/server/src/db/index.ts apps/server/src/routes/60s apps/server/src/routes/cron/index.ts
git commit -m "refactor(server): normalize services and adapters"
```

### Task 5: Add a Real Test Harness and Ship a Safe Verification Loop

**Files:**
- Create: `apps/server/src/testing/create-test-app.ts`
- Create: `apps/server/src/testing/mock-bindings.ts`
- Create: `apps/server/vitest.config.ts`
- Modify: `apps/server/package.json`
- Modify: `apps/server/tsconfig.json`
- Test: `apps/server/src/index.test.ts`
- Test: `apps/server/src/routes/bookmarks/index.test.ts`
- Test: `apps/server/src/routes/translate/index.test.ts`
- Test: `apps/server/src/routes/60s/index.test.ts`

- [ ] **Step 1: Add the failing test command**

Update `apps/server/package.json` with:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "vitest": "^3.2.0"
  }
}
```

- [ ] **Step 2: Run tests to verify the command fails before setup is complete**

Run: `pnpm --filter @armrest/server test`
Expected: FAIL until `vitest.config.ts`, mocks, and route tests are in place

- [ ] **Step 3: Add a reusable test app factory**

```ts
// apps/server/src/testing/create-test-app.ts
import { createApp } from '../app/create-app';
import { createMockBindings } from './mock-bindings';

export const createTestApp = () => {
  const app = createApp();
  return {
    app,
    bindings: createMockBindings(),
  };
};
```

Use `app.request()` for pure request-level tests and avoid spinning up a server.

- [ ] **Step 4: Add minimum regression coverage**

Required coverage for this refactor:

- health route returns 200
- unauthenticated bookmark access returns 401
- bookmark create rejects invalid payloads
- translate route rejects empty text and returns success shape for valid input
- one `60s` route handles upstream failure as a non-200 response or explicit error body

- [ ] **Step 5: Run full verification**

Run: `pnpm --filter @armrest/server test`
Expected: PASS

Run: `pnpm --filter @armrest/server lint`
Expected: PASS

Run: `pnpm --filter @armrest/server build`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/server/package.json apps/server/tsconfig.json apps/server/vitest.config.ts apps/server/src/testing apps/server/src/**/*.test.ts
git commit -m "test(server): add request-level regression coverage"
```

## Notes for the Implementer

- Prefer `createFactory<AppEnv>()` if router/middleware generics still feel repetitive after Task 1.
- Use `HTTPException` plus a centralized `app.onError()` once route files stop returning ad-hoc error objects everywhere.
- Keep comments and identifiers in English even if some current comments are Chinese.
- If a route’s response shape is already consumed by the client, keep that shape stable and refactor internals first.
- Do not delete flat route files until all imports have been migrated and tests pass.

## Suggested Execution Order

1. Task 1
2. Task 5 test harness bootstrap if Task 1 needs it earlier
3. Task 2
4. Task 3
5. Task 4
6. Re-run Task 5 full verification

Plan complete and saved to `docs/superpowers/plans/2026-04-09-server-standards-refactor-plan.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
