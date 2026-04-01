# External API Proxy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将扩展端直接调用的外部 API（60s 天气/一言/历史/AI新闻/壁纸、BigDataCloud 逆地理编码、Google Favicons、AllOrigins/Microlink 元数据）全部迁移到后端代理。

**Architecture:** 后端 Cloudflare Workers 新增 `/api/60s/*`、`/api/geocode`、`/api/favicon`、`/api/metadata` 路由，统一代理外部 API。扩展端移除直接 fetch，改为调用后端代理接口。统一响应格式 `{ data, error }`。

**Tech Stack:** Hono (Cloudflare Workers), TypeScript, chrome.storage

---

## File Structure

```
apps/server/src/routes/
├── 60s/
│   ├── weather.ts    # GET /api/60s/weather
│   ├── quote.ts      # GET /api/60s/quote
│   ├── history.ts    # GET /api/60s/history
│   ├── ai-news.ts    # GET /api/60s/ai-news
│   ├── bing.ts       # GET /api/60s/bing
│   └── index.ts      # 合并所有 60s 子路由
├── geocode.ts        # GET /api/geocode
├── favicon.ts        # GET /api/favicon
└── metadata.ts       # GET /api/metadata

apps/server/src/index.ts  # 注册新路由

apps/ext/lib/
├── constants.ts      # 删除 API_60S, API_BIGDATACLOUD
├── api.ts            # 删除 API 相关导出
├── daily.ts          # 改为调用后端代理
├── geo.ts            # 改为调用后端代理
└── api-client.ts     # 新增 proxy 方法
└── website.ts        # 改为调用后端代理
```

---

## Task 1: 创建 60s 路由目录和统一响应格式

**Files:**
- Create: `apps/server/src/routes/60s/index.ts`

- [ ] **Step 1: 创建 apps/server/src/routes/60s/ 目录和 index.ts**

```typescript
// apps/server/src/routes/60s/index.ts
import { Hono } from 'hono';
import { weatherRouter } from './weather';
import { quoteRouter } from './quote';
import { historyRouter } from './history';
import { aiNewsRouter } from './ai-news';
import { bingRouter } from './bing';

const sixtyRouter = new Hono();

sixtyRouter.route('/weather', weatherRouter);
sixtyRouter.route('/quote', quoteRouter);
sixtyRouter.route('/history', historyRouter);
sixtyRouter.route('/ai-news', aiNewsRouter);
sixtyRouter.route('/bing', bingRouter);

export { sixtyRouter };
```

---

## Task 2: 实现 /api/60s/weather

**Files:**
- Create: `apps/server/src/routes/60s/weather.ts`
- Modify: `apps/server/src/routes/60s/index.ts` (已在 Task 1 创建)
- Modify: `apps/server/src/index.ts` (路由注册)

- [ ] **Step 1: 创建 apps/server/src/routes/60s/weather.ts**

```typescript
// apps/server/src/routes/60s/weather.ts
import { Hono } from 'hono';

const router = new Hono();

router.get('/', async (c) => {
  const city = c.req.query('city');
  if (!city) {
    return c.json({ data: null, error: 'Missing required parameter: city' }, 400);
  }

  const start = Date.now();
  try {
    const url = `https://60s.viki.moe/v2/weather?query=${encodeURIComponent(city)}`;
    const response = await fetch(url);

    if (!response.ok) {
      const duration = Date.now() - start;
      console.log(`[60s] GET /weather?city=${city} → ${response.status} (${duration}ms)`);
      return c.json({ data: null, error: `Upstream error: ${response.status}` });
    }

    const result = await response.json();
    const duration = Date.now() - start;
    console.log(`[60s] GET /weather?city=${city} → 200 (${duration}ms)`);

    if (result.code === 200 && result.data) {
      const location = result.data.location;
      const weatherData = result.data.weather;
      const airQuality = result.data.air_quality;

      return c.json({
        data: {
          city: location?.city || location?.name || city,
          temperature: weatherData?.temperature != null ? `${weatherData.temperature}°C` : '未知',
          weather: weatherData?.condition || '未知',
          wind: weatherData?.wind_direction && weatherData?.wind_power
            ? `${weatherData.wind_direction} ${weatherData.wind_power}级`
            : '未知',
          humidity: airQuality?.quality || airQuality?.aqi?.toString() || '未知',
          updateTime: weatherData?.updated || new Date().toLocaleString('zh-CN'),
        },
        error: null,
      });
    }

    return c.json({ data: null, error: 'Invalid response format' });
  } catch (err) {
    const duration = Date.now() - start;
    console.log(`[60s] GET /weather?city=${city} → 500 (${duration}ms) ${err}`);
    return c.json({ data: null, error: String(err) });
  }
});

export { router as weatherRouter };
```

- [ ] **Step 2: 注册路由到 index.ts**

在 `apps/server/src/index.ts` 中 `app.route('/api', weatherRouter...` 后添加：
```typescript
import { sixtyRouter } from './routes/60s';
// ...
app.route('/api/60s', sixtyRouter as unknown as Hono<any, any, any>);
```

- [ ] **Step 3: 提交**
```bash
git add apps/server/src/routes/60s/ apps/server/src/index.ts
git commit -m "feat(server): add /api/60s/weather proxy endpoint"
```

---

## Task 3: 实现 /api/60s/quote

**Files:**
- Create: `apps/server/src/routes/60s/quote.ts`

- [ ] **Step 1: 创建 apps/server/src/routes/60s/quote.ts**

```typescript
// apps/server/src/routes/60s/quote.ts
import { Hono } from 'hono';

const router = new Hono();

router.get('/', async (c) => {
  const start = Date.now();
  try {
    const url = 'https://60s.viki.moe/v2/hitokoto';
    const response = await fetch(url);

    if (!response.ok) {
      const duration = Date.now() - start;
      console.log(`[60s] GET /quote → ${response.status} (${duration}ms)`);
      return c.json({ data: null, error: `Upstream error: ${response.status}` });
    }

    const result = await response.json();
    const duration = Date.now() - start;
    console.log(`[60s] GET /quote → 200 (${duration}ms)`);

    if (result.code === 200 && result.data) {
      return c.json({
        data: {
          content: result.data.hitokoto || '暂无',
          author: '一言',
        },
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

- [ ] **Step 2: 提交**
```bash
git add apps/server/src/routes/60s/quote.ts
git commit -m "feat(server): add /api/60s/quote proxy endpoint"
```

---

## Task 4: 实现 /api/60s/history

**Files:**
- Create: `apps/server/src/routes/60s/history.ts`

- [ ] **Step 1: 创建 apps/server/src/routes/60s/history.ts**

```typescript
// apps/server/src/routes/60s/history.ts
import { Hono } from 'hono';

const router = new Hono();

router.get('/', async (c) => {
  const start = Date.now();
  try {
    const url = 'https://60s.viki.moe/v2/today-in-history';
    const response = await fetch(url);

    if (!response.ok) {
      const duration = Date.now() - start;
      console.log(`[60s] GET /history → ${response.status} (${duration}ms)`);
      return c.json({ data: null, error: `Upstream error: ${response.status}` });
    }

    const result = await response.json();
    const duration = Date.now() - start;
    console.log(`[60s] GET /history → 200 (${duration}ms)`);

    if (result.code === 200 && result.data) {
      return c.json({
        data: {
          events: result.data.events || [],
          updateTime: result.data.date || new Date().toISOString().split('T')[0],
        },
        error: null,
      });
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

- [ ] **Step 2: 提交**
```bash
git add apps/server/src/routes/60s/history.ts
git commit -m "feat(server): add /api/60s/history proxy endpoint"
```

---

## Task 5: 实现 /api/60s/ai-news

**Files:**
- Create: `apps/server/src/routes/60s/ai-news.ts`

- [ ] **Step 1: 创建 apps/server/src/routes/60s/ai-news.ts**

```typescript
// apps/server/src/routes/60s/ai-news.ts
import { Hono } from 'hono';

const router = new Hono();

router.get('/', async (c) => {
  const start = Date.now();
  try {
    const url = 'https://60s.viki.moe/v2/ai-news';
    const response = await fetch(url);

    if (!response.ok) {
      const duration = Date.now() - start;
      console.log(`[60s] GET /ai-news → ${response.status} (${duration}ms)`);
      return c.json({ data: null, error: `Upstream error: ${response.status}` });
    }

    const result = await response.json();
    const duration = Date.now() - start;
    console.log(`[60s] GET /ai-news → 200 (${duration}ms)`);

    if (result.code === 200 && result.data) {
      return c.json({
        data: {
          news: result.data.news || [],
          updateTime: result.data.date || new Date().toISOString().split('T')[0],
        },
        error: null,
      });
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

- [ ] **Step 2: 提交**
```bash
git add apps/server/src/routes/60s/ai-news.ts
git commit -m "feat(server): add /api/60s/ai-news proxy endpoint"
```

---

## Task 6: 实现 /api/60s/bing

**Files:**
- Create: `apps/server/src/routes/60s/bing.ts`

- [ ] **Step 1: 创建 apps/server/src/routes/60s/bing.ts**

```typescript
// apps/server/src/routes/60s/bing.ts
import { Hono } from 'hono';

const router = new Hono();

router.get('/', async (c) => {
  const start = Date.now();
  try {
    const url = 'https://60s.viki.moe/v2/bing';
    const response = await fetch(url);

    if (!response.ok) {
      const duration = Date.now() - start;
      console.log(`[60s] GET /bing → ${response.status} (${duration}ms)`);
      return c.json({ data: null, error: `Upstream error: ${response.status}` });
    }

    const result = await response.json();
    const duration = Date.now() - start;
    console.log(`[60s] GET /bing → 200 (${duration}ms)`);

    if (result.code === 200 && result.data) {
      return c.json({
        data: {
          image: result.data.image || '',
          copyright: result.data.copyright || '',
          startdate: result.data.startdate || '',
          url: result.data.url || '',
        },
        error: null,
      });
    }

    return c.json({ data: null, error: 'Invalid response format' });
  } catch (err) {
    const duration = Date.now() - start;
    console.log(`[60s] GET /bing → 500 (${duration}ms) ${err}`);
    return c.json({ data: null, error: String(err) });
  }
});

export { router as bingRouter };
```

- [ ] **Step 2: 提交**
```bash
git add apps/server/src/routes/60s/bing.ts
git commit -m "feat(server): add /api/60s/bing proxy endpoint"
```

---

## Task 7: 实现 /api/geocode

**Files:**
- Create: `apps/server/src/routes/geocode.ts`

- [ ] **Step 1: 创建 apps/server/src/routes/geocode.ts**

```typescript
// apps/server/src/routes/geocode.ts
import { Hono } from 'hono';

const router = new Hono();

router.get('/geocode', async (c) => {
  const lat = c.req.query('lat');
  const lon = c.req.query('lon');

  if (!lat || !lon) {
    return c.json({ data: null, error: 'Missing required parameters: lat, lon' }, 400);
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);

  if (isNaN(latitude) || isNaN(longitude)) {
    return c.json({ data: null, error: 'Invalid coordinates: lat and lon must be numbers' }, 400);
  }

  if (latitude < -90 || latitude > 90) {
    return c.json({ data: null, error: 'Invalid latitude: must be between -90 and 90' }, 400);
  }

  if (longitude < -180 || longitude > 180) {
    return c.json({ data: null, error: 'Invalid longitude: must be between -180 and 180' }, 400);
  }

  const start = Date.now();
  try {
    const url = new URL('https://api.bigdatacloud.net/data/reverse-geocode-client');
    url.searchParams.append('latitude', latitude.toString());
    url.searchParams.append('longitude', longitude.toString());
    url.searchParams.append('localityLanguage', 'zh');

    const response = await fetch(url.toString());

    if (!response.ok) {
      const duration = Date.now() - start;
      console.log(`[geocode] GET /geocode?lat=${lat}&lon=${lon} → ${response.status} (${duration}ms)`);
      return c.json({ data: null, error: `Upstream error: ${response.status}` });
    }

    const result = await response.json();
    const duration = Date.now() - start;
    console.log(`[geocode] GET /geocode?lat=${lat}&lon=${lon} → 200 (${duration}ms)`);

    const cityName = result.city || result.locality || '';

    return c.json({
      data: {
        city: cityName || result.principalSubdivision || result.countryName || '',
        locality: result.locality || '',
        countryName: result.countryName || '',
        principalSubdivision: result.principalSubdivision || '',
      },
      error: null,
    });
  } catch (err) {
    const duration = Date.now() - start;
    console.log(`[geocode] GET /geocode?lat=${lat}&lon=${lon} → 500 (${duration}ms) ${err}`);
    return c.json({ data: null, error: String(err) });
  }
});

export { router as geocodeRouter };
```

- [ ] **Step 2: 注册路由到 index.ts**

在 `apps/server/src/index.ts` 中添加：
```typescript
import { geocodeRouter } from './routes/geocode';
// ...
app.route('/api', geocodeRouter as unknown as Hono<any, any, any>);
```

- [ ] **Step 3: 提交**
```bash
git add apps/server/src/routes/geocode.ts apps/server/src/index.ts
git commit -m "feat(server): add /api/geocode proxy endpoint for reverse geocoding"
```

---

## Task 8: 实现 /api/favicon

**Files:**
- Create: `apps/server/src/routes/favicon.ts`

- [ ] **Step 1: 创建 apps/server/src/routes/favicon.ts**

```typescript
// apps/server/src/routes/favicon.ts
import { Hono } from 'hono';

const router = new Hono();

router.get('/favicon', async (c) => {
  const url = c.req.query('url');
  const size = c.req.query('size') || '32';

  if (!url) {
    return c.json({ data: null, error: 'Missing required parameter: url' }, 400);
  }

  // Validate URL
  try {
    new URL(url);
  } catch {
    return c.json({ data: null, error: 'Invalid URL' }, 400);
  }

  const parsedSize = parseInt(size, 10);
  if (isNaN(parsedSize) || parsedSize < 1 || parsedSize > 512) {
    return c.json({ data: null, error: 'Invalid size: must be between 1 and 512' }, 400);
  }

  const start = Date.now();
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace(/^www\./, '');
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=${parsedSize}`;

    const duration = Date.now() - start;
    console.log(`[favicon] GET /favicon?url=${url}&size=${size} → 200 (${duration}ms)`);

    return c.json({
      data: { favicon: faviconUrl },
      error: null,
    });
  } catch (err) {
    const duration = Date.now() - start;
    console.log(`[favicon] GET /favicon?url=${url}&size=${size} → 500 (${duration}ms) ${err}`);
    return c.json({ data: null, error: String(err) });
  }
});

export { router as faviconRouter };
```

- [ ] **Step 2: 注册路由到 index.ts**

在 `apps/server/src/index.ts` 中添加：
```typescript
import { faviconRouter } from './routes/favicon';
// ...
app.route('/api', faviconRouter as unknown as Hono<any, any, any>);
```

- [ ] **Step 3: 提交**
```bash
git add apps/server/src/routes/favicon.ts apps/server/src/index.ts
git commit -m "feat(server): add /api/favicon proxy endpoint"
```

---

## Task 9: 实现 /api/metadata

**Files:**
- Create: `apps/server/src/routes/metadata.ts`

- [ ] **Step 1: 创建 apps/server/src/routes/metadata.ts**

```typescript
// apps/server/src/routes/metadata.ts
import { Hono } from 'hono';

const router = new Hono();

router.get('/metadata', async (c) => {
  const url = c.req.query('url');

  if (!url) {
    return c.json({ data: null, error: 'Missing required parameter: url' }, 400);
  }

  // Validate URL
  try {
    new URL(url);
  } catch {
    return c.json({ data: null, error: 'Invalid URL' }, 400);
  }

  const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
  const start = Date.now();

  try {
    // Fetch from both sources in parallel
    const [proxyResponse, microlinkResponse] = await Promise.all([
      fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(normalizedUrl)}`),
      fetch(`https://api.microlink.io?url=${encodeURIComponent(normalizedUrl)}&palette=true`),
    ]);

    const duration = Date.now() - start;
    console.log(`[metadata] GET /metadata?url=${url} → 200 (${duration}ms)`);

    let title = '';
    let description = '';
    let image = '';
    let logo = '';
    let favicon = '';

    // Parse Microlink response (takes priority)
    if (microlinkResponse.ok) {
      const microlinkData = await microlinkResponse.json();
      if (microlinkData.status === 'success' && microlinkData.data) {
        const { title: t, description: d, image: img, logo: l, favicon: f } = microlinkData.data;
        title = t || '';
        description = d || '';
        image = img?.url || '';
        logo = l?.url || '';
        favicon = f?.url || '';
      }
    }

    // Parse AllOrigins response (fallback for missing fields)
    if (proxyResponse.ok) {
      const proxyData = await proxyResponse.json();
      if (proxyData.contents) {
        // AllOrigins doesn't parse HTML in Workers, so we can't extract metadata from it
        // This is a limitation - in practice, Microlink alone may be sufficient
        // We'll keep this as a placeholder for future enhancement
      }
    }

    // Extract domain for fallback title
    try {
      const urlObj = new URL(normalizedUrl);
      const domain = urlObj.hostname.replace(/^www\./, '');
      if (!title) {
        title = domain.charAt(0).toUpperCase() + domain.slice(1);
      }
    } catch {
      // ignore
    }

    return c.json({
      data: {
        title,
        description,
        image,
        logo,
        favicon,
      },
      error: null,
    });
  } catch (err) {
    const duration = Date.now() - start;
    console.log(`[metadata] GET /metadata?url=${url} → 500 (${duration}ms) ${err}`);
    return c.json({ data: null, error: String(err) });
  }
});

export { router as metadataRouter };
```

- [ ] **Step 2: 注册路由到 index.ts**

在 `apps/server/src/index.ts` 中添加：
```typescript
import { metadataRouter } from './routes/metadata';
// ...
app.route('/api', metadataRouter as unknown as Hono<any, any, any>);
```

- [ ] **Step 3: 提交**
```bash
git add apps/server/src/routes/metadata.ts apps/server/src/index.ts
git commit -m "feat(server): add /api/metadata proxy endpoint"
```

---

## Task 10: 后端路由注册汇总验证

**Files:**
- Modify: `apps/server/src/index.ts`

- [ ] **Step 1: 确保 index.ts 正确注册所有路由**

确认 `apps/server/src/index.ts` 包含以下所有路由注册：
```typescript
import { sixtyRouter } from './routes/60s';
import { geocodeRouter } from './routes/geocode';
import { faviconRouter } from './routes/favicon';
import { metadataRouter } from './routes/metadata';

app.route('/api/60s', sixtyRouter as unknown as Hono<any, any, any>);
app.route('/api', geocodeRouter as unknown as Hono<any, any, any>);
app.route('/api', faviconRouter as unknown as Hono<any, any, any>);
app.route('/api', metadataRouter as unknown as Hono<any, any, any>);
```

- [ ] **Step 2: 运行 lint 检查**
```bash
cd apps/server && pnpm lint
```
预期：无错误

- [ ] **Step 3: 本地测试**
```bash
pnpm dev
# 测试各端点
curl http://localhost:3001/api/60s/weather?city=杭州
curl http://localhost:3001/api/60s/quote
curl http://localhost:3001/api/geocode?lat=30.274&lon=120.138
curl http://localhost:3001/api/favicon?url=https://github.com&size=64
```

- [ ] **Step 4: 提交**
```bash
git add apps/server/src/index.ts
git commit -m "feat(server): register all proxy routes"
```

---

## Task 11: 扩展端 - 更新 api-client.ts

**Files:**
- Modify: `apps/ext/lib/api-client.ts`

- [ ] **Step 1: 添加新的 api 方法**

在 `apps/ext/lib/api-client.ts` 的 `api` 对象中添加：
```typescript
weather60s: (city: string) => apiRequest(`/api/60s/weather?city=${encodeURIComponent(city)}`),
quote60s: () => apiRequest('/api/60s/quote'),
history60s: () => apiRequest('/api/60s/history'),
aiNews60s: () => apiRequest('/api/60s/ai-news'),
bing60s: () => apiRequest('/api/60s/bing'),
geocode: (lat: number, lon: number) => apiRequest(`/api/geocode?lat=${lat}&lon=${lon}`),
favicon: (url: string, size?: number) => apiRequest(`/api/favicon?url=${encodeURIComponent(url)}${size ? `&size=${size}` : ''}`),
metadata: (url: string) => apiRequest(`/api/metadata?url=${encodeURIComponent(url)}`),
```

- [ ] **Step 2: 提交**
```bash
git add apps/ext/lib/api-client.ts
git commit -m "feat(ext): add proxy API methods to api-client"
```

---

## Task 12: 扩展端 - 清理 constants.ts

**Files:**
- Modify: `apps/ext/lib/constants.ts`

- [ ] **Step 1: 删除 API_60S 和 API_BIGDATACLOUD**

从 `constants.ts` 中删除：
- `API_CONFIG.API_60S` (整个对象)
- `API_CONFIG.API_BIGDATACLOUD` (整个对象)

同时更新 `API_CONFIG` 导出，确保不再导出这两个配置。

- [ ] **Step 2: 检查是否还有其他地方引用这些常量**

```bash
grep -r "API_60S\|API_BIGDATACLOUD" apps/ext/
```
预期：无输出

- [ ] **Step 3: 提交**
```bash
git add apps/ext/lib/constants.ts
git commit -m "refactor(ext): remove API_60S and API_BIGDATACLOUD constants"
```

---

## Task 13: 扩展端 - 更新 api.ts

**Files:**
- Modify: `apps/ext/lib/api.ts`

- [ ] **Step 1: 检查 api.ts 是否还有用**

```bash
grep -r "from.*api\|API_" apps/ext/lib/
```
如果 `api.ts` 中的导出不再被使用，删除整个文件或清理无用导出。

当前 `api.ts` 导出：
- `ReverseGeocodeResponse` - `geocode.ts` 中需要，检查是否被使用
- `API_60S` - Task 12 已删除
- `API_BIGDATACLOUD` - Task 12 已删除

- [ ] **Step 2: 保留 `ReverseGeocodeResponse` 类型定义**

如果 `geo.ts` 仍需要这个类型，保留在 `api.ts` 中或移到 `geo.ts` 内。

- [ ] **Step 3: 提交**
```bash
git add apps/ext/lib/api.ts
git commit -m "refactor(ext): clean up api.ts"
```

---

## Task 14: 扩展端 - 更新 lib/daily.ts

**Files:**
- Modify: `apps/ext/lib/daily.ts`

- [ ] **Step 1: 将 getWeather() 改为调用后端**

```typescript
// 原来的:
import { API_60S } from './api';
const requestUrl = `${API_60S.base}${API_60S.api.weather}?query=${encodeURIComponent(city)}`;
// 改为:
const response = await api.weather60s(city);
```

- [ ] **Step 2: 将 getDailyQuote() 改为调用后端**

```typescript
// 原来的:
import { API_60S } from './api';
const requestUrl = `${API_60S.base}${API_60S.api.hitokoto}`;
// 改为:
const result = await api.quote60s();
```

更新响应处理逻辑以适配 `{ data, error }` 格式。

- [ ] **Step 3: 提交**
```bash
git add apps/ext/lib/daily.ts
git commit -m "refactor(ext): migrate getWeather and getDailyQuote to backend proxy"
```

---

## Task 15: 扩展端 - 更新 lib/geo.ts

**Files:**
- Modify: `apps/ext/lib/geo.ts`

- [ ] **Step 1: 将 getCityNameByCoordinates() 改为调用后端**

```typescript
// 删除 API_BIGDATACLOUD 导入
// 原来的:
import { API_BIGDATACLOUD, ReverseGeocodeResponse } from './api';
const requestUrl = new URL(`${API_BIGDATACLOUD.base}${API_BIGDATACLOUD.api.reverseGeocode}`);
// 改为:
const result = await api.geocode(latitude, longitude);
```

更新响应处理逻辑以适配 `{ data, error }` 格式。

- [ ] **Step 2: 提交**
```bash
git add apps/ext/lib/geo.ts
git commit -m "refactor(ext): migrate getCityNameByCoordinates to backend proxy"
```

---

## Task 16: 扩展端 - 更新 lib/website.ts

**Files:**
- Modify: `apps/ext/lib/website.ts`

- [ ] **Step 1: 将 getFaviconUrl() 改为调用后端**

```typescript
// 原来的:
export function getFaviconUrl(url: string, size: number = 32): string {
  const domain = extractDomain(url);
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`;
}
// 改为 (异步):
export async function getFaviconUrl(url: string, size: number = 32): Promise<string> {
  const result = await api.favicon(url, size);
  if (result.data) {
    return result.data.favicon;
  }
  // fallback
  const domain = extractDomain(url);
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`;
}
```

- [ ] **Step 2: 将 fetchWebsiteInfo() 改为调用后端**

```typescript
// 原来的:
const [proxyMetadata, microlinkMetadata] = await Promise.all([...]);
// 改为:
const result = await api.metadata(normalizedUrl);
```

- [ ] **Step 3: 处理同步调用 getFaviconUrl 的地方**

搜索所有调用 `getFaviconUrl` 的地方，更新为 await。

- [ ] **Step 4: 提交**
```bash
git add apps/ext/lib/website.ts
git commit -m "refactor(ext): migrate website metadata and favicon to backend proxy"
```

---

## Task 17: 集成测试

- [ ] **Step 1: 启动后端服务**
```bash
cd apps/server && pnpm dev
```

- [ ] **Step 2: 启动扩展**
```bash
cd apps/ext && pnpm dev
```

- [ ] **Step 3: 验证功能**
- 天气显示正常
- 每日一言显示正常
- 历史上的今天正常显示（如有使用）
- 逆地理编码（城市名获取）正常
- Favicon 正常显示
- 网站元数据正常获取

- [ ] **Step 4: 提交所有扩展端更改**
```bash
git add apps/ext/
git commit -m "feat(ext): migrate all external API calls to backend proxy"
```

---

## Task 18: 最终检查

- [ ] **Step 1: 确保没有遗留的直接外部 API 调用**
```bash
grep -r "https://60s.viki.moe\|https://api.bigdatacloud\|https://api.allorigins\|https://api.microlink" apps/ext/
```
预期：无输出

- [ ] **Step 2: 运行 lint**
```bash
pnpm lint
```
预期：无错误

- [ ] **Step 3: 最终提交**
```bash
git add -A
git commit -m "feat: complete external API proxy migration"
```
