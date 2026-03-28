# Workspace 重构设计方案

## 概述

将现有 `armrest` 浏览器扩展项目改造为 pnpm workspace 结构，新增 `apps/server` 后端服务，最终支持 Cloudflare Workers + D1 部署。

## 目标

1. **改造为 monorepo**：使用 pnpm workspace 管理多个 package/app
2. **迁移现有扩展**：将当前代码迁移至 `apps/ext`
3. **新建后端服务**：使用 Hono + Drizzle + better-auth + Zod
4. **统一 lint 配置**：根目录配置，workspace 继承
5. **支持本地开发**：前后端独立启动，通过环境变量通信
6. **云端部署**：Cloudflare Workers + D1 数据库

---

## 项目结构

```
armrest/                          # pnpm workspace root
├── pnpm-workspace.yaml            # workspace 定义
├── package.json                   # 根 scripts (lint, build, dev)
│
├── .eslintrc.js                   # 统一 ESLint 基础配置
├── .prettierrc                   # 统一 Prettier 配置
├── .lintstagedrc.js             # lint-staged 配置
│
├── apps/
│   ├── ext/                      # 浏览器扩展 (原 armrest)
│   │   ├── package.json
│   │   ├── wxt.config.ts
│   │   ├── entrypoints/
│   │   ├── lib/
│   │   ├── components/
│   │   └── CLAUDE.md             # 扩展专属上下文
│   │
│   └── server/                   # 后端服务 (新建)
│       ├── src/
│       │   ├── index.ts         # Workers 入口 (fetch handler)
│       │   ├── routes/
│       │   │   ├── auth.ts      # better-auth 路由
│       │   │   ├── bookmarks.ts  # 书签 CRUD
│       │   │   ├── sync.ts       # 同步接口
│       │   │   └── weather.ts    # 天气 API 代理
│       │   ├── db/
│       │   │   ├── schema.ts    # Drizzle schema
│       │   │   ├── index.ts     # Drizzle client
│       │   │   └── migrations/
│       │   ├── auth/
│       │   │   └── index.ts     # better-auth 配置
│       │   ├── services/
│       │   │   └── bookmark.ts  # 书签业务逻辑
│       │   └── middleware/
│       │       └── auth.ts      # 认证中间件
│       ├── drizzle.config.ts
│       ├── wrangler.toml         # Cloudflare Workers 配置
│       └── package.json
│
└── docs/superpowers/specs/       # 设计文档
```

---

## 技术方案

### 1. Workspace 配置

**`pnpm-workspace.yaml`**
```yaml
packages:
  - 'apps/*'
```

**根 `package.json` scripts**
```json
{
  "scripts": {
    "dev": "pnpm -r --parallel -c run dev",
    "build": "pnpm -r run build",
    "lint": "pnpm -r run lint",
    "lint:fix": "pnpm -r run lint:fix"
  }
}
```

### 2. Lint 统一配置

**根目录 `.eslintrc.js`**
- 继承 `eslint:recommended`, `plugin:@typescript-eslint/recommended`
- 配置 `import/order`, `no-console` 等通用规则
- 使用 `overrides` 为不同 workspace 指定不同解析器

**`.prettierrc`**
- 单引号、无分号、行宽 100、Tab 2 空格

**lint-staged 配置**
- `*.{ts,tsx}` → `eslint --fix` + `prettier --write`
- `*.{json,md}` → `prettier --write`

### 3. 后端技术栈

| 用途 | 技术 | 说明 |
|------|------|------|
| 框架 | Hono | 轻量、兼容 Cloudflare Workers |
| ORM | Drizzle + D1 | 类型安全 SQL，连接 Cloudflare D1 |
| 认证 | better-auth | 开源认证方案，支持 GitHub OAuth |
| 验证 | Zod | 运行时类型验证 |
| 部署 | Wrangler | Cloudflare Workers CLI |

### 4. API 设计

#### 认证接口
```
GET  /auth/github        - GitHub OAuth 登录入口
GET  /auth/github/callback - OAuth 回调
POST /auth/signout        - 登出
GET  /auth/session        - 获取当前会话
```

#### 书签接口 (需认证)
```
GET    /api/bookmarks         - 获取用户所有书签
POST   /api/bookmarks         - 创建书签
PUT    /api/bookmarks/:id     - 更新书签
DELETE /api/bookmarks/:id     - 删除书签
POST   /api/bookmarks/sync    - 批量同步书签
```

#### 数据接口 (需认证)
```
GET  /api/weather   - 获取天气 (代理外部 API)
GET  /api/quote    - 获取每日一言
```

### 5. 数据模型

**users**
```sql
id          TEXT PRIMARY KEY
github_id   TEXT UNIQUE
email       TEXT
name        TEXT
avatar_url  TEXT
created_at  INTEGER
```

**bookmarks**
```sql
id          TEXT PRIMARY KEY
user_id     TEXT REFERENCES users(id)
folder_id   TEXT
name        TEXT
url         TEXT
logo        TEXT
description TEXT
color       TEXT
position    INTEGER
created_at  INTEGER
updated_at  INTEGER
```

**folders**
```sql
id          TEXT PRIMARY KEY
user_id     TEXT REFERENCES users(id)
name        TEXT
icon        TEXT
color       TEXT
position    INTEGER
created_at  INTEGER
updated_at  INTEGER
```

### 6. 前端扩展改造

**环境变量配置**
```env
VITE_API_URL=http://localhost:3001  # 开发环境
VITE_API_URL=https://api.example.com # 生产环境
```

**API 客户端**
- 使用 `fetch` 或 `ofetch` 封装
- better-auth 默认使用 Cookie 管理 Session，前端通过 `credentials: 'include'` 自动携带
- 扩展端通过 `chrome.cookies` API 读取/写入 auth cookie
- 备用方案：若 Cookie 不可用，使用 `GET /auth/session` 获取 session token 并存储

**扩展端改造点**
1. 新增 `lib/api.ts` - API 请求封装 (支持 fetch + credentials: 'include')
2. 新增 `lib/auth.ts` - 认证状态管理 (检查登录态、重定向到登录页)
3. 书签同步策略：**用户手动触发同步** + 可选的定时自动同步
4. 新增登录入口 (在设置面板中添加 "登录同步" 按钮)
5. 书签冲突处理：服务端数据覆盖本地 (以服务器为准)

### 7. 开发流程

**本地启动**
```bash
# 终端 1 - 后端
cd apps/server
pnpm dev

# 终端 2 - 前端扩展
cd apps/ext
pnpm dev
```

**数据库迁移 (Drizzle)**
```bash
cd apps/server
pnpm db:generate   # 生成迁移文件 (drizzle-kit generate)
pnpm db:migrate    # 执行迁移 (drizzle-kit migrate)
pnpm db:studio     # 打开 Drizzle Studio 查看数据
```

**OAuth 配置**
- GitHub OAuth App Callback URL: `http://localhost:3001/auth/github/callback` (开发)
- 生产环境需配置为实际的域名

**部署**
```bash
# 构建
pnpm build

# 部署后端到 Cloudflare
cd apps/server
pnpm deploy
```

---

## 实现步骤

1. 创建 pnpm-workspace 结构，移动代码到 `apps/ext`
2. 配置根目录 ESLint + Prettier + lint-staged
3. 初始化 `apps/server` 项目，安装依赖
4. 配置 Drizzle + D1，编写 schema
5. 配置 better-auth (GitHub OAuth)
6. 编写 API 路由
7. 改造 `apps/ext` 前端，添加 API 客户端
8. 配置 wrangler.toml，准备部署
9. 测试本地开发流程

---

## 待确认事项

1. GitHub OAuth App credentials 准备情况 (client_id, client_secret)
2. Cloudflare D1 数据库创建 (wrangler d1 create)
3. ~~扩展是否需要用户手动触发同步，还是自动后台同步~~ → **已确认：手动触发 + 可选定时自动同步**
