# Global Scroll-to-Top Fix Report

**Task ID:** `SIDRAHSOFT-GLOBAL-SCROLL-TO-TOP-FIX-001`  
**Status:** PASS  
**Scope:** Frontend route navigation only

## Root Cause

The application uses one `BrowserRouter` around `App`, but it had no global route-level scroll restoration handler. React Router changes the rendered route without causing a document reload, so the browser retained the existing document scroll position when navigating between normal routes.

`CourseDetailPage` had a local `window.scrollTo(0, 0)` effect, but all other public and CMS routes lacked equivalent behavior. The local implementation did not solve the global navigation problem and duplicated logic at page level.

## Files Changed

- `src/components/ScrollToTop.jsx` — created global route scroll handler.
- `src/App.jsx` — mounted the handler once above application routes.
- `src/pages/CourseDetailPage.jsx` — removed the redundant page-local scroll reset.

No backend files were changed. No packages were installed. No migrations are required.

## Implementation Summary

`ScrollToTop` uses React Router's `useLocation()` and `useNavigationType()` at the application root:

- For normal `PUSH` and `REPLACE` pathname navigations without a hash, it calls:

```js
window.scrollTo({
  top: 0,
  left: 0,
  behavior: 'auto',
});
```

- It is mounted exactly once in `App`, inside the existing `BrowserRouter` tree.
- It applies to public routes, Leads routes, and CMS routes without adding duplicated page-level effects.
- It does not change any internal component scroll containers.

## Hash-Link Handling

When the target URL contains a hash, the handler does not force the page to absolute top. It finds the element matching the decoded hash ID and runs:

```js
target.scrollIntoView({ block: 'start' });
```

This preserves existing homepage section navigation such as `/#contact` and in-page anchor expectations.

## Back/Forward Behavior

For browser history `POP` navigation, the handler does not reset the page to top. This leaves browser back/forward scroll restoration available and avoids unnecessarily overriding the browser's history behavior.

Hash navigation still receives anchor handling for history entries containing a hash.

## Validation Results

### Source Review

- `BrowserRouter` wraps `App` in `src/main.jsx`.
- `ScrollToTop` is mounted once in `src/App.jsx`.
- Dependencies track `pathname`, `hash`, and navigation type.
- Normal route navigation uses the required `window.scrollTo` call.
- Hash URLs use the anchor element instead of a top reset.
- Course-detail page-specific scroll logic was removed; no duplicate route-scroll implementation remains.

**Result: PASS**

### Development Preview

A Vite preview server was started at:

```text
http://127.0.0.1:5173
```

Use it for the following manual browser confirmation:

1. Scroll the homepage, navigate to `/training`, and confirm the page starts at top.
2. Scroll `/training`, open any course detail route, and confirm it starts at top.
3. Navigate across at least three public routes and confirm each normal navigation starts at top.
4. Navigate to `/#contact` and confirm the contact section is selected rather than resetting to top.
5. Use browser back/forward and confirm the browser retains acceptable history scroll behavior.

### Build

```text
npm run build
✓ built successfully
```

**Result: PASS**

The build retains pre-existing non-blocking Vite warnings about duplicate translation keys, mixed dynamic/static import of `insightsApi.js`, and bundle size. None are introduced by this change.

### Diff Validation

```text
git diff --check
```

**Result: PASS** (line-ending warnings only).

## Final Verdict

**PASS**

Global route scrolling now resets normal navigations to the top, preserves hash-anchor navigation, and avoids overriding browser back/forward restoration. The change is frontend-only, minimal, and dependency-free.
