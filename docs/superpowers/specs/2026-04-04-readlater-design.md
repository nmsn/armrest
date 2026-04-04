# ReadLater 独立存储系统设计

## 概述

将 `BucketCards` 的默认数据 `defaultCards` 迁移到独立的 `chrome.storage.sync` 存储系统，与现有的 bookmarks 系统完全独立。

## 数据结构

```typescript
interface ReadLaterCard {
  id: string
  url: string
  title: string
  bg: string        // 背景色
  rotation: number  // 旋转角度 (deg)
  offsetX: number   // X轴偏移 (px)
  offsetY: number   // Y轴偏移 (px)
}

interface ReadLaterState {
  cards: ReadLaterCard[]
  version: number
}
```

存储 Key: `armrest_readlater`，当前版本: `1`

## 视觉属性生成

沿用 `BucketCards.tsx` 中现有的生成逻辑和常量：

- **COLORS**: 20 种预设颜色
- **RANDOM_SEED**: 42（固定种子保证默认卡片渲染一致性）
- **generateCardMetas(count)**: 生成指定数量的随机 CardMeta

## 存储层 `lib/readlater.ts`

```typescript
getReadLater(): Promise<ReadLaterState>
saveReadLater(state: ReadLaterState): Promise<void>
addReadLaterCard(card: ReadLaterCard): Promise<void>
deleteReadLaterCard(id: string): Promise<void>
getDefaultCards(): ReadLaterCard[]
```

### getDefaultCards 逻辑

1. 使用现有的 14 条 `defaultCards` 数据
2. 调用 `generateCardMetas(14)` 生成对应的视觉属性
3. 合并为 `ReadLaterCard[]` 返回

### getReadLater 逻辑

1. 从 `chrome.storage.sync` 读取 `armrest_readlater`
2. 数据不存在或版本不匹配时，使用 `getDefaultCards()` 初始化并写入 storage
3. 返回 normalized state

## BucketCards 组件改造

```typescript
interface BucketCardsProps {
  cards: ReadLaterCard[]
  onAddCard?: () => void
  onDeleteCard?: (id: string) => void
  showAddCard?: boolean  // 是否渲染新增卡片
}
```

- `showAddCard=true` 时，在容器第一个位置渲染"新增卡片"
- 新增卡片使用 `bg="#E5E7EB"`（灰色），`rotation=0`，`offsetX=0`，`offsetY=0`，标题为"+"或空
- 新增卡片 `onClick` 触发 `onAddCard()`，不跳转链接
- 删除逻辑：长按或右键删除（具体交互待定，可先不做）

## ReadLater 组件改造

```typescript
export function ReadLater() {
  const [cards, setCards] = useState<ReadLaterCard[]>([])

  useEffect(() => {
    getReadLater().then(state => setCards(state.cards))
  }, [])

  const handleAddCard = useCallback(async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab?.url || !tab?.title) return

    const meta = generateCardMetas(1)[0] // 随机视觉属性
    const newCard: ReadLaterCard = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      url: tab.url,
      title: tab.title,
      ...meta,
    }

    await addReadLaterCard(newCard)
    setCards(prev => [newCard, ...prev])
  }, [])

  return (
    <div className="app-card read-later-card p-0!" style={{ height: "80px" }}>
      <BucketCards
        cards={cards}
        showAddCard={true}
        onAddCard={handleAddCard}
      />
    </div>
  )
}
```

## 文件变更

- **新建**: `apps/ext/lib/readlater.ts` — 存储层
- **修改**: `apps/ext/components/BucketCards.tsx` — 支持外部数据源和新增卡片
- **修改**: `apps/ext/entrypoints/newtab/components/ReadLater.tsx` — 接入存储和新增逻辑

## 默认数据

14 条默认 readlater 数据（来自现有 `defaultCards`）：

| URL | Title |
|-----|-------|
| https://github.com | GitHub |
| https://twitter.com | Twitter |
| https://youtube.com | YouTube |
| https://reddit.com | Reddit |
| https://notion.so | Notion |
| https://figstack.com | FigStack |
| https://claude.ai | Claude AI |
| https://linear.app | Linear |
| https://figma.com | Figma |
| https://stripe.com | Stripe |
| https://vercel.com | Vercel |
| https://tailwindcss.com | Tailwind CSS |
| https://drizzle.team | Drizzle ORM |
| https://hono.dev | Hono |

## 交互流程

1. 用户点击第一个位置的"+"新增卡片
2. 通过 `chrome.tabs.query({ active: true, currentWindow: true })` 获取当前活动标签页
3. 使用当前标签页的 `url` 和 `title` 构建新卡片
4. 生成随机视觉属性（bg、rotation、offsetX、offsetY）
5. 调用 `addReadLaterCard()` 存入 storage
6. 更新本地 state，新卡片出现在容器最前面

## 待定

- 删除卡片交互（长按/右键）— 本次不做
- 编辑卡片交互 — 本次不做
