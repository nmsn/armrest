# WordCard 查词功能集成设计

## 概述

将 WordCard 的 mock 数据替换为真实查词功能：
1. 前端发送查词请求到后端，后端调用 Free Dictionary API
2. 前端记录查词缓存，渲染 card 列表
3. 查词前校验输入单词格式，查词后校验接口返回内容
4. 记录大于 9 条时隐藏更多记录

## 架构

```
┌─────────────────┐    POST /api/dictionary    ┌─────────────────┐
│   WordCard      │ ─────────────────────────▶ │  dictionary.ts  │
│   (前端)        │                            │  (后端路由)     │
└────────┬────────┘                            └────────┬────────┘
         │                                              │
         │                                              ▼
         │                                    ┌─────────────────┐
         │                                    │ Free Dictionary │
         │                                    │   API           │
         │                                    └─────────────────┘
         │
         ▼
┌─────────────────┐
│  wordhistory.ts │
│  (本地存储)      │
└─────────────────┘
```

## API 设计

### 前端 → 后端

**POST `/api/dictionary`**

Request:
```json
{ "word": "serendipity" }
```

Response (成功):
```json
{
  "success": true,
  "data": {
    "word": "serendipity",
    "phonetic": "/ˌser.ənˈdɪp.ɪ.ti/",
    "phoneticAudio": "https://api.dictionaryapi.dev/media/pronunciations/en/serendipity-uk.mp3",
    "meanings": [
      {
        "partOfSpeech": "noun",
        "definitions": [
          {
            "definition": "The occurrence of events by chance in a happy way",
            "example": "a fortunate stroke of serendipity"
          }
        ]
      }
    ]
  }
}
```

Response (失败):
```json
{ "success": false, "error": "Word not found" }
```

### 后端 → Free Dictionary API

**GET `https://api.dictionaryapi.dev/api/v2/entries/en/{word}`**

后端只返回第一个结果（简化处理）。

## 数据模型

### 存储结构（wordhistory.ts）

```typescript
interface WordHistoryItem {
  id: string
  word: string
  phonetic: string
  phoneticAudio?: string  // 新增
  meaning: string         // 第一条释义（简化展示）
  searchedAt: number
  rotation: number
  offsetX: number
  offsetY: number
}
```

## 输入校验

**正则表达式：** `/^[a-zA-Z][a-zA-Z'-]{0,49}$/`

- 必须以字母开头
- 后续字符允许：字母、连字符（-）、撇号（'）
- 最多 50 字符

**错误提示：** "请输入有效单词（仅支持英文字母）"

## API 返回校验

- 后端校验：响应必须包含 `meanings` 数组且非空
- 前端校验：收到数据后检查 `meanings` 存在且有内容

## 显示逻辑

- `cards.length <= 9`：显示全部卡片
- `cards.length > 9`：只显示前 9 条

## 错误处理

| 场景 | 用户反馈 |
|------|---------|
| 输入校验失败 | 输入框下方显示红色提示 |
| 网络错误 | Toast 或输入框下方显示"网络错误" |
| 单词不存在 | 输入框下方显示"未找到该单词" |
| API 无释义 | 输入框下方显示"该单词暂无释义" |

## 文件结构

```
apps/server/src/routes/
└── dictionary.ts              # 新增：查词路由

apps/ext/
├── lib/
│   └── wordhistory.ts        # 修改：添加 phoneticAudio 字段
├── entrypoints/newtab/components/
│   └── WordCard.tsx          # 修改：接入真实 API
└── lib/
    └── api-client.ts         # 修改：添加 dictionary.lookup
```

## 实现步骤

1. **后端**：创建 `dictionary.ts` 路由
2. **前端**：在 `api-client.ts` 添加 `dictionary.lookup`
3. **前端**：在 `WordCard.tsx` 添加输入校验
4. **前端**：修改 `WordCard.tsx` 调用真实 API
5. **前端**：添加错误提示 UI
6. **前端**：添加 9 条限制显示逻辑

## 风险

- Free Dictionary API 可能有访问限制（目前无 key，免费使用）
- 单词发音 URL 可能失效（已有 fallback，不影响核心功能）
