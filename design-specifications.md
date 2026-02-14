# WriteFlow AI - 设计规范文档

## 项目概述

**产品名称**: WriteFlow AI  
**产品定位**: AI 驱动的智能写作助手  
**目标用户**: 专业写作者、内容创作者、商务人士、开发团队  
**设计风格**: 极简主义 + AI 紫色点缀

---

## 设计系统

### 设计模式 (Pattern)

| 属性 | 值 |
|------|-----|
| 名称 | Minimal Single Column |
| 转化焦点 | 单一 CTA 聚焦，大字体，大量留白，无导航干扰 |
| CTA 位置 | 居中，大号按钮 |
| 色彩策略 | 极简：品牌色 + 白色 #FFFFFF + 强调色 |
| 区块结构 | 1. Hero 标题, 2. 简短描述, 3. 优势要点, 4. CTA, 5. 页脚 |

### 设计风格 (Style)

| 属性 | 值 |
|------|-----|
| 名称 | Flat Design |
| 关键词 | 2D、极简、大胆色彩、无阴影、简洁线条、简单形状、字体为主、现代、图标导向 |
| 适用场景 | Web 应用、移动应用、跨平台、初创 MVP、用户友好、SaaS、仪表盘、企业级 |
| 性能 | ⚡ 优秀 |
| 可访问性 | ✓ WCAG AAA |

---

## 色彩系统

### 主色板

| 角色 | 色值 | CSS 变量 | 用途 |
|------|------|----------|------|
| Primary | `#171717` | `--color-primary` | 主要文字、标题、重要元素 |
| Secondary | `#404040` | `--color-secondary` | 次要文字、描述文本 |
| Muted | `#737373` | `--color-muted` | 辅助文字、标签、占位符 |
| Accent | `#8B5CF6` | `--color-accent` | AI 紫色强调、CTA 按钮、交互元素 |
| Accent Light | `#A78BFA` | `--color-accent-light` | 悬停状态、渐变过渡 |
| Accent Dark | `#7C3AED` | `--color-accent-dark` | 按钮按下状态、深色强调 |
| Surface | `#FAFAFA` | `--color-surface` | 背景色、卡片背景 |
| Border | `#E5E5E5` | `--color-border` | 边框、分割线 |
| Background | `#FFFFFF` | `--color-background` | 页面背景 |

### Tailwind 配置

```javascript
tailwind.config = {
    theme: {
        extend: {
            colors: {
                primary: '#171717',
                secondary: '#404040',
                muted: '#737373',
                accent: '#8B5CF6',
                'accent-light': '#A78BFA',
                'accent-dark': '#7C3AED',
                surface: '#FAFAFA',
                border: '#E5E5E5',
            }
        }
    }
}
```

### CSS 变量

```css
:root {
    --color-primary: #171717;
    --color-secondary: #404040;
    --color-muted: #737373;
    --color-accent: #8B5CF6;
    --color-accent-light: #A78BFA;
    --color-accent-dark: #7C3AED;
    --color-surface: #FAFAFA;
    --color-border: #E5E5E5;
    --color-background: #FFFFFF;
}
```

### 渐变

```css
.gradient-text {
    background: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 50%, #7C3AED 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}
```

---

## 字体系统

### 字体家族

| 角色 | 字体 | 备选 |
|------|------|------|
| Display (标题) | Space Grotesk | Inter, sans-serif |
| Body (正文) | Inter | system-ui, sans-serif |

### Google Fonts 引入

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
```

### CSS 配置

```css
font-family: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    display: ['Space Grotesk', 'Inter', 'sans-serif'],
}
```

### 字体层级

| 元素 | 字号 | 字重 | 行高 | 字间距 |
|------|------|------|------|--------|
| H1 (Hero) | 48px / 60px / 72px | 700 (bold) | 1.1 | -0.02em |
| H2 (Section) | 30px / 36px / 48px | 700 (bold) | 1.2 | -0.02em |
| H3 (Card) | 18px | 600 (semibold) | 1.4 | 0 |
| Body Large | 18px / 20px | 400 (normal) | 1.6 | 0 |
| Body | 14px / 16px | 400 (normal) | 1.5 | 0 |
| Small | 12px / 14px | 400 (normal) | 1.5 | 0 |
| Button | 14px / 16px | 500/600 | 1 | 0 |

### Tailwind 字体类

```html
<!-- Hero 标题 -->
<h1 class="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">

<!-- Section 标题 -->
<h2 class="font-display text-3xl md:text-4xl font-bold tracking-tight">

<!-- Card 标题 -->
<h3 class="font-display font-semibold text-lg">

<!-- 正文 -->
<p class="text-secondary text-lg">

<!-- 小字 -->
<span class="text-sm text-muted">
```

---

## 间距系统

### 基础单位

基础单位: `4px`

### 常用间距

| 名称 | 值 | Tailwind | 用途 |
|------|-----|----------|------|
| xs | 4px | `p-1` | 图标内边距 |
| sm | 8px | `p-2` | 紧凑元素 |
| md | 16px | `p-4` | 标准内边距 |
| lg | 24px | `p-6` | 卡片内边距 |
| xl | 32px | `p-8` | 大卡片内边距 |
| 2xl | 48px | `p-12` | Section 内边距 |
| 3xl | 80px | `py-20` | Section 垂直间距 |

### 容器宽度

| 名称 | 值 | Tailwind | 用途 |
|------|-----|----------|------|
| Default | 1152px | `max-w-5xl` | Demo 区域 |
| Content | 1280px | `max-w-6xl` | 标准内容区 |
| Wide | 1440px | `max-w-7xl` | 宽内容区 |
| Text | 896px | `max-w-4xl` | 文字内容区 |

---

## 圆角系统

| 名称 | 值 | Tailwind | 用途 |
|------|-----|----------|------|
| sm | 4px | `rounded` | 小元素、标签 |
| md | 8px | `rounded-lg` | 按钮、输入框 |
| lg | 12px | `rounded-xl` | 卡片、大按钮 |
| xl | 16px | `rounded-2xl` | 大卡片、容器 |
| full | 9999px | `rounded-full` | 徽章、头像 |

---

## 阴影系统

极简风格下，阴影使用极少：

```css
/* 卡片悬停发光效果 */
.glow-card:hover {
    animation: pulse-glow 2s infinite;
}

@keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.3); }
    50% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.5); }
}
```

---

## 动画系统

### 过渡时长

| 类型 | 时长 | 用途 |
|------|------|------|
| 快速 | 150ms | 按钮悬停、颜色变化 |
| 标准 | 200ms | 卡片悬停、边框变化 |
| 中等 | 300ms | 展开/收起、淡入淡出 |
| 慢速 | 600ms | 页面入场动画 |

### 入场动画

```css
@keyframes fade-up {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

.fade-up {
    animation: fade-up 0.6s ease-out forwards;
}

/* 延迟类 */
.fade-up-delay-1 { animation-delay: 0.1s; opacity: 0; }
.fade-up-delay-2 { animation-delay: 0.2s; opacity: 0; }
.fade-up-delay-3 { animation-delay: 0.3s; opacity: 0; }
.fade-up-delay-4 { animation-delay: 0.4s; opacity: 0; }
```

### 打字光标动画

```css
@keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
}

.cursor-blink {
    animation: blink 1s infinite;
}
```

### 无障碍支持

```css
@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}
```

---

## 组件规范

### 按钮

#### Primary 按钮

```html
<a class="bg-accent hover:bg-accent-dark text-white px-8 py-4 rounded-xl text-base font-semibold transition-all duration-200 cursor-pointer">
    按钮文字
</a>
```

#### Secondary 按钮

```html
<a class="border border-border hover:border-primary text-primary px-8 py-4 rounded-xl text-base font-semibold transition-colors cursor-pointer">
    按钮文字
</a>
```

#### Dark 按钮

```html
<a class="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary transition-colors cursor-pointer">
    按钮文字
</a>
```

### 卡片

```html
<div class="group p-6 rounded-2xl border border-border hover:border-accent/30 transition-all duration-300 cursor-pointer glow-card bg-white">
    <!-- 卡片内容 -->
</div>
```

### 导航栏

```html
<nav class="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50">
    <div class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <!-- 导航内容 -->
    </div>
</nav>
```

### 徽章

```html
<span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium">
    徽章文字
</span>
```

### 标签

```html
<span class="px-2 py-1 bg-surface rounded text-xs text-muted">
    标签文字
</span>
```

---

## 图标规范

### 图标库

推荐使用: **Heroicons** 或 **Lucide Icons**

### 图标尺寸

| 名称 | 尺寸 | Tailwind | 用途 |
|------|------|----------|------|
| xs | 16px | `w-4 h-4` | 内联图标 |
| sm | 20px | `w-5 h-5` | 按钮图标 |
| md | 24px | `w-6 h-6` | 卡片图标 |
| lg | 40px | `w-10 h-10` | 集成图标 |

### 图标颜色

- 默认: `text-accent` (紫色)
- 悬停: `text-accent-dark`
- 禁用: `text-muted`

---

## 响应式断点

| 断点 | 宽度 | Tailwind |
|------|------|----------|
| sm | 640px | `sm:` |
| md | 768px | `md:` |
| lg | 1024px | `lg:` |
| xl | 1280px | `xl:` |
| 2xl | 1536px | `2xl:` |

### 移动端适配

- 导航: 隐藏次要链接，保留 Logo 和 CTA
- Hero: 字号缩小，堆叠布局
- 卡片: 单列布局
- 定价: 单列堆叠

---

## 可访问性规范

### 颜色对比度

- 正文文字: 最小 4.5:1
- 大标题: 最小 3:1
- 交互元素: 最小 3:1

### 焦点状态

```css
/* 键盘导航焦点 */
*:focus-visible {
    outline: 2px solid #8B5CF6;
    outline-offset: 2px;
}
```

### 必须检查项

- [ ] 所有图片有 alt 文字
- [ ] 表单输入有 label
- [ ] 颜色不是唯一指示器
- [ ] `prefers-reduced-motion` 受支持
- [ ] Tab 顺序与视觉顺序一致

---

## 反模式 (避免)

| 问题 | 避免 | 推荐 |
|------|------|------|
| 复杂引导流程 | 多步骤注册 | 单一 CTA |
| 拥挤布局 | 过多元素 | 大量留白 |
| Emoji 图标 | 🎨 🚀 ⚙️ | SVG 图标 |
| 布局抖动 | scale 变换 | color/opacity 过渡 |
| 低对比度 | gray-400 正文 | slate-600+ |

---

## 文件结构

```
/
├── ai-writing-assistant-landing.html    # Landing Page HTML
├── design-specifications.md             # 设计规范文档 (本文件)
└── assets/
    ├── icons/                           # SVG 图标
    └── images/                          # 图片资源
```

---

## 技术栈

| 技术 | 用途 |
|------|------|
| Tailwind CSS (CDN) | 样式框架 |
| Google Fonts | 字体服务 |
| Heroicons / Lucide | 图标库 |
| Vanilla JS | 交互脚本 |

---

## 预交付检查清单

### 视觉质量
- [ ] 无 Emoji 作为图标 (使用 SVG)
- [ ] 所有图标来自一致的图标集
- [ ] 品牌图标正确
- [ ] 悬停状态不导致布局偏移
- [ ] 使用主题色而非 var() 包装

### 交互
- [ ] 所有可点击元素有 `cursor-pointer`
- [ ] 悬停状态提供清晰视觉反馈
- [ ] 过渡平滑 (150-300ms)
- [ ] 焦点状态对键盘导航可见

### 布局
- [ ] 浮动元素与边缘有适当间距
- [ ] 无内容隐藏在固定导航后
- [ ] 响应式: 375px, 768px, 1024px, 1440px
- [ ] 移动端无水平滚动

### 可访问性
- [ ] 所有图片有 alt 文字
- [ ] 表单输入有标签
- [ ] 颜色不是唯一指示器
- [ ] `prefers-reduced-motion` 受支持
