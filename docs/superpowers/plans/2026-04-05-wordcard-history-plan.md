# WordCard 查词历史功能实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 WordCard 改造成两排单词历史卡片布局，支持悬停动画和弹窗详情

**Architecture:**
- 扩展 BucketCards 支持多行布局和跨排动画
- 新建 wordhistory.ts 处理本地存储和每日清除
- 新建 WordDetailDialog 复用 Dialog 组件展示单词详情
- WordCard 作为容器整合所有组件

**Tech Stack:** React, TypeScript, chrome.storage.local, Radix UI Dialog

---

## 文件结构

```
apps/ext/
├── components/
│   └── BucketCards.tsx          # 修改：支持多行
├── lib/
│   ├── constants.ts             # 修改：添加 WORD_HISTORY key
│   └── wordhistory.ts           # 新建：存储和清除逻辑
└── entrypoints/newtab/components/
    ├── WordCard.tsx             # 修改：整合新组件
    └── WordDetailDialog.tsx     # 新建：单词详情弹窗
```

---

## Task 1: 添加存储 Key

**Files:**
- Modify: `apps/ext/lib/constants.ts:11-16`

- [ ] **Step 1: 添加 WORD_HISTORY 到 STORAGE_KEYS**

在 `STORAGE_KEYS` 对象中添加 `WORD_HISTORY: 'armrest_word_history'`

```typescript
const STORAGE_KEYS = {
  BOOKMARKS: 'armrest_bookmarks',
  THEME: 'armrest-theme-config',
  DAILY_DATA: 'armrest-daily-data',
  READ_LATER: 'armrest_readlater',
  WORD_HISTORY: 'armrest_word_history',  // 新增
} as const
```

- [ ] **Step 2: 提交**

```bash
git add apps/ext/lib/constants.ts
git commit -m "feat(ext): add WORD_HISTORY storage key"
```

---

## Task 2: 创建 wordhistory.ts 存储模块

**Files:**
- Create: `apps/ext/lib/wordhistory.ts`

- [ ] **Step 1: 创建 wordhistory.ts**

```typescript
import { STORAGE_KEYS } from './constants'

export interface WordHistoryItem {
  id: string
  word: string
  phonetic: string
  meaning: string
  searchedAt: number
}

export interface WordHistoryState {
  cards: WordHistoryItem[]
  lastClearDate: string  // 格式: 'YYYY-MM-DD'
}

const STORAGE_KEY = STORAGE_KEYS.WORD_HISTORY

export async function getWordHistory(): Promise<WordHistoryState> {
  return new Promise((resolve) => {
    chrome.storage.local.get(STORAGE_KEY, (result) => {
      const data = result[STORAGE_KEY] as WordHistoryState | undefined
      if (!data) {
        resolve({ cards: [], lastClearDate: getTodayDate() })
      } else {
        resolve(data)
      }
    })
  })
}

export async function saveWordHistory(state: WordHistoryState): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [STORAGE_KEY]: state }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError)
      } else {
        resolve()
      }
    })
  })
}

export async function addWordHistory(item: WordHistoryItem): Promise<void> {
  const state = await getWordHistory()

  // 检查是否已存在相同单词
  const existingIndex = state.cards.findIndex(c => c.word === item.word)
  if (existingIndex !== -1) {
    // 更新已存在的单词（移到最前面）
    state.cards.splice(existingIndex, 1)
  }

  state.cards.unshift(item)

  // 限制最多保存 50 条
  if (state.cards.length > 50) {
    state.cards = state.cards.slice(0, 50)
  }

  await saveWordHistory(state)
}

export async function clearWordHistory(): Promise<void> {
  await saveWordHistory({ cards: [], lastClearDate: getTodayDate() })
}

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0]
}

export function shouldClearHistory(state: WordHistoryState): boolean {
  const today = getTodayDate()
  return state.lastClearDate !== today
}

export async function checkAndClearIfNeeded(): Promise<void> {
  const state = await getWordHistory()
  if (shouldClearHistory(state)) {
    await clearWordHistory()
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add apps/ext/lib/wordhistory.ts
git commit -m "feat(ext): add word history storage with daily cleanup"
```

---

## Task 3: 扩展 BucketCards 支持多行布局

**Files:**
- Modify: `apps/ext/components/BucketCards.tsx`

- [ ] **Step 1: 添加新 Props 类型**

在文件顶部添加：

```typescript
interface CardItem {
  id: string
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
  onDeleteCard?: (id: string) => void
  showAddCard?: boolean
  columns?: number        // 新增：行数，默认 1
  columnGap?: number       // 新增：行间距，默认 60
  overflowClip?: number     // 新增：底部裁剪量，默认 0
  onCardClick?: (card: CardItem) => void  // 新增
}
```

- [ ] **Step 2: 添加新常量**

```typescript
// 多排模式参数
const COLUMN_OFFSET_Y = 30  // 第二排相对第一排上移的量
```

- [ ] **Step 3: 修改组件签名和默认值**

```typescript
export default function BucketCards({
  cards,
  onAddCard,
  onDeleteCard,
  showAddCard = false,
  columns = 1,              // 默认单排
  columnGap = 60,
  overflowClip = 0,
  onCardClick,
}: BucketCardsProps)
```

- [ ] **Step 4: 修改布局计算逻辑**

将现有的单排横向布局改为多排网格布局。在 `totalSlots` 计算后添加：

```typescript
// 多排布局计算
const ROW_SIZE = CARD_SIZE + columnGap
const containerHeight = columns * ROW_SIZE - columnGap + overflowClip

// 计算卡片位置
function getCardPosition(index: number, totalSlots: number) {
  const row = Math.floor(index / columns)
  const col = index % columns
  const x = col * CARD_GAP
  const y = row * (CARD_SIZE + columnGap) + (row > 0 ? -COLUMN_OFFSET_Y : 0)
  return { x, y, row }
}
```

- [ ] **Step 5: 修改悬停动画逻辑以支持跨排影响**

替换现有的 `translateX` 和 `translateY` 计算逻辑：

```typescript
// 悬停时计算散开效果（支持跨排）
const distance = hoveredIndex !== null ? Math.abs(cardIndex - hoveredIndex) : 0
const spread = hoveredIndex !== null ? distance * HOVER_SPREAD_FACTOR : 0

// 计算方向：同排内水平散开，跨排沿排方向
const currentPos = getCardPosition(cardIndex, totalSlots)
const hoverPos = getCardPosition(hoveredIndex, totalSlots)

const rowDiff = currentPos.row - hoverPos.row
const colDiff = Math.abs(currentPos.x - hoverPos.x)

// 水平散开（沿 x 轴）
const direction = cardIndex > hoveredIndex! ? 1 : -1
const spreadX = spread * direction

// 垂直散开（跨排时）
const spreadY = rowDiff * HOVER_SPREAD_FACTOR * 0.5  // 跨排影响减半

const translateX = currentPos.x + meta.offsetX + spreadX
const translateY = HOVER_BLEED_TOP + CARD_OFFSET_Y + meta.offsetY +
  (isHovered ? HOVER_FLOAT_Y : 0) + spreadY
```

- [ ] **Step 6: 修改容器尺寸**

替换原有的 `width` 和 `height` 计算：

```typescript
// 单排模式保持原有计算
const width = columns === 1 ? totalSlots * CARD_GAP + 100 : columns * CARD_GAP + 100

// 容器高度根据排数计算
const height = columns === 1
  ? `calc(100% + ${HOVER_BLEED_TOP}px)`
  : containerHeight + HOVER_BLEED_TOP

style={{
  width,
  height,
  // ...
}}
```

- [ ] **Step 7: 添加 overflow-hidden 到容器**

在根容器添加 `overflow-hidden` 以裁剪底部：

```typescript
className="relative h-full w-full overflow-hidden"
style={{
  clipPath: columns > 1
    ? `inset(${HOVER_BLEED_TOP}px 0px ${overflowClip}px 0px round var(--ds-r2))`
    : `inset(${-HOVER_BLEED_TOP}px 0px ${BOTTOM_CLIP}px 0px round var(--ds-r2))`,
}}
```

- [ ] **Step 8: 添加点击回调**

在卡片的 `onClick` 中添加：

```typescript
onClick={() => onCardClick?.(card)}
```

- [ ] **Step 9: 提交**

```bash
git add apps/ext/components/BucketCards.tsx
git commit -m "feat(ext): extend BucketCards for multi-row layout"
```

---

## Task 4: 创建 WordDetailDialog 组件

**Files:**
- Create: `apps/ext/entrypoints/newtab/components/WordDetailDialog.tsx`

- [ ] **Step 1: 创建 WordDetailDialog.tsx**

```typescript
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { WordHistoryItem } from '@/lib/wordhistory'

interface WordDetailDialogProps {
  isOpen: boolean
  onClose: () => void
  word: WordHistoryItem | null
}

export function WordDetailDialog({ isOpen, onClose, word }: WordDetailDialogProps) {
  if (!word) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-foreground">
            {word.word}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-lg text-muted-foreground">
            {word.phonetic}
          </div>
          <div className="text-sm text-foreground leading-relaxed">
            {word.meaning}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add apps/ext/entrypoints/newtab/components/WordDetailDialog.tsx
git commit -m "feat(ext): add WordDetailDialog component"
```

---

## Task 5: 重构 WordCard 组件

**Files:**
- Modify: `apps/ext/entrypoints/newtab/components/WordCard.tsx`

- [ ] **Step 1: 重写 WordCard.tsx**

```typescript
import { useState, useEffect, useCallback } from 'react'
import { SearchIcon } from '@/components/ui/saerch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import BucketCards from '@/components/BucketCards'
import { WordDetailDialog } from './WordDetailDialog'
import {
  getWordHistory,
  addWordHistory,
  checkAndClearIfNeeded,
  type WordHistoryItem,
} from '@/lib/wordhistory'

// 转换 WordHistoryItem 为 BucketCards 需要的 CardItem 格式
function toCardItem(word: WordHistoryItem, index: number) {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  ]
  return {
    id: word.id,
    url: `#word-${word.word}`,  // 占位，实际不跳转
    title: word.word,
    bg: colors[index % colors.length],
    rotation: 0,
    offsetX: 0,
    offsetY: 0,
  }
}

export function WordCard() {
  const [word, setWord] = useState('')
  const [cards, setCards] = useState<WordHistoryItem[]>([])
  const [selectedWord, setSelectedWord] = useState<WordHistoryItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // 初始化：检查并清除过期历史
  useEffect(() => {
    checkAndClearIfNeeded()
    getWordHistory().then((state) => setCards(state.cards))
  }, [])

  const handleLookup = useCallback(async () => {
    if (!word.trim()) return

    const newWord: WordHistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      word: word.trim(),
      phonetic: `/${word.trim().slice(0, 3)}./`,
      meaning: 'Definition for this word...',
      searchedAt: Date.now(),
    }

    await addWordHistory(newWord)
    setCards((prev) => [newWord, ...prev.filter(c => c.word !== newWord.word)])
    setWord('')
  }, [word])

  const handleCardClick = useCallback((card: { id: string }) => {
    const found = cards.find((c) => c.id === card.id)
    if (found) {
      setSelectedWord(found)
      setIsDialogOpen(true)
    }
  }, [cards])

  return (
    <div className="app-card h-full flex flex-col">
      <div className="app-card-header">
        <span className="app-card-title">Word Lookup</span>
      </div>
      <div className="flex gap-2 mb-3">
        <Input
          value={word}
          onChange={(e) => setWord(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
          placeholder="Search a word..."
          className="h-9 text-xs bg-background border-border focus:border-accent"
        />
        <Button
          size="sm"
          variant="outline"
          onClick={handleLookup}
          className="h-9 px-3 text-xs border-border hover:border-accent/50"
        >
          <SearchIcon className="w-3.5 h-3.5" />
        </Button>
      </div>
      <div className="flex-1 overflow-hidden">
        <BucketCards
          cards={cards.map(toCardItem)}
          columns={2}
          columnGap={40}
          overflowClip={30}
          onCardClick={handleCardClick}
        />
      </div>

      <WordDetailDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        word={selectedWord}
      />
    </div>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add apps/ext/entrypoints/newtab/components/WordCard.tsx
git commit -m "feat(ext): refactor WordCard with two-row history cards"
```

---

## 验证清单

- [ ] 两排卡片正确显示，第一排在上，第二排上移重叠
- [ ] 悬停卡片上浮，相邻卡片水平散开
- [ ] 跨排影响：悬停第一排卡片时，第二排也受影响
- [ ] 点击卡片弹出 Dialog 显示单词详情
- [ ] 刷新页面后历史记录保持
- [ ] 第二天访问时历史自动清除

---

## 实现顺序

1. Task 1 - 添加存储 Key
2. Task 2 - 创建 wordhistory.ts
3. Task 3 - 扩展 BucketCards
4. Task 4 - 创建 WordDetailDialog
5. Task 5 - 重构 WordCard