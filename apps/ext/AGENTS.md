# Agent 协作指南

## 项目上下文

**Armrest** 是一个 WXT 浏览器扩展，提供高度定制的浏览器新标签页体验。

### 主要入口点

| 入口 | 文件 | 职责 |
|------|------|------|
| New Tab | `entrypoints/newtab/App.tsx` | 主新标签页界面，包含所有核心功能 |
| Popup | `entrypoints/popup/Popup.tsx` | 扩展图标点击弹出的面板 |

### 共享数据流

- 书签数据: `lib/bookmarks.ts` → `chrome.storage.sync` → 各组件
- 主题配置: `lib/theme.ts` → CSS 变量/类名 → 应用主题
- 背景设置: `lib/theme.ts` → `BackgroundSettings.tsx`

### 组件层级

```
App.tsx (Newtab 主组件)
├── Clock.tsx
├── Weather.tsx (使用 geo.ts 获取位置)
├── DailyQuote.tsx (使用 daily.ts API)
├── BookmarkList.tsx + FolderSidebar.tsx (使用 lib/bookmarks.ts)
├── Drawer (设置面板)
│   ├── BackgroundSettings.tsx
│   └── BookmarksSettings.tsx
│       ├── BookmarkEditModal.tsx
│       └── FolderEditModal.tsx
```

## 任务分配建议

### UI/样式任务
- 优先查看 `design-specifications.md` 获取设计规范
- Tailwind CSS v4 使用 `@tailwindcss/vite` 插件
- 颜色变量: `accent`, `primary`, `secondary`, `muted`, `surface`, `border`

### 书签功能任务
- 书签逻辑集中在 `lib/bookmarks.ts`
- 拖拽排序使用 `dnd-kit`，`handleDragEnd` 在 App.tsx
- 跨文件夹移动: `moveBookmark(fromFolderId, toFolderId, bookmarkId)`

### 主题/背景任务
- 主题存储在 `chrome.storage.sync`
- `lib/theme.ts` 导出 `getThemeConfig`, `applyTheme`, `getCurrentBackground`
- 暗黑模式通过 `document.documentElement.classList.toggle('dark')`

### API/外部服务任务
- `lib/daily.ts` - 每日一言 (需要网络请求)
- `lib/geo.ts` - 地理位置获取
- `lib/api.ts` - 通用 API 封装

## 代码规范

- 使用 TypeScript strict 模式
- 组件使用 `useCallback` 处理回调依赖
- 异步操作用 `try/catch` 包装
- UI 组件参考 `components/ui/` 中的 shadcn/ui 风格
