# ReadLater 独立存储系统实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 `defaultCards` 数据迁移到独立 `chrome.storage.sync` 存储系统，增加视觉属性（偏移、旋转），新增点击即添加当前页面的卡片功能。

**Architecture:** 新建 `lib/readlater.ts` 作为独立存储层，`BucketCards` 改为接收外部数据 + 新增卡片回调，`ReadLater` 组件接入存储并处理新增逻辑。

**Tech Stack:** chrome.storage.sync, React hooks, TypeScript

---

## 文件结构

| 文件 | 职责 |
|------|------|
| `apps/ext/lib/readlater.ts` | **新建** — 存储层：CRUD + 默认数据生成 |
| `apps/ext/lib/constants.ts` | **修改** — 新增 `STORAGE_KEYS.READ_LATER` |
| `apps/ext/components/BucketCards.tsx` | **修改** — 支持外部数据源 + 新增卡片渲染 |
| `apps/ext/entrypoints/newtab/components/ReadLater.tsx` | **修改** — 接入存储，处理新增逻辑 |

---

## Task 1: 新增 STORAGE_KEYS.READ_LATER

**Files:**
- Modify: `apps/ext/lib/constants.ts`

- [ ] **Step 1: 在 STORAGE_KEYS 中新增 READ_LATER key**

打开 `apps/ext/lib/constants.ts`，在 `STORAGE_KEYS` 对象中新增：

```typescript
const STORAGE_KEYS = {
  BOOKMARKS: 'armrest_bookmarks',
  THEME: 'armrest-theme-config',
  DAILY_DATA: 'armarmrest-daily-data',
  READ_LATER: 'armrest_readlater',  // 新增
} as const
```

- [ ] **Step 2: Commit**

```bash
git add apps/ext/lib/constants.ts
git commit -m "feat(ext): add READ_LATER storage key"
```

---

## Task 2: 新建 lib/readlater.ts 存储层

**Files:**
- Create: `apps/ext/lib/readlater.ts`
- Test: (手动测试，无需单元测试)

- [ ] **Step 1: 从 BucketCards.tsx 复制颜色和随机生成逻辑**

从 `apps/ext/components/BucketCards.tsx` 复制以下常量定义到新建的 `apps/ext/lib/readlater.ts`：

```typescript
const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8B500', '#2ECC71', '#E74C3C', '#3498DB', '#9B59B6',
  '#1ABC9C', '#F39C12', '#C0392B', '#8E44AD', '#16A085',
]

const RANDOM_SEED = 42
const ROTATION_RANGE = 15
const OFFSET_X_RANGE = 40
const OFFSET_X_BIAS = 10
const OFFSET_Y_RANGE = 10
const OFFSET_Y_BIAS = 5

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}
```

- [ ] **Step 2: 定义 ReadLaterCard 和 ReadLaterState 接口**

```typescript
export interface ReadLaterCard {
  id: string
  url: string
  title: string
  bg: string
  rotation: number
  offsetX: number
  offsetY: number
}

export interface ReadLaterState {
  cards: ReadLaterCard[]
  version: number
}
```

- [ ] **Step 3: 定义存储常量和默认数据**

```typescript
import { STORAGE_KEYS } from './constants'

const STORAGE_KEY = STORAGE_KEYS.READ_LATER
const CURRENT_VERSION = 1

const DEFAULT_CARDS_DATA = [
  { url: 'https://github.com', title: 'GitHub' },
  { url: 'https://twitter.com', title: 'Twitter' },
  { url: 'https://youtube.com', title: 'YouTube' },
  { url: 'https://reddit.com', title: 'Reddit' },
  { url: 'https://notion.so', title: 'Notion' },
  { url: 'https://figstack.com', title: 'FigStack' },
  { url: 'https://claude.ai', title: 'Claude AI' },
  { url: 'https://linear.app', title: 'Linear' },
  { url: 'https://figma.com', title: 'Figma' },
  { url: 'https://stripe.com', title: 'Stripe' },
  { url: 'https://vercel.com', title: 'Vercel' },
  { url: 'https://tailwindcss.com', title: 'Tailwind CSS' },
  { url: 'https://drizzle.team', title: 'Drizzle ORM' },
  { url: 'https://hono.dev', title: 'Hono' },
]
```

- [ ] **Step 4: 实现 generateCardMeta() 函数**

```typescript
function generateCardMeta(): { bg: string; rotation: number; offsetX: number; offsetY: number } {
  const rand = seededRandom(RANDOM_SEED)
  return {
    bg: COLORS[Math.floor(rand() * COLORS.length)],
    rotation: Math.floor(rand() * ROTATION_RANGE * 2) - ROTATION_RANGE,
    offsetX: Math.floor(rand() * OFFSET_X_RANGE) - OFFSET_X_BIAS,
    offsetY: Math.floor(rand() * OFFSET_Y_RANGE) - OFFSET_Y_BIAS,
  }
}
```

- [ ] **Step 5: 实现 getDefaultCards() 函数**

```typescript
export function getDefaultCards(): ReadLaterCard[] {
  const rand = seededRandom(RANDOM_SEED)
  return DEFAULT_CARDS_DATA.map((card) => ({
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    url: card.url,
    title: card.title,
    bg: COLORS[Math.floor(rand() * COLORS.length)],
    rotation: Math.floor(rand() * ROTATION_RANGE * 2) - ROTATION_RANGE,
    offsetX: Math.floor(rand() * OFFSET_X_RANGE) - OFFSET_X_BIAS,
    offsetY: Math.floor(rand() * OFFSET_Y_RANGE) - OFFSET_Y_BIAS,
  }))
}
```

- [ ] **Step 6: 实现 getReadLater() 函数**

```typescript
export async function getReadLater(): Promise<ReadLaterState> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(STORAGE_KEY, (result) => {
      const data = result[STORAGE_KEY] as ReadLaterState | undefined
      if (!data || data.version !== CURRENT_VERSION) {
        const defaultState: ReadLaterState = {
          version: CURRENT_VERSION,
          cards: getDefaultCards(),
        }
        chrome.storage.sync.set({ [STORAGE_KEY]: defaultState })
        resolve(defaultState)
      } else {
        resolve(data)
      }
    })
  })
}
```

- [ ] **Step 7: 实现 saveReadLater() 函数**

```typescript
export async function saveReadLater(state: ReadLaterState): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set({ [STORAGE_KEY]: state }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError)
      } else {
        resolve()
      }
    })
  })
}
```

- [ ] **Step 8: 实现 addReadLaterCard() 函数**

```typescript
export async function addReadLaterCard(card: ReadLaterCard): Promise<void> {
  const state = await getReadLater()
  state.cards.unshift(card) // 插入到最前面
  await saveReadLater(state)
}
```

- [ ] **Step 9: 实现 deleteReadLaterCard() 函数**

```typescript
export async function deleteReadLaterCard(id: string): Promise<void> {
  const state = await getReadLater()
  state.cards = state.cards.filter((c) => c.id !== id)
  await saveReadLater(state)
}
```

- [ ] **Step 10: Commit**

```bash
git add apps/ext/lib/readlater.ts
git commit -m "feat(ext): add readlater storage layer"
```

---

## Task 3: 改造 BucketCards 支持外部数据源和新增卡片

**Files:**
- Modify: `apps/ext/components/BucketCards.tsx`

- [ ] **Step 1: 更新 BucketCardsProps 接口**

将原来的：

```typescript
interface BucketCardsProps {
  cards?: CardItem[]
}
```

替换为：

```typescript
interface CardItem {
  url: string
  title: string
  bg: string
  rotation: number
  offsetX: number
  offsetY: number
}

interface BucketCardsProps {
  cards: CardItem[]
  onAddCard?: () => void
  showAddCard?: boolean
}
```

- [ ] **Step 2: 删除 defaultCards 和相关常量（COLORS, generateCardMetas 等）**

删除以下内容（这些已移到 lib/readlater.ts）：
- `defaultCards` 数组
- `COLORS` 数组
- `RANDOM_SEED`
- `seededRandom` 函数
- `generateCardMetas` 函数

保留卡片尺寸和动画相关常量（CARD_SIZE, CARD_GAP, HOVER_* 等）。

- [ ] **Step 3: 更新组件签名和内部逻辑**

将：

```typescript
export default function BucketCards({
  cards = defaultCards,
}: BucketCardsProps) {
```

改为：

```typescript
export default function BucketCards({
  cards,
  onAddCard,
  showAddCard = false,
}: BucketCardsProps) {
```

删除 `const metas = generateCardMetas(cards.length)` 这行，因为现在每张卡片的视觉属性已在数据中。

- [ ] **Step 4: 更新卡片渲染逻辑**

将原来的：

```typescript
const meta = metas[i]
```

改为直接从 cards 取：

```typescript
const meta = cards[i]
```

- [ ] **Step 5: 在 render 中添加新增卡片逻辑**

在 cards.map 的开头添加一个"新增卡片"的条件渲染。当 `showAddCard=true` 时，渲染一个特殊卡片在第一位：

```typescript
{cards.length === 0 && showAddCard ? (
  <AddCardPlaceholder onAddCard={onAddCard} />
) : (
  cards.map((card, i) => {
    // ... 现有逻辑
  })
)}
```

然后在 cards.map 的最后，当 `showAddCard=true` 时在末尾也渲染一个新增卡片（作为添加按钮）：

```typescript
{showAddCard && (
  <AddCardPlaceholder onAddCard={onAddCard} />
)}
```

添加新增卡片组件定义（放在 BucketCards 函数外部或内部）：

```typescript
function AddCardPlaceholder({ onAddCard }: { onAddCard?: () => void }) {
  return (
    <div
      className="absolute flex flex-col items-center justify-center p-2 rounded-xl border-2 border-dashed border-gray-300 cursor-pointer transition-all duration-300 hover:border-gray-400"
      style={{
        width: CARD_SIZE,
        height: CARD_SIZE,
        background: '#E5E7EB',
        transform: `translateX(${/* 计算位置 */}px) translateY(${/* 计算位置 */}px) rotate(0deg)`,
        zIndex: 0,
      }}
      onClick={onAddCard}
    >
      <span className="text-2xl text-gray-500">+</span>
    </div>
  )
}
```

需要计算新增卡片的位置——新增卡片应始终固定在容器第一个位置（index=0 的位置）。

实际上，由于 `showAddCard` 时需要同时渲染"新增占位卡"在第一个位置 AND 原有卡片，建议的方案是：

```typescript
// 总卡片数 = 原有卡片 + 1（新增占位卡在末尾）
// 如果 showAddCard=true，位置计算时多留一个位置给新增卡片
const totalSlots = cards.length + (showAddCard ? 1 : 0)
```

新增占位卡渲染在 index 0 的位置（使用固定的视觉属性：`bg="#E5E7EB"`, `rotation=0`, `offsetX=0`, `offsetY=0`）。

原有卡片从 index 1 开始往后排列。

修改后的 map 逻辑：

```typescript
const totalSlots = cards.length + (showAddCard ? 1 : 0)

return Array.from({ length: totalSlots }, (_, i) => {
  // 如果是第一个位置且 showAddCard，渲染新增卡片
  if (i === 0 && showAddCard) {
    return (
      <div
        key="add-card"
        className="absolute flex flex-col items-center justify-center p-2 rounded-xl border-2 border-dashed border-gray-300 cursor-pointer transition-all duration-300 hover:border-gray-400"
        style={{
          width: CARD_SIZE,
          height: CARD_SIZE,
          background: '#E5E7EB',
          transform: `translateX(0px) translateY(${HOVER_BLEED_TOP + CARD_OFFSET_Y}px) rotate(0deg)`,
          zIndex: 0,
        }}
        onClick={onAddCard}
      >
        <span className="text-2xl text-gray-500">+</span>
      </div>
    )
  }

  const cardIndex = showAddCard ? i - 1 : i
  const card = cards[cardIndex]
  const meta = card
  // ... 现有渲染逻辑，使用 cardIndex 计算位置
})
```

- [ ] **Step 6: Commit**

```bash
git add apps/ext/components/BucketCards.tsx
git commit -m "refactor(ext): extract defaultCards to readlater storage"
```

---

## Task 4: 改造 ReadLater 组件接入存储

**Files:**
- Modify: `apps/ext/entrypoints/newtab/components/ReadLater.tsx`

- [ ] **Step 1: 更新 ReadLater 组件**

将 `apps/ext/entrypoints/newtab/components/ReadLater.tsx` 的内容替换为：

```typescript
import { useState, useEffect, useCallback } from 'react'
import BucketCards from '@/components/BucketCards'
import { getReadLater, addReadLaterCard, ReadLaterCard } from '@/lib/readlater'

export function ReadLater() {
  const [cards, setCards] = useState<ReadLaterCard[]>([])

  useEffect(() => {
    getReadLater().then((state) => setCards(state.cards))
  }, [])

  const handleAddCard = useCallback(async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab?.url || !tab?.title) return

    // 随机视觉属性
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#F8B500', '#2ECC71', '#E74C3C', '#3498DB', '#9B59B6',
    ]
    const randomBg = colors[Math.floor(Math.random() * colors.length)]
    const randomRotation = Math.floor(Math.random() * 30) - 15
    const randomOffsetX = Math.floor(Math.random() * 40) - 10
    const randomOffsetY = Math.floor(Math.random() * 10) - 5

    const newCard: ReadLaterCard = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      url: tab.url,
      title: tab.title,
      bg: randomBg,
      rotation: randomRotation,
      offsetX: randomOffsetX,
      offsetY: randomOffsetY,
    }

    await addReadLaterCard(newCard)
    setCards((prev) => [newCard, ...prev])
  }, [])

  return (
    <div className="app-card read-later-card p-0!" style={{ height: '80px' }}>
      <BucketCards
        cards={cards}
        showAddCard={true}
        onAddCard={handleAddCard}
      />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/ext/entrypoints/newtab/components/ReadLater.tsx
git commit -m "feat(ext): connect ReadLater to readlater storage"
```

---

## Task 5: 验证

**Files:**
- (无文件变更)

- [ ] **Step 1: 运行 lint 检查**

```bash
cd /Users/nmsn/Studio/armrest && pnpm lint
```

- [ ] **Step 2: 启动扩展开发服务器**

```bash
cd /Users/nmsn/Studio/armrest/apps/ext && pnpm dev
```

- [ ] **Step 3: 手动验证**

1. 打开新标签页，确认 ReadLater 区域显示默认的 14 张卡片（带随机颜色和旋转）
2. 点击第一个"+"新增卡片，确认当前页面被添加为新卡片出现在最前面
3. 刷新页面，确认数据从 `chrome.storage.sync` 正确读取（数据不丢失）

---

## 实施检查清单

- [ ] Task 1: STORAGE_KEYS.READ_LATER 已添加
- [ ] Task 2: lib/readlater.ts 已创建并包含所有 CRUD 函数
- [ ] Task 3: BucketCards 已改造，支持外部数据源和新增卡片
- [ ] Task 4: ReadLater 组件已接入存储
- [ ] Task 5: lint 通过，手动验证通过
