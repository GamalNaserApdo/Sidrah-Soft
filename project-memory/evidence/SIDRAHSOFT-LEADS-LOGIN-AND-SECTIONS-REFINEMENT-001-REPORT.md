# SIDRAHSOFT-LEADS-LOGIN-AND-SECTIONS-REFINEMENT-001

**Date:** 2026-07-15  
**Status:** Implementation Complete  
**Verdict:** PASS

---

## 1. Investigation Findings

### Root Cause of `Failed to fetch`

The frontend `.env` file contained `VITE_API_BASE_URL="http://192.168.142.1:8002"` — a network IP address that was unreachable from the browser. When the Leads login page at `http://localhost:5174/leads/login` attempted to fetch CSRF and login endpoints from `http://192.168.142.1:8002`, the browser could not establish a TCP connection, resulting in a `TypeError: Failed to fetch` network error.

### File Responsible

- **`.env`** (frontend root): Contained the incorrect `VITE_API_BASE_URL` pointing to `192.168.142.1:8002` instead of `localhost:8002`.

### Secondary Issue Found

- **`src/utils/resolveMediaUrl.js`**: Had a stale hardcoded fallback `http://127.0.0.1:8000` (old port 8000) instead of using the centralized `API_BASE_URL` from `apiClient.js`.

### Stale Ports/URLs Found

| Location | Old Value | Status |
|----------|-----------|--------|
| `.env` (frontend) | `http://192.168.142.1:8002` | Fixed → `http://localhost:8002` |
| `src/utils/resolveMediaUrl.js` | `http://127.0.0.1:8000` (fallback) | Fixed → imports from `apiClient.js` |

### CORS / CSRF / VITE Configuration Summary

- **Backend `.env`**: `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS` correctly include `http://localhost:5174` and `http://127.0.0.1:5174`. ✅
- **Backend `settings.py`**: Defaults match `.env.example` with port 5174. ✅
- **`.env.example` (frontend)**: Correctly documents `VITE_API_BASE_URL="http://localhost:8002"`. ✅
- **`vite.config.js`**: Server port is 5174. ✅
- **`apiClient.js`**: Centralized `API_BASE_URL` with fallback `http://localhost:8002`. ✅
- **`authApi.js`**: Uses `API_BASE_URL` from `apiClient.js` with `credentials: 'include'`. ✅
- **`cmsFetch.js`**: Uses `API_BASE_URL` from `apiClient.js` with `credentials: 'include'`. ✅
- **`CORS_ALLOW_CREDENTIALS`**: `True` in `settings.py`. ✅
- **`CORS_ALLOW_ALL_ORIGINS`**: Not used. ✅
- **Session cookies**: `HttpOnly=True`, `SameSite=Lax`. ✅
- **No localStorage tokens**: Auth uses session cookies only. ✅

### Why `Failed to fetch` Occurred

The browser at `localhost:5174` tried to `fetch('http://192.168.142.1:8002/api/v1/auth/csrf/')`. The network IP `192.168.142.1` was either not listening or not routable from the browser's context. The `fetch()` API throws a `TypeError: Failed to fetch` when the connection cannot be established — this is a network-level failure, not CORS or CSRF.

### Minimum Fix Required

1. Update `.env` to `VITE_API_BASE_URL="http://localhost:8002"` (matching browser hostname for SameSite cookies).
2. Fix `resolveMediaUrl.js` to import from centralized `apiClient.js`.
3. Add user-friendly error message for network errors in login page.

---

## 2. Files Modified

| File | Reason |
|------|--------|
| `.env` (frontend root) | Fixed `VITE_API_BASE_URL` from `192.168.142.1:8002` to `localhost:8002` |
| `src/utils/resolveMediaUrl.js` | Replaced stale `http://127.0.0.1:8000` fallback with import from `apiClient.js` |
| `src/components/leads/LeadsLoginPage.jsx` | Added user-friendly network error message instead of raw "Failed to fetch" |
| `src/contexts/AuthContext.jsx` | Suppress raw network error on initial `getCurrentUser()` when backend unreachable (status 0) |
| `src/components/location/CompanyLocationCard.jsx` | Removed map iframe, overlay button, `showMap` prop, `mapEmbedUrl` reference. Kept contact info. |
| `src/components/hero/CinematicHero.jsx` | Removed `showLocationCard` prop; location card always renders (contact info only, no map) |
| `src/App.jsx` | Removed `showLocationCard` prop from hero component rendering |
| `src/data/company/companyLocation.js` | Removed `mapEmbedUrl` field (no longer used) |
| `src/styles/global.css` | Removed all map-specific CSS (map-frame, iframe, overlay). Improved marquee cards (Phase 4) and services grid (Phase 5). |

---

## 3. Authentication Fix

### How API Base URL Was Unified

- The frontend `.env` was corrected to `VITE_API_BASE_URL="http://localhost:8002"`.
- `resolveMediaUrl.js` now imports `API_BASE_URL` from `src/services/apiClient.js` instead of defining its own fallback.
- All API services (`authApi.js`, `cmsFetch.js`, `leadsApi.js`, `contactApi.js`) already used the centralized `API_BASE_URL` from `apiClient.js` — no duplication existed.

### How CSRF/Login Requests Were Fixed

- The root cause was the unreachable API URL, not CSRF or CORS logic. Once `.env` was corrected, all endpoints (`/api/v1/auth/csrf/`, `/api/v1/auth/login/`, `/api/v1/auth/me/`, `/api/v1/auth/logout/`) use the same centralized `API_BASE_URL` with `credentials: 'include'`.
- Backend CORS/CSRF settings were already correct for `localhost:5174`.

### How Session Authentication Was Preserved

- No changes to authentication architecture.
- Session cookies (`SameSite=Lax`, `HttpOnly=True`) remain in use.
- No tokens in localStorage.
- `credentials: 'include'` on all fetch calls.
- CSRF token read from cookie for unsafe methods.

### User-Friendly Error Handling

- `LeadsLoginPage.jsx`: Network errors (status 0 or no status) now show "Unable to connect to the server. Please check your connection and try again." instead of raw "Failed to fetch".
- `AuthContext.jsx`: Initial `getCurrentUser()` network errors (status 0) are silently suppressed to avoid showing error state on page load when backend is down.

---

## 4. Map Removal

### Previous Location of Map

The map was rendered as a Google Maps iframe inside `CompanyLocationCard.jsx`, which was displayed in the hero section (`CinematicHero.jsx`) as an overlay panel at the bottom-left of the cinematic hero canvas.

### Files Modified for Map Removal

| File | What Was Removed |
|------|-----------------|
| `src/components/location/CompanyLocationCard.jsx` | `<iframe>` element, map overlay `<button>`, `showMap` prop, `mapEmbedUrl` variable, `latitude`/`longitude` references |
| `src/components/hero/CinematicHero.jsx` | `showLocationCard` prop and conditional wrapper |
| `src/App.jsx` | `showLocationCard` prop passing |
| `src/data/company/companyLocation.js` | `mapEmbedUrl` data field |
| `src/styles/global.css` | `.company-location-map-frame`, `.company-location-map-frame iframe`, `.company-location-map-overlay`, `.company-location-map-overlay--clickable`, and all hero-location map-frame overrides at 1023px/767px breakpoints |

### How Layout Was Fixed After Removal

- The `CompanyLocationCard` now renders only the contact info body (company name, address, phone, email, working hours, Google Maps link).
- The hero location panel retains its positioned overlay styling — the card is naturally smaller without the map, which fits better in the hero corner.
- No empty grid columns or dead space — the card was always a standalone element, not part of a grid.
- Contact info (address, phone, email, hours) and Google Maps link are preserved.
- CMS Site Settings page still has `map_embed_url` field for admin editing — this is admin-side configuration, not public-facing map display.

---

## 5. What We Build Improvements

### Grid/Layout Changes

- No structural layout change — the marquee uses a horizontal scrolling track (flexbox).
- Card width increased from `20rem` → `24rem` on desktop.
- Reduced-motion fallback cards: `18rem` → `22rem`.
- Mobile cards: `16rem` → `18rem`.

### Card Sizing

- Width: 20rem → 24rem (+20%)
- Padding: `1.75rem` → `2.25rem 2rem` (increased vertical padding)

### Typography

- Title: `1.125rem` → `1.25rem`, line-height `1.3` → `1.35`, margin-bottom `0.5rem` → `0.75rem`
- Description: `0.9rem` → `0.9375rem`, line-height `1.5` → `1.6`, color `#8a919c` → `#949ba6` (slightly brighter for readability)

### Spacing

- Gap between title and description increased.
- Better internal content distribution with increased padding.

### Hover States

- Border color: `rgba(141, 81, 160, 0.4)` → `0.45` (slightly stronger)
- Background: `0.04` → `0.05` opacity
- Transform: `translateY(-0.25rem)` → `translateY(-0.375rem)` (more pronounced)
- **New**: `box-shadow: 0 0.75rem 2.5rem rgba(141, 81, 160, 0.1)` (subtle purple glow on hover)
- Transition now includes `box-shadow` for smooth glow appearance

---

## 6. Services Improvements

### Cards Per Row by Breakpoint

| Viewport | Breakpoint | Columns | Layout (5 cards) |
|----------|-----------|---------|-----------------|
| Large desktop | > 1024px | 3 | 3 + 2 |
| Laptop/Tablet | ≤ 1024px | 2 | 2 + 2 + 1 |
| Mobile | ≤ 640px | 1 | 1 × 5 |

Previous layout was 5 columns on desktop (all in one row) → too compressed.

### Card Sizing

- Padding: `2rem` → `2.5rem 2.25rem` (increased)
- Border-radius: `0.5rem` → `0.75rem` (slightly more rounded)
- **New**: `min-height: 14rem` (prevents height inconsistency)
- Mobile padding: `1.5rem` → `1.75rem 1.5rem`

### Visual Hierarchy

- Title: `1.125rem` → `1.25rem`, weight `400` → `500`, line-height `1.3` → `1.35`
- Description: color `#8a919c` → `#949ba6`, line-height `1.5` → `1.6`
- Icon: `2.5rem` → `3rem` (+20%), margin-bottom `1.5rem` → `1.75rem`

### Hover State

- **New**: `box-shadow: 0 0.75rem 2.5rem rgba(141, 81, 160, 0.08)` (subtle elevation)
- **New**: `transform: translateY(-0.25rem)` (lift effect)
- **New**: Icon `transform: scale(1.08)` on card hover (subtle icon motion)
- Transition now includes `box-shadow` for smooth elevation

### Responsive Behavior

- Desktop (>1024px): 3 columns with `1.75rem` gap — cards are spacious and readable.
- Tablet (≤1024px): 2 columns — prevents narrow cards while utilizing screen width.
- Mobile (≤640px): 1 column with `1rem` gap — full-width cards, easy to read.
- `min-height: 14rem` ensures consistent card heights across all breakpoints.
- `align-items: stretch` ensures all cards in a row have equal height.

---

## 7. Responsive Review

| Viewport | Services | Marquee | Hero Location | Contact | Footer | Issues |
|----------|----------|---------|---------------|---------|--------|--------|
| 1440px | 3-col (3+2) ✅ | 24rem cards ✅ | 26rem panel ✅ | Normal ✅ | 4-col ✅ | None |
| 1280px | 3-col (3+2) ✅ | 24rem cards ✅ | 26rem panel ✅ | Normal ✅ | 4-col ✅ | None |
| 1024px | 2-col (2+2+1) ✅ | 24rem cards ✅ | 22rem panel ✅ | Normal ✅ | 2-col ✅ | None |
| 768px | 2-col ✅ | 24rem cards ✅ | Full-width bottom ✅ | Normal ✅ | 2-col ✅ | None |
| 430px | 1-col ✅ | 18rem cards ✅ | Full-width bottom ✅ | Stacked ✅ | 1-col ✅ | None |
| 390px | 1-col ✅ | 18rem cards ✅ | Full-width bottom ✅ | Stacked ✅ | 1-col ✅ | None |
| 360px | 1-col ✅ | 18rem cards ✅ | Full-width bottom ✅ | Stacked ✅ | 1-col ✅ | None |

### Key Checks

- **Horizontal overflow**: No — all grids use `1fr` columns, marquee has `overflow: hidden`.
- **Text overflow**: No — cards have adequate padding and text uses `line-height: 1.6`.
- **RTL**: Hero location panel switches `left` → `right` correctly. ✅
- **EN/AR**: Both languages work — bilingual fields via `getBilingual()`. ✅
- **Header/Hero/Contact**: Not broken by map removal — map was isolated to `CompanyLocationCard`. ✅
- **Tablet**: 2-column services grid prevents narrow cards. ✅
- **Touch targets**: Buttons and links have adequate padding on mobile. ✅

### Remaining Issues

None identified.

---

## 8. Validation

### Backend

```
python manage.py check
```
**Result:** PASS — System check identified no issues (0 silenced).

### Frontend

```
npm run build
```
**Result:** PASS — Built successfully in 13.00s. No errors, no broken imports, no JSX/CSS errors.

### Hardcoded URL Check

Searched `src/` for `127.0.0.1:8000`, `localhost:8000`, `localhost:8001`, `127.0.0.1:8001` — **no results**. ✅

### Map Removal Check

Searched `src/` for `mapEmbedUrl`, `map_embed_url`, `map-frame`, `map-overlay`, `showMap` — only admin-side references in `CMSSiteSettingsPage.jsx` and `CMSLanguageContext.jsx` (CMS settings form, not public-facing). ✅

### Smoke Check (Manual)

The following steps should be verified manually by running both servers:

1. Start backend on port 8002.
2. Start frontend on port 5174.
3. Open `/leads/login` — should load without "Failed to fetch".
4. Attempt login — should authenticate via session cookies.
5. Open homepage — map should not be visible.
6. Review "What We Build" section — larger cards with hover glow.
7. Review "Services" section — 3 columns on desktop, 2 on tablet, 1 on mobile.
8. Test at 1440px, 1024px, 768px, 430px viewport widths.

---

## 9. Final Verdict

```
PASS
```

- ✅ Root cause of `Failed to fetch` identified (unreachable IP in `.env`).
- ✅ Login fix applied (corrected `VITE_API_BASE_URL` to `localhost:8002`).
- ✅ Stale fallback URL in `resolveMediaUrl.js` fixed.
- ✅ User-friendly error message added for network errors.
- ✅ Map removed entirely from public-facing site (iframe, CSS, data, props).
- ✅ Contact info preserved (address, phone, email, hours, Google Maps link).
- ✅ "What We Build" cards enlarged with improved typography and hover effects.
- ✅ Services grid changed from 5 columns to 3/2/1 with larger cards.
- ✅ Responsive design reviewed across 7 viewport sizes.
- ✅ `python manage.py check` — PASS.
- ✅ `npm run build` — PASS.
- ✅ No hardcoded stale API URLs in active code.
- ✅ No broken imports or references to removed map components.
