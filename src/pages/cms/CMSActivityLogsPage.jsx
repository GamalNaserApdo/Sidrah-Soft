/**
 * CMS Activity Logs Page.
 *
 * Displays a read-only, filterable, paginated list of audit log entries.
 * Protected by the existing AuthContext / ProtectedRoute.
 *
 * Uses shared CMS UI primitives (CMSToolbar, CMSTable, CMSPagination,
 * CMSStateViews, CMSBadge) and CMS design tokens for visual consistency.
 */

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCMSLang } from '../../contexts/CMSLanguageContext';
import { fetchActivityLogs } from '../../services/activityLogsApi';
import CMSLayout from '../../components/cms/layout/CMSLayout';
import CMSPageHeader from '../../components/cms/ui/CMSPageHeader';
import CMSToolbar from '../../components/cms/ui/CMSToolbar';
import { CMSTable, CMSTableRow, CMSTableCell } from '../../components/cms/ui/CMSTable';
import CMSPagination from '../../components/cms/ui/CMSPagination';
import CMSBadge from '../../components/cms/ui/CMSBadge';
import CMSButton from '../../components/cms/ui/CMSButton';
import { CMSInput, CMSSelect } from '../../components/cms/ui/CMSFormInputs';
import { CMSLoadingState, CMSErrorState, CMSEmptyState } from '../../components/cms/ui/CMSStateViews';

export default function CMSActivityLogsPage() {
  const { user, hasCapability } = useAuth();
  const { t } = useCMSLang();
  const canView = hasCapability('activity_logs.view');

  const [logs, setLogs] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [filters, setFilters] = useState({
    module: '',
    action: '',
    success: '',
    search: '',
    from: '',
    to: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadLogs = useCallback(async () => {
    if (!canView) return;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchActivityLogs({
        ...filters,
        page,
        page_size: pageSize,
      });
      setLogs(data.results || []);
      setCount(data.count || 0);
    } catch (err) {
      if (err.status === 403) {
        setError(t('common.accessDenied') || 'You do not have permission to view activity logs.');
      } else if (err.status === 401) {
        setError(t('msg.sessionExpired') || 'Session expired. Please log in again.');
      } else {
        setError(err.message || t('msg.loadFailed') || 'Failed to load activity logs.');
      }
    } finally {
      setLoading(false);
    }
  }, [canView, filters, page, pageSize, t]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ module: '', action: '', success: '', search: '', from: '', to: '' });
    setPage(1);
  };

  if (!user) {
    return (
      <CMSLayout>
        <CMSLoadingState />
      </CMSLayout>
    );
  }

  if (!canView) {
    return (
      <CMSLayout>
        <CMSPageHeader title={t('nav.activityLogs')} />
        <CMSErrorState message={t('common.accessDenied') || 'Access denied: activity logs.'} />
      </CMSLayout>
    );
  }

  return (
    <CMSLayout>
      <CMSPageHeader title={t('nav.activityLogs')} />

      <CMSToolbar
        search={filters.search}
        onSearchChange={(v) => handleFilterChange('search', v)}
        onSearchSubmit={loadLogs}
      >
        <CMSSelect value={filters.module} onChange={(e) => handleFilterChange('module', e.target.value)}>
          <option value="">{t('filter.allStatuses') === 'كل الحالات' ? 'كل الوحدات' : 'All modules'}</option>
          <option value="auth">Authentication</option>
          <option value="dashboard">Dashboard</option>
          <option value="site_settings">{t('nav.siteSettings')}</option>
          <option value="navigation">{t('nav.navigation')}</option>
          <option value="partners">{t('nav.partners')}</option>
          <option value="services">{t('nav.services')}</option>
          <option value="case_studies">{t('nav.caseStudies')}</option>
          <option value="careers">{t('nav.careers')}</option>
          <option value="insights">{t('nav.insights')}</option>
          <option value="contact">{t('nav.contact')}</option>
          <option value="media">{t('nav.media')}</option>
          <option value="users">{t('nav.users')}</option>
          <option value="activity_logs">{t('nav.activityLogs')}</option>
        </CMSSelect>
        <CMSSelect value={filters.action} onChange={(e) => handleFilterChange('action', e.target.value)}>
          <option value="">{t('filter.allStatuses') === 'كل الحالات' ? 'كل الإجراءات' : 'All actions'}</option>
          <option value="login">Login</option>
          <option value="logout">Logout</option>
          <option value="login_failed">Login Failed</option>
          <option value="create">{t('action.create')}</option>
          <option value="update">{t('action.edit')}</option>
          <option value="delete">{t('action.delete')}</option>
          <option value="publish">{t('action.publish')}</option>
          <option value="unpublish">{t('action.unpublish')}</option>
          <option value="archive">{t('action.archive')}</option>
          <option value="restore">Restore</option>
          <option value="status_change">Status Change</option>
          <option value="assign">Assign</option>
          <option value="export">{t('action.download')}</option>
          <option value="settings_change">Settings Change</option>
        </CMSSelect>
        <CMSSelect value={filters.success} onChange={(e) => handleFilterChange('success', e.target.value)}>
          <option value="">{t('filter.allStatuses')}</option>
          <option value="true">Success</option>
          <option value="false">Failure</option>
        </CMSSelect>
        <CMSInput
          type="datetime-local"
          value={filters.from}
          onChange={(e) => handleFilterChange('from', e.target.value)}
          placeholder={t('form.from')}
        />
        <CMSInput
          type="datetime-local"
          value={filters.to}
          onChange={(e) => handleFilterChange('to', e.target.value)}
          placeholder={t('form.to')}
        />
        <CMSButton variant="ghost" onClick={clearFilters}>{t('action.clear')}</CMSButton>
      </CMSToolbar>

      {loading && <CMSLoadingState />}
      {error && <CMSErrorState message={error} onRetry={loadLogs} />}
      {!loading && !error && logs.length === 0 && <CMSEmptyState message={t('state.empty')} />}
      {!loading && !error && logs.length > 0 && (
        <>
          <CMSTable
            columns={[
              { key: 'time', label: t('col.timestamp') },
              { key: 'user', label: t('col.user') },
              { key: 'action', label: t('col.action') },
              { key: 'module', label: t('col.resource') },
              { key: 'description', label: t('form.description') },
              { key: 'object', label: t('col.resource') },
              { key: 'status', label: t('col.status') },
            ]}
          >
            {logs.map((log) => (
              <CMSTableRow key={log.id}>
                <CMSTableCell>{new Date(log.created_at).toLocaleString()}</CMSTableCell>
                <CMSTableCell>{log.user?.display_name || log.username || '—'}</CMSTableCell>
                <CMSTableCell>{log.action}</CMSTableCell>
                <CMSTableCell>{log.module || '—'}</CMSTableCell>
                <CMSTableCell>{log.description || '—'}</CMSTableCell>
                <CMSTableCell>
                  {log.object_repr || (log.object_type && log.object_id ? `${log.object_type} #${log.object_id}` : '—')}
                </CMSTableCell>
                <CMSTableCell>
                  <CMSBadge type={log.is_success ? 'success' : 'danger'} size="xs">
                    {log.is_success ? 'Success' : 'Failure'}
                  </CMSBadge>
                </CMSTableCell>
              </CMSTableRow>
            ))}
          </CMSTable>
          <CMSPagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            count={count}
          />
        </>
      )}
    </CMSLayout>
  );
}
