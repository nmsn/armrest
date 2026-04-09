# Free Dictionary API 集成实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `translation.ts` 中同时调用 60s 翻译 API 和 Free Dictionary API，合并结果后返回给前端。

**Architecture:** 在 `translate()` 函数内部同时发起两个 API 请求，优先使用 Free Dictionary API 的音标，完整数据存入 `dictionaryData` 字段。

**Tech Stack:** TypeScript, Hono, `@hono/node-server`

---

## 文件结构

```
apps/server/src/services/
└── translation.ts    # 修改：添加 FreeDict 调用和合并逻辑
```

---

## Task 1: 添加 Free Dictionary API 调用函数

**Files:**
- Modify: `apps/server/src/services/translation.ts:1-41`

- [ ] **Step 1: 在 `translation.ts` 顶部添加 FreeDict API 调用函数**

在文件顶部的 import 语句之后、`TranslateOptions` 接口之前添加：

```typescript
async function callFreeDictionaryAPI(word: string) {
  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
    );
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add apps/server/src/services/translation.ts
git commit -m "feat(server): add FreeDictionary API caller"
```

---

## Task 2: 修改 `TranslateResult` 接口

**Files:**
- Modify: `apps/server/src/services/translation.ts:13-41`

- [ ] **Step 1: 在 `TranslateResult` 接口末尾添加 `dictionaryData` 字段**

```typescript
interface TranslateResult {
  source: {
    text: string;
    type: string;
    typeDesc: string;
    pronounce: string;
  };
  target: {
    text: string;
    type: string;
    typeDesc: string;
    pronounce: string;
  };
  dictionaryData: Record<string, any> | null;  // 新增
}
```

- [ ] **Step 2: 提交**

```bash
git add apps/server/src/services/translation.ts
git commit -m "feat(server): add dictionaryData field to TranslateResult"
```

---

## Task 3: 修改 `translate()` 函数逻辑

**Files:**
- Modify: `apps/server/src/services/translation.ts:43-78`

- [ ] **Step 1: 修改 `translate()` 函数，同时调用两个 API 并合并结果**

将原来的函数体替换为：

```typescript
export async function translate(
  env: Env,
  options: TranslateOptions,
): Promise<TranslateResult | null> {
  const { text, from = 'auto', to = 'auto', encoding } = options;

  // ① 调用 60s 翻译 API
  const params = new URLSearchParams({ text, from, to });
  if (encoding) params.set('encoding', encoding);

  let fanyiResult: { source: RawTranslateResult['source']; target: RawTranslateResult['target'] } | null = null;

  try {
    const response = await fetch(`https://60s.viki.moe/v2/fanyi?${params}`);
    if (response.ok) {
      const result = (await response.json()) as { code: number; data?: RawTranslateResult };
      if (result.code === 200 && result.data) {
        fanyiResult = {
          source: {
            text: result.data.source.text,
            type: result.data.source.type,
            type_desc: result.data.source.type_desc,
            pronounce: result.data.source.pronounce,
          },
          target: {
            text: result.data.target.text,
            type: result.data.target.type,
            type_desc: result.data.target.type_desc,
            pronounce: result.data.target.pronounce,
          },
        };
      }
    }
  } catch {
    // 忽略，fanyiResult 保持 null
  }

  if (!fanyiResult) return null;

  // ② 总是调用 Free Dictionary API
  const dictionaryData = await callFreeDictionaryAPI(text);

  // ③ 合并结果
  // 优先使用 Free Dictionary API 的音标
  const pronounce = dictionaryData?.phonetic || fanyiResult.source.pronounce || '';

  return {
    source: {
      text: fanyiResult.source.text,
      type: fanyiResult.source.type,
      typeDesc: fanyiResult.source.type_desc,
      pronounce,
    },
    target: {
      text: fanyiResult.target.text,
      type: fanyiResult.target.type,
      typeDesc: fanyiResult.target.type_desc,
      pronounce: fanyiResult.target.pronounce,
    },
    dictionaryData: dictionaryData || null,
  };
}
```

- [ ] **Step 2: 本地测试启动 server**

```bash
cd apps/server && pnpm dev
# 确认无编译错误
```

- [ ] **Step 3: 提交**

```bash
git add apps/server/src/services/translation.ts
git commit -m "feat(server): merge FreeDictionary API data into translate response"
```

---

## Task 4: 验证端到端

- [ ] **Step 1: 启动 server**

```bash
cd apps/server && pnpm dev
```

- [ ] **Step 2: 测试翻译接口**

```bash
curl -X POST http://localhost:3001/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "hello", "from": "en", "to": "zh"}'
```

预期返回包含 `dictionaryData` 字段（Free Dictionary API 数据）和 `pronounce` 字段（优先使用 FreeDict 音标）。

- [ ] **Step 3: 停止 server 并提交**

```bash
git add -A
git commit -m "feat(server): integrate Free Dictionary API for phonetic data"
```
