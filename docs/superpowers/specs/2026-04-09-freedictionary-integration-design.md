# Free Dictionary API 集成设计

## 概述

扩展翻译服务，同时调用两个 API 获取更丰富的单词信息：

1. **60s 翻译 API** (`60s.viki.moe/v2/fanyi`) — 获取翻译结果
2. **Free Dictionary API** (`api.dictionaryapi.dev`) — 获取英文音标、释义等

两个 API 的结果在后端合并，优先使用 Free Dictionary API 的音标。

## 数据流

```
POST /api/translate
    │
    ▼
┌─────────────────────────────────────┐
│  translation.ts                     │
│                                     │
│  ① 调用 60s 翻译 API                │
│  ② 调用 Free Dictionary API         │
│  ③ 合并结果                         │
│                                     │
│  - pronounce: 优先 FreeDict          │
│  - dictionaryData: FreeDict 完整数据 │
└─────────────────────────────────────┘
```

## API 设计

### POST `/api/translate`

Request:
```json
{ "text": "hello", "from": "en", "to": "zh" }
```

Response:
```json
{
  "success": true,
  "data": {
    "source": {
      "text": "hello",
      "type": "en",
      "typeDesc": "英文",
      "pronounce": "/həˈləʊ/"
    },
    "target": {
      "text": "你好",
      "type": "zh",
      "typeDesc": "中文",
      "pronounce": ""
    },
    "dictionaryData": {
      "word": "hello",
      "phonetic": "/həˈləʊ/",
      "phonetics": [
        { "text": "/həˈləʊ/", "audio": "..." },
        { "text": "/hɛloʊ/", "audio": "..." }
      ],
      "meanings": [
        {
          "partOfSpeech": "exclamation",
          "definitions": [
            { "definition": "Used as a greeting...", "example": "Hello, world!" }
          ]
        }
      ],
      "license": { "name": "CC BY-SA 3.0", "url": "..." },
      "sourceUrls": [...]
    }
  }
}
```

## 实现逻辑

### `translate()` 函数修改

```typescript
export async function translate(env: Env, options: TranslateOptions): Promise<TranslateResult | null> {
  // ① 调用 60s 翻译 API
  const fanyiResult = await callFanyiAPI(options);

  // ② 总是调用 Free Dictionary API（如果源文本是英文单词）
  const dictionaryData = await callFreeDictionaryAPI(options.text);

  // ③ 合并结果
  return {
    source: {
      text: fanyiResult.source.text,
      type: fanyiResult.source.type,
      typeDesc: fanyiResult.source.typeDesc,
      // 优先使用 Free Dictionary API 的音标
      pronounce: dictionaryData?.phonetic || fanyiResult.source.pronounce || '',
    },
    target: fanyiResult.target,
    // 完整 Free Dictionary 数据
    dictionaryData: dictionaryData || null,
  };
}
```

### 新增 `callFreeDictionaryAPI()` 函数

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

## 错误处理

| 场景 | 60s API 失败 | FreeDict API 失败 |
|------|-------------|------------------|
| 结果 | 返回 `success: false` | 返回翻译结果，`dictionaryData: null` |
| 原因 | 网络错误/API 不可用 | 网络错误/非英文单词 |

两个 API 独立调用，一个失败不影响另一个。

## 文件修改

```
apps/server/src/services/
└── translation.ts    # 修改：添加 FreeDict 调用和合并逻辑
```

## 后续重构

用户后续会根据两个 API 结构的差异，重构 `/api/translate` 的返回结构，暂定为 `dictionaryData` 字段承载 Free Dictionary 完整数据。
