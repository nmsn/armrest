# BucketCards 组件拆分实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将 BucketCards 拆分为 SingleRowBucketCards 和 MultiRowBucketCards 两个独立组件

**Architecture:** 单行组件复用现有水平滚动逻辑，多行组件使用 2-column 网格布局，两个组件完全独立互不影响

**Tech Stack:** React, TypeScript

---

## 文件结构

```
apps/ext/components/
├── SingleRowBucketCards.tsx    # 新建：单行横向滚动
├── MultiRowBucketCards.tsx     # 新建：多行网格布局
└── BucketCards.tsx            # 删除
```

---

## Task 1: 创建 SingleRowBucketCards 组件

**Files:**
- Create: `apps/ext/components/SingleRowBucketCards.tsx`

- [ ] **Step 1: 创建 SingleRowBucketCards.tsx**

从现有 BucketCards.tsx 提取单行逻辑：

```typescript
import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'

interface CardItem {
  id: string
  url: string
  title: string
  bg: string
  rotation: number
  offsetX: number
  offsetY: number
}

interface SingleRowBucketCardsProps {
  cards: CardItem[]
  onAddCard?: () => void
  onDeleteCard?: (id: string) => void
  showAddCard?: boolean
  onCardClick?: (card: CardItem) => void
}

const CARD_SIZE = 80
const CARD_GAP = 60
const CARD_OFFSET_Y = 20
const HOVER_FLOAT_Y = -40
const HOVER_SPREAD_FACTOR = 15
const HOVER_BLEED_TOP = 28
const BOTTOM_CLIP = 0

function getFaviconUrl(url: string): string {
  try {
    if (url.startsWith('#')) return ''
    const domain = new URL(url).origin
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
  } catch {
    return ''
  }
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return url
  }
}

export default function SingleRowBucketCards({
  cards,
  onAddCard,
  onDeleteCard,
  showAddCard = false,
  onCardClick,
}: SingleRowBucketCardsProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const totalSlots = cards.length + (showAddCard ? 1 : 0)

  return (
    <div
      className="relative h-full w-full overflow-visible"
      style={{
        clipPath: `inset(${-HOVER_BLEED_TOP}px 0px ${BOTTOM_CLIP}px 0px round var(--ds-r2))`,
      }}
    >
      <div
        className="absolute left-0 right-0 bottom-0 overflow-y-hidden scrollbar-hide"
        style={{ top: -HOVER_BLEED_TOP }}
      >
        <div
          className="relative"
          style={{
            width: totalSlots * CARD_GAP + 100,
            height: `calc(100% + ${HOVER_BLEED_TOP}px)`,
          }}
        >
          {Array.from({ length: totalSlots }, (_, i) => {
            if (i === 0 && showAddCard) {
              const isAddHovered = hoveredIndex === -1
              const distance = hoveredIndex !== null ? Math.abs(i - hoveredIndex) : 0
              const spread = hoveredIndex !== null ? distance * HOVER_SPREAD_FACTOR : 0
              const direction = i > hoveredIndex! ? 1 : -1

              const translateX = 0 + (isAddHovered ? 0 : spread * direction)
              const translateY = HOVER_BLEED_TOP + CARD_OFFSET_Y + (isAddHovered ? HOVER_FLOAT_Y : 0)
              const zIndex = isAddHovered ? 99 : 0

              return (
                <div
                  key="add-card"
                  className="absolute flex flex-col items-center justify-center p-2 rounded-xl border-2 border-dashed border-gray-300 cursor-pointer transition-all duration-300 hover:border-gray-400"
                  style={{
                    width: CARD_SIZE,
                    height: CARD_SIZE,
                    background: '#E5E7EB',
                    transform: `translateX(${translateX}px) translateY(${translateY}px)`,
                    boxShadow: isAddHovered ? '0 12px 32px rgba(0,0,0,0.2)' : '0 4px 12px rgba(0,0,0,0.12)',
                    zIndex,
                  }}
                  onClick={onAddCard}
                  onMouseEnter={() => setHoveredIndex(-1)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <span className="text-2xl text-gray-500">+</span>
                </div>
              )
            }

            const cardIndex = showAddCard ? i - 1 : i
            const card = cards[cardIndex]
            const meta = card
            const baseOffset = cardIndex * CARD_GAP
            const isHovered = hoveredIndex === cardIndex

            const distance = hoveredIndex !== null ? Math.abs(cardIndex - hoveredIndex) : 0
            const spread = hoveredIndex !== null ? distance * HOVER_SPREAD_FACTOR : 0
            const direction = cardIndex > hoveredIndex! ? 1 : -1

            const translateX = baseOffset + meta.offsetX + (isHovered ? 0 : spread * direction)
            const translateY = HOVER_BLEED_TOP + CARD_OFFSET_Y + meta.offsetY + (isHovered ? HOVER_FLOAT_Y : 0)
            const rotation = isHovered ? 0 : meta.rotation
            const zIndex = isHovered ? 99 : cardIndex

            return (
              <ContextMenu key={cardIndex}>
                <ContextMenuTrigger asChild>
                  <div
                    className="absolute flex flex-col items-center justify-between p-2 rounded-xl border border-black/10 cursor-pointer transition-all duration-300 gap-1"
                    style={{
                      width: CARD_SIZE,
                      height: CARD_SIZE,
                      background: meta.bg,
                      transform: `translateX(${translateX}px) translateY(${translateY}px) rotate(${rotation}deg)`,
                      boxShadow: isHovered ? '0 12px 32px rgba(0,0,0,0.2)' : '0 4px 12px rgba(0,0,0,0.12)',
                      zIndex,
                    }}
                    onClick={() => onCardClick?.(card)}
                    onMouseEnter={() => setHoveredIndex(cardIndex)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {getFaviconUrl(card.url) && (
                      <img src={getFaviconUrl(card.url)} alt="" className="w-5 h-5 mt-1" />
                    )}
                    <div className="flex flex-col items-center flex-1 justify-center min-w-0">
                      <div className="font-medium text-[#1a1a1a] text-center leading-tight text-[10px] line-clamp-2">
                        {card.title}
                      </div>
                      <div className="text-[8px] text-[#1a1a1a]/60 truncate max-w-full mt-0.5">
                        {getDomain(card.url)}
                      </div>
                    </div>
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem
                    onClick={() => onDeleteCard?.(card.id)}
                    className="text-red-500 focus:text-red-500"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    删除
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            )
          })}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add apps/ext/components/SingleRowBucketCards.tsx
git commit -m "feat(ext): create SingleRowBucketCards component"
```

---

## Task 2: 创建 MultiRowBucketCards 组件

**Files:**
- Create: `apps/ext/components/MultiRowBucketCards.tsx`

- [ ] **Step 1: 创建 MultiRowBucketCards.tsx**

多行网格布局组件：

```typescript
import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'

interface CardItem {
  id: string
  url: string
  title: string
  bg: string
  rotation: number
  offsetX: number
  offsetY: number
}

interface MultiRowBucketCardsProps {
  cards: CardItem[]
  columns?: number
  columnGap?: number
  overflowClip?: number
  onCardClick?: (card: CardItem) => void
}

const CARD_SIZE = 80
const CARD_GAP = 60
const CARD_OFFSET_Y = 20
const HOVER_FLOAT_Y = -40
const HOVER_SPREAD_FACTOR = 15
const HOVER_BLEED_TOP = 28
const COLUMN_OFFSET_Y = 30

function getFaviconUrl(url: string): string {
  try {
    if (url.startsWith('#')) return ''
    const domain = new URL(url).origin
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
  } catch {
    return ''
  }
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return url
  }
}

function getCardPosition(index: number, columns: number, columnGap: number) {
  const col = index % columns
  const row = Math.floor(index / columns)
  const x = col * CARD_GAP
  const y = row * (CARD_SIZE + columnGap) + (row > 0 ? -COLUMN_OFFSET_Y : 0)
  return { x, y, row, col }
}

export default function MultiRowBucketCards({
  cards,
  columns = 2,
  columnGap = 40,
  overflowClip = 30,
  onCardClick,
}: MultiRowBucketCardsProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const totalCards = cards.length

  const maxRow = Math.ceil(totalCards / columns)
  const containerHeight = maxRow * (CARD_SIZE + columnGap) - columnGap + overflowClip

  return (
    <div
      className="relative h-full w-full overflow-visible"
      style={{
        clipPath: `inset(${HOVER_BLEED_TOP}px 0px ${overflowClip}px 0px round var(--ds-r2))`,
      }}
    >
      <div
        className="absolute left-0 right-0 bottom-0 overflow-y-hidden scrollbar-hide"
        style={{ top: -HOVER_BLEED_TOP }}
      >
        <div
          className="relative"
          style={{
            width: columns * CARD_GAP + 100,
            height: containerHeight + HOVER_BLEED_TOP,
          }}
        >
          {cards.map((card, index) => {
            const meta = card
            const isHovered = hoveredIndex === index

            const distance = hoveredIndex !== null ? Math.abs(index - hoveredIndex) : 0
            const spread = hoveredIndex !== null ? distance * HOVER_SPREAD_FACTOR : 0

            const currentPos = getCardPosition(index, columns, columnGap)
            const hoverPos = hoveredIndex !== null ? getCardPosition(hoveredIndex, columns, columnGap) : null

            const direction = index > hoveredIndex! ? 1 : -1
            const spreadX = spread * direction

            let spreadY = 0
            if (hoverPos) {
              const rowDiff = currentPos.row - hoverPos.row
              spreadY = rowDiff * HOVER_SPREAD_FACTOR * 0.5
            }

            const translateX = currentPos.x + meta.offsetX + spreadX
            const translateY = HOVER_BLEED_TOP + CARD_OFFSET_Y + meta.offsetY + (isHovered ? HOVER_FLOAT_Y : 0) + spreadY
            const rotation = isHovered ? 0 : meta.rotation
            const zIndex = isHovered ? 99 : index

            return (
              <ContextMenu key={card.id}>
                <ContextMenuTrigger asChild>
                  <div
                    className="absolute flex flex-col items-center justify-between p-2 rounded-xl border border-black/10 cursor-pointer transition-all duration-300 gap-1"
                    style={{
                      width: CARD_SIZE,
                      height: CARD_SIZE,
                      background: meta.bg,
                      transform: `translateX(${translateX}px) translateY(${translateY}px) rotate(${rotation}deg)`,
                      boxShadow: isHovered ? '0 12px 32px rgba(0,0,0,0.2)' : '0 4px 12px rgba(0,0,0,0.12)',
                      zIndex,
                    }}
                    onClick={() => onCardClick?.(card)}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {getFaviconUrl(card.url) && (
                      <img src={getFaviconUrl(card.url)} alt="" className="w-5 h-5 mt-1" />
                    )}
                    <div className="flex flex-col items-center flex-1 justify-center min-w-0">
                      <div className="font-medium text-[#1a1a1a] text-center leading-tight text-[10px] line-clamp-2">
                        {card.title}
                      </div>
                      <div className="text-[8px] text-[#1a1a1a]/60 truncate max-w-full mt-0.5">
                        {getDomain(card.url)}
                      </div>
                    </div>
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem className="text-red-500 focus:text-red-500">
                    <Trash2 className="w-4 h-4 mr-2" />
                    删除
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            )
          })}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add apps/ext/components/MultiRowBucketCards.tsx
git commit -m "feat(ext): create MultiRowBucketCards component"
```

---

## Task 3: 更新 ReadLater 使用 SingleRowBucketCards

**Files:**
- Modify: `apps/ext/entrypoints/newtab/components/ReadLater.tsx:2`

- [ ] **Step 1: 更新导入**

将 `import BucketCards from '@/components/BucketCards'` 改为 `import SingleRowBucketCards from '@/components/SingleRowBucketCards'`

- [ ] **Step 2: 更新组件使用**

将 `<BucketCards` 改为 `<SingleRowBucketCards`

- [ ] **Step 3: 提交**

```bash
git add apps/ext/entrypoints/newtab/components/ReadLater.tsx
git commit -m "refactor(ext): use SingleRowBucketCards in ReadLater"
```

---

## Task 4: 更新 WordCard 使用 MultiRowBucketCards

**Files:**
- Modify: `apps/ext/entrypoints/newtab/components/WordCard.tsx:5`

- [ ] **Step 1: 更新导入**

将 `import BucketCards from '@/components/BucketCards'` 改为 `import MultiRowBucketCards from '@/components/MultiRowBucketCards'`

- [ ] **Step 2: 更新组件使用**

将 `<BucketCards cards={cards.map(toCardItem)} ...` 改为 `<MultiRowBucketCards cards={cards.map(toCardItem)} ...`

- [ ] **Step 3: 提交**

```bash
git add apps/ext/entrypoints/newtab/components/WordCard.tsx
git commit -m "refactor(ext): use MultiRowBucketCards in WordCard"
```

---

## Task 5: 删除旧的 BucketCards.tsx

**Files:**
- Delete: `apps/ext/components/BucketCards.tsx`

- [ ] **Step 1: 删除文件**

```bash
git rm apps/ext/components/BucketCards.tsx
git commit -m "refactor(ext): remove old BucketCards (replaced by SingleRow and MultiRow variants)"
```

---

## 验证清单

- [ ] ReadLater 单行横向滚动正常工作
- [ ] WordCard 两排网格布局正常显示
- [ ] 悬停动画效果正确
- [ ] 点击卡片弹窗正常

---

## 实现顺序

1. Task 1 - 创建 SingleRowBucketCards
2. Task 2 - 创建 MultiRowBucketCards
3. Task 3 - 更新 ReadLater
4. Task 4 - 更新 WordCard
5. Task 5 - 删除旧 BucketCards