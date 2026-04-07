# MultiRowBucketCards 排列方式修改设计

## 目标

修改 `MultiRowBucketCards` 组件的卡片排列方式，实现从下往上堆叠的布局，同时保留所有现有定位、动画、偏移效果。

## 需求

1. 最多显示9张卡片
2. 卡片从下往上排列（第1行底部 → 第2行上方 → 第3行顶部）
3. 保留所有现有效果：
   - `offsetX` / `offsetY` 偏移
   - `rotation` 旋转
   - `getSpreadOffset` 悬停扩散动画
   - `CARD_OVERLAP_X` / `ROW_OFFSET_Y` 层叠效果
   - `zIndex` 层级
   - hover 缩放和阴影动画

## 设计方案

### 实现方式：数据预处理 + Flexbox column-reverse

**步骤：**

1. **数据截取**：取前9张卡片 `displayCards = cards.slice(0, 9)`

2. **按行分组**：
   ```
   row1 = [cards[0], cards[1], cards[2]]   // 底部行
   row2 = [cards[3], cards[4], cards[5]]   // 中间行
   row3 = [cards[6], cards[7], cards[8]]  // 顶部行
   ```

3. **反转行顺序**：`rows = [row1, row2, row3]`（render 时 row1 在底部，row3 在顶部）

4. **Flexbox column-reverse 布局**：
   - 外层容器：`flex flex-col-reverse justify-end gap-2`
   - 内层每行：`flex justify-center gap-2`

5. **渲染**：遍历 `rows`，每个 row 内遍历卡片，保持现有 transform 逻辑不变

### 代码改动

```tsx
// 数据预处理
const displayCards = cards.slice(0, 9)
const columns = 3
const rowCount = Math.ceil(displayCards.length / columns)

// 按行分组
const rows: CardItem[][] = []
for (let i = 0; i < rowCount; i++) {
  rows.push(displayCards.slice(i * columns, (i + 1) * columns))
}

// rows[0] 渲染在底部，rows[rows.length-1] 渲染在顶部
```

```tsx
// 布局
<div className="flex flex-col-reverse justify-end gap-2 h-full">
  {rows.map((row, rowIndex) => (
    <div key={rowIndex} className="flex justify-center gap-2 w-full">
      {row.map((card, cardIndex) => {
        const originalIndex = rows.slice(0, rowIndex).reduce((acc, r) => acc + r.length, 0) + cardIndex
        // ... 保持原有 transform 逻辑
      })}
    </div>
  ))}
</div>
```

## 不修改的内容

- 所有 animation constants（`SCALE_HOVERED`, `SCALE_DEFAULT`, `HOVER_TRANSLATE_Y`, `SPREAD_*`, `CARD_OVERLAP_X`, `ROW_OFFSET_Y`, `TRANSITION_TIMING`）
- `getSpreadOffset` 函数
- transform 样式构建逻辑
- z-index 计算逻辑
- hover 事件处理

## 验证

- 1张卡片：显示在左下角
- 3张卡片：底部一行3张
- 4张卡片：底部3张，顶部1张
- 9张卡片：底部3张，中间3张，顶部3张
- 超过9张：只显示前9张
