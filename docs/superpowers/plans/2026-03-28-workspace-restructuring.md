# Workspace 重构实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 armrest 改造为 pnpm workspace，新增 apps/server 后端，统一 lint 配置

**Architecture:** 使用 pnpm workspace 管理 apps/ext 和 apps/server 两个独立项目。根目录配置统一的 ESLint/Prettier，workspace 继承并扩展。开发时前后端独立启动，通过环境变量 `VITE_API_URL` 通信。

**Tech Stack:** pnpm workspaces, Hono, Drizzle ORM, Cloudflare D1, better-auth, Zod, ESLint, Prettier, lint-staged

---

## 文件结构概览

```
armrest/
├── pnpm-workspace.yaml          # 新建
├── package.json                 # 修改 (根 scripts)
├── .prettierrc                  # 新建
├── .eslintrc.js                 # 新建
├── .lintstagedrc.js            # 新建
├── .gitignore                   # 修改
├── apps/
│   ├── ext/                     # 原 armrest 项目 (移动)
│   │   ├── package.json         # 修改
│   │   ├── wxt.config.ts        # 修改
│   │   └── ...
│   └── server/                  # 新建
│       ├── src/
│       │   ├── index.ts
│       │   ├── routes/
│       │   ├── db/
│       │   ├── auth/
│       │   └── services/
│       ├── drizzle.config.ts
│       ├── wrangler.toml
│       └── package.json
└── docs/superpowers/plans/      # 本计划
```

---

## 阶段一：创建 Workspace 基础结构

### Task 1: 创建 pnpm-workspace 配置

**Files:**
- Create: `pnpm-workspace.yaml`

- [ ] **Step 1: 创建 pnpm-workspace.yaml**

```yaml
packages:
  - 'apps/*'
```

Run: `cat > pnpm-workspace.yaml << 'EOF'
packages:
  - 'apps/*'
EOF`

- [ ] **Step 2: 更新根 package.json**

Modify: `package.json` - 添加 workspace scripts

```json
{
  "name": "armrest",
  "private": true,
  "scripts": {
    "dev": "pnpm -r --parallel -c run dev",
    "build": "pnpm -r run build",
    "lint": "pnpm -r run lint",
    "lint:fix": "pnpm -r run lint:fix"
  }
}
```

Run: `git add pnpm-workspace.yaml package.json && git commit -m "feat(workspace): add pnpm workspace config"`

---

### Task 2: 创建统一 Lint 配置

**Files:**
- Create: `.prettierrc`
- Create: `.eslintrc.js`
- Create: `.lintstagedrc.js`
- Modify: `.gitignore`

- [ ] **Step 1: 创建 .prettierrc**

```json
{
  "semi": true,
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

Run: `cat > .prettierrc << 'EOF'
{
  "semi": true,
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "trailingComma": "es5"
}
EOF`

- [ ] **Step 2: 创建 .eslintrc.js**

**CORRECTED VERSION** (the plan had a syntax error, use this exact content):

```js
const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

module.exports = [
  ...compat.extends(
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
  ),
  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal'],
          pathGroups: [
            { pattern: '@/**', group: 'internal' },
          ],
          'newlines-between': 'always',
        },
      ],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
];
```

Run: `cat > .eslintrc.js << 'EOF'
const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

module.exports = [
  ...compat.extends(
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
  ),
  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal'],
          pathGroups: [
            { pattern: '@/**', group: 'internal' },
          ],
          'newlines-between': 'always',
        },
      ],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
];
EOF`

- [ ] **Step 3: 创建 .lintstagedrc.js**

```js
module.exports = {
  '*.{ts,tsx}': ['eslint --fix', 'prettier --write'],
  '*.{json,md}': ['prettier --write'],
};
```

Run: `cat > .lintstagedrc.js << 'EOF'
module.exports = {
  '*.{ts,tsx}': ['eslint --fix', 'prettier --write'],
  '*.{json,md}': ['prettier --write'],
};
EOF`

- [ ] **Step 4: 更新 .gitignore**

添加以下忽略项:
```
node_modules/
dist/
.wxt/
.output/
*.local
```

- [ ] **Step 5: 提交**

Run: `git add .prettierrc .eslintrc.js .lintstagedrc.js .gitignore && git commit -m "feat(lint): add unified ESLint and Prettier configuration"`

---

## 阶段二：迁移扩展到 apps/ext

### Task 3: 移动代码到 apps/ext

**Files:**
- Create: `apps/ext/` (所有现有文件移动)
- Modify: `apps/ext/package.json`
- Modify: `apps/ext/wxt.config.ts`
- Create: `apps/ext/CLAUDE.md`

- [ ] **Step 1: 创建 apps/ext 目录结构并移动文件**

Run:
```bash
mkdir -p apps/ext
mv entrypoints components lib apps/ext/
mv package.json wxt.config.ts tsconfig.json components.json apps/ext/
mv ai-writing-assistant-landing.html design-specifications.md apps/ext/
mv CLAUDE.md AGENTS.md apps/ext/ 2>/dev/null || true
git add -A && git commit -m "feat(ext): move extension to apps/ext"
```

- [ ] **Step 2: 更新 apps/ext/package.json**

Modify: `apps/ext/package.json` - 添加 lint scripts

```json
{
  "scripts": {
    "dev": "wxt",
    "build": "wxt build",
    "preview": "wxt preview",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  }
}
```

- [ ] **Step 3: 更新 apps/ext/wxt.config.ts**

Modify: `apps/ext/wxt.config.ts` - 保持原有配置，更新 alias 路径

```ts
import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  alias: {
    '@': path.resolve(__dirname),
  },
  // ... 其他原有配置
});
```

- [ ] **Step 4: 创建 apps/ext/CLAUDE.md**

```markdown
# Armrest Browser Extension

## 项目概述

浏览器扩展，提供自定义新标签页功能。

## 开发

```bash
pnpm dev    # 开发模式
pnpm build  # 构建
```

## 目录结构

- `entrypoints/` - 扩展入口点
  - `newtab/` - 新标签页主应用
  - `popup/` - 弹窗面板
- `components/` - UI 组件
- `lib/` - 工具库
```

Run: `git add apps/ext/CLAUDE.md && git commit -m "docs(ext): add CLAUDE.md"`

---

## 阶段三：创建后端项目 apps/server

### Task 4: 初始化 apps/server 项目

**Files:**
- Create: `apps/server/package.json`
- Create: `apps/server/tsconfig.json`
- Create: `apps/server/drizzle.config.ts`
- Create: `apps/server/wrangler.toml`

- [ ] **Step 1: 创建 apps/server 目录**

Run: `mkdir -p apps/server/src/{routes,db/migrations,auth,services,middleware}`

- [ ] **Step 2: 创建 apps/server/package.json**

```json
{
  "name": "@armrest/server",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "wrangler dev --local",
    "build": "wrangler deploy --dry-run",
    "deploy": "wrangler deploy",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio"
  },
  "dependencies": {
    "hono": "^4.0.0",
    "@hono/zod-validator": "^0.2.0",
    "drizzle-orm": "^0.30.0",
    "@libsql/client": "^0.6.0",
    "better-auth": "^1.0.0",
    "zod": "^3.22.0",
    "zod-to-json-schema": "^4.22.0"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.20240117.0",
    "wrangler": "^3.0.0",
    "drizzle-kit": "^0.20.0",
    "typescript": "^5.6.0",
    "@types/node": "^20.0.0",
    "eslint": "^9.0.0"
  }
}
```

- [ ] **Step 3: 创建 apps/server/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "types": ["@cloudflare/workers-types"]
  },
  "include": ["src/**/*", "*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: 创建 apps/server/drizzle.config.ts**

```ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: './dev.db',
  },
});
```

- [ ] **Step 5: 创建 apps/server/wrangler.toml**

```toml
name = "armrest-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[site]
bucket = "./dist"

[[d1_databases]]
binding = "DB"
database_name = "armrest-db"
database_id = "YOUR_D1_DATABASE_ID"

[vars]
NODE_ENV = "development"
```

- [ ] **Step 6: 提交**

Run: `git add apps/server/package.json apps/server/tsconfig.json apps/server/drizzle.config.ts apps/server/wrangler.toml && git commit -m "feat(server): add apps/server project scaffold"`

---

### Task 5: 实现数据库 Schema

**Files:**
- Create: `apps/server/src/db/schema.ts`
- Create: `apps/server/src/db/index.ts`

- [ ] **Step 1: 创建 apps/server/src/db/schema.ts**

```ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  githubId: text('github_id').unique(),
  email: text('email'),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const usersRelations = relations(users, ({ many }) => ({
  bookmarks: many(bookmarks),
  folders: many(folders),
}));

export const folders = sqliteTable('folders', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  icon: text('icon').default('folder'),
  color: text('color').default('#6366F1'),
  position: integer('position').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const foldersRelations = relations(folders, ({ one, many }) => ({
  user: one(users, {
    fields: [folders.userId],
    references: [users.id],
  }),
  bookmarks: many(bookmarks),
}));

export const bookmarks = sqliteTable('bookmarks', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  folderId: text('folder_id').references(() => folders.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  url: text('url').notNull(),
  logo: text('logo'),
  description: text('description'),
  color: text('color').default('#6366F1'),
  position: integer('position').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(users, {
    fields: [bookmarks.userId],
    references: [users.id],
  }),
  folder: one(folders, {
    fields: [bookmarks.folderId],
    references: [folders.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Bookmark = typeof bookmarks.$inferSelect;
export type NewBookmark = typeof bookmarks.$inferInsert;
export type Folder = typeof folders.$inferSelect;
export type NewFolder = typeof folders.$inferInsert;
```

- [ ] **Step 2: 创建 apps/server/src/db/index.ts**

```ts
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

const globalForDb = globalThis as unknown as {
  db: ReturnType<typeof drizzle> | undefined;
};

export function getDb(env: { DB: D1Database }) {
  if (globalForDb.db) return globalForDb.db;
  globalForDb.db = drizzle(env.DB, { schema });
  return globalForDb.db;
}

export { schema };
```

- [ ] **Step 3: 提交**

Run: `git add apps/server/src/db/ && git commit -m "feat(server): add Drizzle schema for users, bookmarks, folders"`

---

### Task 6: 配置 better-auth

**Files:**
- Create: `apps/server/src/auth/index.ts`
- Modify: `apps/server/src/index.ts`

- [ ] **Step 1: 创建 apps/server/src/auth/index.ts**

```ts
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { github } from 'better-auth/providers/github';
import { getDb } from '../db';

interface AuthEnv {
  DB: D1Database;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  BETTER_AUTH_SECRET: string;
  NODE_ENV: string;
}

export function createAuth(env: AuthEnv) {
  const db = getDb(env);

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: 'sqlite',
    }),
    emailAndPassword: {
      enabled: false,
    },
    socialProviders: {
      github: {
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 30, // 30 days
      updateAge: 60 * 60 * 24, // 1 day
    },
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.NODE_ENV === 'development'
      ? 'http://localhost:3001'
      : 'https://api.example.com',
  });
}

export type Auth = ReturnType<typeof createAuth>;
```

- [ ] **Step 2: 更新 apps/server/src/index.ts**

```ts
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createAuth } from './auth';
import { authRouter } from './routes/auth';
import { bookmarksRouter } from './routes/bookmarks';
import { weatherRouter } from './routes/weather';
import { authMiddleware } from './middleware/auth';

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
```

- [ ] **Step 3: 提交**

Run: `git add apps/server/src/auth/ apps/server/src/index.ts && git commit -m "feat(server): add better-auth with GitHub OAuth"`

---

### Task 7: 实现 API 路由

**Files:**
- Create: `apps/server/src/routes/auth.ts`
- Create: `apps/server/src/routes/bookmarks.ts`
- Create: `apps/server/src/routes/weather.ts`
- Create: `apps/server/src/routes/sync.ts`
- Create: `apps/server/src/middleware/auth.ts`
- Create: `apps/server/src/services/bookmark.ts`

- [ ] **Step 1: 创建 apps/server/src/middleware/auth.ts**

```ts
import type { Context, Next } from 'hono';
import type { Auth } from '../auth';

export async function authMiddleware(c: Context, next: Next, auth: Auth) {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  c.set('userId', session.user.id);
  c.set('session', session);

  await next();
}
```

- [ ] **Step 2: 创建 apps/server/src/services/bookmark.ts**

```ts
import { getDb, schema } from '../db';
import { eq, and, asc } from 'drizzle-orm';
import type { D1Database } from '@cloudflare/workers-types';

interface CreateBookmarkInput {
  userId: string;
  folderId: string;
  name: string;
  url: string;
  logo?: string;
  description?: string;
  color?: string;
  position?: number;
}

interface UpdateBookmarkInput {
  name?: string;
  url?: string;
  logo?: string;
  description?: string;
  color?: string;
  position?: number;
  folderId?: string;
}

export class BookmarkService {
  constructor(private db: ReturnType<typeof getDb>) {}

  async list(userId: string) {
    return this.db.select().from(schema.bookmarks)
      .where(eq(schema.bookmarks.userId, userId))
      .orderBy(asc(schema.bookmarks.position));
  }

  async create(input: CreateBookmarkInput) {
    const id = crypto.randomUUID();
    const now = new Date();

    await this.db.insert(schema.bookmarks).values({
      id,
      userId: input.userId,
      folderId: input.folderId,
      name: input.name,
      url: input.url,
      logo: input.logo,
      description: input.description,
      color: input.color,
      position: input.position || 0,
      createdAt: now,
      updatedAt: now,
    });

    return id;
  }

  async update(id: string, userId: string, input: UpdateBookmarkInput) {
    await this.db.update(schema.bookmarks)
      .set({ ...input, updatedAt: new Date() })
      .where(and(eq(schema.bookmarks.id, id), eq(schema.bookmarks.userId, userId)));
  }

  async delete(id: string, userId: string) {
    await this.db.delete(schema.bookmarks)
      .where(and(eq(schema.bookmarks.id, id), eq(schema.bookmarks.userId, userId)));
  }

  async sync(userId: string, bookmarks: Array<CreateBookmarkInput & { id?: string }>) {
    // 批量同步：先删除旧数据，再插入新数据
    await this.db.delete(schema.bookmarks).where(eq(schema.bookmarks.userId, userId));

    for (const bookmark of bookmarks) {
      await this.create({
        userId,
        folderId: bookmark.folderId,
        name: bookmark.name,
        url: bookmark.url,
        logo: bookmark.logo,
        description: bookmark.description,
        color: bookmark.color,
        position: bookmark.position,
      });
    }
  }
}
```

- [ ] **Step 3: 创建 apps/server/src/routes/auth.ts**

```ts
import { Hono } from 'hono';
import type { Auth } from '../auth';

export function authRouter(auth: Auth) {
  const app = new Hono();

  app.get('/session', async (c) => {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });
    if (!session) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    return c.json(session);
  });

  app.get('/sign-out', async (c) => {
    await auth.api.signOut({
      headers: c.req.raw.headers,
    });
    return c.json({ success: true });
  });

  return app;
}
```

- [ ] **Step 4: 创建 apps/server/src/routes/bookmarks.ts**

```ts
import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { getDb } from '../db';
import { BookmarkService } from '../services/bookmark';

const bookmarkSchema = z.object({
  folderId: z.string(),
  name: z.string().min(1),
  url: z.string().url(),
  logo: z.string().optional(),
  description: z.string().optional(),
  color: z.string().optional(),
  position: z.number().optional(),
});

const router = new Hono();

router.get('/', async (c) => {
  const userId = c.get('userId');
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);

  const db = getDb({ DB: c.env.DB });
  const service = new BookmarkService(db);
  const bookmarks = await service.list(userId);
  return c.json(bookmarks);
});

router.post('/', zValidator('json', bookmarkSchema), async (c) => {
  const userId = c.get('userId');
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);

  const body = c.req.valid('json');
  const db = getDb({ DB: c.env.DB });
  const service = new BookmarkService(db);

  const id = await service.create({ userId, ...body });
  return c.json({ id, ...body });
});

router.put('/:id', zValidator('json', bookmarkSchema.partial()), async (c) => {
  const userId = c.get('userId');
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);

  const id = c.req.param('id');
  const body = c.req.valid('json');

  const db = getDb({ DB: c.env.DB });
  const service = new BookmarkService(db);
  await service.update(id, userId, body);

  return c.json({ success: true });
});

router.delete('/:id', async (c) => {
  const userId = c.get('userId');
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);

  const id = c.req.param('id');
  const db = getDb({ DB: c.env.DB });
  const service = new BookmarkService(db);
  await service.delete(id, userId);

  return c.json({ success: true });
});

export { router as bookmarksRouter };
```

- [ ] **Step 5: 创建 apps/server/src/routes/sync.ts**

```ts
import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { getDb } from '../db';
import { BookmarkService } from '../services/bookmark';

const syncSchema = z.object({
  bookmarks: z.array(z.object({
    id: z.string().optional(),
    folderId: z.string(),
    name: z.string().min(1),
    url: z.string().url(),
    logo: z.string().optional(),
    description: z.string().optional(),
    color: z.string().optional(),
    position: z.number().optional(),
  })),
});

const router = new Hono();

// 挂载在 /api/bookmarks/sync，所以这里用 /
router.post('/', zValidator('json', syncSchema), async (c) => {
  const userId = c.get('userId');
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);

  const body = c.req.valid('json');
  const db = getDb({ DB: c.env.DB });
  const service = new BookmarkService(db);

  await service.sync(userId, body.bookmarks);
  return c.json({ success: true });
});

export { router as syncRouter };
```

- [ ] **Step 6: 创建 apps/server/src/routes/weather.ts**

```ts
import { Hono } from 'hono';

const router = new Hono();

router.get('/weather', async (c) => {
  const { latitude, longitude } = c.req.query();
  if (!latitude || !longitude) {
    return c.json({ error: 'Missing latitude or longitude' }, 400);
  }

  const apiKey = c.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return c.json({ error: 'Weather API not configured' }, 500);
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
  const response = await fetch(url);
  const data = await response.json();

  return c.json(data);
});

router.get('/quote', async (c) => {
  const response = await fetch('https://api.xygeng.cn/one');
  const data = await response.json();
  return c.json(data);
});

export { router as weatherRouter };
```

- [ ] **Step 7: 提交**

Run: `git add apps/server/src/routes/ apps/server/src/middleware/ apps/server/src/services/ && git commit -m "feat(server): add API routes for auth, bookmarks, weather, sync"`

---

### Task 8: 安装依赖并验证构建

- [ ] **Step 1: 安装 apps/server 依赖**

Run: `cd apps/server && pnpm install`

- [ ] **Step 2: 验证 TypeScript 编译**

Run: `cd apps/server && pnpm exec tsc --noEmit`

- [ ] **Step 3: 创建本地 D1 数据库并更新配置**

Run:
```bash
cd apps/server
wrangler d1 create armrest-db --local
```

从输出中复制 `database_id`，然后更新 `wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "armrest-db"
database_id = "实际复制的database_id"  # 替换这里
```

同时更新 `drizzle.config.ts` 中的本地数据库路径:
```ts
dbCredentials: {
  url: './dev.db',  // 本地开发使用 dev.db
},
```

生产环境部署时再创建正式 D1 并更新 `wrangler.toml`。

- [ ] **Step 4: 生成数据库迁移**

Run: `cd apps/server && pnpm db:generate`

- [ ] **Step 5: 提交**

Run: `git add apps/server/package.json apps/server/pnpm-lock.yaml apps/server/drizzle.config.ts apps/server/wrangler.toml && git commit -m "chore(server): install dependencies and setup D1"`

---

## 阶段四：改造扩展前端

### Task 9: 扩展添加 API 客户端

**Files:**
- Create: `apps/ext/lib/api.ts`
- Create: `apps/ext/lib/auth.ts`
- Modify: `apps/ext/package.json`

- [ ] **Step 1: 创建 apps/ext/lib/api.ts**

```ts
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface RequestOptions {
  method?: string;
  body?: unknown;
}

export async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body } = options;

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(await getAuthHeaders()),
    },
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  // For cookie-based auth, credentials: 'include' handles it automatically
  // For bearer token fallback
  const token = await chrome.storage.local.get('auth_token');
  if (token.auth_token) {
    return { Authorization: `Bearer ${token.auth_token}` };
  }
  return {};
}

export const api = {
  bookmarks: {
    list: () => apiRequest('/api/bookmarks'),
    create: (data: CreateBookmarkData) => apiRequest('/api/bookmarks', { method: 'POST', body: data }),
    update: (id: string, data: UpdateBookmarkData) => apiRequest(`/api/bookmarks/${id}`, { method: 'PUT', body: data }),
    delete: (id: string) => apiRequest(`/api/bookmarks/${id}`, { method: 'DELETE' }),
    sync: (data: { bookmarks: CreateBookmarkData[] }) => apiRequest('/api/bookmarks/sync', { method: 'POST', body: data }),
  },
  auth: {
    getSession: () => apiRequest('/auth/session'),
    signOut: () => apiRequest('/auth/sign-out', { method: 'POST' }),
  },
  weather: {
    get: (lat: number, lon: number) => apiRequest(`/api/weather?latitude=${lat}&longitude=${lon}`),
  },
};

interface CreateBookmarkData {
  folderId: string;
  name: string;
  url: string;
  logo?: string;
  description?: string;
  color?: string;
}

interface UpdateBookmarkData extends Partial<CreateBookmarkData> {}
```

- [ ] **Step 2: 创建 apps/ext/lib/auth.ts**

```ts
import { api } from './api';

export interface User {
  id: string;
  email?: string;
  name?: string;
  image?: string;
}

let currentUser: User | null = null;

export async function checkAuth(): Promise<User | null> {
  try {
    const session = await api.auth.getSession();
    currentUser = session.user;
    return currentUser;
  } catch {
    currentUser = null;
    return null;
  }
}

export function getCurrentUser(): User | null {
  return currentUser;
}

export async function signOut(): Promise<void> {
  await api.auth.signOut();
  currentUser = null;
  await chrome.storage.local.remove('auth_token');
}
```

- [ ] **Step 3: 创建 apps/ext/src/env.d.ts**

Run: `mkdir -p apps/ext/src && cat > apps/ext/src/env.d.ts << 'EOF'
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
EOF`

- [ ] **Step 4: 提交**

Run: `git add apps/ext/lib/api.ts apps/ext/lib/auth.ts apps/ext/src/env.d.ts && git commit -m "feat(ext): add API client and auth library"`

---

### Task 10: 扩展端集成登录和同步

**Files:**
- Modify: `apps/ext/entrypoints/newtab/App.tsx`
- Modify: `apps/ext/entrypoints/newtab/components/BookmarksSettings.tsx`

- [ ] **Step 1: 在 App.tsx 中添加登录状态检查**

在 App.tsx 的 useEffect 中添加:

```tsx
import { checkAuth, getCurrentUser } from '@/lib/auth';

// 在现有 useEffect 中添加:
useEffect(() => {
  async function initAuth() {
    const user = await checkAuth();
    if (!user) {
      // 未登录，可以显示登录提示
      console.log('Not logged in');
    } else {
      console.log('Logged in as:', user.name);
    }
  }
  initAuth();
}, []);
```

- [ ] **Step 2: 在 BookmarksSettings 中添加登录按钮**

在 `BookmarksSettings.tsx` 的设置面板中添加同步登录区域:

```tsx
// 在设置面板中添加一个 "同步设置" 区域
<div className="mb-6">
  <h3 className="text-lg font-semibold mb-3">云同步</h3>
  {isLoggedIn ? (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <img src={user?.image} className="w-8 h-8 rounded-full" />
        <span className="text-sm">{user?.name}</span>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSync}
          disabled={isSyncing}
        >
          {isSyncing ? '同步中...' : '同步书签'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
        >
          登出
        </Button>
      </div>
    </div>
  ) : (
    <Button
      variant="default"
      onClick={handleLogin}
      className="w-full"
    >
      登录以同步书签
    </Button>
  )}
</div>
```

- [ ] **Step 3: 添加同步和登录处理函数**

```tsx
const handleLogin = () => {
  // 打开 OAuth 登录页面
  window.open(`${import.meta.env.VITE_API_URL}/auth/github`, '_blank');
};

const handleSync = async () => {
  setIsSyncing(true);
  try {
    // 获取本地书签并同步
    const bookmarks = await getBookmarks();
    await api.bookmarks.sync({
      bookmarks: bookmarks.folders.flatMap(f => f.bookmarks.map(b => ({
        folderId: f.id,
        name: b.name,
        url: b.url,
        logo: b.logo,
        description: b.description,
        color: b.color,
        position: b.position,
      })))
    });
    alert('同步成功');
  } catch (error) {
    alert('同步失败');
  } finally {
    setIsSyncing(false);
  }
};

const handleSignOut = async () => {
  await signOut();
  setIsLoggedIn(false);
};
```

- [ ] **Step 4: 提交**

Run: `git add apps/ext/entrypoints/newtab/App.tsx apps/ext/entrypoints/newtab/components/BookmarksSettings.tsx && git commit -m "feat(ext): add login and sync UI integration"`

---

### Task 11: 验证整体构建

- [ ] **Step 1: 在根目录安装依赖**

Run: `pnpm install`

- [ ] **Step 2: 运行 lint 检查**

Run: `pnpm lint`

- [ ] **Step 3: 验证构建**

Run: `pnpm build`

- [ ] **Step 4: 本地开发测试**

终端 1:
```bash
cd apps/server && pnpm dev
```

终端 2:
```bash
cd apps/ext && pnpm dev
```

验证扩展页面可以正常打开，且设置面板中有登录按钮。

- [ ] **Step 5: 提交**

Run: `git add package.json pnpm-workspace.yaml pnpm-lock.yaml && git commit -m "chore: setup pnpm workspace and root scripts"`

---

## 执行检查清单

完成所有任务后验证：

- [ ] `pnpm install` 可以安装所有 workspace 依赖
- [ ] `pnpm lint` 可以检查所有代码
- [ ] `pnpm build` 可以构建所有项目
- [ ] `pnpm dev` 可以在两个 workspace 同时启动
- [ ] 本地 D1 数据库创建成功并能执行迁移
- [ ] GitHub OAuth 可以完成登录流程
- [ ] 书签 CRUD API 可以正常读写数据
- [ ] 书签同步 API 可以批量同步数据
- [ ] 扩展设置面板显示登录按钮
- [ ] 点击登录按钮可以打开 GitHub OAuth 页面

## 前置准备

开始实施前需要：

1. **GitHub OAuth App**: 在 https://github.com/settings/developers 创建 OAuth App
   - Homepage URL: `http://localhost:3001`
   - Callback URL: `http://localhost:3001/auth/github/callback`

2. **Cloudflare D1**: 安装 Wrangler CLI 后执行 `wrangler d1 create armrest-db`

3. **环境变量**: 配置 `apps/server/.dev.vars`:
   ```
   GITHUB_CLIENT_ID=your_client_id
   GITHUB_CLIENT_SECRET=your_client_secret
   BETTER_AUTH_SECRET=random_secret_string
   NODE_ENV=development
   ```
