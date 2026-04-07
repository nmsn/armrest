# MultiRowBucketCards 排列方式修改实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修改 `MultiRowBucketCards` 组件，实现从下往上堆叠的卡片排列，最多显示9张，保留所有现有动画和偏移效果

**Architecture:** 使用 Flexbox `flex-col-reverse` 布局 + 数据预处理（按行分组），所有现有 transform、offset、animation 逻辑保持不变

**Tech Stack:** React, Tailwind CSS, TypeScript

---

## 修改文件

- `apps/ext/components/MultiRowBucketCards.tsx` — 唯一需要修改的文件

---

## 实施步骤

### Task 1: 数据预处理（截取9张卡片 + 按行分组）

**文件:** `apps/ext/components/MultiRowBucketCards.tsx`

- [ ] **Step 1: 添加数据预处理逻辑**

在组件内部、`return` 之前添加：

```tsx
// 限制最多显示9张卡片
const displayCards = cards.slice(0, 9)

// 每行3列
const columns = 3
const rowCount = Math.ceil(displayCards.length / columns)

// 按行分组（row1=底部, row2=中间, row3=顶部）
const rows: CardItem[][] = []
for (let i = 0; i < rowCount; i++) {
  rows.push(displayCards.slice(i * columns, (i + 1) * columns))
}
```

### Task 2: 修改布局容器为 Flexbox column-reverse

**文件:** `apps/ext/components/MultiRowBucketCards.tsx:81-82`

- [ ] **Step 1: 替换 Grid 容器为 Flexbox**

找到：
```tsx
<div
  className="grid w-full h-full"
  style={{
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gridTemplateRows: 'repeat(3, 1fr)',
    gap: '8px',
    padding: '16px',
  }}
>
```

替换为：
```tsx
<div
  className="flex flex-col-reverse justify-end gap-2 h-full px-4 pb-4"
>
```

### Task 3: 修改卡片渲染逻辑（按行遍历）

**文件:** `apps/ext/components/MultiRowBucketCards.tsx:91-145`

- [ ] **Step 1: 替换 cards.map 为 rows.map**

找到：
```tsx
{cards.map((card, index) => {
  const meta = card
  const isHovered = hoveredIndex === index
  const col = index % columns
  const spread = getSpreadOffset(index, hoveredIndex, columns)
  ...
```

替换为：
```tsx
{rows.map((row, rowIndex) => (
  <div key={rowIndex} className="flex justify-center gap-2 w-full">
    {row.map((card, cardIndex) => {
      // 计算原始 index 用于 hover 和 spread 计算
      const originalIndex = rows.slice(0, rowIndex).reduce((acc, r) => acc + r.length, 0) + cardIndex
      const isHovered = hoveredIndex === originalIndex
      const spread = getSpreadOffset(originalIndex, hoveredIndex, columns)

      return (
        <ContextMenu key={card.id}>
          <ContextMenuTrigger asChild>
            <div
              className="flex flex-col items-center justify-between p-2 rounded-xl border border-black/10 cursor-pointer"
              style={{
                background: card.bg,
                transform: `
                  scale(${isHovered ? SCALE_HOVERED : SCALE_DEFAULT})
                  rotate(${card.rotation}deg)
                  translate(calc(${card.offsetX}px + ${spread.x}px), calc(${card.offsetY}px + ${spread.y}px))
                `,
                transformOrigin: 'center center',
                boxShadow: isHovered
                  ? '0 20px 40px rgba(0,0,0,0.25)'
                  : '0 4px 12px rgba(0,0,0,0.12)',
                zIndex: isHovered ? 99 : originalIndex,
                marginLeft: cardIndex === 0 ? '0' : CARD_OVERLAP_X,
                marginTop: rowIndex === 0 ? '0' : ROW_OFFSET_Y,
                transition: `transform ${TRANSITION_TIMING}, box-shadow 0.3s ease`,
              }}
              onClick={() => onCardClick?.(card)}
              onMouseEnter={() => setHoveredIndex(originalIndex)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {getFaviconUrl(card.url) && (
                <img src={getFaviconUrl(card.url)} alt="" className="w-5 h-5 mt-1" />
              )}
              <div className="flex flex-col items-center flex-1 justify-center min-w-0 w-full px-1">
                <div className="font-medium text-[#1a1a1a] text-center leading-tight text-[10px] line-clamp-2">
                  {card.title}
                </div>
                <div className="text-[8px] text-[#1a1a1a]/60 truncate max-w-full">
                  {card.phonetic}
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
))}
```

### Task 4: 移除 columns prop 默认值（固定为3）

**文件:** `apps/ext/components/MultiRowBucketCards.tsx:75`

- [ ] **Step 1: 删除 columns prop（内部已固定为3）**

删除或注释掉 `MultiRowBucketCardsProps` 中的 `columns` 参数，或保留但不使用。

---

## 验证清单

- [ ] 1张卡片：显示在左下角
- [ ] 3张卡片：底部一行3张
- [ ] 4张卡片：底部3张，顶部1张
- [ ] 9张卡片：底部3张，中间3张，顶部3张
- [ ] 超过9张：只显示前9张
- [ ] hover 动画正常（扩散效果、缩放、阴影）
- [ ] 卡片偏移 `offsetX`/`offsetY` 正常
- [ ] 卡片旋转 `rotation` 正常
- [ ] 右键菜单正常
