# Dev Links — Jira Linkifier

Chrome MV3 extension that scans web pages for Jira ticket IDs (e.g., `ENG-1234`) and converts them into clickable links pointing to your Jira instance.

## Prerequisites

- Node.js (v18+)
- npm

## Setup

```bash
git clone <repo-url> && cd dev-links
npm install
cp .env.example .env
```

Edit `.env` with your values (see [Configuration](#configuration) below).

## Build

```bash
npm run build
```

This produces a `dist/` folder containing the built extension.

## Install in Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked** and select the `dist/` directory

## Development

```bash
npm run dev
```

Watches for file changes and rebuilds automatically. After a rebuild, reload the extension in `chrome://extensions` to pick up changes.

## Scripts

| Script              | Description                          |
| ------------------- | ------------------------------------ |
| `npm run build`     | Build the extension to `dist/`       |
| `npm run dev`       | Build + watch for changes            |
| `npm run typecheck` | Run TypeScript type checking         |
| `npm run lint`      | Lint source files                    |
| `npm run lint:fix`  | Lint and auto-fix                    |
| `npm run format`    | Format source files with Prettier    |
| `npm run format:check` | Check formatting without writing  |

## Configuration

All configuration is set in `.env` and injected at build time.

| Variable         | Description                                              | Example                                    |
| ---------------- | -------------------------------------------------------- | ------------------------------------------ |
| `DOMAINS`        | Comma-separated Chrome match patterns for target domains | `https://github.com/*,https://gitlab.com/*` |
| `JIRA_PREFIXES`  | Comma-separated Jira project prefixes to match           | `ENG,PLAT,INFRA`                           |
| `JIRA_BASE_URL`  | Base URL for Jira links (ticket ID is appended)          | `https://mycompany.atlassian.net/browse/`  |
| `SCAN_INTERVAL`  | Re-scan interval in milliseconds (default: `30000`)      | `30000`                                    |
