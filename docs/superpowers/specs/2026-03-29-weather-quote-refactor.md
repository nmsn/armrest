# Weather & Quote Backend Refactor

> **Goal:** Move quote fetching to backend with cron, weather simplified via proxy

## Architecture

### Quote (一言)
```
Cloudflare Cron / node-cron (local)
    ↓
GET https://60s.viki.moe/v2/hitokoto
    ↓
Store in DB (daily_quotes table)
    ↓
Extension: GET /api/quote → chrome.storage.local cache
```

### Weather
```
User opens newtab
    ↓
Check chrome.storage.local freshness (1 hour expiry)
    ↓
If expired → GET /api/weather?city=杭州 → Backend fetches 60s API → Display
    ↓
Store in chrome.storage.local (no DB)
```

## API Design

### GET /api/quote
- Returns latest quote from `daily_quotes` table
- Response (transformed to extension format):
```json
{
  "content": "string",
  "author": "一言"
}
```
- Source API returns `{ code: 200, data: { hitokoto: "...", from: "..." } }`
- Backend transforms to `{ content, author }`

### GET /api/weather?city=杭州
- Backend proxy to `https://60s.viki.moe/v2/weather?query=杭州`
- Does NOT store in DB
- Response (matches extension's `WeatherData` interface):
```json
{
  "city": "杭州",
  "temperature": "25°C",
  "weather": "晴",
  "wind": "东风 3级",
  "humidity": "良",
  "updateTime": "2026-03-29 12:00:00"
}
```
- Source API returns nested `{ data: { location: {...}, weather: {...}, air_quality: {...} } }`
- Backend transforms to flat structure

### POST /api/maintenance/refresh (dev only, no auth)
- Manual trigger for quote refresh
- Used for local testing

## Database Schema

### 1. Add city to users
```typescript
export const users = sqliteTable('users', {
  // ...existing fields
  city: text('city').default('北京'),
});
```

### 2. New table: daily_quotes
```typescript
export const dailyQuotes = sqliteTable('daily_quotes', {
  id: integer('id').primaryKey().autoincrement(),
  content: text('content').notNull(),
  author: text('author').default('一言'),
  fetchedAt: integer('fetched_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});
```

## Implementation Details

### Local Development (dev.ts)
- Add `node-cron` package
- Schedule: Daily at 00:00 (`0 0 * * *`)
- On trigger: fetch from 60s API, upsert to `daily_quotes`
- Also expose `POST /api/maintenance/refresh` for manual testing

### Production (wrangler.toml)
```toml
[triggers]
crons = ["0 0 * * *"]  # Daily at midnight UTC
```

### Extension Changes (daily.ts)
- `getDailyQuote()` → call `GET /api/quote` instead of direct 60s API
- `getWeather()` → call `GET /api/weather?city=xxx` instead of direct 60s API
- Keep `chrome.storage.local` caching logic unchanged
- City passed to API comes from `storedData.weatherCity` or `DEFAULT_VALUES.FALLBACK_CITY`

### Backend Transformation (routes/weather.ts, dev.ts)
- Quote: `{ data: { hitokoto, from } }` → `{ content: hitokoto, author: from || '一言' }`
- Weather: Transform 60s nested response to flat `WeatherData` format

## Error Handling

| Scenario | Strategy |
|----------|----------|
| 60s API failure | Return cached data from chrome.storage if available, else return error |
| DB unavailable (quote) | Return `{ content: '暂无', author: '一言' }` |
| Invalid city | Use fallback city `北京` |

## Key Decisions

1. **Weather stays out of DB** -时效性数据，浏览器缓存足够
2. **Quote in DB** -支持 cron 刷新，需要持久化
3. **Single weather API** -统一使用 60s API (按城市，无需经纬度)
4. **Response format alignment** -后端转换，适配 extension 接口
