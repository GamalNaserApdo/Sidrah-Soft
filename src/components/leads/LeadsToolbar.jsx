/**
 * LeadsToolbar — search and filter controls for the leads dashboard.
 */

import { useCMSLang } from '../../contexts/CMSLanguageContext';
import Button from '../ui/Button.jsx';

export default function LeadsToolbar({
  search,
  onSearchChange,
  filters,
  onFilterChange,
  onClearFilters,
  onRefresh,
  statusOptions,
  priorityOptions,
  inquiryTypeOptions,
  inquiryTypesLoading,
  hasActiveFilters,
}) {
  const { t } = useCMSLang();

  return (
    <div className="leads-toolbar">
      <div className="leads-toolbar__search">
        <label className="leads-toolbar__filter-label" htmlFor="leads-search">
          {t('action.search')}
        </label>
        <input
          id="leads-search"
          type="text"
          className="ui-input ui-focus-ring"
          placeholder={t('a11y.searchPlaceholder')}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label={t('action.search')}
        />
      </div>

      <div className="leads-toolbar__filters">
        <div className="leads-toolbar__filter">
          <label className="leads-toolbar__filter-label" htmlFor="leads-status-filter">
            {t('leads.status')}
          </label>
          <select
            id="leads-status-filter"
            value={filters.status || ''}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="ui-select ui-focus-ring"
          >
            <option value="">{t('leads.allStatuses')}</option>
            {statusOptions.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div className="leads-toolbar__filter">
          <label className="leads-toolbar__filter-label" htmlFor="leads-priority-filter">
            {t('leads.priority')}
          </label>
          <select
            id="leads-priority-filter"
            value={filters.priority || ''}
            onChange={(e) => onFilterChange('priority', e.target.value)}
            className="ui-select ui-focus-ring"
          >
            <option value="">{t('leads.allPriorities')}</option>
            {priorityOptions.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>

        <div className="leads-toolbar__filter">
          <label className="leads-toolbar__filter-label" htmlFor="leads-type-filter">
            {t('leads.inquiryType')}
          </label>
          <select
            id="leads-type-filter"
            value={filters.inquiry_type || ''}
            onChange={(e) => onFilterChange('inquiry_type', e.target.value)}
            className="ui-select ui-focus-ring"
            disabled={inquiryTypesLoading}
          >
            <option value="">{t('leads.allTypes')}</option>
            {inquiryTypeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="leads-toolbar__actions">
          {hasActiveFilters && (
            <Button variant="ghost" size="small" onClick={onClearFilters}>
              {t('action.clear')}
            </Button>
          )}
          <Button variant="secondary" size="small" onClick={onRefresh}>
            {t('action.refresh')}
          </Button>
        </div>
      </div>
    </div>
  );
}
