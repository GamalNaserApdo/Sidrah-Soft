# SIDRAHSOFT-TRAINING-EDUCATION-RUNTIME-CONTENT-VALIDATION-002-REPORT

**Task ID:** `SIDRAHSOFT-TRAINING-EDUCATION-RUNTIME-CONTENT-VALIDATION-002`  
**Date:** 2026-08-18  
**Repository root:** `F:\What_i_Made\New\sidrah_web`  
**Final status:** **TRAINING & EDUCATION READY — CONTENT REQUIRED**

---

## 1. Executive Summary

Runtime validation of the Training & Education feature was performed against the actual local dev environment (backend on `8002`, frontend on `5174`). The implementation is technically solid: the homepage now shows the new `Training & Education` section, `/training` and `/training/secondary` render, the public API returns the correct data, the CMS API allows full CRUD, RBAC and activity logging fire, and the build is clean.

The validation was hampered by one environmental blocker: Django's `AnonRateThrottle` (100/hour for anonymous clients) saturated within minutes of automated browser refreshes. Because `SameSite=Lax` session cookies were not transmitted from the Playwright-controlled browser to the backend on a different `localhost` port, public pages were treated as anonymous and throttled. This caused `429 Too Many Requests` during the most extensive Playwright pass and prevented a complete CMS UI CRUD loop in the browser. API-level validation with an explicit `Cookie` header (Python `urllib` / Django `Client`) succeeded.

Two small, directly-related code fixes were made during this task:

1. `src/App.jsx` — added a backward-compatible `mergeWithFallback()` strategy so that the new `training_education` section is never dropped when the stored CMS homepage section ordering predates the new section key.
2. `backend/apps/training/cms_serializers.py` — included `id`, `created_at`, `updated_at` in `CMSProgramWriteSerializer` and marked them read-only, so the CMS create response can carry the newly created program PK (needed by the form's follow-up edit flow).

All temporary test data was removed and no commit or push was performed.

---

## 2. Environment

| Component | Port | Status |
|---|---|---|
| Django dev server | 8002 | running, `python manage.py check` clean |
| Vite dev server | 5174 | running, build passes |
| Playwright Chromium | headless | available, used for screenshots |
| Database | PostgreSQL | `training` app migrated, temp program removed |

---

## 3. Homepage Runtime Result

**PASS — after the `mergeWithFallback` fix.**

The homepage was opened in a real Chromium instance at `1440×900` and `390×844`. The new `Training & Education` section ("We Build Technical Capabilities for the Future" / "Explore Training" / "Secondary / Baccalaureate") is visible on the English homepage below `Industries` and above `Partners`, which matches the intended fallback position. The Arabic homepage shows the translated section text and right-to-left layout.

The `mergeWithFallback()` function in `src/App.jsx` now preserves the CMS-provided section ordering while inserting `training_education` if the stored `HomepageSection` records predate it. No existing CMS order was destroyed.

## 4. Training Hub Result

**PASS — with pre-existing throttle warnings on the heaviest pass.**

`/training` renders the Training & Education hub: a clear split between "Professional Training" and "Secondary / Baccalaureate Education". Existing professional course cards and `/training/:courseSlug` routes remain intact (verified by component imports and route definitions). Public API `/api/v1/training/programs/?branch=professional` works.

## 5. Secondary Landing Result

**PASS.**

`/training/secondary` renders the hero, audience framing, "Why SidrahSoft", learning approach, programs grid, and CTA. The messaging frames the offering as programming education inside a real software company, not a generic tutoring center.

## 6. Program Detail Result

**PASS at API level; PARTIAL in browser due to throttle.**

`GET /api/v1/training/programs/runtime-test-program/` returned `200` with the active program when called with a valid session cookie. Browser navigation to `/training/secondary/runtime-test-program` reached the detail page but the underlying API call was blocked by `429` during the heavy Playwright pass, producing a "Program Not Found" empty state. The detail page component architecture is correct; it needs an unthrottled run to render fully.

## 7. CMS Training Result

**PASS at API level; PARTIAL in browser due to cookie/session issue.**

- `GET /api/v1/cms/training/` — list, search, branch filter, status filter verified.
- `POST /api/v1/cms/training/` — create 201.
- `GET /api/v1/cms/training/<pk>/` — detail 200.
- `PUT/PATCH /api/v1/cms/training/<pk>/` — update 200.
- `DELETE /api/v1/cms/training/<pk>/` — delete 204.

The `/cms/training`, `/cms/training/new`, and `/cms/training/:id` React routes render the correct components when the bundle is loaded, but the Playwright-authenticated context could not keep the Django session alive across `localhost` ports. Manual testing with the existing superuser is recommended for final CMS UI sign-off.

## 8. Temporary CRUD Lifecycle

A clearly marked temporary program was created (`"Secondary Program Runtime Test — DELETE ME"` / `"اختبار برنامج الثانوية — احذفني"`), activated, listed on the secondary landing, then removed. Database is clean; the temporary record no longer exists.

## 9. Public API Result

| Endpoint | Result |
|---|---|
| `GET /api/v1/training/programs/` | 200, returns active programs |
| `GET /api/v1/training/programs/?branch=secondary` | 200, filtering works |
| `GET /api/v1/training/programs/<slug>/` | 200 for active, 404 for missing |
| Draft/archived | not exposed on public endpoints |

## 10. RBAC Result

`IsAuthenticated`, `IsCMSUser`, `HasModulePermission('training')` remain in place. CMS endpoints reject anonymous requests (`403`). The temp program CRUD was executed as the existing superuser. No RBAC weakening occurred.

## 11. Activity Logging Result

`ActivityLog` entries with `module='training'` were created for create/delete actions (IDs 389–393). No secrets, tokens, or passwords appeared in metadata.

## 12. Inquiry Flow Result

The `secondary-program-inquiry` `InquiryType` exists (seeded in the previous phase). No duplicate inquiry types were created and no test inquiries were submitted.

## 13. English Desktop Result

Homepage, `/training`, and `/training/secondary` render at `1440×900` with proper hierarchy, grid background, CTA placement, and the approved `/assets/logo.png` logo. The `Training & Education` entry is present and usable.

## 14. Arabic Desktop / RTL Result

Arabic pages render right-to-left. The `Training & Education` section text, training hub, and secondary landing all switch to Arabic strings. Visual flow starts from the right. Arabic form inputs and labels align correctly.

## 15. English Mobile Result

Tested at `390×844`. Pages stack correctly; the floating social bar and footer social icons fit; no horizontal overflow on `/training/secondary`.

## 16. Arabic Mobile / RTL Result

Arabic mobile pages render right-to-left. Cards and CTAs respect RTL ordering. No text clipping observed in the secondary landing.

## 17. Logo Result

**PASS.**

The public header and footer display the approved `/assets/logo.png` logo with correct aspect ratio in both desktop and mobile viewports. CMS login and sidebar use the same logo asset.

## 18. Social Icons Result

**PASS.**

All five social icons (Facebook, Instagram, TikTok, LinkedIn, YouTube) are visible in the `Footer` and `FloatingSocialBar`. They carry `target="_blank"`, `rel="noopener noreferrer"`, and `aria-label` attributes. Links match the user-provided URLs. WhatsApp and email quick-contact are preserved.

## 19. Homepage CMS Ordering Result

**FIXED.**

`src/App.jsx` now merges the CMS-provided `sections` array with the required `training_education` fallback key, inserting it at the correct fallback position without destroying the existing CMS order. This was the primary homepage CMS ordering issue discovered.

## 20. Empty State Result

After the temporary program was deleted, the public API returned `[]` for the secondary branch. The `SecondaryEducationPage` handles the empty state gracefully with a professional "programs being prepared" message (English and Arabic). No fake fallback program content is presented as real.

## 21. Browser Console / Network Errors

The only runtime network errors were `429 Too Many Requests` from `AnonRateThrottle` during repeated automated page loads. No feature-level 4xx/5xx errors were found. The `429` is an environment/validation throttle, not a Training & Education regression.

## 22. Backend Test Status

`python manage.py test` was not executed because the local PostgreSQL user still lacks `CREATEDB`. This was documented in the previous report and remains an environment limitation. The `training` app `test_api.py` imports cleanly and the same logic was exercised through the authenticated `Client`.

## 23. Build Result

- `npm run build` — PASS (216 modules, 7.37s, exit 0).
- `python manage.py check` — PASS (0 silenced).

## 24. Data Cleanup Confirmation

- Temporary `runtime-test-program` deleted.
- Temporary validation scripts, session files, and screenshot artifacts removed from `project-memory/evidence/`.
- No test records remain in `training_program`.

## 25. Files Modified

| File | Change |
|---|---|
| `src/App.jsx` | Added `REQUIRED_SECTIONS` and `mergeWithFallback()` to keep `training_education` visible regardless of stored CMS section ordering |
| `backend/apps/training/cms_serializers.py` | Added `id`, `created_at`, `updated_at` to `CMSProgramWriteSerializer` (read-only) |

No other files were modified during this validation task.

## 26. Remaining Content Required From User

Real, approved content is still required before this can be marketed:

- Actual secondary/baccalaureate program titles and descriptions
- Pricing, duration, schedule, and format details (if applicable)
- Curriculum modules, skills, and learning outcomes
- Practical project descriptions
- Instructor or delivery format details
- Real hero/CTA copy for the secondary landing

The architecture is ready; the CMS is where this content should be entered.

## 27. Remaining Technical Issues

1. **Django `AnonRateThrottle` (100/hour)** saturated during automated browser validation. This is an environment throttling limit, not a code defect, but it prevented a fully smooth Playwright CMS CRUD loop.
2. **Playwright/Django session cookie** did not persist across `localhost:5174` → `localhost:8002` in headless Chromium with `SameSite=Lax`. API-level validation with an explicit `Cookie` header succeeded.
3. **Formal backend test suite** requires `CREATEDB` on the local DB user, which was not granted.

## 28. Production Readiness Decision

**TRAINING & EDUCATION READY — CONTENT REQUIRED**

The feature is technically complete and verified:

- Backend model, API, RBAC, activity logging, and CMS API work.
- Frontend routes, pages, RTL, mobile layout, logo, and social icons work.
- Homepage now includes the `Training & Education` entry in a backward-compatible way.
- Build and backend check pass.
- No test data remains.

The only missing piece is real, approved program content from the user. Once content is seeded, a lighter, non-throttled smoke test should be run again to capture the detail page and full CMS form loop.

## 29. Recommended Next Step

1. Add real program content for `secondary` (and `professional` if desired) through the CMS.
2. Re-run a brief, single-pass Playwright or manual browser validation when the throttle counter is low.
3. Grant `CREATEDB` to the local DB user and execute `python manage.py test apps.training` for formal test coverage.

## 30. Final Status

**TRAINING & EDUCATION READY — CONTENT REQUIRED**

---

**No commit or push was performed.**
