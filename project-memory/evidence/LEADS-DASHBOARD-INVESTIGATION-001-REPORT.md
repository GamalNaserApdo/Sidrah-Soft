# LEADS-DASHBOARD-INVESTIGATION-001 — Investigation Report

**Date:** 2026-07-16  
**Status:** FAIL  
**Scope:** Investigate why `http://localhost:5174/leads` is not displaying content

---

## 1. Route Analysis

### Route Registration

The `/leads` route is registered in `src/App.jsx:140-148`:

```jsx
<Route path="/leads/*" element={
  <AuthProvider>
    <CMSLanguageProvider>
      <CMSToastProvider>
        <LeadsRoutes />
      </CMSToastProvider>
    </CMSLanguageProvider>
  </AuthProvider>
} />
```

- Route path: `/leads/*` — correctly uses wildcard for nested routes
- Providers: `AuthProvider` → `CMSLanguageProvider` → `CMSToastProvider` → `LeadsRoutes`
- All three providers are properly nested

### Nested Routes in LeadsRoutes

`src/components/leads/LeadsRoutes.jsx:14-33`:

```jsx
<Routes>
  <Route path="login" element={<LeadsLoginPage />} />
  <Route path="" element={
    <ProtectedRoute requiredModule="contact">
      <LeadsLayout>
        <LeadsDashboardPage />
      </LeadsLayout>
    </ProtectedRoute>
  } />
  <Route path=":id" element={
    <ProtectedRoute requiredModule="contact">
      <LeadsLayout>
        <LeadDetailPage />
      </LeadsLayout>
    </ProtectedRoute>
  } />
</Routes>
```

- `path=""` matches `/leads` (empty sub-path under `/leads/*`)
- `path="login"` matches `/leads/login`
- `path=":id"` matches `/leads/:id`
- **Route registration is correct**

### Redirect Flow

1. User visits `/leads`
2. `ProtectedRoute` calls `useAuth()` → `isLoading = true` → shows "Loading..." div
3. `AuthContext` calls `getCurrentUser()` → backend returns 401 → returns `null`
4. `setUser(null)`, `setIsLoading(false)`
5. `ProtectedRoute` sees `isAuthenticated = false` → redirects to `/leads/login?next=%2Fleads`
6. `LeadsLoginPage` renders

**Verdict:** Route registration and redirect flow are correct. The issue is downstream.

---

## 2. Component Tree

```
App
└── BrowserRouter (main.jsx)
    └── I18nProvider (main.jsx)
        └── App
            └── Routes
                └── Route path="/leads/*"
                    └── AuthProvider
                        └── CMSLanguageProvider
                            └── CMSToastProvider
                                └── LeadsRoutes
                                    └── Routes
                                        ├── Route path="login" → LeadsLoginPage
                                        ├── Route path="" → ProtectedRoute → LeadsLayout → LeadsDashboardPage
                                        └── Route path=":id" → ProtectedRoute → LeadsLayout → LeadDetailPage
```

### LeadsLoginPage Imports

`src/components/leads/LeadsLoginPage.jsx:7-12`:

```jsx
import { useCallback, useState, useId } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../ui/Input.jsx';
import { ErrorState } from '../ui/StateViews.jsx';
import Button from '../ui/Button.jsx';
```

### LeadsLoginPage Usage

`src/components/leads/LeadsLoginPage.jsx:25`:

```jsx
const { t } = useCMSLang();
```

### Import vs Usage Comparison

| Hook/Component | Imported? | Used? |
|---|---|---|
| `useCallback` | Yes (line 7) | Yes (line 34) |
| `useState` | Yes (line 7) | Yes (lines 27-30) |
| `useId` | Yes (line 7) | Yes (line 31) |
| `Navigate` | Yes (line 8) | Yes (line 64) |
| `useLocation` | Yes (line 8) | Yes (line 24) |
| `useAuth` | Yes (line 9) | Yes (line 23) |
| `Input` | Yes (line 10) | Yes (lines 79, 89) |
| `ErrorState` | Yes (line 11) | Yes (line 101) |
| `Button` | Yes (line 12) | Yes (line 104) |
| **`useCMSLang`** | **NO** | **Yes (line 25)** |

### All Other Leads Components — Import Check

| Component | Imports `useCMSLang`? |
|---|---|
| `LeadsDashboardPage.jsx` | Yes (line 10) |
| `LeadsLayout.jsx` | Yes (line 5) |
| `LeadsHeader.jsx` | Yes (line 9) |
| `LeadsToolbar.jsx` | Yes (line 5) |
| `LeadsPagination.jsx` | Yes (line 5) |
| `LeadsBadge.jsx` | Yes (line 5) |
| `LeadDetailPage.jsx` | Yes (line 10) |
| **`LeadsLoginPage.jsx`** | **NO** |

---

## 3. Rendering Status

### Expected Flow (when visiting `/leads` without authentication)

1. `ProtectedRoute` renders "Loading..." while `AuthContext` checks auth
2. `getCurrentUser()` returns `null` (401 from backend)
3. `ProtectedRoute` redirects to `/leads/login?next=%2Fleads`
4. `LeadsLoginPage` mounts
5. `LeadsLoginPage` calls `useCMSLang()` at line 25
6. **`useCMSLang` is not defined** → `ReferenceError: useCMSLang is not defined`
7. React component throws during render
8. No error boundary catches it → **white screen / blank page**

### Actual Behavior

The page displays nothing (blank white page) because `LeadsLoginPage` crashes with a `ReferenceError` before it can render any content.

### Why the Build Succeeded

Vite's production build (`npm run build`) does not perform static analysis for undefined variable references. It bundles the code as-is. The error only manifests at runtime when the component attempts to execute the undefined function.

---

## 4. Errors Found

### Error 1: Missing `useCMSLang` Import in LeadsLoginPage

- **File:** `src/components/leads/LeadsLoginPage.jsx`
- **Line:** 25
- **Error type:** `ReferenceError`
- **Message:** `useCMSLang is not defined`
- **Severity:** **HIGH — Blocks all leads dashboard access**
- **Impact:** Any unauthenticated visit to `/leads` redirects to `/leads/login`, which crashes. Authenticated users who are already logged in would go directly to `LeadsDashboardPage` (which has the correct import), so they would not encounter this error. However, any logout, session expiry, or fresh visit triggers the crash.

### Error 2 (Non-blocking): Build Warning

- **File:** `src/services/insightsApi.js`
- **Warning:** Dynamically imported by `useInsights.js` but also statically imported — dynamic import will not move module into another chunk.
- **Severity:** LOW — No runtime impact, unrelated to leads dashboard

---

## 5. Root Cause

**The `LeadsLoginPage` component calls `useCMSLang()` at line 25 but does not import it.**

Every other leads component (`LeadsDashboardPage`, `LeadsLayout`, `LeadsHeader`, `LeadsToolbar`, `LeadsPagination`, `LeadsBadge`, `LeadDetailPage`) correctly imports `useCMSLang` from `../../contexts/CMSLanguageContext`. The `LeadsLoginPage` is the only file that omits this import.

When an unauthenticated user visits `/leads`:
1. `ProtectedRoute` redirects to `/leads/login`
2. `LeadsLoginPage` mounts and immediately throws `ReferenceError: useCMSLang is not defined`
3. No React error boundary is configured to catch this → blank page

---

## 6. Recommended Fix

**Add the missing import to `LeadsLoginPage.jsx`:**

In `src/components/leads/LeadsLoginPage.jsx`, add:

```jsx
import { useCMSLang } from '../../contexts/CMSLanguageContext';
```

After the existing imports (after line 9, alongside `useAuth`):

```jsx
import { useAuth } from '../../contexts/AuthContext';
import { useCMSLang } from '../../contexts/CMSLanguageContext';
```

**This is a one-line fix.** No other changes are required.

---

## 7. Files Expected To Change

| File | Change | Lines |
|---|---|---|
| `src/components/leads/LeadsLoginPage.jsx` | Add `useCMSLang` import | +1 line |

**Total: 1 file, 1 line added.**

---

## 8. Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Fix introduces new import cycle | Very Low | `useCMSLang` is imported by 7 other leads components without issues — no cycle exists |
| Fix doesn't resolve the issue | Very Low | The root cause is definitively a missing import. Adding it will allow the component to render. |
| Other leads components have similar issues | None | All 7 other leads components were verified — they all correctly import `useCMSLang` |
| Backend API incompatibility | None | Backend returns 401 for unauthenticated requests as expected. `getCurrentUser` handles this correctly. |
| CSS hiding content | None | No `display: none` or `visibility: hidden` on leads layout/page/card selectors |

---

## 9. Final Status

**FAIL**

The `/leads` route is not displaying content because `LeadsLoginPage.jsx` has a missing import for `useCMSLang`, causing a `ReferenceError` that crashes the component on every unauthenticated access.

| Check | Result |
|---|---|
| Route registered correctly? | PASS |
| Component should render for /leads? | PASS |
| Is the component mounting? | PASS (then crashes) |
| Runtime errors? | **FAIL — `ReferenceError: useCMSLang is not defined`** |
| Failed imports? | **FAIL — `useCMSLang` not imported** |
| Failed API calls? | PASS (401 handled correctly) |
| Authentication guards blocking rendering? | PASS (redirect works correctly) |
| React rendering exceptions? | **FAIL — unhandled ReferenceError** |
| Missing providers or context dependencies? | PASS (all providers wrapped in App.jsx) |
| Page rendering but hidden by CSS? | PASS (no hiding CSS found) |

---

## Summary

- **Root cause:** Missing `useCMSLang` import in `src/components/leads/LeadsLoginPage.jsx:25`
- **Severity:** HIGH — blocks all unauthenticated access to leads dashboard
- **Recommended fix:** Add `import { useCMSLang } from '../../contexts/CMSLanguageContext';` to `LeadsLoginPage.jsx`
- **Files involved:** `src/components/leads/LeadsLoginPage.jsx`
- **Report path:** `project-memory/evidence/LEADS-DASHBOARD-INVESTIGATION-001-REPORT.md`
- **Final status:** FAIL
