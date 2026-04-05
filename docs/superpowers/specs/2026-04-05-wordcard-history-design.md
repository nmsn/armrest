# WordCard 查词历史功能设计

## 概述

将 WordCard 下方展示区域改为两排单词历史卡片，采用扑克牌式堆叠布局，支持悬停动画和弹窗详情。

## 布局结构

```
┌─────────────────────────────┐
│  [输入框]  [搜索按钮]       │  ← 顶部搜索栏
├─────────────────────────────┤
│  ┌───┐ ┌───┐ ┌───┐         │  ← 第一排 (y=0)
│  └───┘ └───┘ └───┘ ┌───┐   │  ← 第二排 (y=-30px, 底部被裁剪)
│                    └───┘   │
└─────────────────────────────┘
```

- **第一排**：正常展示，y=0
- **第二排**：往上偏移 30px，与第一排底部重叠
- **第二排底部**：被容器底部裁剪，模拟扑克牌堆叠效果
- **容器**：固定高度，overflow-hidden 裁剪

## BucketCards 改造

### 新增 Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `columns` | `number` | `1` | 行数（多排模式） |
| `columnGap` | `number` | `60` | 行间距（px） |
| `overflowClip` | `number` | `0` | 底部裁剪量（px） |
| `onCardClick` | `(card: CardItem) => void` | - | 卡片点击回调 |

### 布局计算

```
totalHeight = CARD_SIZE + columnGap
containerHeight = totalHeight * columns - columnGap + overflowClip
```

### 多行动画逻辑

1. **悬停检测**：根据鼠标位置判断悬停在哪张卡片
2. **距离计算**：
   - 同排内距离：水平距离差
   - 跨排距离：水平距离 + 排数差 * columnGap
3. **散开方向**：
   - 同排：水平散开
   - 不同排：水平 + 垂直（沿排方向）
4. **zIndex**：悬停卡片置顶

### 单排 vs 多排行为差异

| 场景 | 单排 | 多排 |
|------|------|------|
| 悬停上浮 | translateY 上移 | 同排内上浮 |
| 相邻散开 | 水平散开 | 同排水平散开 |
| 跨排影响 | 无 | 第二排整体受第一排影响 |

## 数据存储

### 存储结构

```typescript
interface WordHistoryItem {
  id: string
  word: string
  phonetic: string
  meaning: string
  searchedAt: number // timestamp
}

interface WordHistoryStore {
  cards: WordHistoryItem[]
}
```

### 存储位置

- `chrome.storage.local`
- Key: `word_history`

### 定时清除

- 每天凌晨 12:00 自动清除所有记录
- 使用 `chrome.alarms` API 或页面加载时检查日期

## 弹窗详情

### 组件复用

- 复用现有 `Dialog` 组件（来自 `@/components/ui/dialog`）

### 弹窗内容

| 字段 | 样式 |
|------|------|
| 单词 | 大字、加粗 |
| 音标 | 中等字号、灰色 |
| 解释 | 常规字号、可换行 |

### 交互

- 点击卡片：打开弹窗
- 点击背景 / 关闭按钮：关闭弹窗
- 弹窗打开时记录该卡片为"已查看"（可选）

## 组件结构

```
WordCard
├── SearchBar (输入框 + 搜索按钮)
└── BucketCards (多排单词卡片)
    └── WordHistoryCard (点击 → Dialog)
```

## 实现步骤

1. 扩展 BucketCards 支持多行布局和动画
2. 创建 WordHistoryCard 数据类型和存储逻辑
3. 实现定时清除机制
4. 添加 Dialog 弹窗展示详情
5. 集成到 WordCard

## 风险与注意事项

- 多排动画计算复杂，需仔细测试边界情况
- 定时清除依赖 chrome.alarms，需声明 permissions
- 弹窗关闭后状态管理（已查看标记）