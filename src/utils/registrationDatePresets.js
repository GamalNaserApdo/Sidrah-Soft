/**
 * Registration date preset utilities.
 *
 * All ranges are computed in the browser's local timezone and sent to the
 * backend as YYYY-MM-DD strings. The backend uses Django's __date lookup
 * which converts to TIME_ZONE ('Asia/Riyadh') before comparing, so the
 * calendar-day boundaries are consistent with the application timezone.
 *
 * Week starts on Saturday (Saturday → Friday) per project convention.
 */

export const DATE_PRESETS = [
  'all_time',
  'today',
  'yesterday',
  'last_7_days',
  'last_30_days',
  'this_week',
  'last_week',
  'this_month',
  'last_month',
  'custom',
];

/**
 * Format a Date as YYYY-MM-DD in local time.
 */
export function formatDateInput(date) {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Return the Saturday that starts the week containing the given date.
 * Week = Saturday → Friday.
 */
function startOfWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  // Shift so Saturday is day 0 of the week.
  // Sat(6)->0, Sun(0)->1, Mon(1)->2, Tue(2)->3, Wed(3)->4, Thu(4)->5, Fri(5)->6
  const offset = (day + 1) % 7;
  d.setDate(d.getDate() - offset);
  return d;
}

/**
 * Compute { date_from, date_to } for a named preset.
 * Returns empty strings for 'all_time' (no filter).
 * For 'custom', returns null — caller must use explicit from/to values.
 */
export function computePresetRange(preset, fromStr, toStr) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  switch (preset) {
    case 'all_time':
      return { date_from: '', date_to: '' };

    case 'today':
      return { date_from: formatDateInput(now), date_to: formatDateInput(now) };

    case 'yesterday': {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      return { date_from: formatDateInput(y), date_to: formatDateInput(y) };
    }

    case 'last_7_days': {
      const start = new Date(now);
      start.setDate(start.getDate() - 6); // today inclusive → 7 days
      return { date_from: formatDateInput(start), date_to: formatDateInput(now) };
    }

    case 'last_30_days': {
      const start = new Date(now);
      start.setDate(start.getDate() - 29); // today inclusive → 30 days
      return { date_from: formatDateInput(start), date_to: formatDateInput(now) };
    }

    case 'this_week': {
      const start = startOfWeek(now);
      const end = new Date(start);
      end.setDate(end.getDate() + 6); // Saturday → Friday
      return { date_from: formatDateInput(start), date_to: formatDateInput(end) };
    }

    case 'last_week': {
      const thisWeekStart = startOfWeek(now);
      const start = new Date(thisWeekStart);
      start.setDate(start.getDate() - 7);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return { date_from: formatDateInput(start), date_to: formatDateInput(end) };
    }

    case 'this_month': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { date_from: formatDateInput(start), date_to: formatDateInput(end) };
    }

    case 'last_month': {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { date_from: formatDateInput(start), date_to: formatDateInput(end) };
    }

    case 'custom':
      return { date_from: fromStr || '', date_to: toStr || '' };

    default:
      return { date_from: '', date_to: '' };
  }
}

/**
 * Determine which preset matches a given { date_from, date_to } pair.
 * Returns 'custom' if no preset matches, or 'all_time' if both are empty.
 */
export function detectPreset(date_from, date_to) {
  if (!date_from && !date_to) return 'all_time';
  for (const preset of DATE_PRESETS) {
    if (preset === 'all_time' || preset === 'custom') continue;
    const range = computePresetRange(preset, '', '');
    if (range.date_from === date_from && range.date_to === date_to) {
      return preset;
    }
  }
  return 'custom';
}

/**
 * Human-readable label for a date range, used in the active-filter chip.
 */
export function formatRangeLabel(preset, date_from, date_to, t) {
  if (preset === 'all_time' || (!date_from && !date_to)) {
    return t('dateFilter.allTime');
  }
  if (preset !== 'custom') {
    return t(`dateFilter.preset.${preset}`);
  }
  if (date_from && date_to) {
    return `${date_from} → ${date_to}`;
  }
  if (date_from) {
    return `${t('dateFilter.from')} ${date_from}`;
  }
  return `${t('dateFilter.to')} ${date_to}`;
}
