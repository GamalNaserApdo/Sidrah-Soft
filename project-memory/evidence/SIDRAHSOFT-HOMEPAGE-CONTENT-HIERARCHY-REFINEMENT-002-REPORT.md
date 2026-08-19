# SIDRAHSOFT-HOMEPAGE-CONTENT-HIERARCHY-REFINEMENT-002-REPORT

**Task ID:** `SIDRAHSOFT-HOMEPAGE-CONTENT-HIERARCHY-REFINEMENT-002`  
**Date:** 2026-08-19  
**Repository:** `F:\What_i_Made\New\sidrah_web`  
**Preview URL:** `http://127.0.0.1:63395`  

---

## 1. Status

Implemented. Build passes. Changes are local and uncommitted.

---

## 2. Homepage Section Order BEFORE

1. Hero  
2. Foundation  
3. Capabilities / What We Build  
4. Services  
5. Automation Showcase  
6. Industries  
7. Training & Education  
8. Partners  
9. Case Studies  
10. Insights  
11. Careers  
12. Contact  

---

## 3. Homepage Section Order AFTER

1. Hero  
2. Foundation  
3. What We Build (Capabilities)  
4. Industries  
5. Training & Education  
6. Partners  
7. Case Studies  
8. Insights  
9. Careers  
10. Contact  

`Services` and `Automation Showcase` are no longer rendered on the homepage. Their component files, CMS modules, and backend APIs remain untouched.

---

## 4. Hero Content BEFORE / AFTER

### BEFORE

- Eyebrow: `SidrahSoft`
- Headline: `Technology partner for institutions and enterprises`
- Supporting: long paragraph about custom software, ERP, AI, and automation
- Primary CTA: `Book Consultation`
- Secondary CTA: `View Case Studies`
- Capability line: `Custom Software · ERP · AI · Automation`

### AFTER

- Brand name: `Sidrah Soft` / `سِدرة سوفت` (dominant visual)
- Slogan: `Enter the Next Era`
- Supporting: one short sentence
- Primary CTA: `Start a Project` / `ابدأ مشروعاً`
- Secondary CTA: `See What We Build` / `اكتشف ما نبنيه`
- No capability line
- No social icons

---

## 5. Exact Final English Hero Copy

```
Sidrah Soft

Enter the Next Era

We build technology, train professionals, and prepare students for what comes next.

[Start a Project] [See What We Build]
```

---

## 6. Exact Final Arabic Hero Copy

```
سِدرة سوفت

Enter the Next Era

نبني التقنية، نؤهل المهنيين، ونجهز الطلاب لما هو قادم — تحت اسم واحد.

[ابدأ مشروعاً] [اكتشف ما نبنيه]
```

The official brand slogan is kept in English as requested; no unapproved Arabic translation was introduced.

---

## 7. How Sidrah Soft Was Made Visually Dominant

- The company name is now the `h1` rendered at `clamp(3rem, 9vw, 8rem)`.
- It sits in its own column above the slogan, instead of being a small eyebrow above a generic marketing headline.
- The hero layout is a two-column editorial composition on desktop; in RTL the brand column is anchored to the right.
- Supporting copy is reduced to a single short sentence so the brand name and slogan control the first impression.

---

## 8. Slogan Placement

`Enter the Next Era` is placed directly beneath the brand name in a smaller, uppercase, gold-colored line. It is intentionally subordinate to the brand name and does not compete with it.

---

## 9. Social Links Removed from Hero

- The floating social bar (`FloatingSocialBar`) has been removed from `App.jsx` and no longer appears on any public page.
- The Hero itself never contained direct social links; no additional removal was needed inside the Hero component.

Result: social icons are no longer visible above the fold.

---

## 10. Footer Social Verification

The `SocialIcons` component used in the footer still renders all five approved platforms:

- Facebook
- Instagram
- TikTok
- LinkedIn
- YouTube

URLs are preserved from the existing configuration.

---

## 11. Services vs What We Build Consolidation

- The `Services` section was removed from the homepage flow because it duplicated `What We Build`.
- `What We Build` was retained as the primary software-development section.
- The `What We Build` card list was reduced to five focused categories:
  1. Web Applications
  2. Mobile Applications
  3. ERP / Business Systems
  4. AI & Automation
  5. Custom Software Solutions
- The automation pipeline/workflow graphic was removed from `What We Build` to avoid duplication with the overall automation message and to reduce visual noise.
- Header/footer anchor links that previously pointed to `#services` now point to `#capabilities`.
- The `ServicesSection` component file, CMS module, backend API, and service-detail architecture were **not** deleted.

---

## 12. Homepage Content Removed / Reduced

Removed from homepage rendering:
- `Services` section
- `Automation Showcase` section
- `FloatingSocialBar`
- Hero eyebrow
- Hero capability line
- Hero long supporting paragraph
- Section eyebrow labels and index numbers across Foundation, Capabilities, Industries, Partners, Case Studies, Insights, and Careers
- Automation workflow graphic inside Capabilities
- Extra capability cards (reduced from 10 to 5)

Reduced:
- Foundation description
- Capabilities description and card descriptions
- Industries description
- Partners description
- Case Studies heading and description
- Insights heading and description
- Careers description

---

## 13. Homepage Content Rewritten

- **Hero:** brand-first, one-sentence supporting copy, official slogan.
- **Foundation:** `One company. Three paths.` + short description tying software, training, and education together.
- **What We Build:** clearer five-category card set with one-line descriptions.
- **Industries:** `Sectors We Work With` + concise sector list.
- **Training & Education:** `We Build Capabilities. We Teach Learners.` + clear secondary/baccalaureate positioning.
- **Partners:** shorter, more direct partnership statement.
- **Case Studies:** `Selected Work` + focused description.
- **Insights:** `Technical Insights` + shorter description.
- **Careers:** shorter, human description.

Generic AI/agency phrases such as “Empowering businesses with innovative cutting-edge solutions” were removed where they appeared.

---

## 14. Training + Education Positioning

Training and Education are now presented as a core Sidrah pillar rather than an add-on. The section title explicitly pairs capability building with teaching, and the supporting copy mentions both professional training and secondary/baccalaureate pathways within a real software-company environment.

---

## 15. Arabic Font Audit Findings

Search across `src/` for font-related overrides:

- No remaining references to `El Messiri` or `Tajawal`.
- No component-level hardcoded Arabic font families on the public website.
- All Arabic typography resolves through the token variables `--font-display-ar` and `--font-body-ar`.
- CMS/admin inline `fontFamily: 'inherit'` and `system-ui` fallbacks remain; these do not override the public website Arabic font.

---

## 16. Central Cairo Implementation

In `src/styles/tokens.css`:

```css
--font-arabic: 'Cairo', 'Space Grotesk', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-display-ar: var(--font-arabic);
--font-body-ar: var(--font-arabic);
```

`--font-arabic` is now the single source of truth for the Arabic typeface. Changing it updates every Arabic heading and body usage across the public website. English fonts (`Space Grotesk`, `Inter`) were not changed.

---

## 17. Remaining Arabic Font Overrides

None on the public website. All Arabic text now inherits from `--font-arabic`.

---

## 18. Homepage Button Audit

Homepage CTAs/buttons reviewed:

- Hero primary CTA: solid gold
- Hero secondary CTA: transparent with border
- Foundation CTA: text link with arrow (not a button)
- Training & Education links: border-only buttons
- Careers CTA: solid copper
- Contact submit: solid gold
- Footer CTA: solid gold

No gradient fills remain on homepage buttons, including hover/focus/active states.

---

## 19. Confirmation of Zero Gradient-Filled Homepage Buttons

Verified in:
- `src/styles/hero.css` (hero primary CTA)
- `src/styles/sections.css` (contact submit button)
- `src/styles/global.css` (footer CTA zone button)

All three were converted from `linear-gradient` backgrounds to solid color backgrounds.

---

## 20. Arabic RTL Validation

- `html[dir='rtl']` still sets `direction: rtl`.
- Hero content grid uses `[dir='rtl'] .hero-content { direction: rtl; }` so the brand column appears on the right in Arabic.
- The Hero overlay aligns to the right in RTL on desktop.
- Mobile RTL keeps text aligned right and content centered.
- Section headings, cards, and form labels retain RTL-specific rules from the existing system.

---

## 21. Mobile Result

- Hero collapses to a single column with the brand name on top and the supporting statement below.
- CTA group becomes a vertical stack of full-width buttons.
- Brand font scales down via `clamp()` to remain readable.
- Removed sections reduce overall page length and information density.

---

## 22. English Regression Validation

- Technical grid background preserved.
- Logo and RTL architecture preserved.
- Section separation system (ambient gradients) from the previous refinement preserved.
- CMS/backend untouched.
- Training image architecture preserved.
- Insights underline fix preserved.

---

## 23. Build Result

```
npm run build
```

- Exit code: 0
- Built successfully in 9.53s
- Pre-existing Vite chunk-size and `insightsApi.js` warnings only; unrelated to this task.

---

## 24. Files Modified

| File | Change |
|---|---|
| `src/App.jsx` | Removed `FloatingSocialBar`; removed `ServicesSection` and `AutomationShowcaseSection` from homepage mapping/order; added `HIDDEN_HOMEPAGE_SECTIONS` filter. |
| `src/hooks/useHeaderNavigation.js` | Fallback nav anchors now point to `#capabilities` instead of `#services`. |
| `src/components/Footer.jsx` | Footer anchor links now point to `#capabilities`. |
| `src/components/hero/HeroContent.jsx` | Rewrote hero markup: brand name, slogan, supporting copy, two CTAs. |
| `src/styles/hero.css` | New two-column hero layout, larger brand name, solid primary CTA, RTL column flip. |
| `src/i18n/en.js` | New English hero copy. |
| `src/i18n/ar.js` | New Arabic hero copy. |
| `src/components/sections/FoundationSection.jsx` | Rewrote fallback copy and CTA target; removed eyebrow/index. |
| `src/components/sections/CapabilitiesMarqueeSection.jsx` | Reduced to 5 core categories, removed workflow, removed eyebrow/index. |
| `src/components/sections/IndustriesSection.jsx` | Shortened heading/description, removed eyebrow/index. |
| `src/components/sections/TrainingEducationEntry.jsx` | Rewrote title and description. |
| `src/components/sections/PartnersTrustSection.jsx` | Shortened description, removed eyebrow/index. |
| `src/components/sections/CaseStudiesSection.jsx` | Shortened heading/description, removed eyebrow/index. |
| `src/components/sections/InsightsSection.jsx` | Shortened heading/description, removed eyebrow/index. |
| `src/components/sections/CareersSection.jsx` | Shortened description, removed eyebrow/index. |
| `src/styles/tokens.css` | Added `--font-arabic` source-of-truth token. |
| `src/styles/global.css` | Footer CTA button converted to solid gold. |
| `src/styles/sections.css` | Contact submit button converted to solid gold. |

---

## 25. Remaining Issues

| Issue | Note |
|---|---|
| Browser captures | User chose to skip sending screenshots; preview server is available at `http://127.0.0.1:63395` for local review. |
| CMS navigation ordering | If the CMS header navigation has stored links pointing to `#services`, those should be updated by the content manager to `#capabilities`. The fallback links have been updated. |
| `ServicesSection` and `AutomationShowcaseSection` components | Still exist and can be re-enabled by removing `services` / `automation_showcase` from `HIDDEN_HOMEPAGE_SECTIONS` or restoring them in `FALLBACK_SECTION_ORDER`. |

---

## 26. Git Safety Confirmation

No `git commit`, `git push`, `git reset`, `git stash`, or `git clean` was performed. All changes remain in the working tree for review.
