# 每日定时数据缓存设计

## 背景

当前 `/api/60s/quote`、`/api/60s/history`、`/api/60s/ai-news` 三个接口每次请求都会实时调用 60s.viki.moe 外部 API：
- 增加外部依赖延迟
- 无法保证在 API 不可用时用户仍能获取数据
- 重复请求造成资源浪费

## 目标

- 每日定时（早上 8:00）抓取三类数据并存入数据库
- 用户请求时优先从数据库读取（缓存未过期）
- 数据过期/为空时回退到实时 API 调用，并异步更新缓存
- 7 天过期自动清理，保证数据库干净

## 架构

```
定时任务 (每天 8:00 Cron)
    │
    ├── 清理过期数据 (DELETE WHERE fetched_at < NOW - 7 days)
    │
    ├── 抓取一言 ──────────────→ daily_quotes 表
    ├── 抓取历史上的今天 ─────→ daily_history 表
    └── 抓取 AI 新闻 ─────────→ daily_news 表

用户请求 /api/60s/*
    │
    ├── 数据库有数据且未过期 ──→ 直接返回
    └── 数据为空/已过期 ─────→ 回退到 60s API
                               + 异步触发存储更新
```

## 数据库 Schema

### daily_quotes（一言）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT (PK) | 固定值 "latest" |
| content | TEXT | 一言内容 |
| author | TEXT | 作者（固定"一言"） |
| date | TEXT | 日期 (YYYY-MM-DD) |
| fetched_at | INTEGER | 抓取时间戳 (Unix ms) |

### daily_history（历史上的今天）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT (PK) | 固定值 "latest" |
| events | TEXT (JSON) | 事件列表 |
| date | TEXT | 日期 (YYYY-MM-DD) |
| fetched_at | INTEGER | 抓取时间戳 (Unix ms) |

### daily_news（AI 新闻）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT (PK) | 固定值 "latest" |
| news | TEXT (JSON) | 新闻列表 |
| date | TEXT | 日期 (YYYY-MM-DD) |
| fetched_at | INTEGER | 抓取时间戳 (Unix ms) |

## 定时任务

### Cloudflare Cron Trigger 配置

在 `wrangler.toml` 中添加：

```toml
[triggers]
crons = ["0 8 * * *"]
```

### 路由设计

| 路由 | 方法 | 说明 |
|------|------|------|
| `/api/cron/fetch` | POST | Cron 触发器（需验证 Cron Secret） |
| `/internal/cron/fetch` | POST | 内部调用（开发环境无验证） |

### Cron 执行逻辑

```
1. 清理过期数据
   DELETE FROM daily_quotes WHERE fetched_at < NOW() - 7 days
   DELETE FROM daily_history WHERE fetched_at < NOW() - 7 days
   DELETE FROM daily_news WHERE fetched_at < NOW() - 7 days

2. 并行抓取新数据
   Promise.all([
     fetch('https://60s.viki.moe/v2/hitokoto'),
     fetch('https://60s.viki.moe/v2/today-in-history'),
     fetch('https://60s.viki.moe/v2/ai-news'),
   ])

3. 写入数据库
   INSERT OR REPLACE INTO daily_quotes VALUES ('latest', content, author, date, now)
   INSERT OR REPLACE INTO daily_history VALUES ('latest', events_json, date, now)
   INSERT OR REPLACE INTO daily_news VALUES ('latest', news_json, date, now)
```

### 本地开发

在 `apps/server/package.json` 中添加脚本：

```json
{
  "scripts": {
    "cron:run": "wrangler dev --local --env cron"
  }
}
```

本地命令直接调用 `/internal/cron/fetch`，无需验证。

## API 响应逻辑

### GET /api/60s/quote

**查询流程：**
1. `SELECT * FROM daily_quotes WHERE id = 'latest'`
2. 检查 `fetched_at` 是否在 7 天内
3. 如有有效数据 → 返回 `{ data: { content, author, date }, error: null }`
4. 如无/已过期 → 实时调用 60s API → 返回数据 → 异步写入数据库

**响应格式：**
```json
{
  "data": {
    "content": "生活不是等待风暴过去，而是学会在雨中跳舞。",
    "author": "一言",
    "date": "2026-03-31"
  },
  "error": null
}
```

### GET /api/60s/history

**响应格式：**
```json
{
  "data": {
    "events": [
      { "year": "1949年", "title": "中华人民共和国成立" }
    ],
    "date": "2026-03-31"
  },
  "error": null
}
```

### GET /api/60s/ai-news

**响应格式：**
```json
{
  "data": {
    "news": [
      { "title": "OpenAI 发布 GPT-5", "source": "TechCrunch", "url": "https://..." }
    ],
    "date": "2026-03-31"
  },
  "error": null
}
```

## 文件结构

```
apps/server/src/
├── db/
│   ├── schema.ts          # 新增 daily_quotes, daily_history, daily_news 表
│   └── index.ts          # 现有 db 逻辑
├── routes/
│   ├── 60s/
│   │   ├── quote.ts       # 修改：优先查数据库，回退到 API
│   │   ├── history.ts     # 修改：优先查数据库，回退到 API
│   │   └── ai-news.ts    # 修改：优先查数据库，回退到 API
│   └── cron.ts           # 新增：定时任务入口
├── services/
│   └── daily-cache.ts    # 新增：缓存读写服务
│       # getQuote(): Promise<CachedQuote | null>
│       # setQuote(content, author, date): Promise<void>
│       # getHistory(): Promise<CachedHistory | null>
│       # setHistory(events, date): Promise<void>
│       # getNews(): Promise<CachedNews | null>
│       # setNews(news, date): Promise<void>
│       # cleanExpired(): Promise<void>
└── index.ts              # 注册 /api/cron/* 路由
```

## 错误处理

| 场景 | 处理方式 |
|------|----------|
| 数据库有有效数据 | 直接返回 |
| 数据库无数据/已过期 | 回退到 60s API |
| 60s API 也失败 | 返回 `{ data: null, error: "Service unavailable" }` |
| 定时任务抓取失败 | 记录日志，下次重试 |
| 定时任务写入失败 | 记录日志，下次覆盖写入 |

## 实现顺序

1. 扩展 db/schema.ts 添加三张表
2. 创建 services/daily-cache.ts 缓存服务
3. 创建 routes/cron.ts 定时任务入口
4. 修改 routes/60s/*.ts 优先读缓存
5. 配置 wrangler.toml Cron Triggers
6. 添加 `pnpm cron:run` 本地开发命令
