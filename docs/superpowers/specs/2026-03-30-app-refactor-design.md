# App.tsx 组件拆分设计

## 概述

将 `entrypoints/newtab/App.tsx` (570行) 拆分为清晰的组件结构，实现 UI 与逻辑的分离。

## 目标

- 提升代码可维护性
- 分离关注点
- 提取可复用的 hooks

## 目录结构

```
entrypoints/newtab/
├── App.tsx                    # 主应用入口
├── components/
│   ├── Header.tsx            # 头部：Logo + 搜索框
│   ├── Sidebar.tsx            # 侧边栏容器
│   │   ├── ClockWidget.tsx    # 时钟组件（已有）
│   │   ├── WeatherWidget.tsx  # 天气组件（已有）
│   │   └── FolderList.tsx     # 文件夹列表
│   ├── MainContent.tsx        # 主内容区容器
│   │   ├── BookmarkGrid.tsx   # 书签网格
│   │   └── InfoRow.tsx        # News + Word + Quote 行
├── hooks/
│   ├── useBookmarks.ts        # 书签 CRUD 逻辑
│   ├── useDragAndDrop.ts      # DnD 拖拽逻辑
│   └── useFolders.ts          # 文件夹状态管理
```

## 组件职责

| 组件 | 职责 | 状态位置 |
|------|------|----------|
| `App.tsx` | 组合所有组件 | 保留必要的全局状态 |
| `Header` | Logo + 搜索框 UI | 无状态 |
| `Sidebar` | 组合 Clock/Weather/FolderList | 无状态 |
| `FolderList` | 文件夹列表渲染和选择 | 接收 props |
| `BookmarkGrid` | 书签网格渲染 | 接收 props |
| `InfoRow` | 组合 NewsCard + WordCard + DailyQuote | 无状态 |

## Hooks

### useBookmarks

```ts
interface UseBookmarks {
  loadFolders: () => Promise<void>
  handleSaveBookmark: (data: BookmarkFormData) => Promise<void>
  handleDeleteBookmark: (folderId: string, bookmarkId: string) => Promise<void>
  handleBookmarksReorder: (folderId: string, orderedIds: string[]) => Promise<void>
}
```

### useDragAndDrop

```ts
interface UseDragAndDrop {
  handleDragEnd: (event: DragEndEvent, foldersData: BookmarkFolder[], activeFolderIndex: number, currentFolder: BookmarkFolder) => Promise<void>
  parseBookmarkDragId: (dragId: string) => string | null
  parseFolderItemDragId: (dragId: string) => string | null
  getBookmarkDragId: (bookmarkId: string) => string
  getFolderItemDragId: (folderId: string) => string
  sensors: Sensor[]  // 导出的 sensors 供 DndContext 使用
}
```

### useFolders

```ts
interface UseFolders {
  foldersData: BookmarkFolder[]
  activeFolderIndex: number
  direction: number
  handleFolderChange: (index: number) => void
  handleFoldersReorder: (orderedFolderIds: string[]) => Promise<void>
  handleOpenFolderModal: (folder?: FolderEditData) => void
  handleSaveFolder: (data: FolderFormData) => Promise<void>
}
```

## 实施步骤

1. 创建 `hooks/useFolders.ts`
2. 创建 `hooks/useBookmarks.ts`
3. 创建 `hooks/useDragAndDrop.ts`
4. 创建 `components/Header.tsx`
5. 创建 `components/FolderList.tsx`
6. 创建 `components/Sidebar.tsx`
7. 创建 `components/BookmarkGrid.tsx`
8. 创建 `components/InfoRow.tsx`
9. 创建 `components/MainContent.tsx`
10. 精简 `App.tsx`
11. 删除不再需要的内联组件（如 `FolderSidebarItem`）

## 保留在 App.tsx 的状态

- `searchQuery` - 搜索输入
- `isBookmarkModalOpen` / `isFolderModalOpen` - modal 开关
- `editingBookmark` / `editingFolder` - 编辑状态
- `activeSettingsTab` - 设置面板 tab

## 不纳入本次重构的内容

- BookmarkEditModal / FolderEditModal（已有独立文件）
- BookmarksSettings 组件（已有独立文件）
- Drawer/Settings 交互逻辑
