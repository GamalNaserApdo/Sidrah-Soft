import { useState, useMemo, useRef, useEffect } from 'react';
import { useCMSLang } from '../../../contexts/CMSLanguageContext';
import CMSButton from '../ui/CMSButton';
import { formatDateInput } from '../../../utils/registrationDatePresets';

const WEEKDAY_START_OFFSET = 6; // Saturday = 6 (JS getDay: 0=Sun..6=Sat)
const WEEKDAYS_EN = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const WEEKDAYS_AR = ['سبت', 'أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع'];
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

function isSameDay(a, b) {
  return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isInRange(day, start, end) {
  if (!start || !end) return false;
  const t = day.getTime();
  return t >= start.getTime() && t <= end.getTime();
}

/**
 * Lightweight date-range calendar popover.
 *
 * Props:
 *  - open: boolean
 *  - initialStart: Date | null
 *  - initialEnd: Date | null
 *  - onApply(startStr, endStr): called with YYYY-MM-DD strings when user clicks Apply
 *  - onCancel(): called when user cancels or clicks outside
 *  - onClear(): called when user clicks Clear
 *  - anchorRef: ref to the element the popover should anchor to (used for outside-click)
 */
export default function CalendarRangePicker({
  open,
  initialStart,
  initialEnd,
  onApply,
  onCancel,
  onClear,
  anchorRef,
}) {
  const { t, lang } = useCMSLang();
  const isAr = lang === 'ar';
  const weekdays = isAr ? WEEKDAYS_AR : WEEKDAYS_EN;
  const months = isAr ? MONTHS_AR : MONTHS_EN;

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Working draft state — never applied until Apply is pressed
  const [viewMonth, setViewMonth] = useState(() => {
    const base = initialStart || today;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const [draftStart, setDraftStart] = useState(initialStart || null);
  const [draftEnd, setDraftEnd] = useState(initialEnd || null);
  const [hoverDay, setHoverDay] = useState(null);

  const popoverRef = useRef(null);

  // Reset draft when popover opens
  useEffect(() => {
    if (open) {
      setDraftStart(initialStart || null);
      setDraftEnd(initialEnd || null);
      setHoverDay(null);
      const base = initialStart || today;
      setViewMonth(new Date(base.getFullYear(), base.getMonth(), 1));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Outside click / escape handling
  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target) &&
          anchorRef && anchorRef.current && !anchorRef.current.contains(e.target)) {
        onCancel?.();
      }
    }
    function handleKey(e) {
      if (e.key === 'Escape') onCancel?.();
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open, onCancel, anchorRef]);

  if (!open) return null;

  const days = useMemo(() => {
    const firstOfMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
    const startOffset = (firstOfMonth.getDay() - WEEKDAY_START_OFFSET + 7) % 7;
    const gridStart = new Date(firstOfMonth);
    gridStart.setDate(firstOfMonth.getDate() - startOffset);
    const cells = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(gridStart);
      d.setDate(gridStart.getDate() + i);
      cells.push(d);
    }
    return cells;
  }, [viewMonth]);

  const prevMonth = () => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1));
  const nextMonth = () => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1));

  const handleDayClick = (day) => {
    if (!draftStart || (draftStart && draftEnd)) {
      // Start new selection
      setDraftStart(day);
      setDraftEnd(null);
      return;
    }
    if (day < draftStart) {
      // Clicked before existing start — swap
      setDraftStart(day);
      setDraftEnd(null);
      return;
    }
    setDraftEnd(day);
  };

  const handleDayHover = (day) => {
    if (draftStart && !draftEnd) {
      setHoverDay(day);
    }
  };

  const displayEnd = draftEnd || hoverDay;
  const rangeActive = draftStart && !draftEnd && hoverDay;
  const canApply = draftStart && draftEnd;

  const apply = () => {
    if (!canApply) return;
    let s = draftStart;
    let e = draftEnd;
    if (e < s) [s, e] = [e, s];
    onApply(formatDateInput(s), formatDateInput(e));
  };

  const clear = () => {
    setDraftStart(null);
    setDraftEnd(null);
    onClear?.();
  };

  const monthLabel = `${months[viewMonth.getMonth()]} ${viewMonth.getFullYear()}`;

  return (
    <div ref={popoverRef} className="cms-calendar-range" role="dialog" aria-label={t('dateFilter.preset.custom')}>
      <div className="cms-calendar-header">
        <button type="button" className="cms-calendar-nav" onClick={prevMonth} aria-label={t('dateFilter.previousMonth')}>
          {isAr ? '›' : '‹'}
        </button>
        <span className="cms-calendar-month">{monthLabel}</span>
        <button type="button" className="cms-calendar-nav" onClick={nextMonth} aria-label={t('dateFilter.nextMonth')}>
          {isAr ? '‹' : '›'}
        </button>
      </div>

      <div className="cms-calendar-grid">
        {weekdays.map((wd) => (
          <div key={wd} className="cms-calendar-weekday">{wd}</div>
        ))}
        {days.map((day) => {
          const inMonth = day.getMonth() === viewMonth.getMonth();
          const isToday = isSameDay(day, today);
          const isStart = isSameDay(day, draftStart);
          const isEnd = isSameDay(day, draftEnd);
          const inRange = isInRange(day, draftStart, draftEnd) ||
            (rangeActive && isInRange(day, draftStart, hoverDay));
          const isEdge = isStart || isEnd;
          const classes = [
            'cms-calendar-day',
            !inMonth && 'is-outside',
            isToday && 'is-today',
            isEdge && 'is-edge',
            inRange && 'is-in-range',
          ].filter(Boolean).join(' ');
          return (
            <button
              key={day.toISOString()}
              type="button"
              className={classes}
              onClick={() => handleDayClick(day)}
              onMouseEnter={() => handleDayHover(day)}
              onMouseLeave={() => setHoverDay(null)}
              aria-label={day.toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>

      <div className="cms-calendar-footer">
        <div className="cms-calendar-selection">
          {draftStart ? formatDateInput(draftStart) : '—'}
          <span className="cms-calendar-sep">→</span>
          {draftEnd ? formatDateInput(draftEnd) : '—'}
        </div>
        <div className="cms-calendar-actions">
          <CMSButton variant="secondary" size="sm" onClick={clear} disabled={!draftStart && !draftEnd}>
            {t('dateFilter.clear')}
          </CMSButton>
          <CMSButton variant="secondary" size="sm" onClick={onCancel}>
            {t('action.cancel')}
          </CMSButton>
          <CMSButton variant="primary" size="sm" onClick={apply} disabled={!canApply}>
            {t('dateFilter.apply')}
          </CMSButton>
        </div>
      </div>
    </div>
  );
}
