# SIDRAHSOFT-CONTACT-LINKEDIN-RUNTIME-CONSISTENCY-FIX-004-REPORT

**Task ID:** `SIDRAHSOFT-CONTACT-LINKEDIN-RUNTIME-CONSISTENCY-FIX-004`  
**Date:** 2026-08-19  
**Repository:** `F:\What_i_Made\New\sidrah_web`  
**Preview URL:** `http://127.0.0.1:63395`  

---

## 1. Status

Implemented. Build passes. Changes are local and uncommitted.

---

## 2. LinkedIn Placeholder Locations Found

- `src/components/Footer.jsx` — fallback value in `linkedinUrl`
- `src/config/seo.js` — `sameAs` array

The `SocialIcons` component (`src/components/SocialIcons.jsx`) already contained the approved LinkedIn URL and was not a placeholder source.

---

## 3. LinkedIn Final URL

```
https://www.linkedin.com/sidrah.soft/
```

---

## 4. LinkedIn Placeholders Remaining?

NO

---

## 5. Contact Data Source Hierarchy

| Consumer | Primary Source | Fallback |
|---|---|---|
| Header CTA | `t('header.cta')` | n/a (text only) |
| Footer email | `settings.contact.contact_email` | `sidrahsoft@gmail.com` |
| Footer phone | static link in `contactLinks` | `tel:01027285487` |
| Footer WhatsApp | `settings.contact.whatsapp_url` | `https://wa.me/201027285487` |
| Footer LinkedIn | `settings.social.linkedin_url` | `https://www.linkedin.com/sidrah.soft/` |
| Footer location | `settings.location.address` | `companyLocation.address` object (en/ar) |
| Contact Section phone/WhatsApp/location | hardcoded local fallback values | same values |
| SEO `sameAs` | `src/config/seo.js` | n/a |

`settings` comes from the public `/api/v1/site-settings/` endpoint via `useSiteSettings`.

---

## 6. CMS Data Override Check

Command run:

```bash
python manage.py shell -c "from apps.site_settings.models import SiteSetting; s=SiteSetting.get_current(); print('exists:', bool(s)); print('phone:', repr(s.phone if s else None)); print('whatsapp_url:', repr(s.whatsapp_url if s else None)); print('address:', repr(s.address if s else None)); print('linkedin_url:', repr(s.linkedin_url if s else None));"
```

Result:

```
exists: False
phone: None
whatsapp_url: None
address: None
linkedin_url: None
```

**Conclusion:** No `SiteSetting` row exists in the local database. Therefore the public site currently uses the frontend fallbacks, which are now all aligned with the approved values.

---

## 7. CMS Data Changed?

NO — no `SiteSetting` row was created or updated at runtime.

The default-seed management command (`seed_site_settings`) was updated so that if it is run later it will create a record with the approved contact values rather than the old Riyadh defaults.

---

## 8. Seed Command Update

File: `backend/apps/site_settings/management/commands/seed_site_settings.py`

Changes:
- Added `phone='01027285487'`
- Added `whatsapp_url='https://wa.me/201027285487'`
- Added `linkedin_url='https://www.linkedin.com/sidrah.soft/'`
- Set `address=''` so the bilingual `companyLocation.address` fallback remains effective.

Old `address='Riyadh, Saudi Arabia'` removed.

---

## 9. Runtime Displayed Values

Because no CMS record overrides them, the effective runtime values are:

- **Phone display:** `01027285487`
- **WhatsApp display:** `01027285487`
- **WhatsApp href:** `https://wa.me/201027285487`
- **Phone href:** `tel:01027285487`
- **English location:** `Beheira Governorate, Egypt`
- **Arabic location:** `جمهورية مصر العربية – محافظة البحيرة`
- **LinkedIn:** `https://www.linkedin.com/sidrah.soft/`

---

## 10. SEO / Structured Data Result

`src/config/seo.js` updated:
- LinkedIn `sameAs` entry now uses `https://www.linkedin.com/sidrah.soft/`
- WhatsApp `sameAs` entry remains `https://wa.me/201027285487`

No other SEO fields changed.

---

## 11. Mobile Hero Fix

### Root Cause

On mobile the Hero content overlay used `justify-content: flex-end` inside a `100vh` stage. That pinned the brand name, slogan, supporting copy, and CTAs near the bottom of the viewport, leaving a large empty grid area between the fixed header and the content.

### Fix

In `src/styles/hero.css`, inside `@media (max-width: 767px)`:

- Changed `.hero-content-overlay` from `justify-content: flex-end` to `justify-content: flex-start`.
- Added top padding: `clamp(5rem, 14vh, 7rem)` to clear the fixed header.
- Reduced bottom padding slightly and tightened gaps/font sizes.

### Behavior Change

| Viewport | Before | After |
|---|---|---|
| 360×800 | Content near bottom, large empty top | Content begins shortly below header |
| 390×844 | Content near bottom, large empty top | Content begins shortly below header |
| 430×932 | Content near bottom, large empty top | Content begins shortly below header |
| Desktop | Centered two-column composition | Unchanged |

### Arabic RTL

Preserved. The Hero grid still flips direction in RTL; on mobile the content remains centered with text aligned right.

### Performance

Pure CSS change. No JS, images, or heavy effects added.

---

## 12. Files Modified

- `src/components/Footer.jsx`
- `src/config/seo.js`
- `src/styles/hero.css`
- `backend/apps/site_settings/management/commands/seed_site_settings.py`

---

## 13. Data Records Modified

None at runtime. The local database has no `SiteSetting` record.

---

## 14. Build Result

```
npm run build
```

- Exit code: 0
- Built in 6.14s
- Only pre-existing Vite chunk-size and `insightsApi.js` warnings.

---

## 15. Browser Validation

Screenshots were skipped by user request. The preview server is available at `http://127.0.0.1:63395` for local review of:

- Mobile Hero at 360×800 / 390×844 / 430×932
- Arabic RTL Hero
- Footer contact/LinkedIn values
- Contact Section values

---

## 16. Remaining Production-Only Checks

- Verify the production CMS `SiteSetting` record does not contain outdated phone, WhatsApp, address, or LinkedIn values. If it does, update only those fields to the approved values listed above.
- The local environment has no `SiteSetting` row, so the frontend fallbacks are the current source of truth.

---

## 17. Confirmation: No Commit/Push

No `git commit`, `git push`, `git reset`, `git stash`, or `git clean` was performed. All changes remain in the working tree for review.
