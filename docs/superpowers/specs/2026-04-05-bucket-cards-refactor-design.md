# BucketCards 组件拆分设计

## 概述

将 BucketCards 拆分为两个独立组件，解决多行布局与单行布局的冲突。

## 问题

当前 BucketCards 通过 `columns` 属性同时支持单行和多行，但两种布局算法相互干扰：
- 单行模式：需要横向排列
- 多行模式：需要 2-column 网格布局
- `getCardPosition` 的计算在两种模式下不兼容

## 解决方案

拆分两个独立组件：

### 1. SingleRowBucketCards（单行横向滚动）

**用途**：ReadLater 等需要横向滚动单行展示的场景

**Props**：
```typescript
interface SingleRowBucketCardsProps {
  cards: CardItem[]
  onAddCard?: () => void
  onDeleteCard?: (id: string) => void
  showAddCard?: boolean
  onCardClick?: (card: CardItem) => void
}
```

**布局**：
- 横向排列，index * CARD_GAP 计算 x 位置
- y = 0 固定
- 容器 overflow-x-auto（父组件控制）

### 2. MultiRowBucketCards（多行网格布局）

**用途**：WordCard 等需要多行网格展示的场景

**Props**：
```typescript
interface MultiRowBucketCardsProps {
  cards: CardItem[]
  columns?: number  // 默认 2
  columnGap?: number
  overflowClip?: number
  onCardClick?: (card: CardItem) => void
}
```

**布局**：
- 固定列数（columns=2）
- col = index % columns
- row = Math.floor(index / columns)
- x = col * CARD_GAP
- y = row * (CARD_SIZE + columnGap)

## 文件结构

```
apps/ext/components/
├── SingleRowBucketCards.tsx   # 新建：单行组件
├── MultiRowBucketCards.tsx    # 新建：多行组件
└── BucketCards.tsx            # 删除（或保留作为 wrapper）
```

## 实现步骤

1. 创建 SingleRowBucketCards.tsx（从现有 BucketCards 提取单行逻辑）
2. 创建 MultiRowBucketCards.tsx（新的多行网格布局）
3. 更新 ReadLater.tsx 使用 SingleRowBucketCards
4. 更新 WordCard.tsx 使用 MultiRowBucketCards
5. 删除 BucketCards.tsx