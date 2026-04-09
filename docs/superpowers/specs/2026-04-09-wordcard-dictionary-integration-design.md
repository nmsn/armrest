# WordCard 查词功能集成设计

## 概述

将 WordCard 的 mock 数据替换为真实翻译功能：
1. 前端发送查词请求到后端，后端调用翻译 API
2. 前端记录查词缓存，渲染 card 列表
3. 查词前校验输入单词格式，查词后校验接口返回内容
4. 记录大于 9 条时隐藏更多记录

**注意：** 使用 `60s` 翻译 API（`/v2/fanyi`），不是字典 API。

## 架构

```
┌─────────────────┐    POST /api/translate    ┌─────────────────┐
│   WordCard      │ ─────────────────────────▶ │  translate.ts   │
│   (前端)        │                            │  (后端路由)     │
└────────┬────────┘                            └────────┬────────┘
         │                                              │
         │                                              ▼
         │                                    ┌─────────────────┐
         │                                    │   60s 翻译 API  │
         │                                    │  /v2/fanyi      │
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

**POST `/api/translate`**

Request:
```json
{ "text": "hello", "from": "en", "to": "zh" }
```

Response (成功):
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
    }
  }
}
```

Response (失败):
```json
{ "success": false, "error": "翻译失败" }
```

## 数据模型

### 存储结构（wordhistory.ts）

```typescript
interface WordHistoryItem {
  id: string
  word: string          // 源单词
  phonetic: string      // 发音（来自 API）
  meaning: string       // 翻译结果（target.text）
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

- 后端校验：由 translate.ts 处理
- 前端校验：检查 `target.text` 非空

## 显示逻辑

- `cards.length <= 9`：显示全部卡片
- `cards.length > 9`：只显示前 9 条

## 错误处理

| 场景 | 用户反馈 |
|------|---------|
| 输入为空或格式错误 | 输入框下方显示"请输入有效单词（仅支持英文字母）" |
| 单词过长（>50字符） | 输入框下方显示"单词过长（最多50字符）" |
| 网络超时 | 输入框下方显示"网络超时，请检查网络连接" |
| 翻译失败 | 输入框下方显示"翻译失败" |
| 无翻译结果 | 输入框下方显示"未找到翻译结果" |
| 其他网络错误 | 输入框下方显示"网络错误" |

## 文件结构

```
apps/server/src/routes/
└── translate.ts          # 已有：翻译路由

apps/ext/
├── lib/
│   └── wordhistory.ts   # 已有：WordHistoryItem 接口
├── lib/
│   └── api-client.ts    # 修改：添加 translate.lookup
└── entrypoints/newtab/components/
    └── WordCard.tsx     # 修改：接入翻译 API
```

## 实现步骤

1. ~~**后端**：创建 `dictionary.ts` 路由~~ (已移除，使用翻译 API)
2. **前端**：在 `api-client.ts` 添加 `translate.lookup`
3. **前端**：在 `WordCard.tsx` 添加输入校验
4. **前端**：修改 `WordCard.tsx` 调用翻译 API
5. **前端**：添加错误提示 UI
6. **前端**：添加 9 条限制显示逻辑
