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