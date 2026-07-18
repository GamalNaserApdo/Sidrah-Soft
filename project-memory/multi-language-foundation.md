# Multi-Language Foundation

This document describes the Arabic + English internationalization (i18n) foundation for the SidrahSoft website.

---

## Supported Languages

| Code | Label | Direction | UI label shown in switcher |
|------|-------|-----------|--------------------------|
| `en` | English | `ltr` | `English` |
| `ar` | Arabic | `rtl` | `العربية` |

Default language: **English (`en`)**.

---

## Translation File Structure

All i18n code lives in `src/i18n/`:

```text
src/i18n/
  config.js          # Language metadata and default
  en.js              # English translations
  ar.js              # Arabic translations
  index.js           # Barrel export + translations map
  I18nProvider.jsx   # React context provider + useI18n hook
```

### Adding a new key

1. Open `src/i18n/en.js` and `src/i18n/ar.js`.
2. Add the same nested key to both files with the translated string.
3. Use the key in components with the `t()` helper.

Example:

```js
// src/i18n/en.js
export const en = {
  hero: {
    title: 'Build the future of your business',
  },
};

// src/i18n/ar.js
export const ar = {
  hero: {
    title: 'ابنِ مستقبل أعمالك',
  },
};
```

```jsx
// In a component
import { useI18n } from '../i18n/I18nProvider.jsx';

function Hero() {
  const { t } = useI18n();
  return <h1>{t('hero.title')}</h1>;
}
```

If a key is missing, `t(key)` returns the key string itself as a fallback so the UI keeps working.

---

## Provider / Hook

The `I18nProvider` is mounted in `src/main.jsx` and wraps the whole app.

`useI18n()` returns:

- `lang` — current language code (`'en'` or `'ar'`).
- `setLanguage(code)` — switch the active language.
- `t(key)` — dotted-path translation helper.
- `dir` — current direction (`'ltr'` or `'rtl'`).
- `languages` — language configuration object.

### Persisting the choice

The selected language is saved to `localStorage` under the key `sidrah-language`. On the next visit, the provider restores it automatically. If no stored language exists, it falls back to the browser language and then to English.

### Direction handling

Whenever the language changes, the provider updates:

- `document.documentElement.lang`
- `document.documentElement.dir`

Arabic receives `lang="ar"` and `dir="rtl"`. English receives `lang="en"` and `dir="ltr"`.

---

## Language Switcher

A compact toggle is placed in the Header:

- Desktop: next to the CTA button.
- Mobile: inside the hamburger menu.

It always shows the **other** language label:

- In English mode: `العربية`
- In Arabic mode: `English`

Clicking it calls `setLanguage(...)` and updates the document direction immediately.

---

## RTL Preparation

Basic RTL-safe CSS is included in `src/styles/global.css`:

- `html[dir='rtl']` sets `direction: rtl` on the body.
- The floating social bar flips from `right: 1rem` to `left: 1rem`.
- The hover label of the floating social bar flips to the outside edge in RTL.

The Header and Footer rely on flexbox/grid layout that adapts naturally to RTL because the document direction controls the inline axis. No major layout redesign was done for this foundation task.

---

## How a CMS Can Later Provide Translated Content

The current structure is built for easy CMS integration:

1. The `translations` object in `src/i18n/index.js` can be replaced or merged with a CMS payload.
2. The `en.js` and `ar.js` files act as the source of truth for static UI labels; CMS-driven content (insights, case studies, training details, admin settings) can be fetched at runtime and stored in a separate content map keyed by language.
3. Components can switch between `t('static.key')` for UI chrome and `cmsContent[lang].someArticle` for CMS content.

Recommended future pattern:

```jsx
const { lang, t } = useI18n();
const article = cmsData[lang].articles[slug];
return (
  <>
    <h1>{article.title}</h1>
    <button>{t('common.readMore')}</button>
  </>
);
```

---

## Current Translation Coverage

This foundation translates the following areas only:

- Header navigation and CTA
- Header brand subtitle
- Footer column titles, description, copyright, and link labels
- Training page hero, course titles/summaries, meta labels, and CTA
- Contact form labels, placeholders, success message, and inquiry types

Other marketing sections still display English text. They can be migrated to the `t()` pattern incrementally by following the same nested-key convention.

---

## File Checklist

- `src/i18n/config.js` — language metadata
- `src/i18n/en.js` — English dictionary
- `src/i18n/ar.js` — Arabic dictionary
- `src/i18n/index.js` — barrel + translations map
- `src/i18n/I18nProvider.jsx` — provider and hook
- `src/main.jsx` — wrapped with `I18nProvider`
- `src/components/Header.jsx` — translated nav + language switcher
- `src/components/Footer.jsx` — translated labels
- `src/components/sections/ContactSection.jsx` — translated form
- `src/components/pages/TrainingPage.jsx` — translated page
- `src/styles/global.css` — language switcher + RTL helpers
- `project-memory/multi-language-foundation.md` — this document
