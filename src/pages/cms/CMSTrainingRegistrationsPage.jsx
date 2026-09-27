import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import CMSLayout from '../../components/cms/layout/CMSLayout';
import CMSPageHeader from '../../components/cms/ui/CMSPageHeader';
import CMSToolbar from '../../components/cms/ui/CMSToolbar';
import { CMSTable, CMSTableRow, CMSTableCell, TableActionButton } from '../../components/cms/ui/CMSTable';
import CMSPagination from '../../components/cms/ui/CMSPagination';
import CMSButton from '../../components/cms/ui/CMSButton';
import CMSBadge from '../../components/cms/ui/CMSBadge';
import { CMSInput, CMSSelect } from '../../components/cms/ui/CMSFormInputs';
import { CMSLoadingState, CMSErrorState, CMSEmptyState } from '../../components/cms/ui/CMSStateViews';
import { SectionCard } from '../../components/cms/ui/CmsDashboardComponents';
import { CMSStatCard, CMSStatsGrid } from '../../components/cms/ui/CMSStatCard';
import RegistrationDetailModal from '../../components/cms/training/RegistrationDetailModal';
import RegistrationDateFilter from '../../components/cms/training/RegistrationDateFilter';
import { computePresetRange, detectPreset } from '../../utils/registrationDatePresets';
import { useCMSList } from '../../hooks/cms/useCMSList';
import { useAuth } from '../../contexts/AuthContext';
import { useCMSLang } from '../../contexts/CMSLanguageContext';
import { useToast } from '../../contexts/CMSToastContext';
import { listRegistrations, getRegistrationStats, exportRegistrations } from '../../services/cms/trainingRegistrationsApi';
import { formatPrice } from '../../utils/formatPrice';
import { listPrograms } from '../../services/cms/trainingApi';
import { parseApiError } from '../../services/cms/cmsFetch';

const OPERATIONAL_STATUS_OPTIONS = [
  { value: 'lead', labelKey: 'registration.operational_status.lead' },
  { value: 'contacted', labelKey: 'registration.operational_status.contacted' },
  { value: 'subscribed', labelKey: 'registration.operational_status.subscribed' },
  { value: 'cancelled', labelKey: 'registration.operational_status.cancelled' },
];

const OPERATIONAL_STATUS_VARIANTS = {
  lead: 'danger',
  contacted: 'accent',
  subscribed: 'success',
  cancelled: 'default',
};

const SOURCE_OPTIONS = [
  { value: 'google_form', label: 'Google Form' },
  { value: 'cms_manual', label: 'CMS Manual' },
  { value: 'website', label: 'Website' },
];

const SOURCE_CLASSES = {
  google_form: 'info',
  cms_manual: 'accent',
  website: 'success',
};

const EMAIL_STATUS_CLASSES = {
  sent: 'success',
  failed: 'danger',
  not_attempted: 'default',
};

const ACQUISITION_OPTIONS = [
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'friend', label: 'Friend / Recommendation' },
  { value: 'website', label: 'Sidrah Website' },
  { value: 'other', label: 'Other' },
];

const LEVEL_LABELS = {
  beginner: 'Beginner',
  basic_knowledge: 'Basic Knowledge',
  studied_basics: 'Studied Basics',
};

const SOURCE_LABELS_AR = {
  google_form: 'نموذج Google',
  cms_manual: 'إدخال يدوي',
  website: 'موقع Sidrah',
};

const EMAIL_STATUS_LABELS_AR = {
  sent: 'تم الإرسال',
  failed: 'فشل',
  not_attempted: 'لم يُحاول',
};

const ACQUISITION_LABELS_AR = {
  facebook: 'فيسبوك',
  instagram: 'إنستجرام',
  linkedin: 'لينكدإن',
  tiktok: 'تيك توك',
  friend: 'صديق / ترشيح',
  website: 'موقع Sidrah',
  other: 'أخرى',
};

const LEVEL_LABELS_AR = {
  beginner: 'مبتدئ تمامًا',
  basic_knowledge: 'معرفة بسيطة',
  studied_basics: 'درست الأساسيات',
};



export default function CMSTrainingRegistrationsPage() {
  const { t, lang } = useCMSLang();
  const isAr = lang === 'ar';
  const { hasCapability } = useAuth();
  const { showSuccess, showError } = useToast();

  const canView = hasCapability('training_registrations.view');
  const canCreate = hasCapability('training_registrations.create');
  const canExport = hasCapability('training_registrations.export');

  const list = useCMSList(listRegistrations, { page_size: 20 });
  const [stats, setStats] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [exporting, setExporting] = useState(false);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const statsParams = useMemo(() => {
    const p = {
      ...list.filters,
      search: list.debouncedSearch || undefined,
    };
    Object.keys(p).forEach((k) => {
      if (p[k] === undefined || p[k] === '' || p[k] === null) delete p[k];
    });
    return p;
  }, [list.filters, list.debouncedSearch]);

  const refreshStats = useCallback(() => {
    if (!canView) return;
    getRegistrationStats(statsParams)
      .then((d) => setStats(d))
      .catch(() => setStats(null));
  }, [canView, statsParams]);

  useEffect(() => {
    if (!canView) return;
    refreshStats();
    listPrograms({ page_size: 1000 })
      .then((d) => setPrograms(d.results || []))
      .catch(() => setPrograms([]));
  }, [canView, refreshStats]);

  const handleDatePresetSelect = useCallback((preset) => {
    if (preset === 'all_time') {
      list.setFilter('date_from', '');
      list.setFilter('date_to', '');
      return;
    }
    if (preset === 'custom') {
      // Keep existing custom values or default to today
      if (!list.filters.date_from && !list.filters.date_to) {
        const today = new Date().toISOString().slice(0, 10);
        list.setFilter('date_from', today);
        list.setFilter('date_to', today);
      }
      return;
    }
    const range = computePresetRange(preset, '', '');
    list.setFilter('date_from', range.date_from);
    list.setFilter('date_to', range.date_to);
  }, [list]);

  const handleCustomRangeChange = useCallback((from, to) => {
    list.setFilter('date_from', from);
    list.setFilter('date_to', to);
  }, [list]);

  const handleClearDates = useCallback(() => {
    list.setFilter('date_from', '');
    list.setFilter('date_to', '');
  }, [list]);

  const activeDatePreset = detectPreset(list.filters.date_from || '', list.filters.date_to || '');

  const handleClearAllFilters = useCallback(() => {
    ['program', 'operational_status', 'source', 'acquisition_source', 'email_status', 'utm_campaign', 'date_from', 'date_to'].forEach((key) => {
      list.setFilter(key, '');
    });
    list.setSearch('');
  }, [list]);

  const activeFilterChips = useMemo(() => {
    const chips = [];
    if (list.filters.program) {
      const p = programs.find((prog) => String(prog.id) === String(list.filters.program));
      chips.push({ key: 'program', label: p?.title_en || `Program #${list.filters.program}` });
    }
    if (list.filters.operational_status) {
      chips.push({ key: 'operational_status', label: t(`registration.operational_status.${list.filters.operational_status}`) });
    }
    if (list.filters.source) {
      chips.push({ key: 'source', label: isAr ? (SOURCE_LABELS_AR[list.filters.source] || list.filters.source) : t(`registration.source.${list.filters.source}`) });
    }
    if (list.filters.date_from || list.filters.date_to) {
      const from = list.filters.date_from || '…';
      const to = list.filters.date_to || '…';
      chips.push({ key: 'date', label: `${from} → ${to}` });
    }
    return chips;
  }, [list.filters, programs, t, isAr]);

  const removeFilter = (key) => {
    if (key === 'date') {
      list.setFilter('date_from', '');
      list.setFilter('date_to', '');
    } else {
      list.setFilter(key, '');
    }
  };

  const handleExport = useCallback(async () => {
    if (!canExport) return;
    setExporting(true);
    try {
      const csvText = await exportRegistrations({
        ...list.filters,
        search: list.debouncedSearch,
      });
      const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `registrations-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showSuccess(t('msg.saved'));
    } catch (err) {
      showError(parseApiError(err));
    } finally {
      setExporting(false);
    }
  }, [canExport, list.filters, list.debouncedSearch, showSuccess, showError, t]);

  if (!canView) {
    return (
      <CMSLayout>
        <CMSLoadingState />
      </CMSLayout>
    );
  }

  const sourceLabel = (value) => isAr ? (SOURCE_LABELS_AR[value] || value) : t(`registration.source.${value}`);
  const emailStatusLabel = (value) => {
    if (!value) return '—';
    return isAr ? (EMAIL_STATUS_LABELS_AR[value] || value) : (
      // Try translation first, fall back to capitalized value
      t(`registration.email_status.${value}`) !== `registration.email_status.${value}`
        ? t(`registration.email_status.${value}`)
        : value.charAt(0).toUpperCase() + value.slice(1).replace('_', ' ')
    );
  };
  const acquisitionLabel = (value) => {
    if (!value) return '—';
    return isAr ? (ACQUISITION_LABELS_AR[value] || value) : (
      ACQUISITION_OPTIONS.find(o => o.value === value)?.label || value
    );
  };
  const levelLabel = (value) => {
    if (!value) return '—';
    return isAr ? (LEVEL_LABELS_AR[value] || value) : (LEVEL_LABELS[value] || value);
  };

  // Registration-time price snapshot — never falls back to the program's
  // current price. NULL (legacy rows) renders '—'.
  const formatCoursePrice = (r) => {
    if (r.course_price === null || r.course_price === undefined) return '—';
    return formatPrice(r.course_price, isAr ? 'ar' : 'en', true) || '—';
  };

  // toLocaleString (not toLocaleDateString) — the latter ignores the
  // hour/minute options and would drop the registration time.
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleString(isAr ? 'ar-EG' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };


  return (
    <CMSLayout>
      <CMSPageHeader
        title={t('nav.trainingRegistrations') || 'Training Registrations'}
        actions={
          <>
            {canCreate && (
              <Link to="/cms/training/registrations/new">
                <CMSButton variant="primary">+ {t('action.addNew')}</CMSButton>
              </Link>
            )}
            {canExport && (
              <CMSButton variant="secondary" onClick={handleExport} loading={exporting}>
                {t('action.download') || 'Export CSV'}
              </CMSButton>
            )}
          </>
        }
      />

      {/* Primary toolbar: Search | Status | Track | Date Range | Download */}
      <CMSToolbar search={list.search} onSearchChange={list.setSearch} onSearchSubmit={() => list.refresh()}>
        <CMSSelect
          value={list.filters.operational_status || ''}
          onChange={(e) => list.setFilter('operational_status', e.target.value)}
        >
          <option value="">{t('training.status.all') || 'All statuses'}</option>
          {OPERATIONAL_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{t(o.labelKey)}</option>
          ))}
        </CMSSelect>
        <CMSSelect value={list.filters.program || ''} onChange={(e) => list.setFilter('program', e.target.value)}>
          <option value="">{t('training.status.all') || 'All tracks'}</option>
          {programs.map((program) => (
            <option key={program.id} value={program.id}>{program.title_en}</option>
          ))}
        </CMSSelect>
        <RegistrationDateFilter
          dateFrom={list.filters.date_from || ''}
          dateTo={list.filters.date_to || ''}
          onPresetSelect={handleDatePresetSelect}
          onCustomRangeChange={handleCustomRangeChange}
          onClear={handleClearDates}
        />
        <CMSButton variant="secondary" onClick={() => setShowMoreFilters(s => !s)}>
          {showMoreFilters ? (isAr ? 'إخفاء الفلاتر' : 'Hide Filters') : t('registration.filter.moreFilters')}
        </CMSButton>
      </CMSToolbar>

      {/* Secondary / More Filters */}
      {showMoreFilters && (
        <CMSToolbar>
          <CMSSelect value={list.filters.source || ''} onChange={(e) => list.setFilter('source', e.target.value)}>
            <option value="">{t('leads.allTypes') || 'All sources'}</option>
            {SOURCE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{sourceLabel(o.value)}</option>
            ))}
          </CMSSelect>
          <CMSSelect value={list.filters.acquisition_source || ''} onChange={(e) => list.setFilter('acquisition_source', e.target.value)}>
            <option value="">{isAr ? 'كل مصادر الاستقطاب' : 'All acquisition'}</option>
            {ACQUISITION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{isAr ? ACQUISITION_LABELS_AR[o.value] : o.label}</option>
            ))}
          </CMSSelect>
          <CMSSelect value={list.filters.email_status || ''} onChange={(e) => list.setFilter('email_status', e.target.value)}>
            <option value="">{isAr ? 'كل حالات الإيميل' : 'All email statuses'}</option>
            <option value="sent">{isAr ? 'تم الإرسال' : 'Sent'}</option>
            <option value="failed">{isAr ? 'فشل' : 'Failed'}</option>
            <option value="not_attempted">{isAr ? 'لم يُحاول' : 'Not attempted'}</option>
          </CMSSelect>
          <CMSInput
            type="text"
            value={list.filters.utm_campaign || ''}
            onChange={(e) => list.setFilter('utm_campaign', e.target.value)}
            placeholder={isAr ? 'UTM Campaign' : 'UTM Campaign'}
          />
        </CMSToolbar>
      )}

      {/* Active Filter Chips */}
      {activeFilterChips.length > 0 && (
        <div className="cms-filter-chips" style={styles.filterChips}>
          {activeFilterChips.map((chip) => (
            <span key={chip.key} className="cms-filter-chip" style={styles.chip}>
              {chip.label}
              <button
                type="button"
                className="cms-filter-chip-remove"
                onClick={() => removeFilter(chip.key)}
                aria-label={`Remove ${chip.label} filter`}
                style={styles.chipRemove}
              >
                ×
              </button>
            </span>
          ))}
          <button type="button" className="cms-filter-clear" onClick={handleClearAllFilters} style={styles.clearAll}>
            {t('registration.filter.clearAll')}
          </button>
        </div>
      )}

      {stats && (
        <>
          <SectionCard title={t('registration.summary')} icon="registrations">
            <CMSStatsGrid>
              <CMSStatCard
                value={stats.total ?? 0}
                label={t('dash.total') || 'Total'}
                icon="registrations"
                variant="accent"
              />
              <CMSStatCard
                value={stats.by_operational_status?.lead ?? 0}
                label={t('registration.operational_status.lead')}
                variant="danger"
                onClick={() => list.setFilter('operational_status', 'lead')}
                clickable
              />
              <CMSStatCard
                value={stats.by_operational_status?.contacted ?? 0}
                label={t('registration.operational_status.contacted')}
                variant="accent"
                onClick={() => list.setFilter('operational_status', 'contacted')}
                clickable
              />
              <CMSStatCard
                value={stats.by_operational_status?.subscribed ?? 0}
                label={t('registration.operational_status.subscribed')}
                variant="success"
                onClick={() => list.setFilter('operational_status', 'subscribed')}
                clickable
              />
              <CMSStatCard
                value={stats.by_operational_status?.cancelled ?? 0}
                label={t('registration.operational_status.cancelled')}
                variant="default"
                onClick={() => list.setFilter('operational_status', 'cancelled')}
                clickable
              />
            </CMSStatsGrid>
          </SectionCard>

          {/* Track Grouping */}
          {stats.by_track && stats.by_track.length > 0 && (
            <SectionCard title={t('registration.kpi.byTrack')} icon="training">
              <div className="cms-course-stats-strip">
                {stats.by_track.map((track) => (
                  <CMSStatCard
                    key={track.track}
                    value={track.total}
                    label={track.track}
                    compact
                  />
                ))}
              </div>
            </SectionCard>
          )}
        </>
      )}

      {list.loading && <CMSLoadingState />}
      {list.error && <CMSErrorState message={list.error} onRetry={list.refresh} />}
      {!list.loading && !list.error && list.items.length === 0 && (
        <CMSEmptyState message={t('state.empty')} />
      )}
      {!list.loading && !list.error && list.items.length > 0 && (
        <>
          <CMSTable
            columns={[
              { key: 'date', label: t('form.date') || 'Date', width: '120px' },
              { key: 'name', label: t('form.name') || 'Name' },
              { key: 'phone', label: isAr ? 'واتساب' : 'WhatsApp', width: '130px' },
              { key: 'track', label: isAr ? 'المسار' : 'Track' },
              { key: 'status', label: t('form.status') || 'Status', width: '120px' },
              { key: 'price', label: t('registration.coursePrice') || 'Course Price', width: '110px' },
              { key: 'actions', label: t('col.actions') || 'Actions', align: 'right', width: '90px' },
            ]}
          >
            {list.items.map((r) => (
              <CMSTableRow key={r.id}>
                <CMSTableCell style={styles.cellDate}>{formatDate(r.submitted_at || r.created_at)}</CMSTableCell>
                <CMSTableCell style={styles.cellName}>{r.full_name || r.name || '—'}</CMSTableCell>
                <CMSTableCell style={styles.cellPhone}>{r.phone || '—'}</CMSTableCell>
                <CMSTableCell>{r.program_track || r.program_title || '—'}</CMSTableCell>
                <CMSTableCell>
                  <CMSBadge type={OPERATIONAL_STATUS_VARIANTS[r.operational_status] || 'default'}>
                    {t(`registration.operational_status.${r.operational_status}`)}
                  </CMSBadge>
                </CMSTableCell>
                <CMSTableCell>{formatCoursePrice(r)}</CMSTableCell>
                <CMSTableCell align="right">
                  <TableActionButton onClick={() => { setSelectedId(r.id); setModalOpen(true); }}>
                    {t('action.view')}
                  </TableActionButton>
                </CMSTableCell>
              </CMSTableRow>
            ))}
          </CMSTable>
          <CMSPagination
            page={list.page}
            totalPages={list.totalPages}
            onPageChange={list.setPage}
            count={list.count}
          />
        </>
      )}

      {modalOpen && (
        <RegistrationDetailModal
          registrationId={selectedId}
          open
          onClose={() => setModalOpen(false)}
          onSaved={() => { list.refresh(); refreshStats(); }}
          onDeleted={() => { setModalOpen(false); list.refresh(); refreshStats(); }}
        />
      )}
    </CMSLayout>
  );
}

const styles = {
  cellDate: {
    fontSize: '0.75rem',
    color: 'var(--cms-text-secondary)',
    whiteSpace: 'nowrap',
  },
  cellName: {
    fontWeight: 600,
    color: 'var(--cms-text-primary)',
  },
  cellPhone: {
    fontFamily: 'monospace',
    fontSize: '0.8rem',
    whiteSpace: 'nowrap',
    direction: 'ltr',
  },
  filterChips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    alignItems: 'center',
    padding: '0.5rem 1.25rem',
  },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.75rem',
    background: 'var(--cms-bg-surface)',
    border: '1px solid var(--cms-border-default)',
    borderRadius: 'var(--cms-radius-pill)',
    fontSize: '0.8125rem',
    color: 'var(--cms-text-primary)',
  },
  chipRemove: {
    background: 'none',
    border: 'none',
    color: 'var(--cms-text-muted)',
    cursor: 'pointer',
    fontSize: '1rem',
    lineHeight: 1,
    padding: 0,
    marginInlineStart: '0.25rem',
  },
  clearAll: {
    background: 'none',
    border: 'none',
    color: 'var(--cms-accent)',
    cursor: 'pointer',
    fontSize: '0.8125rem',
    fontWeight: 600,
    padding: '0.25rem 0.5rem',
  },
};
