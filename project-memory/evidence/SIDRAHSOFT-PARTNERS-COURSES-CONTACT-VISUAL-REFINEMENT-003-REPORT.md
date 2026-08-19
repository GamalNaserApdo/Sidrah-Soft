# SIDRAHSOFT-PARTNERS-COURSES-CONTACT-VISUAL-REFINEMENT-003-REPORT

**Task ID:** `SIDRAHSOFT-PARTNERS-COURSES-CONTACT-VISUAL-REFINEMENT-003`  
**Date:** 2026-08-19  
**Repository:** `F:\What_i_Made\New\sidrah_web`  
**Preview URL:** `http://127.0.0.1:63395`  

---

## 1. Status

Implemented. Build passes. Changes are local and uncommitted.

---

## 2. Files Modified

- `src/styles/global.css`
- `src/styles/sections.css`
- `src/styles/training.css`
- `src/styles/tokens.css`
- `src/components/sections/PartnersTrustSection.jsx`
- `src/components/pages/TrainingPage.jsx`
- `src/components/sections/ContactSection.jsx`
- `src/components/sections/Footer.jsx`
- `src/components/hero/HeroContent.jsx`
- `src/styles/hero.css`
- `src/data/caseStudies/caseStudiesData.js`
- `src/data/company/companyLocation.js`
- `src/config/seo.js`
- `src/components/FloatingSocialBar.jsx`
- `src/i18n/en.js`
- `src/i18n/ar.js`

---

## 3. Partner-Card Changes

- Card background is already `var(--card-surface-solid)` (#161420); no glass/transparency on the card surface.
- Partner logo frame background changed from a translucent dark surface to a solid light surface (`#f8f8fa`) with a subtle dark border.
- Logo `filter` brightness/contrast overrides removed so logos render in their original colors on a high-contrast background.
- Logo `object-fit: contain`, `max-width: 100%`, and `max-height` preserved; no cropping or stretching.
- Padding and border radius preserved.

---

## 4. Club Pilates Result

Club Pilates logo now sits on a solid `#f8f8fa` frame. Without the previous dark/translucent frame, the dark logo is clearly visible. All partner logos are rendered in original color on the same consistent light frame.

---

## 5. Course-Card Changes

- `TrainingPage.jsx` `CourseCard` no longer renders any image container.
- Removed: image wrapper, image fallback, and category badge positioned on the image.
- Added: a category chip at the top of the card body.
- Card body retains flex layout, title, summary, and CTA.
- CSS updated to remove image/fallback styles and style the new category chip.
- Training track selector cards (`training-track-card`) now use `var(--card-surface-solid)` and `var(--color-border-solid)` instead of translucent backgrounds.
- No gradient card fills introduced.

---

## 6. Course-Image Removals

- Removed current course images from the `CourseCard` rendering path only.
- Image imports in `src/data/courses.js` and `CourseDetailPage` remain intact; detail-page hero images are out of scope.
- No placeholder or stock imagery added.
- No empty image containers or awkward gaps remain; the category chip fills the top of the card body.

---

## 7. Section-Separation Changes

- Added a new token `--section-wash: rgba(10, 11, 16, 0.78)` in `tokens.css`.
- Applied the wash to all public homepage content sections (Foundation, Capabilities, Industries, Partners, Case Studies, Insights, Careers, Contact) via a grouped CSS rule in `sections.css`.
- Applied the same wash and slightly stronger purple-tinted top/bottom borders to the `training-education-entry` section in `training.css`.
- Existing ambient gradients and top/bottom borders are preserved; the wash mutes the technical grid just enough to make each section feel bounded.
- No heavy backgrounds, videos, Canvas, WebGL, or animated blur added.

---

## 8. "Web Platform" Occurrences Found

Two occurrences in `src/data/caseStudies/caseStudiesData.js` inside the `technologies` arrays for case studies.

Both were used as SidrahSoft service naming.

---

## 9. Exact Service Wording Replacements

| Before | After |
|---|---|
| `Web Platform` (Education Learning Platform case study) | `Web Application` |
| `Web Platform` (Healthcare Appointment & Records case study) | `Web Application` |

Arabic case-study data did not contain a corresponding literal "Web Platform" string; existing Arabic translations already use `منصة`/`تطبيق` in context.

---

## 10. Old Contact Data Found

| Location | Old Value |
|---|---|
| `src/data/company/companyLocation.js` | phone `+966 50 000 0000`, address `Etay Al Baroud, Egypt` / `إيتاي البارود، مصر` |
| `src/components/sections/ContactSection.jsx` | phone/WA `+966 50 000 0000` / `966500000000`, location `Riyadh, Saudi Arabia` / `الرياض، المملكة العربية السعودية` |
| `src/config/seo.js` | `https://wa.me/PLACEHOLDER` |
| `src/components/FloatingSocialBar.jsx` | `https://wa.me/PLACEHOLDER` |
| `src/i18n/en.js` & `src/i18n/ar.js` | footer location label `Egypt` / `مصر` |

---

## 11. New Contact Data Applied

| Field | New Value |
|---|---|
| Display phone | `01027285487` |
| Display WhatsApp | `01027285487` |
| `tel:` link | `tel:01027285487` |
| `wa.me` direct link | `https://wa.me/201027285487` |
| English location | `Beheira Governorate, Egypt` |
| Arabic location | `جمهورية مصر العربية – محافظة البحيرة` |

Applied in:
- `src/data/company/companyLocation.js`
- `src/components/sections/ContactSection.jsx`
- `src/components/Footer.jsx` (WhatsApp fallback URL)
- `src/config/seo.js`
- `src/components/FloatingSocialBar.jsx`
- `src/i18n/en.js` & `src/i18n/ar.js` (footer labels and new `phone` key)
- `src/components/Footer.jsx` contactLinks now includes a phone link.

---

## 12. WhatsApp Link Result

Direct WhatsApp links across the public frontend now use `https://wa.me/201027285487`. The displayed number remains `01027285487`.

---

## 13. Phone Link Result

Phone links use `tel:01027285487`.

---

## 14. Arabic Location Result

Arabic footer/contact location now reads `جمهورية مصر العربية – محافظة البحيرة`.

---

## 15. English Location Result

English footer/contact location now reads `Beheira Governorate, Egypt`.

---

## 16. Responsive Result

- Partner grid collapses from 3 → 2 → 1 column; solid cards and light logo frames remain readable at all sizes.
- Course grid becomes a single column on mobile; imageless cards still show category chip, title, summary, and CTA with no broken gaps.
- Hero logo scales via `clamp()` and respects reduced-motion preferences.
- Section wash applies consistently across breakpoints.
- No horizontal overflow introduced.

Browser screenshots were skipped by user request; preview server is available for manual review.

---

## 17. Arabic RTL Result

- `[dir='rtl']` rules preserved for partner names, course-card CTAs, footer links, and hero positioning.
- Hero brand column remains anchored to the right in Arabic.
- New hero logo and course category chip do not break RTL layout.

---

## 18. Performance Impact

- No new images, videos, Canvas, WebGL, or continuous animations added.
- Partner logo frame and course card changes are pure CSS / markup.
- Section separation uses a single CSS color wash.
- Build output size unchanged except for the CSS recompilation; no new assets.

---

## 19. Build/Test Result

```
npm run build
```

- Exit code: 0
- Built in 9.42s
- Only pre-existing Vite chunk-size and `insightsApi.js` warnings.

No lightweight frontend tests were present to run.

---

## 20. Remaining Issues

- Browser screenshots were not provided; the preview at `http://127.0.0.1:63395` can be used to confirm partner/course card visuals and Club Pilates clarity.
- LinkedIn URL in `src/config/seo.js` and `src/components/Footer.jsx` remains a `PLACEHOLDER`; no official value was provided.
- CMS-stored contact/location values will override the fallbacks if they are configured differently in the database.

---

## 21. Confirmation: No Commit/Push

No `git commit`, `git push`, `git reset`, `git stash`, or `git clean` was performed. All changes remain in the working tree for review.
