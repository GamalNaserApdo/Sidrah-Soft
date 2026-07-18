/**
 * Pick a value from a bilingual CMS object based on the active language.
 *
 * @param {string | { en?: string, ar?: string } | null | undefined} value
 *   A plain string or a bilingual object returned by the CMS.
 * @param {string} lang - The active language code (e.g. 'en' or 'ar').
 * @param {string} [fallback='en'] - Language to fall back to when the preferred value is empty.
 * @returns {string} The resolved text, or an empty string if nothing is available.
 */
export default function getBilingual(value, lang, fallback = 'en') {
  if (!value) return '';

  if (typeof value === 'string') {
    return value;
  }

  const preferred = value[lang];
  if (preferred && typeof preferred === 'string') {
    return preferred;
  }

  const fallbackValue = value[fallback];
  if (fallbackValue && typeof fallbackValue === 'string') {
    return fallbackValue;
  }

  // Last resort: return any non-empty string value found in the object.
  for (const key of Object.keys(value)) {
    const candidate = value[key];
    if (candidate && typeof candidate === 'string') {
      return candidate;
    }
  }

  return '';
}
