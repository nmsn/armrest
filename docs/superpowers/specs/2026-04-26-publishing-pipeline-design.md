# Publishing Pipeline Design

## Overview

Establish CI/CD pipelines for automated deployment of Armrest's server and browser extension.

## Architecture

```
main branch push
       ↓
  GitHub Actions
       ↓
   ┌───┴───┐
   ↓       ↓
Server    Extension
CI        CI
   ↓       ↓
CF Workers   Chrome Store
(deploy)    (upload)
```

## Server CI (Cloudflare Workers)

### Trigger Conditions
- Push to `main` branch
- Changes in `apps/server/**` directory

### Workflow: `server.yml`

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

### Required Secrets
| Secret | Description |
|--------|-------------|
| `CLOUDFLARE_API_TOKEN` | API Token with Workers deployment permission |
| `CLOUDFLARE_ACCOUNT_ID` | Found in Cloudflare Dashboard |

## Extension CI (Chrome Web Store)

### Trigger Conditions
- Push to `main` branch
- Changes in `apps/ext/**` directory

### Workflow: `extension.yml`

```yaml
jobs:
  build-and-upload:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - uses: vinceac/wxt-chrome-action@v1
        with:
          extension-id: ${{ secrets.CHROME_EXTENSION_ID }}
          client-id: ${{ secrets.CHROME_CLIENT_ID }}
          client-secret: ${{ secrets.CHROME_CLIENT_SECRET }}
          refresh-token: ${{ secrets.CHROME_REFRESH_TOKEN }}
```

### Required Secrets
| Secret | Description |
|--------|-------------|
| `CHROME_EXTENSION_ID` | Extension ID from Chrome Web Store developer dashboard |
| `CHROME_CLIENT_ID` | OAuth client ID from Google Cloud Console |
| `CHROME_CLIENT_SECRET` | OAuth client secret |
| `CHROME_REFRESH_TOKEN` | Refresh token for OAuth flow |

### Note on Chrome Web Store Review
- First submission requires manual review (1-7 days)
- Subsequent updates also require review (hours to 1 day)
- CI automates build + upload; review is handled by Google

## File Structure

```
.github/
└── workflows/
    ├── server.yml
    └── extension.yml
```

## Setup Steps

### Cloudflare
1. Go to Cloudflare Dashboard → API Tokens
2. Create custom token with "Workers Bundled Script" template
3. Copy Account ID from Workers overview page

### Chrome Web Store
1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Register/pay $5 one-time fee (already done)
3. Create a new item to get Extension ID
4. Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/):
   - Credentials → OAuth client ID → Chrome extension
5. Generate refresh token using OAuth flow

## Version Management

- Extension version is read from `apps/ext/package.json` `version` field
- Server version is managed by `wrangler.toml` or `package.json`
- Both should be updated before release (manual or automated bump)
