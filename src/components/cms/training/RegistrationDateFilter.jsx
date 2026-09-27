import { useMemo, useRef, useState } from 'react';
import { useCMSLang } from '../../../contexts/CMSLanguageContext';
import { detectPreset } from '../../../utils/registrationDatePresets';
import { CMSSelect } from '../ui/CMSFormInputs';
import CalendarRangePicker from './CalendarRangePicker';

const PRESET_ORDER = [
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

function parseDate(str) {
  if (!str) return null;
  const [y, m, d] = str.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

/**
 * Compact date-range filter: a single dropdown of presets. Selecting
 * "Custom Range" opens the shared CalendarRangePicker — no second calendar.
 * Week convention (Saturday → Friday) and preset math live in
 * registrationDatePresets.js, unchanged.
 */
export default function RegistrationDateFilter({
  dateFrom,
  dateTo,
  onPresetSelect,
  onCustomRangeChange,
  onClear,
}) {
  const { t } = useCMSLang();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const selectWrapRef = useRef(null);

  const activePreset = useMemo(
    () => detectPreset(dateFrom, dateTo),
    [dateFrom, dateTo],
  );
  const value = activePreset === 'custom' && (!dateFrom && !dateTo)
    ? 'all_time'
    : activePreset;

  const handleSelect = (e) => {
    const preset = e.target.value;
    if (preset === 'custom') {
      setCalendarOpen(true);
      return;
    }
    setCalendarOpen(false);
    onPresetSelect(preset);
  };

  const handleCalendarApply = (from, to) => {
    onCustomRangeChange(from, to);
    setCalendarOpen(false);
  };

  const handleCalendarClear = () => {
    onClear();
    setCalendarOpen(false);
  };

  return (
    <div className="cms-date-filter-dropdown" ref={selectWrapRef} style={{ position: 'relative' }}>
      <CMSSelect value={value} onChange={handleSelect} aria-label={t('dateFilter.allTime')}>
        {PRESET_ORDER.map((preset) => (
          <option key={preset} value={preset}>
            {t(`dateFilter.preset.${preset}`)}
          </option>
        ))}
      </CMSSelect>
      {calendarOpen && (
        <CalendarRangePicker
          open={calendarOpen}
          initialStart={parseDate(dateFrom)}
          initialEnd={parseDate(dateTo)}
          onApply={handleCalendarApply}
          onCancel={() => setCalendarOpen(false)}
          onClear={handleCalendarClear}
          anchorRef={selectWrapRef}
        />
      )}
    </div>
  );
}
