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

### 3. /api/geocode

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

### 4. /api/favicon

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

### 5. /api/metadata

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

后端合并两个数据源返回统一的元数据。

## 扩展端改造

### constants.ts

删除以下内容：
- `API_CONFIG.API_60S`
- `API_CONFIG.API_BIGDATACLOUD`

### lib/daily.ts

1. 删除 `API_60S` 导入
2. `getWeather()` 改为调用 `GET /api/60s/weather?city=xxx`
3. `getDailyQuote()` 改为调用 `GET /api/60s/quote`

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

1. 创建路由文件结构
2. 实现 `/api/60s/weather` 和 `/api/60s/quote`
3. 实现 `/api/geocode`
4. 实现 `/api/favicon` 和 `/api/metadata`
5. 扩展端改造
6. 测试验证

## 待确认

- [ ] 60s API 是否有其他端点需要代理？（历史上的今天、必应壁纸等）
- [ ] 是否需要保留 60s 的 `history`（历史上的今天）接口？
- [ ] 是否需要保留 60s 的 `ai-news` 接口？
