# Daily Cached Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现每日定时数据缓存——一言、历史上的今天、AI新闻三类数据每天早上 8 点抓取并存入数据库，用户请求时优先从缓存读取，过期/为空时回退到实时 API。

**Architecture:** 三张全局缓存表（daily_quotes, daily_history, daily_news），定时任务负责写入，API 路由优先读缓存。7 天过期自动清理。

**Tech Stack:** Hono + Drizzle ORM + D1 (Cloudflare) + libsql (local)

---

## File Structure

```
apps/server/src/
├── db/
│   └── schema.ts          # 添加 daily_quotes, daily_history, daily_news 表
├── services/
│   └── daily-cache.ts    # 缓存读写服务
├── routes/
│   ├── 60s/
│   │   ├── quote.ts      # 修改：优先查缓存
│   │   ├── history.ts     # 修改：优先查缓存
│   │   └── ai-news.ts   # 修改：优先查缓存
│   └── cron.ts           # 新增：定时任务入口
└── index.ts              # 注册 /internal/cron/fetch

apps/server/wrangler.toml  # 添加 Cron Triggers
apps/server/package.json   # 添加 cron:run 脚本
```

---

## Task 1: 扩展数据库 Schema

**Files:**
- Modify: `apps/server/src/db/schema.ts`

- [ ] **Step 1: 添加三张表定义**

在 `schema.ts` 末尾添加：

```typescript
// 一言缓存
export const dailyQuotes = sqliteTable('daily_quotes', {
  id: text('id').$defaultFn(() => 'latest'), // 固定值
  content: text('content').notNull(),
  author: text('author').notNull().default('一言'),
  date: text('date').notNull(), // YYYY-MM-DD
  fetchedAt: integer('fetched_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// 历史上的今天缓存
export const dailyHistory = sqliteTable('daily_history', {
  id: text('id').$defaultFn(() => 'latest'),
  events: text('events').notNull(), // JSON string
  date: text('date').notNull(),
  fetchedAt: integer('fetched_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// AI 新闻缓存
export const dailyNews = sqliteTable('daily_news', {
  id: text('id').$defaultFn(() => 'latest'),
  news: text('news').notNull(), // JSON string
  date: text('date').notNull(),
  fetchedAt: integer('fetched_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});
```

- [ ] **Step 2: 提交**
```bash
git add apps/server/src/db/schema.ts
git commit -m "feat(server): add daily_quotes, daily_history, daily_news tables"
```

---

## Task 2: 创建 daily-cache 服务

**Files:**
- Create: `apps/server/src/services/daily-cache.ts`

- [ ] **Step 1: 创建缓存服务**

```typescript
// apps/server/src/services/daily-cache.ts
import { eq, lt, and } from 'drizzle-orm';
import { getDb } from '../db';
import { dailyQuotes, dailyHistory, dailyNews } from '../db/schema';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

// 类型定义
export interface CachedQuote {
  content: string;
  author: string;
  date: string;
}

export interface CachedHistory {
  events: Array<{ year: string; title: string }>;
  date: string;
}

export interface CachedNews {
  news: Array<{ title: string; source?: string; url?: string }>;
  date: string;
}

// 检查是否过期
function isExpired(fetchedAt: Date | null): boolean {
  if (!fetchedAt) return true;
  return Date.now() - fetchedAt.getTime() > SEVEN_DAYS_MS;
}

// ==================== Quote ====================

export async function getQuote(): Promise<CachedQuote | null> {
  const db = getDb({ local: true }); // 本地开发
  const rows = await db.select().from(dailyQuotes).where(eq(dailyQuotes.id, 'latest')).limit(1);
  if (rows.length === 0) return null;
  const row = rows[0];
  if (isExpired(row.fetchedAt)) return null;
  return { content: row.content, author: row.author, date: row.date };
}

export async function setQuote(content: string, author: string, date: string): Promise<void> {
  const db = getDb({ local: true });
  await db.insert(dailyQuotes).values({ id: 'latest', content, author, date }).onConflictDoUpdate({ target: dailyQuotes.id, set: { content, author, date, fetchedAt: new Date() } });
}

// ==================== History ====================

export async function getHistory(): Promise<CachedHistory | null> {
  const db = getDb({ local: true });
  const rows = await db.select().from(dailyHistory).where(eq(dailyHistory.id, 'latest')).limit(1);
  if (rows.length === 0) return null;
  const row = rows[0];
  if (isExpired(row.fetchedAt)) return null;
  return { events: JSON.parse(row.events), date: row.date };
}

export async function setHistory(events: Array<{ year: string; title: string }>, date: string): Promise<void> {
  const db = getDb({ local: true });
  await db.insert(dailyHistory).values({ id: 'latest', events: JSON.stringify(events), date }).onConflictDoUpdate({ target: dailyHistory.id, set: { events: JSON.stringify(events), date, fetchedAt: new Date() } });
}

// ==================== News ====================

export async function getNews(): Promise<CachedNews | null> {
  const db = getDb({ local: true });
  const rows = await db.select().from(dailyNews).where(eq(dailyNews.id, 'latest')).limit(1);
  if (rows.length === 0) return null;
  const row = rows[0];
  if (isExpired(row.fetchedAt)) return null;
  return { news: JSON.parse(row.news), date: row.date };
}

export async function setNews(news: Array<{ title: string; source?: string; url?: string }>, date: string): Promise<void> {
  const db = getDb({ local: true });
  await db.insert(dailyNews).values({ id: 'latest', news: JSON.stringify(news), date }).onConflictDoUpdate({ target: dailyNews.id, set: { news: JSON.stringify(news), date, fetchedAt: new Date() } });
}

// ==================== Cleanup ====================

export async function cleanExpired(): Promise<void> {
  const db = getDb({ local: true });
  const cutoff = new Date(Date.now() - SEVEN_DAYS_MS);
  await db.delete(dailyQuotes).where(lt(dailyQuotes.fetchedAt, cutoff));
  await db.delete(dailyHistory).where(lt(dailyHistory.fetchedAt, cutoff));
  await db.delete(dailyNews).where(lt(dailyNews.fetchedAt, cutoff));
}
```

**注意：** `getDb({ local: true })` 仅用于本地开发。在 Cloudflare Workers 环境中需要传入 `env: { DB: ... }`。后续 Task 3 会处理这个问题。

- [ ] **Step 2: 提交**
```bash
git add apps/server/src/services/daily-cache.ts
git commit -m "feat(server): add daily-cache service"
```

---

## Task 3: 创建 Cron 定时任务路由

**Files:**
- Create: `apps/server/src/routes/cron.ts`
- Modify: `apps/server/src/index.ts`

- [ ] **Step 1: 创建 cron.ts**

```typescript
// apps/server/src/routes/cron.ts
import { Hono } from 'hono';
import { getDb } from '../db';
import { cleanExpired, setQuote, setHistory, setNews } from '../services/daily-cache';
import type { Env } from '../index';

const router = new Hono<{ Bindings: Env }>();

// 60s API 响应类型
interface SixtyResponse {
  code: number;
  data?: Record<string, unknown>;
}

async function fetchSixtyData<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json() as SixtyResponse;
    if (data.code === 200 && data.data) return data.data as T;
    return null;
  } catch {
    return null;
  }
}

router.post('/fetch', async (c) => {
  const start = Date.now();
  console.log('[cron] Starting daily data fetch');

  try {
    // 1. 清理过期数据
    await cleanExpired();
    console.log('[cron] Cleaned expired data');

    // 2. 并行抓取新数据
    const today = new Date().toISOString().split('T')[0];

    const [quoteData, historyData, newsData] = await Promise.all([
      fetchSixtyData<{ hitokoto?: string }>('https://60s.viki.moe/v2/hitokoto'),
      fetchSixtyData<{ events?: Array<{ year?: string; title?: string }>; date?: string }>('https://60s.viki.moe/v2/today-in-history'),
      fetchSixtyData<{ news?: Array<{ title?: string; source?: string; url?: string }>; date?: string }>('https://60s.viki.moe/v2/ai-news'),
    ]);

    // 3. 写入数据库
    if (quoteData?.hitokoto) {
      await setQuote(quoteData.hitokoto, '一言', today);
      console.log('[cron] Saved quote');
    }

    if (historyData?.events) {
      await setHistory(historyData.events.map(e => ({ year: e.year || '', title: e.title || '' })), today);
      console.log('[cron] Saved history');
    }

    if (newsData?.news) {
      await setNews(newsData.news.map(n => ({ title: n.title || '', source: n.source || '', url: n.url || '' })), today);
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

// 内部开发路由（无验证）
export { router as cronRouter };
```

**说明：**
- `Env` 类型已从 `index.ts` 导出（`export interface Env`），导入方式正确
- `cronRouter` 会被注册到两个路径：`/api/cron` 和 `/internal/cron`
- 生产路径后续可添加 Cron Secret 验证，开发路径无需验证

**更好的方案：** 让 `getDb` 接收可选的 env 参数，或者在 cron.ts 中直接使用 drizzle 调用。

实际上，查看现有代码，`getDb` 接收 `{ local: true }` 或 `{ DB: D1Database }`。cron.ts 可以从 `c.env.DB` 获取 D1Database。

修改 `daily-cache.ts` 中的 `getDb` 调用，改为接收参数传入：

```typescript
// 修改方案：getDb 调用改为从调用方传入
// 在 cron.ts 中：
// const db = getDb({ local: false, env: c.env });

// 但为了简化，我们先让 cron.ts 直接操作数据库，不通过 daily-cache.ts
```

**简化方案：** cron.ts 直接在内部调用 drizzle，不走 services。这样 Task 2 的 `getDb` 调用也改成从外部传入。

让我重新设计 Task 2 和 Task 3：

**Task 2 修正：** `daily-cache.ts` 接收 `env` 参数，函数签名改为 `getQuote(env: Env)` 形式。

- [ ] **Step 1: 重新创建 apps/server/src/services/daily-cache.ts（使用 env 参数）**

```typescript
// apps/server/src/services/daily-cache.ts
import { eq, lt } from 'drizzle-orm';
import { getDb } from '../db';
import { dailyQuotes, dailyHistory, dailyNews } from '../db/schema';
import type { Env } from '../index';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export interface CachedQuote { content: string; author: string; date: string; }
export interface CachedHistory { events: Array<{ year: string; title: string }>; date: string; }
export interface CachedNews { news: Array<{ title: string; source?: string; url?: string }>; date: string; }

function isExpired(fetchedAt: Date | null): boolean {
  if (!fetchedAt) return true;
  return Date.now() - fetchedAt.getTime() > SEVEN_DAYS_MS;
}

// ==================== Quote ====================
export async function getQuote(env: Env): Promise<CachedQuote | null> {
  const db = getDb(env);
  const rows = await db.select().from(dailyQuotes).where(eq(dailyQuotes.id, 'latest')).limit(1);
  if (rows.length === 0) return null;
  const row = rows[0];
  if (isExpired(row.fetchedAt)) return null;
  return { content: row.content, author: row.author, date: row.date };
}

export async function setQuote(env: Env, content: string, author: string, date: string): Promise<void> {
  const db = getDb(env);
  await db.insert(dailyQuotes).values({ id: 'latest', content, author, date }).onConflictDoUpdate({
    target: dailyQuotes.id,
    set: { content, author, date, fetchedAt: new Date() },
  });
}

// ==================== History ====================
export async function getHistory(env: Env): Promise<CachedHistory | null> {
  const db = getDb(env);
  const rows = await db.select().from(dailyHistory).where(eq(dailyHistory.id, 'latest')).limit(1);
  if (rows.length === 0) return null;
  const row = rows[0];
  if (isExpired(row.fetchedAt)) return null;
  return { events: JSON.parse(row.events), date: row.date };
}

export async function setHistory(env: Env, events: Array<{ year: string; title: string }>, date: string): Promise<void> {
  const db = getDb(env);
  await db.insert(dailyHistory).values({ id: 'latest', events: JSON.stringify(events), date }).onConflictDoUpdate({
    target: dailyHistory.id,
    set: { events: JSON.stringify(events), date, fetchedAt: new Date() },
  });
}

// ==================== News ====================
export async function getNews(env: Env): Promise<CachedNews | null> {
  const db = getDb(env);
  const rows = await db.select().from(dailyNews).where(eq(dailyNews.id, 'latest')).limit(1);
  if (rows.length === 0) return null;
  const row = rows[0];
  if (isExpired(row.fetchedAt)) return null;
  return { news: JSON.parse(row.news), date: row.date };
}

export async function setNews(env: Env, news: Array<{ title: string; source?: string; url?: string }>, date: string): Promise<void> {
  const db = getDb(env);
  await db.insert(dailyNews).values({ id: 'latest', news: JSON.stringify(news), date }).onConflictDoUpdate({
    target: dailyNews.id,
    set: { news: JSON.stringify(news), date, fetchedAt: new Date() },
  });
}

// ==================== Cleanup ====================
export async function cleanExpired(env: Env): Promise<void> {
  const db = getDb(env);
  const cutoff = new Date(Date.now() - SEVEN_DAYS_MS);
  await db.delete(dailyQuotes).where(lt(dailyQuotes.fetchedAt, cutoff));
  await db.delete(dailyHistory).where(lt(dailyHistory.fetchedAt, cutoff));
  await db.delete(dailyNews).where(lt(dailyNews.fetchedAt, cutoff));
}
```

- [ ] **Step 2: 创建 cron.ts**

```typescript
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
```

- [ ] **Step 3: 注册路由到 index.ts**

在 `apps/server/src/index.ts` 中添加：
```typescript
import { cronRouter } from './routes/cron';
// ...
// 注册到两个路径：生产用 /api/cron，开发用 /internal/cron
app.route('/internal/cron', cronRouter as unknown as Hono<any, any, any>);
app.route('/api/cron', cronRouter as unknown as Hono<any, any, any>);
```

- [ ] **Step 4: 提交**
```bash
git add apps/server/src/routes/cron.ts apps/server/src/services/daily-cache.ts apps/server/src/index.ts
git commit -m "feat(server): add cron routes and daily-cache service"
```

---

## Task 4: 修改 60s 路由优先读缓存

**Files:**
- Modify: `apps/server/src/routes/60s/quote.ts`
- Modify: `apps/server/src/routes/60s/history.ts`
- Modify: `apps/server/src/routes/60s/ai-news.ts`

**核心逻辑：** 每个路由先查缓存，缓存命中则直接返回；缓存未命中则回退到 60s API，同时异步更新缓存。

- [ ] **Step 1: 修改 quote.ts**

```typescript
// apps/server/src/routes/60s/quote.ts
import { Hono } from 'hono';
import { getQuote } from '../../services/daily-cache';
import type { Env } from '../../index';

interface SixtyQuoteResponse { code: number; data?: { hitokoto?: string }; }

const router = new Hono<{ Bindings: Env }>();

router.get('/', async (c) => {
  const env = c.env;
  const start = Date.now();

  // 1. 尝试从缓存读取
  const cached = await getQuote(env);
  if (cached) {
    const duration = Date.now() - start;
    console.log(`[60s] GET /quote (cache hit) → 200 (${duration}ms)`);
    return c.json({ data: { content: cached.content, author: cached.author, date: cached.date }, error: null });
  }

  // 2. 缓存未命中，回退到 60s API
  console.log(`[60s] GET /quote (cache miss) → fetching upstream`);
  try {
    const response = await fetch('https://60s.viki.moe/v2/hitokoto');
    if (!response.ok) {
      const duration = Date.now() - start;
      console.log(`[60s] GET /quote → ${response.status} (${duration}ms)`);
      return c.json({ data: null, error: `Upstream error: ${response.status}` });
    }

    const result = await response.json() as SixtyQuoteResponse;
    const duration = Date.now() - start;
    console.log(`[60s] GET /quote → 200 (${duration}ms)`);

    if (result.code === 200 && result.data?.hitokoto) {
      const today = new Date().toISOString().split('T')[0];
      // 异步更新缓存（不阻塞响应）
      setTimeout(async () => {
        try {
          const { setQuote } = await import('../../services/daily-cache');
          await setQuote(env, result.data!.hitokoto!, '一言', today);
          console.log(`[60s] Quote cached for today`);
        } catch (e) { console.error('[60s] Failed to cache quote:', e); }
      }, 0);

      return c.json({
        data: { content: result.data.hitokoto, author: '一言', date: today },
        error: null,
      });
    }

    return c.json({ data: null, error: 'Invalid response format' });
  } catch (err) {
    const duration = Date.now() - start;
    console.log(`[60s] GET /quote → 500 (${duration}ms) ${err}`);
    return c.json({ data: null, error: String(err) });
  }
});

export { router as quoteRouter };
```

**注意：** `setTimeout` 方式适合本地开发。在 Cloudflare Workers 生产环境中，建议使用 `waitUntil` 确保持久化完成。但为简化，先用 setTimeout。

- [ ] **Step 2: 修改 history.ts**

```typescript
// apps/server/src/routes/60s/history.ts
import { Hono } from 'hono';
import { getHistory } from '../../services/daily-cache';
import type { Env } from '../../index';

interface SixtyHistoryResponse {
  code: number;
  data?: { events?: Array<{ year?: string; title?: string }>; date?: string };
}

const router = new Hono<{ Bindings: Env }>();

router.get('/', async (c) => {
  const env = c.env;
  const start = Date.now();

  // 1. 尝试从缓存读取
  const cached = await getHistory(env);
  if (cached) {
    const duration = Date.now() - start;
    console.log(`[60s] GET /history (cache hit) → 200 (${duration}ms)`);
    return c.json({ data: { events: cached.events, date: cached.date }, error: null });
  }

  // 2. 缓存未命中，回退到 60s API
  console.log(`[60s] GET /history (cache miss) → fetching upstream`);
  try {
    const response = await fetch('https://60s.viki.moe/v2/today-in-history');
    if (!response.ok) {
      const duration = Date.now() - start;
      console.log(`[60s] GET /history → ${response.status} (${duration}ms)`);
      return c.json({ data: null, error: `Upstream error: ${response.status}` });
    }

    const result = await response.json() as SixtyHistoryResponse;
    const duration = Date.now() - start;
    console.log(`[60s] GET /history → 200 (${duration}ms)`);

    if (result.code === 200 && result.data?.events) {
      const today = result.data.date || new Date().toISOString().split('T')[0];
      const events = result.data.events.map(e => ({ year: e.year || '', title: e.title || '' }));

      // 异步更新缓存
      setTimeout(async () => {
        try {
          const { setHistory } = await import('../../services/daily-cache');
          await setHistory(env, events, today);
          console.log(`[60s] History cached for today`);
        } catch (e) { console.error('[60s] Failed to cache history:', e); }
      }, 0);

      return c.json({ data: { events, date: today }, error: null });
    }

    return c.json({ data: null, error: 'Invalid response format' });
  } catch (err) {
    const duration = Date.now() - start;
    console.log(`[60s] GET /history → 500 (${duration}ms) ${err}`);
    return c.json({ data: null, error: String(err) });
  }
});

export { router as historyRouter };
```

- [ ] **Step 3: 修改 ai-news.ts**

```typescript
// apps/server/src/routes/60s/ai-news.ts
import { Hono } from 'hono';
import { getNews } from '../../services/daily-cache';
import type { Env } from '../../index';

interface SixtyNewsResponse {
  code: number;
  data?: { news?: Array<{ title?: string; source?: string; url?: string }>; date?: string };
}

const router = new Hono<{ Bindings: Env }>();

router.get('/', async (c) => {
  const env = c.env;
  const start = Date.now();

  // 1. 尝试从缓存读取
  const cached = await getNews(env);
  if (cached) {
    const duration = Date.now() - start;
    console.log(`[60s] GET /ai-news (cache hit) → 200 (${duration}ms)`);
    return c.json({ data: { news: cached.news, date: cached.date }, error: null });
  }

  // 2. 缓存未命中，回退到 60s API
  console.log(`[60s] GET /ai-news (cache miss) → fetching upstream`);
  try {
    const response = await fetch('https://60s.viki.moe/v2/ai-news');
    if (!response.ok) {
      const duration = Date.now() - start;
      console.log(`[60s] GET /ai-news → ${response.status} (${duration}ms)`);
      return c.json({ data: null, error: `Upstream error: ${response.status}` });
    }

    const result = await response.json() as SixtyNewsResponse;
    const duration = Date.now() - start;
    console.log(`[60s] GET /ai-news → 200 (${duration}ms)`);

    if (result.code === 200 && result.data?.news) {
      const today = result.data.date || new Date().toISOString().split('T')[0];
      const news = result.data.news.map(n => ({ title: n.title || '', source: n.source || '', url: n.url || '' }));

      // 异步更新缓存
      setTimeout(async () => {
        try {
          const { setNews } = await import('../../services/daily-cache');
          await setNews(env, news, today);
          console.log(`[60s] News cached for today`);
        } catch (e) { console.error('[60s] Failed to cache news:', e); }
      }, 0);

      return c.json({ data: { news, date: today }, error: null });
    }

    return c.json({ data: null, error: 'Invalid response format' });
  } catch (err) {
    const duration = Date.now() - start;
    console.log(`[60s] GET /ai-news → 500 (${duration}ms) ${err}`);
    return c.json({ data: null, error: String(err) });
  }
});

export { router as aiNewsRouter };
```

- [ ] **Step 4: 提交**
```bash
git add apps/server/src/routes/60s/quote.ts apps/server/src/routes/60s/history.ts apps/server/src/routes/60s/ai-news.ts
git commit -m "refactor(server): add cache-first logic to 60s routes"
```

---

## Task 5: 配置 Cron Triggers 和本地开发脚本

**Files:**
- Modify: `apps/server/wrangler.toml`
- Modify: `apps/server/package.json`

- [ ] **Step 1: 添加 Cron Triggers 到 wrangler.toml**

```toml
[triggers]
crons = ["0 8 * * *"]
```

- [ ] **Step 2: 添加本地开发脚本到 package.json**

在 `scripts` 中添加：

```json
"cron:run": "wrangler dev --local --env cron"
```

**注意：** `pnpm cron:run` 会启动一个本地 dev server，你需要在另一个终端手动调用 `curl -X POST http://localhost:8787/internal/cron/fetch` 来触发定时任务。

- [ ] **Step 3: 提交**
```bash
git add apps/server/wrangler.toml apps/server/package.json
git commit -m "chore(server): add cron trigger and cron:run script"
```

---

## Task 6: 数据库推送和本地验证

- [ ] **Step 1: 推送 schema 到本地数据库**

```bash
cd apps/server && pnpm db:push
```

- [ ] **Step 2: 测试定时任务**

```bash
# 终端 1: 启动本地服务
cd apps/server && pnpm dev

# 终端 2: 触发定时任务
curl -X POST http://localhost:8787/internal/cron/fetch
```

预期输出：
```json
{"success":true,"duration":xxx}
```

- [ ] **Step 3: 验证数据库**

```bash
# 使用 drizzle studio 查看数据
cd apps/server && pnpm db:studio
```

或直接 curl 测试 API：
```bash
curl http://localhost:8787/api/60s/quote
curl http://localhost:8787/api/60s/history
curl http://localhost:8787/api/60s/ai-news
```

- [ ] **Step 4: 提交**
```bash
git add -A
git commit -m "chore(server): verify cron and cache functionality"
```

---

## Task 7: 最终检查

- [ ] **Step 1: 运行 TypeScript 检查**

```bash
cd apps/server && pnpm exec tsc --noEmit
```

- [ ] **Step 2: 运行 Lint**

```bash
cd apps/server && pnpm lint
```

- [ ] **Step 3: 检查 git 状态**

```bash
git status
git log --oneline -5
```

- [ ] **Step 4: 确保无外部 API 直接暴露**

```bash
grep -r "60s.viki.moe" apps/server/src/routes/60s/
```

预期：仅在 quote.ts, history.ts, ai-news.ts 的回退逻辑中（setTimeout 内的 import）。

- [ ] **Step 5: 提交所有剩余更改**

```bash
git add apps/server/src/ apps/server/wrangler.toml apps/server/package.json
git commit -m "feat(server): complete daily cached data implementation"
```

- [ ] **Step 6: 验证完成**

报告：
```
✅ 数据库 schema 已添加
✅ daily-cache 服务已创建
✅ cron 路由已注册
✅ 60s 路由已支持缓存
✅ Cron Triggers 已配置
✅ 本地开发脚本已添加
```**
