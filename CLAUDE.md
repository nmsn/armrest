# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Armrest is a WXT browser extension providing a custom new tab page experience, backed by a Cloudflare Workers API with D1 database.

## Project Structure

```
armrest/
├── apps/
│   ├── ext/           # Browser extension (WXT)
│   └── server/        # Backend API (Hono + Cloudflare Workers)
├── docs/superpowers/  # Design specs and implementation plans
├── pnpm-workspace.yaml
└── .eslintrc.js / .prettierrc
```

## Commands

```bash
# Root (pnpm workspace)
pnpm dev              # Run all apps in parallel
pnpm build            # Build all apps
pnpm lint             # Lint all apps
pnpm lint:fix         # Fix lint issues

# Extension (apps/ext)
pnpm dev              # Start extension dev server
pnpm build            # Build production extension

# Server (apps/server)
pnpm dev              # Wrangler dev (Cloudflare Workers, local)
pnpm dev:sqlite       # Local SQLite dev server (bypasses D1)
pnpm db:push          # Push schema to local SQLite
pnpm db:studio        # Open Drizzle Studio
pnpm deploy           # Deploy to Cloudflare Workers
```

## Architecture

### Browser Extension (WXT)
- **Entry points**: `entrypoints/newtab/` (main new tab), `entrypoints/popup/` (extension popup)
- **API Client**: `lib/api-client.ts` → backend API
- **Local Storage**: `chrome.storage.sync` for bookmarks, theme, background settings
- **Styling**: Tailwind CSS v4 with `@tailwindcss/vite` plugin
- **UI Components**: shadcn/ui-style components in `components/ui/`

### Backend (Hono + Cloudflare Workers)
- **Production**: Uses D1 database via `getDb(env)` in `src/db/index.ts`
- **Local Dev**: `src/dev.ts` uses local SQLite via `@libsql/client` for development
- **Auth**: Simulated local user (better-auth removed — incompatible with Workers runtime)
- **Routes**: `src/routes/` (auth, bookmarks, weather, sync)

### Database Schema (Drizzle + SQLite/D1)
- `users` - User accounts with GitHub OAuth
- `folders` - Bookmark folders (user-owned)
- `bookmarks` - URL bookmarks with position, color, folder association

### API Design
- `GET /api/bookmarks` - List bookmarks
- `POST /api/bookmarks` - Create bookmark
- `PUT /api/bookmarks/:id` - Update bookmark
- `DELETE /api/bookmarks/:id` - Delete bookmark
- `POST /api/bookmarks/sync` - Batch sync (full replace)
- `GET /api/weather` - Weather proxy
- `GET /api/quote` - Daily quote proxy
- `POST /auth/*` - better-auth handlers

## Commit Safety

**Before committing, always scan staged changes for sensitive information:**
- Keys, secrets, tokens (GitHub client secrets, API keys, auth secrets)
- Passwords, DB credentials, CF account IDs
- `.dev.vars`, `.env`, `*.pem`, and other credential files

If any sensitive value is detected in `git diff --cached`, **abort the commit** and warn the user. Do NOT commit these files even with `--force` or if the user asks — remind them they'll be exposed in git history.

## Lint Configuration

ESLint (flat config) + Prettier with lint-staged:
- ESLint: `eslint:recommended`, `@typescript-eslint/recommended`, `import/recommended`
- Prettier: semi, singleQuote, 100 printWidth, trailingComma es5
- Pre-commit hook: `lint-staged` runs `eslint --fix` and `prettier --write`

## Environment Variables

### Server (.dev.vars for local)
```
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx
BETTER_AUTH_SECRET=xxx
OPENWEATHER_API_KEY=xxx
```

### Extension
```
VITE_API_URL=http://localhost:3001  # For local dev
```
