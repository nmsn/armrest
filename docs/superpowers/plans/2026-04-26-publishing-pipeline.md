# Publishing Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish CI/CD pipelines for automated deployment of server (Cloudflare Workers) and browser extension (Chrome Web Store).

**Architecture:** Two separate GitHub Actions workflows triggered on main branch changes - one for server deployment via wrangler, one for extension build and Chrome Web Store upload via WXT.

**Tech Stack:** GitHub Actions, Wrangler CLI, WXT, Chrome Web Store API

---

## File Structure

```
.github/
└── workflows/
    ├── server.yml          # Cloudflare Workers deployment
    └── extension.yml       # Chrome Web Store upload
```

---

## Task 1: Create Server Deployment Workflow

**Files:**
- Create: `.github/workflows/server.yml`

- [ ] **Step 1: Create workflows directory**

```bash
mkdir -p .github/workflows
```

- [ ] **Step 2: Write server.yml**

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

      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        working-directory: apps/server

      - name: Deploy to Cloudflare Workers
        run: pnpm deploy
        working-directory: apps/server
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/server.yml
git commit -m "ci(server): add Cloudflare Workers deployment workflow"
```

---

## Task 2: Create Extension Build & Upload Workflow

**Files:**
- Create: `.github/workflows/extension.yml`

- [ ] **Step 1: Write extension.yml**

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

      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        working-directory: apps/ext

      - name: Build extension
        run: pnpm build
        working-directory: apps/ext

      - name: Upload to Chrome Web Store
        uses: vinceac/wxt-chrome-action@v1
        with:
          extension-id: ${{ secrets.CHROME_EXTENSION_ID }}
          client-id: ${{ secrets.CHROME_CLIENT_ID }}
          client-secret: ${{ secrets.CHROME_CLIENT_SECRET }}
          refresh-token: ${{ secrets.CHROME_REFRESH_TOKEN }}
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/extension.yml
git commit -m "ci(extension): add Chrome Web Store upload workflow"
```

---

## Task 3: Document Required Secrets

**Files:**
- Create: `.github/workflows/README.md` (optional, for reference)

- [ ] **Step 1: Document required secrets**

```markdown
# Required GitHub Secrets

## Server Deployment (server.yml)

| Secret | Description |
|--------|-------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API Token with Workers deployment permission |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Account ID (found in Workers dashboard) |

### Setup Instructions
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → API Tokens
2. Create custom token with "Workers Bundled Script" template
3. Copy Account ID from Workers overview page
4. Add both secrets to GitHub repo: Settings → Secrets and variables → Actions

## Extension Upload (extension.yml)

| Secret | Description |
|--------|-------------|
| `CHROME_EXTENSION_ID` | Extension ID from Chrome Web Store developer dashboard |
| `CHROME_CLIENT_ID` | OAuth client ID from Google Cloud Console |
| `CHROME_CLIENT_SECRET` | OAuth client secret |
| `CHROME_REFRESH_TOKEN` | OAuth refresh token |

### Setup Instructions
1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Create/publish item to get Extension ID
3. Go to [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
4. Create OAuth client ID for Chrome extension
5. Generate refresh token via OAuth flow (see wxt-chrome-action docs)
6. Add all secrets to GitHub repo
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/README.md
git commit -m "docs: document required GitHub secrets for CI"
```

---

## Verification

After implementation, verify:

1. **Server workflow**: Push to main with changes in `apps/server/` → Actions tab shows workflow running → Check Cloudflare Workers dashboard for deployed version

2. **Extension workflow**: Push to main with changes in `apps/ext/` → Actions tab shows workflow running → Check [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) for uploaded version

---

## Notes

- Chrome Web Store submissions require manual review by Google (typically hours to 1 day)
- First-time submission may take 1-7 days for manual review
- Extension version is read from `apps/ext/package.json` - increment before deploying if needed
