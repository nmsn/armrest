# WordCard 查词功能集成实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 WordCard 的 mock 数据替换为真实查词功能，前端通过后端调用 Free Dictionary API

**Architecture:**
- 后端新建 `/api/dictionary` 路由，调用 `api.dictionaryapi.dev`
- 前端在 `api-client.ts` 添加 `dictionary.lookup` 方法
- `WordCard.tsx` 添加校验、调用真实 API、9 条限制

**Tech Stack:** React, TypeScript, Hono, chrome.storage.local

---

## 文件结构

```
apps/server/src/routes/
└── dictionary.ts              # 新增：查词路由

apps/ext/
├── lib/
│   └── wordhistory.ts        # 修改：添加 phoneticAudio 字段
├── lib/
│   └── api-client.ts         # 修改：添加 dictionary.lookup
└── entrypoints/newtab/components/
    └── WordCard.tsx          # 修改：接入真实 API
```

---

## Task 1: 创建后端 dictionary.ts 路由

**Files:**
- Create: `apps/server/src/routes/dictionary.ts`
- Modify: `apps/server/src/index.ts` (注册路由)

- [ ] **Step 1: 创建 dictionary.ts**

```typescript
import { Hono } from 'hono';
import type { Env } from '../index';

const router = new Hono<{ Bindings: Env }>();

interface DictionaryResult {
  word: string;
  phonetic: string;
  phoneticAudio: string;
  meanings: Array<{
    partOfSpeech: string;
    definitions: Array<{
      definition: string;
      example?: string;
    }>;
  }>;
}

router.post('/', async (c) => {
  const body = await c.req.json<{ word?: string }>();

  // 输入校验
  if (!body.word || typeof body.word !== 'string') {
    return c.json({ success: false, error: '无效输入' }, 400);
  }

  const word = body.word.trim();
  const WORD_REGEX = /^[a-zA-Z][a-zA-Z'-]{0,49}$/;

  if (!WORD_REGEX.test(word)) {
    return c.json({ success: false, error: '无效输入' }, 400);
  }

  // 调用 Free Dictionary API
  const encodedWord = encodeURIComponent(word.toLowerCase());
  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodedWord}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      if (response.status === 404) {
        return c.json({ success: false, error: '单词未找到' }, 404);
      }
      return c.json({ success: false, error: '外部 API 错误' }, 502);
    }

    const data = await response.json();

    // API 返回是数组，取第一个
    if (!Array.isArray(data) || data.length === 0) {
      return c.json({ success: false, error: '单词未找到' }, 404);
    }

    const entry = data[0];

    // 校验 meanings
    if (!entry.meanings || !Array.isArray(entry.meanings) || entry.meanings.length === 0) {
      return c.json({ success: false, error: '该单词暂无释义' }, 200);
    }

    // 校验 meanings[].definitions
    const hasValidMeanings = entry.meanings.some(
      (m: any) => m.definitions && Array.isArray(m.definitions) && m.definitions.length > 0
    );
    if (!hasValidMeanings) {
      return c.json({ success: false, error: '该单词暂无释义' }, 200);
    }

    // 提取数据
    const phonetic = entry.phonetic || '';
    const phoneticAudio = entry.phonetics
      ?.find((p: any) => p.audio && p.audio.length > 0)
      ?.audio || '';

    const result: DictionaryResult = {
      word: entry.word,
      phonetic,
      phoneticAudio,
      meanings: entry.meanings.map((m: any) => ({
        partOfSpeech: m.partOfSpeech || '',
        definitions: (m.definitions || []).slice(0, 2).map((d: any) => ({
          definition: d.definition || '',
          example: d.example || undefined,
        })),
      })),
    };

    return c.json({ success: true, data: result });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return c.json({ success: false, error: '网络超时' }, 500);
    }
    return c.json({ success: false, error: '网络错误' }, 500);
  }
});

export { router as dictionaryRouter };
```

- [ ] **Step 2: 在 index.ts 注册路由**

找到 `app.route('/api/translate', translateRouter...` 这一行，在其后添加：

```typescript
app.route('/api/dictionary', dictionaryRouter as unknown as Hono<any, any, any>);
```

在文件顶部 import 部分添加：

```typescript
import { dictionaryRouter } from './routes/dictionary';
```

- [ ] **Step 3: 提交**

```bash
git add apps/server/src/routes/dictionary.ts apps/server/src/index.ts
git commit -m "feat(server): add dictionary lookup route with Free Dictionary API"
```

---

## Task 2: 前端添加 dictionary.lookup 方法

**Files:**
- Modify: `apps/ext/lib/api-client.ts`

- [ ] **Step 1: 添加 dictionary.lookup 方法**

在 `api-client.ts` 的 `api` 对象中添加：

```typescript
dictionary: {
  lookup: (word: string) =>
    apiRequest<ApiResponse<{
      word: string;
      phonetic: string;
      phoneticAudio: string;
      meanings: Array<{
        partOfSpeech: string;
        definitions: Array<{
          definition: string;
          example?: string;
        }>;
      }>;
    }>>('/api/dictionary', { method: 'POST', body: { word } }),
},
```

- [ ] **Step 2: 提交**

```bash
git add apps/ext/lib/api-client.ts
git commit -m "feat(ext): add dictionary.lookup API method"
```

---

## Task 3: WordCard 添加输入校验和错误提示

**Files:**
- Modify: `apps/ext/entrypoints/newtab/components/WordCard.tsx`

- [ ] **Step 1: 添加校验函数和错误状态**

在组件内添加：

```typescript
const WORD_REGEX = /^[a-zA-Z][a-zA-Z'-]{0,49}$/
const MAX_DISPLAY_CARDS = 9

function validateWord(word: string): string | null {
  if (!word.trim()) return '请输入有效单词（仅支持英文字母）'
  if (word.length > 50) return '单词过长（最多50字符）'
  if (!WORD_REGEX.test(word)) return '请输入有效单词（仅支持英文字母）'
  return null
}
```

在 `useState` 部分添加错误状态：

```typescript
const [error, setError] = useState<string | null>(null)
```

- [ ] **Step 2: 修改 handleLookup 函数**

将现有的 `handleLookup` 替换为：

```typescript
const handleLookup = useCallback(async () => {
  const trimmed = word.trim()
  const validationError = validateWord(trimmed)
  if (validationError) {
    setError(validationError)
    return
  }
  setError(null)

  try {
    const res = await api.dictionary.lookup(trimmed)
    if (!res.success || !res.data) {
      setError(res.error || '未找到该单词')
      return
    }

    const d = res.data
    // 取第一条释义作为卡片展示
    const firstMeaning = d.meanings[0]
    const meaning = firstMeaning
      ? firstMeaning.definitions[0]?.definition || ''
      : ''

    const newWord: WordHistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      word: d.word,
      phonetic: d.phonetic,
      phoneticAudio: d.phoneticAudio || undefined,
      meaning,
      searchedAt: Date.now(),
      rotation: Math.floor(Math.random() * 16) - 8,
      offsetX: Math.floor(Math.random() * 24) - 12,
      offsetY: Math.floor(Math.random() * 16) - 8,
    }

    await addWordHistory(newWord)
    setCards((prev) => [newWord, ...prev.filter((c) => c.word !== newWord.word)])
    setWord('')
  } catch (err) {
    if (err instanceof Error && err.message.includes('timeout')) {
      setError('网络超时，请检查网络连接')
    } else {
      setError('网络错误')
    }
  }
}, [word])
```

- [ ] **Step 3: 添加错误提示 UI**

在 Input 组件下方添加：

```typescript
{error && (
  <div className="text-xs text-red-500 mt-1">{error}</div>
)}
```

- [ ] **Step 4: 提交**

```bash
git add apps/ext/entrypoints/newtab/components/WordCard.tsx
git commit -m "feat(ext): add word validation and API call in WordCard"
```

---

## Task 4: 添加 9 条限制显示逻辑

**Files:**
- Modify: `apps/ext/entrypoints/newtab/components/WordCard.tsx`

- [ ] **Step 1: 修改显示逻辑**

在 `MultiRowBucketCards` 的 cards prop 中限制数量：

```typescript
<MultiRowBucketCards
  cards={cards.slice(0, MAX_DISPLAY_CARDS).map(toCardItem)}
  columns={3}
  onCardClick={handleCardClick}
/>
```

- [ ] **Step 2: 提交**

```bash
git add apps/ext/entrypoints/newtab/components/WordCard.tsx
git commit -m "feat(ext): limit word card display to 9 items"
```

---

## Task 5: 更新 wordhistory.ts 添加 phoneticAudio 字段

**Files:**
- Modify: `apps/ext/lib/wordhistory.ts`

- [ ] **Step 1: 在 WordHistoryItem 接口添加 phoneticAudio 字段**

```typescript
export interface WordHistoryItem {
  id: string
  word: string
  phonetic: string
  phoneticAudio?: string  // 新增
  meaning: string
  searchedAt: number
  rotation: number
  offsetX: number
  offsetY: number
}
```

- [ ] **Step 2: 提交**

```bash
git add apps/ext/lib/wordhistory.ts
git commit -m "feat(ext): add phoneticAudio field to WordHistoryItem"
```

---

## Task 6: 移除 mock 数据，接入真实功能

**Files:**
- Modify: `apps/ext/entrypoints/newtab/components/WordCard.tsx`

- [ ] **Step 1: 修改 useEffect，加载真实数据**

找到 `useEffect` 部分，将：

```typescript
useEffect(() => {
  // TODO: Remove mock data when ready for production
  // checkAndClearIfNeeded()
  // getWordHistory().then((state) => setCards(state.cards))
  setCards(MOCK_WORDS)
}, [])
```

替换为：

```typescript
useEffect(() => {
  checkAndClearIfNeeded()
  getWordHistory().then((state) => setCards(state.cards))
}, [])
```

同时删除文件顶部的 `MOCK_WORDS` 常量定义。

- [ ] **Step 2: 删除 MOCK_WORDS**

找到并删除：

```typescript
const MOCK_WORDS: WordHistoryItem[] = [
  { id: '1', word: 'Serendipity', phonetic: '/ser.ən.dip.i.ti/', meaning: 'Finding something good by chance', searchedAt: Date.now(), rotation: -3, offsetX: 5, offsetY: -2 },
  // ... 其余 mock 数据
]
```

- [ ] **Step 3: 提交**

```bash
git add apps/ext/entrypoints/newtab/components/WordCard.tsx
git commit -m "feat(ext): remove mock data and use real word history"
```

---

## 验证清单

- [ ] 输入框输入 `hello`，点击搜索，API 返回正确数据
- [ ] 输入框输入 `serendipity`，点击搜索，卡片显示正确
- [ ] 输入框输入数字 `123`，显示错误提示
- [ ] 输入框输入过长文本（>50字符），显示错误提示
- [ ] 搜索不存在单词如 `xyz123abc`，显示"未找到该单词"
- [ ] 刷新页面，历史记录保持
- [ ] 搜索超过 9 条，只显示前 9 条卡片
