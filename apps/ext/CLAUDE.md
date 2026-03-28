# Armrest Dashboard - WXT 浏览器扩展

## 项目概述

**产品名称**: Armrest Dashboard
**类型**: WXT 浏览器扩展 (Chrome/Edge)
**定位**: 高度定制的自定义新标签页
**技术栈**: React 19, Tailwind CSS v4, Radix UI, dnd-kit, Motion

## 项目结构

```
armrest/
├── entrypoints/
│   ├── newtab/           # 新标签页主应用
│   │   ├── App.tsx       # 主应用组件 (时钟、搜索、书签管理)
│   │   ├── components/   # Newtab 专属组件
│   │   │   ├── Clock.tsx, Weather.tsx, DailyQuote.tsx
│   │   │   ├── BookmarkList.tsx, FolderSidebar.tsx
│   │   │   ├── BookmarkEditModal.tsx, FolderEditModal.tsx
│   │   │   ├── BackgroundSettings.tsx, BookmarksSettings.tsx
│   │   └── style.css     # Newtab 样式
│   ├── popup/            # 扩展弹窗面板
│   │   ├── Popup.tsx
│   │   └── style.css
│   └── shared/           # 共享组件
│       └── ui/           # UI 组件 (button, input, dialog, drawer)
├── lib/                  # 共享工具库
│   ├── bookmarks.ts     # 书签 CRUD 与存储
│   ├── theme.ts          # 主题配置与背景
│   ├── api.ts            # API 请求封装
│   ├── daily.ts          # 每日一言 API
│   ├── geo.ts            # 地理位置服务
│   ├── constants.ts      # 常量定义
│   ├── icons.ts          # 图标相关
│   ├── website.ts        # 网站信息获取
│   └── utils.ts
├── components.json       # shadcn/ui 组件配置
├── wxt.config.ts         # WXT 扩展配置
└── design-specifications.md  # 设计规范文档

## 核心功能

1. **新标签页** - 自定义背景 (颜色/图片)、时钟、天气
2. **书签管理** - 文件夹分组、拖拽排序、跨文件夹移动
3. **主题系统** - Light/Dark 模式、本地存储持久化
4. **每日一言** - 随机语句展示

## 开发命令

```bash
npm run dev      # 开发模式 (热重载)
npm run build    # 生产构建
npm run preview  # 预览构建结果
```

## 技术要点

- **别名**: `@` 指向项目根目录
- **存储**: 使用 `chrome.storage.sync` 存储书签和主题配置
- **拖拽**: 使用 `@dnd-kit/core` 和 `@dnd-kit/sortable`
- **动画**: 使用 `motion/react`
- **主题切换**: 通过 CSS 类 `dark` 控制暗黑模式
