# Intelly Dashboard — 设计规范文档

> 医疗管理平台 SaaS Dashboard，包含账单页与日历页两个主视图。

---

## 一、整体视觉风格

| 属性 | 描述 |
|------|------|
| 风格 | 现代简洁的 SaaS 医疗管理系统，Soft UI / Light Mode |
| 布局 | 左侧固定侧边栏 + 右侧主内容区（顶部导航栏 + 内容区） |
| 圆角倾向 | 大量使用圆角，整体柔和友好 |
| 阴影倾向 | 轻微投影，卡片有层次感但不过于突出 |
| 背景基调 | 米白/暖白色 `#F5F3EE` 或 `#F7F5F0`（非纯白） |

---

## 二、颜色系统

### 主色板

| 色彩角色 | 色值（估算） | 用途 |
|----------|-------------|------|
| 背景色 | `#F5F3EE` | 整体页面背景（米白暖调） |
| 侧边栏背景 | `#1A1A1A` / `#1C1C1C` | 深黑色侧边栏 |
| 侧边栏文字 | `#FFFFFF` / `#AAAAAA` | 白色主文字，灰色次级文字 |
| 主强调色（绿） | `#B8E0C8` / `#A8D5B8` | 支付卡片背景、成功状态 |
| 主强调色（黄） | `#F5E6A3` / `#F2DC8D` | 待付款卡片、日历事件 |
| 主强调色（蓝紫） | `#C5C8F0` / `#BFC3F5` | 图表扇区、标签高亮 |
| 强调红（负向） | `#F4B8B8` / `#EDAAAA` | 负增长指示器 |
| 正文颜色 | `#1A1A1A` / `#222222` | 主内容文字 |
| 次级文字 | `#888888` / `#999999` | 辅助说明文字 |
| 分割线 | `#E8E6E0` | 表格行分割、区域分割 |
| 白色卡片 | `#FFFFFF` | 内容卡片背景 |
| 黑色按钮 | `#1A1A1A` | 主操作按钮（"Add event"等） |

### 状态颜色

| 状态 | 色值 | 场景 |
|------|------|------|
| Paid（已付款） | `#4CAF50` 绿色小标签 | 账单状态 |
| Requested（请求中） | `#FFB347` 橙黄色小标签 | 账单状态 |
| Sent（已发送） | `#64B5F6` 蓝色小标签 | 账单状态 |
| In progress（进行中） | `#7EC8A4` 绿色胶囊标签 | 日历事件状态 |

---

## 三、字体规范

| 层级 | 字号 | 字重 | 用途 |
|------|------|------|------|
| 品牌名 "intelly" | 18px | 700 Bold | 侧边栏顶部品牌标识 |
| 页面大标题 | 28–32px | 700 Bold | "Your patients billing & invoices" |
| 数据大数字 | 36–48px | 700 Bold | 核心指标数字 "23,4k"、"$14,568" |
| 卡片标题 | 14–16px | 600 SemiBold | 卡片区块名称 |
| 正文 / 表格内容 | 13–14px | 400 Regular | 表格行内容、描述文字 |
| 辅助说明 | 11–12px | 400 Regular | 时间戳、副标题说明 |
| 侧边栏导航 | 13–14px | 400–500 | 菜单项文字 |
| 标签文字 | 11–12px | 500 Medium | 状态标签、筛选 Tab |

**推荐字体族**：`Inter`、`DM Sans`、或系统无衬线字体，视觉上为几何圆润风格。

---

## 四、布局结构

### 整体栅格

```
┌─────────────────────────────────────────────────────────┐
│  Sidebar (220px)  │  Main Content Area (flex: 1)         │
│                   │  ┌──────────────────────────────────┐│
│  Logo             │  │ Top Navigation Bar (56–64px h)   ││
│  Nav Groups       │  ├──────────────────────────────────┤│
│  - General        │  │                                  ││
│  - Tools          │  │  Page Content                    ││
│                   │  │                                  ││
│  Log out          │  │                                  ││
└─────────────────────────────────────────────────────────┘
```

### 侧边栏（Sidebar）

- **宽度**：220px（固定）
- **背景**：`#1A1A1A` 深黑色
- **顶部**：Logo "intelly" + 红色小圆点装饰（品牌标识）
- **导航分组**：
  - `General` 分组标签（灰色小字，全大写）
    - Dashboard
    - Schedule（日历页选中时高亮，左侧有白色竖线条指示器）
    - Patients
    - Statistics & reports
    - Education
    - My articles
  - `Tools` 分组标签
    - Chats & calls
    - Billing（账单页选中时高亮）
    - Documents base
    - Settings
- **底部**：Log out 链接
- **图标**：每个菜单项左侧有 16px 线性图标（stroke 风格，白色）
- **激活状态**：左侧 3px 白色竖线 + 文字变白色，背景轻微高亮（`rgba(255,255,255,0.08)`）
- **padding**：内容区左右 `20px`，菜单项上下 `10–12px`

### 顶部导航栏（Top Navigation）

- **高度**：56–64px
- **背景**：同页面背景 `#F5F3EE`（无明显分割线或轻微）
- **左侧**：搜索框（圆角 `24px`，背景白色，宽度约 240px，内有搜索 icon）
- **中部**：快捷筛选标签 `Patients | Education | Prescriptions | Test results`（小胶囊标签，边框样式，浅灰色）
- **右侧**：用户头像圆形图标组（3个圆形按钮 32–36px，间距 8px）

---

## 五、组件规范

### 5.1 卡片（Card）

```css
background: #FFFFFF;
border-radius: 16px;
padding: 20px 24px;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
```

### 5.2 统计卡片（Stat Card）

- 有颜色背景（绿/黄/蓝）
- 结构：
  ```
  [图标] 标题文字
  $ 大数字        [▲ +13%] 趋势指示器
  副标题说明文字
  ```
- 圆角：`16px`
- padding：`20px`
- 趋势标签：小胶囊样式，绿色背景正向，红色背景负向，字号 `12px`

**三个统计卡片色彩**：
- Payments received：绿色背景 `#B8E0C8`
- Payments requested：黄色背景 `#F5E6A3`
- Non insurance payments：蓝紫背景 `#C5C8F0`（或浅蓝灰）

### 5.3 环形图（Donut Chart）

- 居中显示在左侧区域
- 中心显示大数字 `23,4k` + `$` 符号
- 颜色分段：黄色 + 绿色 + 蓝色（对应不同账单类型）
- 尺寸：约 180×180px
- 外侧有小爱心图标装饰（趣味元素）

### 5.4 患者等待卡片（Waiting for bills）

```
[头像] 患者姓名
      科室/类型
      时间戳（右上角）
[Request payment 按钮]
```
- 卡片背景：白色
- 圆角：`12px`
- 按钮样式：黑色实心圆角按钮，白色文字，`border-radius: 20px`，`padding: 8px 16px`，`font-size: 12px`

### 5.5 最近交易卡片（Latest Transaction）

- 水平排列 3 个交易记录
- 每项包含：
  - 顶部：卡号（灰色小字）
  - 中部：金额（绿色大字 `+$568.56`）
  - 底部：交易ID `#3586895`，时间 `15 min ago`
- 卡片有轻微边框或投影
- 圆角：`12px`

### 5.6 表格（Transaction Table）

- 表头：`Type | Send date | Name | Amount | Recipient | Due date | Status | Actions`
- 行高：`48–52px`
- 行分割线：`1px solid #E8E6E0`
- 斑马纹：无（统一白色背景）
- 状态标签（Status）：
  - `Paid`：绿色圆角标签，`background: #E8F5E9; color: #4CAF50`
  - `Requested`：橙色圆角标签，`background: #FFF3E0; color: #FF9800`
  - `Sent`：蓝色圆角标签，`background: #E3F2FD; color: #2196F3`
- 操作图标（Actions）：右侧有下载、发送等小图标，灰色线性风格

### 5.7 筛选 Tab（Filter Tabs）

```
[All] [Telemedicine] [In clinic] [Insurance]
```
- 选中项：黑色实心圆角胶囊，白色文字
- 未选中：白色背景或透明，灰色文字
- 圆角：`20px`
- 字号：`12–13px`
- padding：`6px 14px`

### 5.8 按钮规范

| 类型 | 背景 | 文字 | 圆角 | padding |
|------|------|------|------|---------|
| Primary（主操作） | `#1A1A1A` 黑色 | `#FFFFFF` 白色 | `20px` | `10px 20px` |
| Secondary（次操作） | `#FFFFFF` 白色 | `#1A1A1A` 黑色 | `20px` | `10px 20px` |
| Ghost（筛选按钮） | 透明/白色 | `#666666` | `16px` | `6px 14px` |
| Outline（加入） | 白色 + 边框 | `#1A1A1A` | `20px` | `8px 16px` |

### 5.9 搜索框（Search Bar）

```css
background: #FFFFFF;
border-radius: 24px;
padding: 10px 16px;
border: 1px solid #E8E6E0;
font-size: 14px;
```
- 左侧搜索图标，颜色 `#AAAAAA`
- placeholder 颜色：`#AAAAAA`

---

## 六、日历页（Schedule / Calendar）专项规范

### 6.1 布局

- 顶部标题：`Stay up to date, Dr.Olivia`（大标题，带医生姓名个性化）
- 右上角操作区：`Add event`（黑色实心按钮）+ 刷新图标 + 编辑图标
- 日历切换栏：`May 11/05 - 11/06 ▼` 日期选择器 + `Today | Week | Month` 切换 Tab

### 6.2 周视图表格

- **时间轴**：左侧竖向时间刻度（07:00、07:30、08:00...），字号 `12px`，颜色 `#999999`
- **列数**：7列（周一到周日）
- **列头格式**：
  ```
  星期缩写（MONDAY）
  日期数字（11/05）
  ```
  - 今日列（THU 14/05）：黑色背景，白色文字，圆角 `12px`
  - 其他列：灰色文字
- **列宽**：均等分布，约 120–140px

### 6.3 事件卡片（Event Card）

```
[小图标/emoji]  事件标题
               地点（West camp, Room 312）
               时间段（07:00 - 07:30）
               [参与者头像组] 人数
               [操作按钮（Join / In progress...）]
```

**事件卡片颜色分类**：
| 颜色 | 含义 | 色值（估算） |
|------|------|-------------|
| 黄色 | 诊断/测试类 | `#F5E6A3` |
| 绿色 | 在线/远程问诊 | `#B8E0C8` |
| 蓝紫色 | 计划/会议 | `#C5C8F0` |
| 白色 | 普通事件 | `#FFFFFF` |
| 粉色 | 紧急/特殊 | `#F4B8D4` |

事件卡片规范：
```css
border-radius: 12px;
padding: 10px 12px;
font-size: 12px;
min-height: 60px;
```

### 6.4 参与者头像组（Participant Avatars）

- 小圆形头像，直径 `20px`
- 多个头像重叠排列，overlap `-6px`
- 溢出时显示 `+N` 数字标签（同色系圆形背景）

### 6.5 事件状态标签

- `In progress...`：绿色胶囊，`background: #B8E0C8; color: #2E7D52`，圆角 `12px`
- `Join`（蓝色）：深色实心胶囊，偏黑色或深绿，白色文字

---

## 七、间距系统

采用 **8px 基础单位** 的间距体系：

| 名称 | 值 | 使用场景 |
|------|-----|---------|
| xs | 4px | 图标与文字间距、小元素内部 |
| sm | 8px | 标签内 padding、小组件间距 |
| md | 16px | 卡片内部 padding、表单间距 |
| lg | 24px | 卡片间距、区块 margin |
| xl | 32px | 区域之间的间隔 |
| 2xl | 48px | 大版块间距 |

---

## 八、圆角规范

| 元素 | 圆角值 |
|------|--------|
| 大卡片容器 | `16px` |
| 小卡片、事件卡 | `12px` |
| 按钮（胶囊型） | `20–24px`（full radius） |
| 筛选标签 | `16–20px` |
| 搜索框 | `24px` |
| 头像 | `50%`（圆形） |
| 状态标签 | `6–8px` |
| 今日日期高亮 | `12px` |
| 整体界面外框 | `20–24px` |

---

## 九、阴影规范

```css
/* 卡片默认阴影 */
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

/* 卡片 hover 阴影 */
box-shadow: 0 4px 16px rgba(0, 0, 0, 0.10);

/* 侧边栏无阴影（深色背景，自带层次） */

/* 弹窗/浮层阴影 */
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
```

---

## 十、图标规范

- **风格**：线性图标（Stroke style），无填充或轻量填充
- **尺寸**：侧边栏菜单 `16px`，操作按钮 `16–18px`，表格操作 `14px`
- **颜色**：跟随文字颜色（侧边栏白色，内容区灰色 `#888888`）
- **推荐图标库**：Lucide Icons / Heroicons / Phosphor Icons

---

## 十一、数据展示规范

### 趋势指示器（Trend Indicator）

```html
<span class="trend positive">▲ +13%</span>
<span class="trend negative">▼ -17%</span>
```

```css
.trend {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}
.trend.positive {
  background: #E8F5E9;
  color: #4CAF50;
}
.trend.negative {
  background: #FFEBEE;
  color: #EF5350;
}
```

### 金额格式

- 正向金额：`+ $ 568.56`（绿色，带空格分隔）
- 大数字简化：`23,4k`（欧式逗号小数点）
- 对齐：金额列右对齐

---

## 十二、交互规范

| 交互 | 效果 |
|------|------|
| 菜单 hover | 背景 `rgba(255,255,255,0.08)`，光标 pointer |
| 按钮 hover | 加深 10%，轻微上移 `translateY(-1px)` |
| 卡片 hover | 阴影加深，轻微上浮 |
| 表格行 hover | 背景 `#F9F7F2`（轻暖色高亮） |
| 事件卡片 hover | 边框轻微显现，阴影加深 |
| 日历今日列 | 持续高亮，黑色背景 |

---

## 十三、响应式断点建议

| 断点 | 宽度 | 布局变化 |
|------|------|---------|
| Desktop | ≥1280px | 标准双栏布局 |
| Laptop | 1024–1280px | 侧边栏收窄至 180px |
| Tablet | 768–1024px | 侧边栏折叠为图标栏（48px） |
| Mobile | <768px | 侧边栏隐藏，底部 tab bar |

---

## 十四、页面级参数汇总

| 参数 | 值 |
|------|-----|
| 最小页面宽度 | 1200px |
| 侧边栏宽度 | 220px |
| 顶部导航高度 | 60px |
| 内容区左右 padding | 32px |
| 内容区顶部 padding | 24px |
| 卡片 grid gap | 16px |
| 主字体 | DM Sans / Inter |
| 基础字号 | 14px |
| 行高 | 1.5 |
| 主背景色 | `#F5F3EE` |
| 侧边栏背景 | `#1A1A1A` |

---

## 十五、核心页面还原要点

### 账单页（Billing & Invoices）

1. 左栏：环形统计图（占满左栏上部）
2. 右栏：`Waiting for bills` 患者列表（水平卡片）
3. 右侧中部：`Latest transaction` 3列交易卡片
4. 下方：三个统计数字卡片（绿/黄/蓝色背景，左右排列）
5. 底部：筛选 Tab + 完整交易表格

### 日历页（Schedule）

1. 顶部：个性化问候标题 + 操作按钮组
2. 次级：日期范围选择器 + 视图切换（Today/Week/Month）
3. 主体：7列周视图，左侧时间轴，事件卡片填充格子
4. 事件卡片颜色根据类型区分（见第六节）

---

*文档生成基于 Intelly 医疗管理平台 UI 设计截图分析，版本 v1.0*
