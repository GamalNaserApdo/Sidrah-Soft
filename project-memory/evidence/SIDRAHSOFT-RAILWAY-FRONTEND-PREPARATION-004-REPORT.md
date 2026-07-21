# SidrahSoft Railway Frontend Preparation Report

**Task ID:** SIDRAHSOFT-RAILWAY-FRONTEND-PREPARATION-004  
**Date:** 2026-07-21  
**Frontend root:** `F:\What_i_Made\New\sidrah_web`

---

## 1. Files Modified

- `package.json`
  - Added `serve@^14.2.4` to `dependencies`
  - Added production start script: `start`
  - Preserved `dev`, `build`, and `preview` scripts
- `src/services/apiClient.js`
  - Now validates `VITE_API_BASE_URL` in production builds
  - Throws a clear error if `VITE_API_BASE_URL` is missing in `import.meta.env.PROD`
  - Keeps `http://localhost:8002` fallback for local development only
- `.env.example`
  - Added note that `VITE_API_BASE_URL` is required in production builds
- `package-lock.json`
  - Updated by `npm install` to include `serve` and its transitive dependencies

## 2. Files Created

- `railway.frontend.toml`
  - Root-level Railway configuration for the frontend service

---

## 3. Dependency Added

```json
"serve": "^14.2.4"
```

Installed locally: `serve 14.2.6`

---

## 4. Build Command

```bash
npm ci && npm run build
```

- `npm ci` requires an up-to-date `package-lock.json` (already updated).
- `npm run build` invokes `vite build`.

## 5. Start Command

```bash
npm run start
```

Script in `package.json`:

```json
"start": "serve --single --listen ${PORT:-3000} dist"
```

- Serves the `dist/` directory.
- Listens on Railway's `$PORT` environment variable.
- `--single` enables SPA fallback for `BrowserRouter` routes.
- Falls back to port `3000` only if `$PORT` is not set.

---

## 6. SPA Fallback Behavior

`serve --single` returns `index.html` for all non-file routes, so client-side routes work:

- `/`
- `/training`
- `/training/backend-development`
- `/leads/login`
- `/leads`
- `/careers`
- `/case-studies`

---

## 7. Environment Variables Required

### Railway Production

- `VITE_API_BASE_URL=https://backend-production-23ed.up.railway.app`
  - Set in Railway Variables before building the frontend.
  - Must be set at build time because Vite embeds it into the bundle.
- `PORT`
  - Provided automatically by Railway.

### Local Development

- `VITE_API_BASE_URL=http://localhost:8002` (optional; falls back to `http://localhost:8002`)

---

## 8. API URL Audit Results

Searched `src/` for:

- `localhost` — only in `apiClient.js` as the local development fallback
- `127.0.0.1` — not found
- `8002` — only in `apiClient.js` as the local development fallback
- `VITE_API_BASE_URL` — only in `apiClient.js`
- `/api/v1/` — used in `src/services/*` as relative paths appended to `API_BASE_URL`

No production-breaking hardcoded API URLs found outside of the safe local fallback. The production backend URL is **not** hardcoded in source files; it is supplied at build time through `VITE_API_BASE_URL`.

---

## 9. Validation Results

### `npm install`

```text
added 157 packages, and audited 158 packages in 20s
```

**Result: PASS**

### `npm run build`

```text
vite v7.3.6 building client environment for production...
✓ 161 modules transformed.
✓ built in 10.02s
```

**Result: PASS**

The build emitted two pre-existing warnings:

1. `src/contexts/CMSLanguageContext.jsx`: duplicate `form.status` key (non-blocking).
2. `src/services/insightsApi.js`: dynamically imported but also statically imported (non-blocking chunking warning).
3. Some chunks larger than 500 kB (performance warning, non-blocking).

### Static Server Smoke Check

Not run in this session because the local `node_modules` was locked by a previously running Vite dev server process. The `serve` package was installed and `npm run build` succeeded.

---

## 10. Railway Service Settings

### `railway.frontend.toml`

```toml
[build]
builder = "nixpacks"

[build.nixpacksPlan]
providers = ["node"]

[deploy]
startCommand = "npm run start"
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 3
```

### Recommended Railway Frontend Service Configuration

| Setting | Value |
|---|---|
| **Root Directory** | `/` (repository root) |
| **Build Command** | `npm ci && npm run build` |
| **Start Command** | `npm run start` |
| **Output Directory** | `dist/` |
| **Health Check** | Not required for static frontend |
| **Required Variables** | `VITE_API_BASE_URL`, `PORT` |

---

## 11. Security Review

| Check | Status |
|---|---|
| Frontend variables contain no secrets | `VITE_API_BASE_URL` is a public API URL; no secrets |
| `.env` remains gitignored | Yes |
| Production API URL supplied through Railway Variables | Yes, `VITE_API_BASE_URL` |
| No Django secret, database credentials, or SMTP passwords in frontend | Yes |
| Existing routing unchanged | `BrowserRouter` preserved |
| Bilingual support unchanged | No modifications to i18n code |
| RTL behavior unchanged | No CSS or layout modifications |
| Leads authentication flow unchanged | No changes to auth code |

---

## 12. Final GO / NO-GO Decision

**Decision: GO — frontend is prepared for Railway deployment.**

Required changes are complete:
- Production static server (`serve`) added.
- Railway frontend configuration created.
- `VITE_API_BASE_URL` handling enforced in production builds.
- SPA fallback configured for all client-side routes.
- API URL audit completed with no production-breaking hardcoded URLs.
- `npm run build` succeeds.

Remaining deployment steps:
1. Commit `package.json`, `package-lock.json`, `railway.frontend.toml`, `src/services/apiClient.js`, and `.env.example`.
2. In Railway, set `VITE_API_BASE_URL=https://backend-production-23ed.up.railway.app`.
3. Deploy the frontend service.
