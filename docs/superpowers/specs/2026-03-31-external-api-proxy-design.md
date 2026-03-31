# 外部 API 后端代理设计

## 背景

当前浏览器扩展直接调用多个外部第三方 API，存在以下问题：
- **CORS 限制**：部分 API 在浏览器端调用时被阻止
- **API Key 暴露**：第三方 API 密钥硬编码在扩展中
- **数据不可控**：无法统一缓存和数据格式

## 目标

将扩展端直接调用的外部 API 全部迁移到后端代理，统一通过 Cloudflare Workers 后端转发。

## 架构

```
扩展端                              后端
─────────                          ──────────────
lib/daily.ts    ──────────────→    /api/60s/weather
                                   /api/60s/quote
                                   /api/60s/history
                                   /api/60s/ai-news
                                   /api/60s/bing

lib/geo.ts      ──────────────→    /api/geocode

lib/website.ts   ──────────────→    /api/favicon
                                   /api/metadata
```

## 路由设计

### 新增路由

| 文件 | 路由 | 代理目标 |
|------|------|----------|
| `apps/server/src/routes/60s/weather.ts` | `GET /api/60s/weather?city=xxx` | 60s 天气 |
| `apps/server/src/routes/60s/quote.ts` | `GET /api/60s/quote` | 60s 一言 |
| `apps/server/src/routes/60s/history.ts` | `GET /api/60s/history` | 60s 历史上的今天 |
| `apps/server/src/routes/60s/ai-news.ts` | `GET /api/60s/ai-news` | 60s AI 资讯 |
| `apps/server/src/routes/60s/bing.ts` | `GET /api/60s/bing` | 60s 必应每日壁纸 |
| `apps/server/src/routes/geocode.ts` | `GET /api/geocode?lat=xx&lon=xx` | BigDataCloud 逆地理编码 |
| `apps/server/src/routes/favicon.ts` | `GET /api/favicon?url=xxx&size=xx` | Google Favicons |
| `apps/server/src/routes/metadata.ts` | `GET /api/metadata?url=xxx` | AllOrigins + Microlink 网页元数据 |

### 路由注册

在 `apps/server/src/index.ts` 中新增路由注册：

```typescript
app.route('/api/60s', sixtyRouter);
app.route('/api', geocodeRouter);
app.route('/api', faviconRouter);
app.route('/api', metadataRouter);
```

## 详细设计

### 1. /api/60s/weather

**请求**
```
GET /api/60s/weather?city=杭州
```

**响应**
```json
{
  "data": {
    "city": "杭州",
    "temperature": "22°C",
    "weather": "晴",
    "wind": "东风 3级",
    "humidity": "良",
    "updateTime": "2026-03-31 12:00:00"
  },
  "error": null
}
```

**代理目标**: `https://60s.viki.moe/v2/weather?query=杭州`

### 2. /api/60s/quote

**请求**
```
GET /api/60s/quote
```

**响应**
```json
{
  "data": {
    "content": "生活不是等待风暴过去，而是学会在雨中跳舞。",
    "author": "一言"
  },
  "error": null
}
```

**代理目标**: `https://60s.viki.moe/v2/hitokoto`

### 3. /api/60s/history

**请求**
```
GET /api/60s/history
```

**响应**
```json
{
  "data": {
    "events": [
      { "year": "1949年", "title": "中华人民共和国成立" },
      { "year": "1997年", "title": "香港回归祖国" }
    ],
    "updateTime": "2026-03-31"
  },
  "error": null
}
```

**代理目标**: `https://60s.viki.moe/v2/today-in-history`

### 4. /api/60s/ai-news

**请求**
```
GET /api/60s/ai-news
```

**响应**
```json
{
  "data": {
    "news": [
      { "title": "OpenAI 发布 GPT-5", "source": "TechCrunch", "url": "https://..." },
      { "title": "Google 发布 Gemini 2.0", "source": "The Verge", "url": "https://..." }
    ],
    "updateTime": "2026-03-31"
  },
  "error": null
}
```

**代理目标**: `https://60s.viki.moe/v2/ai-news`

### 5. /api/60s/bing

**请求**
```
GET /api/60s/bing
```

**响应**
```json
{
  "data": {
    "image": "https://bing.com/api/image.jpg",
    "copyright": "长城，中国",
    "startdate": "20260331",
    "url": "https://bing.com/..."
  },
  "error": null
}
```

**代理目标**: `https://60s.viki.moe/v2/bing`

### 6. /api/geocode

**请求**
```
GET /api/geocode?lat=30.274&lon=120.138
```

**响应**
```json
{
  "data": {
    "city": "杭州市",
    "locality": "西湖区",
    "countryName": "中国",
    "principalSubdivision": "浙江省"
  },
  "error": null
}
```

**代理目标**: `https://api.bigdatacloud.net/data/reverse-geocode-client`

### 7. /api/favicon

**请求**
```
GET /api/favicon?url=https://github.com&size=64
```

**响应**
```json
{
  "data": {
    "favicon": "https://www.google.com/s2/favicons?domain=github.com&sz=64"
  },
  "error": null
}
```

**代理目标**: `https://www.google.com/s2/favicons?domain=xxx&sz=xx`

### 8. /api/metadata

**请求**
```
GET /api/metadata?url=https://github.com
```

**响应**
```json
{
  "data": {
    "title": "GitHub",
    "description": "Where the world builds software...",
    "image": "https://github.githubassets.com/...",
    "logo": "https://github.githubassets.com/..."
  },
  "error": null
}
```

**代理目标**:
- `https://api.allorigins.win/get?url=xxx` (提取 title, description, og:image)
- `https://api.microlink.io?url=xxx&palette=true` (提取 title, description, image, logo, favicon)

后端合并两个数据源返回统一的元数据。合并策略：Microlink 数据优先；AllOrigins 用于补充 Microlink 缺失的字段（如 description、og:image）。

## 扩展端改造

### constants.ts

删除以下内容：
- `API_CONFIG.API_60S`
- `API_CONFIG.API_BIGDATACLOUD`

### lib/daily.ts

1. 删除 `API_60S` 导入
2. `getWeather()` 改为调用 `GET /api/60s/weather?city=xxx`
3. `getDailyQuote()` 改为调用 `GET /api/60s/quote`
4. `getHistory()` 改为调用 `GET /api/60s/history`
5. `getAiNews()` 改为调用 `GET /api/60s/ai-news`
6. `getBingImage()` 改为调用 `GET /api/60s/bing`

### lib/geo.ts

1. 删除 `API_BIGDATACLOUD` 导入
2. `getCityNameByCoordinates()` 改为调用 `GET /api/geocode?lat=xx&lon=xx`

### lib/website.ts

1. `getFaviconUrl()` 改为调用 `GET /api/favicon?url=xxx&size=xx`
2. `fetchWebsiteInfo()` 改为调用 `GET /api/metadata?url=xxx`

### api-client.ts

新增扩展端代理接口调用：
```typescript
export const api = {
  // ... existing
  proxy: {
    weather60s: (city: string) => apiRequest(`/api/60s/weather?city=${encodeURIComponent(city)}`),
    quote60s: () => apiRequest('/api/60s/quote'),
    history60s: () => apiRequest('/api/60s/history'),
    aiNews60s: () => apiRequest('/api/60s/ai-news'),
    bing60s: () => apiRequest('/api/60s/bing'),
    geocode: (lat: number, lon: number) => apiRequest(`/api/geocode?lat=${lat}&lon=${lon}`),
    favicon: (url: string, size?: number) => apiRequest(`/api/favicon?url=${encodeURIComponent(url)}${size ? `&size=${size}` : ''}`),
    metadata: (url: string) => apiRequest(`/api/metadata?url=${encodeURIComponent(url)}`),
  },
}
```

## 错误处理

### 统一响应格式

```typescript
interface ProxyResponse<T> {
  data: T | null;
  error: string | null;
}
```

### 后端错误处理

- 代理请求失败：返回 `{ data: null, error: "错误描述" }`，保持 HTTP 200
- 第三方 API 超时：返回 `{ data: null, error: "Request timeout" }`
- 参数缺失：返回 HTTP 400 `{ data: null, error: "Missing required parameter: xxx" }`

### 扩展端错误处理

- 沿用现有缓存 fallback 机制（网络失败时使用本地缓存）
- 后端返回 `{ data: null, error }` 时，按现有错误处理流程

## 日志规范

后端统一打印请求日志：
```
[60s] GET /weather?city=杭州 → 200 (320ms)
[geocode] GET /geocode?lat=30.274&lon=120.138 → 200 (150ms)
[metadata] GET /metadata?url=https://github.com → 500 (Upstream error)
```

## 实现顺序

1. 创建路由文件结构 (`apps/server/src/routes/60s/`)
2. 实现 `/api/60s/weather`、`/api/60s/quote`、`/api/60s/history`、`/api/60s/ai-news`、`/api/60s/bing`
3. 实现 `/api/geocode`
4. 实现 `/api/favicon` 和 `/api/metadata`
5. 扩展端改造
6. 测试验证

## 待确认

- [x] 60s API 是否有其他端点需要代理？（历史上的今天、必应壁纸等）
- [x] 是否需要保留 60s 的 `history`（历史上的今天）接口？
- [x] 是否需要保留 60s 的 `ai-news` 接口？

> **确认结果**：history、ai-news、bing 均需要代理，已纳入设计。
