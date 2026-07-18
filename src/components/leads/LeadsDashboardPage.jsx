/**
 * Leads Dashboard Page.
 *
 * Lists all contact submissions with filtering, search, pagination, and quick
 * summary cards. Clicking a row opens the lead detail page.
 */

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCMSLang } from '../../contexts/CMSLanguageContext';
import { useCMSList } from '../../hooks/cms/useCMSList';
import { listLeads, listInquiryTypes, getLeadStats } from '../../services/leadsApi';
import Button from '../ui/Button.jsx';
import LeadsBadge from './LeadsBadge.jsx';
import LeadsToolbar from './LeadsToolbar.jsx';
import LeadsPagination from './LeadsPagination.jsx';
import LeadsStatCard from './LeadsStatCard.jsx';
import { LoadingState, EmptyState, ErrorState } from '../ui/StateViews.jsx';

const STATUS_OPTIONS = ['new', 'contacted', 'in_progress', 'closed', 'spam', 'archived'];
const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'urgent'];

const STAT_ICONS = {
  total: '◆',
  new: '●',
  contacted: '●',
  inProgress: '●',
  closed: '✓',
  spam: '!',
  archived: '⊘',
  highPriority: '↑',
};

function formatDate(isoString, lang) {
  if (!isoString) return '-';
  const d = new Date(isoString);
  return d.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function LeadsDashboardPage() {
  const { t, lang } = useCMSLang();
  const navigate = useNavigate();
  const {
    items,
    count,
    page,
    totalPages,
    loading,
    error,
    search,
    setSearch,
    debouncedSearch,
    filters,
    setFilter,
    clearFilters,
    setPage,
    refresh,
  } = useCMSList(listLeads);
  const [inquiryTypes, setInquiryTypes] = useState([]);
  const [inquiryTypesLoading, setInquiryTypesLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    contacted: 0,
    in_progress: 0,
    closed: 0,
    spam: 0,
    archived: 0,
    high_priority: 0,
  });
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const params = { ...filters };
    if (debouncedSearch) params.search = debouncedSearch;

    Promise.all([
      getLeadStats(params),
      getLeadStats({ ...params, priority: 'high' }),
    ])
      .then(([statusStats, priorityStats]) => {
        if (cancelled) return;
        setStats({
          ...statusStats,
          high_priority: priorityStats.total || 0,
        });
      })
      .catch(() => {
        if (!cancelled) {
          setStats({
            total: 0, new: 0, contacted: 0, in_progress: 0, closed: 0, spam: 0, archived: 0, high_priority: 0,
          });
        }
      });

    return () => { cancelled = true; };
  }, [debouncedSearch, filters]);

  useEffect(() => {
    let cancelled = false;
    setInquiryTypesLoading(true);
    listInquiryTypes({ active: true })
      .then((data) => {
        if (!cancelled) setInquiryTypes(data.results || []);
      })
      .catch(() => {
        if (!cancelled) setInquiryTypes([]);
      })
      .finally(() => {
        if (!cancelled) setInquiryTypesLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const inquiryTypeOptions = useMemo(
    () => inquiryTypes.map((it) => ({
      value: String(it.id),
      label: lang === 'ar' && it.name_ar ? it.name_ar : it.name_en,
    })),
    [inquiryTypes, lang],
  );

  const statusOptions = useMemo(
    () => STATUS_OPTIONS.map((s) => ({ value: s, label: t(`status.${s}`) || s.replace(/_/g, ' ') })),
    [t],
  );

  const priorityOptions = useMemo(
    () => PRIORITY_OPTIONS.map((p) => ({ value: p, label: t(`priority.${p}`) || p })),
    [t],
  );

  const statCards = useMemo(() => [
    { key: 'total', label: t('leads.total'), value: stats.total, variant: 'total', icon: STAT_ICONS.total },
    { key: 'new', label: t('leads.new'), value: stats.new, variant: 'new', icon: STAT_ICONS.new },
    { key: 'contacted', label: t('leads.contacted'), value: stats.contacted, variant: 'contacted', icon: STAT_ICONS.contacted },
    { key: 'in_progress', label: t('status.inProgress'), value: stats.in_progress, variant: 'in-progress', icon: STAT_ICONS.inProgress },
    { key: 'closed', label: t('leads.closed'), value: stats.closed, variant: 'closed', icon: STAT_ICONS.closed },
    { key: 'high_priority', label: t('dash.highPriority'), value: stats.high_priority, variant: 'high-priority', icon: STAT_ICONS.highPriority },
  ], [stats, t]);

  const hasActiveFilters = Boolean(search || filters.status || filters.priority || filters.inquiry_type);

  const handleCopyEmail = async (email, id) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // ignore
    }
  };

  const inquiryLabel = (lead) => {
    if (!lead.inquiry_type) return '-';
    const it = inquiryTypes.find((type) => type.id === lead.inquiry_type);
    if (it) {
      return lang === 'ar' && it.name_ar ? it.name_ar : it.name_en;
    }
    return lead.inquiry_type_name || '-';
  };

  const handleRowKeyDown = (e, leadId) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigate(`/leads/${leadId}`);
    }
  };

  return (
    <div className="leads-page">
      <div className="leads-dashboard__header">
        <h1 className="leads-dashboard__title">{t('leads.dashboard')}</h1>
        <p className="leads-dashboard__subtitle">{t('leads.subtitle')}</p>
        {count != null && (
          <p className="leads-dashboard__count">{count} {count === 1 ? t('leads.itemCount') : t('leads.itemsCount')}</p>
        )}
      </div>

      <div className="leads-dashboard__stats">
        {statCards.map((stat) => (
          <LeadsStatCard
            key={stat.key}
            value={stat.value}
            label={stat.label}
            variant={stat.variant}
            icon={stat.icon}
          />
        ))}
      </div>

      <LeadsToolbar
        search={search}
        onSearchChange={setSearch}
        filters={filters}
        onFilterChange={setFilter}
        onClearFilters={clearFilters}
        onRefresh={refresh}
        statusOptions={statusOptions}
        priorityOptions={priorityOptions}
        inquiryTypeOptions={inquiryTypeOptions}
        inquiryTypesLoading={inquiryTypesLoading}
        hasActiveFilters={hasActiveFilters}
      />

      {error && <div className="leads-error"><ErrorState message={error} onRetry={refresh} /></div>}

      {loading ? (
        <LoadingState />
      ) : items.length === 0 ? (
        <EmptyState
          message={hasActiveFilters ? t('leads.noLeadsFiltered') : t('leads.noLeads')}
          className="leads-empty"
        >
          {hasActiveFilters && (
            <Button variant="secondary" size="small" onClick={clearFilters}>
              {t('action.clear')}
            </Button>
          )}
        </EmptyState>
      ) : (
        <>
          <div className="leads-table-wrap">
            <table className="leads-table">
              <thead className="leads-table__head">
                <tr>
                  <th scope="col">{t('form.name')}</th>
                  <th scope="col">{t('form.email')}</th>
                  <th scope="col">{t('leads.inquiryType')}</th>
                  <th scope="col">{t('leads.status')}</th>
                  <th scope="col">{t('leads.priority')}</th>
                  <th scope="col">{t('form.date')}</th>
                  <th scope="col" className="leads-table__cell--actions">{t('users.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((lead) => (
                  <tr
                    key={lead.id}
                    className="leads-table__row"
                    tabIndex={0}
                    role="button"
                    aria-label={`${t('leads.openDetail')} ${lead.full_name}`}
                    onClick={() => navigate(`/leads/${lead.id}`)}
                    onKeyDown={(e) => handleRowKeyDown(e, lead.id)}
                  >
                    <td className="leads-table__cell">{lead.full_name}</td>
                    <td className="leads-table__cell leads-table__cell--email">{lead.email}</td>
                    <td className="leads-table__cell">{inquiryLabel(lead)}</td>
                    <td className="leads-table__cell"><LeadsBadge type="status" value={lead.status} /></td>
                    <td className="leads-table__cell"><LeadsBadge type="priority" value={lead.priority} /></td>
                    <td className="leads-table__cell">{formatDate(lead.created_at, lang)}</td>
                    <td className="leads-table__cell leads-table__cell--actions">
                      <div className="leads-table__actions" onClick={(e) => e.stopPropagation()} role="group" aria-label={t('users.actions')}>
                        <Button
                          variant="ghost"
                          size="small"
                          onClick={() => handleCopyEmail(lead.email, lead.id)}
                        >
                          {copiedId === lead.id ? t('leads.emailCopied') : t('leads.copyEmail')}
                        </Button>
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={() => navigate(`/leads/${lead.id}`)}
                        >
                          {t('leads.openDetail')}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <LeadsPagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            count={count}
          />
        </>
      )}
    </div>
  );
}
