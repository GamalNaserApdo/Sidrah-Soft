/**
 * Resolve a bilingual field from an object that uses the `_ar` suffix convention.
 *
 * Supports three data shapes:
 * 1. Fallback arrays:  item.title / item.title_ar
 * 2. CMS API objects:  item.title_en / item.title_ar
 * 3. Plain fields:     item.title (no _ar variant)
 *
 * Resolution order in Arabic mode:
 *   1. Arabic field (field_ar) when non-empty
 *   2. English field (field or field_en) as fallback
 *   3. Arabic field as last resort (even if empty, returns '')
 *
 * Resolution order in English mode:
 *   1. English field (field or field_en)
 *   2. Arabic field as last resort
 *
 * @param {object|null|undefined} item - The data object.
 * @param {string} field - The base field name (e.g. 'title', 'description', 'department').
 * @param {string} lang - The active language code ('en' or 'ar').
 * @returns {string} The resolved text, or empty string if nothing is available.
 */
export default function getBilingualField(item, field, lang) {
  if (!item) return '';

  const arKey = `${field}_ar`;
  const enKey = `${field}_en`;

  if (lang === 'ar') {
    if (item[arKey]) return item[arKey];
  }

  // Try base field, then _en variant, then _ar as last resort
  return item[field] || item[enKey] || item[arKey] || '';
}
