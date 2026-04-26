# 发布流水线实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**目标：** 建立 CI/CD 流水线，实现服务器（Cloudflare Workers）和浏览器插件（Chrome Web Store）的自动化部署。

**架构：** 两个独立的 GitHub Actions 工作流，在 main 分支代码变更时触发 - 一个用于通过 wrangler 部署服务器，一个用于通过 WXT 构建并上传 Chrome Web Store。

**技术栈：** GitHub Actions, Wrangler CLI, WXT, Chrome Web Store API

---

## 文件结构

```
.github/
└── workflows/
    ├── server.yml          # Cloudflare Workers 部署
    └── extension.yml       # Chrome Web Store 上传
```

---

## 任务 1: 创建服务器部署工作流

**文件：**
- 创建: `.github/workflows/server.yml`

- [ ] **Step 1: 创建 workflows 目录**

```bash
mkdir -p .github/workflows
```

- [ ] **Step 2: 编写 server.yml**

```yaml
name: Deploy Server

on:
  push:
    branches:
      - main
    paths:
      - 'apps/server/**'
      - '.github/workflows/server.yml'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
          cache-dependency-path: apps/server/pnpm-lock.yaml

      - name: 安装依赖
        run: pnpm install --frozen-lockfile
        working-directory: apps/server

      - name: 部署到 Cloudflare Workers
        run: pnpm deploy
        working-directory: apps/server
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

- [ ] **Step 3: 提交**

```bash
git add .github/workflows/server.yml
git commit -m "ci(server): add Cloudflare Workers deployment workflow"
```

---

## 任务 2: 创建插件构建和上传工作流

**文件：**
- 创建: `.github/workflows/extension.yml`

- [ ] **Step 1: 编写 extension.yml**

```yaml
name: Deploy Extension

on:
  push:
    branches:
      - main
    paths:
      - 'apps/ext/**'
      - '.github/workflows/extension.yml'

jobs:
  build-and-upload:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
          cache-dependency-path: apps/ext/pnpm-lock.yaml

      - name: 安装依赖
        run: pnpm install --frozen-lockfile
        working-directory: apps/ext

      - name: 构建插件
        run: pnpm build
        working-directory: apps/ext

      - name: 上传到 Chrome Web Store
        uses: vinceac/wxt-chrome-action@v1
        with:
          extension-id: ${{ secrets.CHROME_EXTENSION_ID }}
          client-id: ${{ secrets.CHROME_CLIENT_ID }}
          client-secret: ${{ secrets.CHROME_CLIENT_SECRET }}
          refresh-token: ${{ secrets.CHROME_REFRESH_TOKEN }}
```

- [ ] **Step 2: 提交**

```bash
git add .github/workflows/extension.yml
git commit -m "ci(extension): add Chrome Web Store upload workflow"
```

---

## 任务 3: 记录所需的 Secrets

**文件：**
- 创建: `.github/workflows/README.md`（可选，用于参考）

- [ ] **Step 1: 编写所需的 secrets 文档**

```markdown
# 必需的 GitHub Secrets

## 服务器部署 (server.yml)

| Secret | 描述 |
|--------|------|
| `CLOUDFLARE_API_TOKEN` | 具有 Workers 部署权限的 Cloudflare API Token |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare 账号 ID（在 Workers 仪表盘查找） |

### 设置步骤
1. 进入 [Cloudflare Dashboard](https://dash.cloudflare.com) → API Tokens
2. 创建自定义 Token，选择 "Workers Bundled Script" 模板
3. 从 Workers 概览页面复制账号 ID
4. 将两个 secret 添加到 GitHub 仓库：Settings → Secrets and variables → Actions

## 插件上传 (extension.yml)

| Secret | 描述 |
|--------|------|
| `CHROME_EXTENSION_ID` | Chrome Web Store 开发者仪表盘中的插件 ID |
| `CHROME_CLIENT_ID` | Google Cloud Console 中的 OAuth 客户端 ID |
| `CHROME_CLIENT_SECRET` | OAuth 客户端密钥 |
| `CHROME_REFRESH_TOKEN` | OAuth 刷新令牌 |

### 设置步骤
1. 进入 [Chrome Web Store 开发者仪表盘](https://chrome.google.com/webstore/devconsole)
2. 创建/发布项目以获取插件 ID
3. 进入 [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
4. 为 Chrome 插件创建 OAuth 客户端 ID
5. 通过 OAuth 流程生成刷新令牌（参考 wxt-chrome-action 文档）
6. 将所有 secrets 添加到 GitHub 仓库
```

- [ ] **Step 2: 提交**

```bash
git add .github/workflows/README.md
git commit -m "docs: document required GitHub secrets for CI"
```

---

## 验证

实施后验证：

1. **服务器工作流**：推送代码到 main 分支（修改 `apps/server/`）→ Actions 标签页显示工作流运行中 → 检查 Cloudflare Workers 仪表盘确认部署成功

2. **插件工作流**：推送代码到 main 分支（修改 `apps/ext/`）→ Actions 标签页显示工作流运行中 → 检查 [Chrome Web Store 开发者仪表盘](https://chrome.google.com/webstore/devconsole) 确认上传成功

---

## 注意事项

- Chrome Web Store 提交需要 Google 人工审核（通常数小时到 1 天）
- 首次提交可能需要 1-7 天人工审核
- 插件版本号从 `apps/ext/package.json` 读取，部署前如需更新请先修改版本号
