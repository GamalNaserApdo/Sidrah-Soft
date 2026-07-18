/**
 * CMS Activity Logs Page.
 *
 * Displays a read-only, filterable, paginated list of audit log entries.
 * Protected by the existing AuthContext / ProtectedRoute.
 */

import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { fetchActivityLogs } from '../../services/activityLogsApi';
import CMSLayout from '../../components/cms/layout/CMSLayout';
import CMSPageHeader from '../../components/cms/ui/CMSPageHeader';

const STATUS_LABELS = {
  true: 'Success',
  false: 'Failure',
};

export default function CMSActivityLogsPage() {
  const { user, hasCapability } = useAuth();
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
        setError('You do not have permission to view activity logs.');
      } else if (err.status === 401) {
        setError('Session expired. Please log in again.');
      } else {
        setError(err.message || 'Failed to load activity logs.');
      }
    } finally {
      setLoading(false);
    }
  }, [canView, filters, page, pageSize]);

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
    return <div style={styles.loading}>Loading session...</div>;
  }

  if (!canView) {
    return (
      <CMSLayout>
        <div style={styles.error}>Access denied: activity logs.</div>
      </CMSLayout>
    );
  }

  return (
    <CMSLayout>
      <CMSPageHeader title="Activity Logs" />

      <div>

        <div style={styles.filters}>
          <input
            type="text"
            placeholder="Search..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            style={styles.input}
          />
          <select
            value={filters.module}
            onChange={(e) => handleFilterChange('module', e.target.value)}
            style={styles.select}
          >
            <option value="">All modules</option>
            <option value="auth">Authentication</option>
            <option value="dashboard">Dashboard</option>
            <option value="site_settings">Site Settings</option>
            <option value="navigation">Navigation</option>
            <option value="partners">Partners</option>
            <option value="services">Services</option>
            <option value="case_studies">Case Studies</option>
            <option value="careers">Careers</option>
            <option value="insights">Insights</option>
            <option value="contact">Contact</option>
            <option value="media">Media</option>
            <option value="users">Users</option>
            <option value="activity_logs">Activity Logs</option>
          </select>
          <select
            value={filters.action}
            onChange={(e) => handleFilterChange('action', e.target.value)}
            style={styles.select}
          >
            <option value="">All actions</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
            <option value="login_failed">Login Failed</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="publish">Publish</option>
            <option value="unpublish">Unpublish</option>
            <option value="archive">Archive</option>
            <option value="restore">Restore</option>
            <option value="status_change">Status Change</option>
            <option value="assign">Assign</option>
            <option value="export">Export</option>
            <option value="settings_change">Settings Change</option>
          </select>
          <select
            value={filters.success}
            onChange={(e) => handleFilterChange('success', e.target.value)}
            style={styles.select}
          >
            <option value="">All statuses</option>
            <option value="true">Success</option>
            <option value="false">Failure</option>
          </select>
          <input
            type="datetime-local"
            value={filters.from}
            onChange={(e) => handleFilterChange('from', e.target.value)}
            style={styles.input}
          />
          <input
            type="datetime-local"
            value={filters.to}
            onChange={(e) => handleFilterChange('to', e.target.value)}
            style={styles.input}
          />
          <button type="button" onClick={clearFilters} style={styles.clearBtn}>
            Clear
          </button>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {loading ? (
          <div style={styles.loading}>Loading activity logs...</div>
        ) : (
          <>
            <div style={styles.count}>Total: {count} entries</div>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Time</th>
                    <th style={styles.th}>User</th>
                    <th style={styles.th}>Action</th>
                    <th style={styles.th}>Module</th>
                    <th style={styles.th}>Description</th>
                    <th style={styles.th}>Object</th>
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={styles.empty}>
                        No activity logs found.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} style={styles.tr}>
                        <td style={styles.td}>
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td style={styles.td}>{log.user?.display_name || log.username || '—'}</td>
                        <td style={styles.td}>{log.action}</td>
                        <td style={styles.td}>{log.module || '—'}</td>
                        <td style={styles.td}>{log.description || '—'}</td>
                        <td style={styles.td}>
                          {log.object_repr || `${log.object_type} #${log.object_id}` || '—'}
                        </td>
                        <td style={styles.td}>
                          <span style={log.is_success ? styles.successBadge : styles.failureBadge}>
                            {STATUS_LABELS[String(log.is_success)]}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div style={styles.pagination}>
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                style={styles.pageBtn}
              >
                Previous
              </button>
              <span style={styles.pageInfo}>
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                style={styles.pageBtn}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </CMSLayout>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#0a0a14',
    color: '#e0e0e0',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 2rem',
    borderBottom: '1px solid #1e1e2e',
    background: '#12121e',
  },
  brand: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.5rem',
  },
  logo: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#c9a96e',
  },
  cms: {
    fontSize: '0.75rem',
    fontWeight: '500',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  nav: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
  },
  navLink: {
    color: '#aaa',
    textDecoration: 'none',
    fontSize: '0.875rem',
  },
  activeNavLink: {
    color: '#c9a96e',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  main: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#c9a96e',
    marginBottom: '1.5rem',
  },
  filters: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem',
    marginBottom: '1.5rem',
    padding: '1rem',
    background: '#12121e',
    borderRadius: '8px',
    border: '1px solid #1e1e2e',
  },
  input: {
    padding: '0.5rem 0.75rem',
    borderRadius: '6px',
    border: '1px solid #2a2a3e',
    background: '#0a0a14',
    color: '#e0e0e0',
    fontSize: '0.875rem',
    minWidth: '140px',
  },
  select: {
    padding: '0.5rem 0.75rem',
    borderRadius: '6px',
    border: '1px solid #2a2a3e',
    background: '#0a0a14',
    color: '#e0e0e0',
    fontSize: '0.875rem',
    minWidth: '140px',
  },
  clearBtn: {
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    border: '1px solid #c9a96e',
    background: 'transparent',
    color: '#c9a96e',
    fontSize: '0.8125rem',
    cursor: 'pointer',
  },
  count: {
    marginBottom: '1rem',
    color: '#888',
    fontSize: '0.875rem',
  },
  tableWrapper: {
    overflowX: 'auto',
    background: '#12121e',
    borderRadius: '8px',
    border: '1px solid #1e1e2e',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.875rem',
  },
  th: {
    padding: '0.75rem 1rem',
    textAlign: 'left',
    borderBottom: '1px solid #2a2a3e',
    color: '#c9a96e',
    fontWeight: '500',
    whiteSpace: 'nowrap',
  },
  tr: {
    borderBottom: '1px solid #1e1e2e',
  },
  td: {
    padding: '0.75rem 1rem',
    borderBottom: '1px solid #1e1e2e',
    color: '#ccc',
    verticalAlign: 'top',
  },
  empty: {
    padding: '2rem',
    textAlign: 'center',
    color: '#888',
  },
  loading: {
    padding: '2rem',
    textAlign: 'center',
    color: '#888',
  },
  error: {
    padding: '1rem',
    marginBottom: '1rem',
    background: 'rgba(220, 38, 38, 0.1)',
    border: '1px solid rgba(220, 38, 38, 0.3)',
    borderRadius: '6px',
    color: '#ef4444',
  },
  successBadge: {
    display: 'inline-block',
    padding: '0.125rem 0.5rem',
    borderRadius: '4px',
    background: 'rgba(34, 197, 94, 0.15)',
    color: '#22c55e',
    fontSize: '0.75rem',
    fontWeight: '500',
  },
  failureBadge: {
    display: 'inline-block',
    padding: '0.125rem 0.5rem',
    borderRadius: '4px',
    background: 'rgba(239, 68, 68, 0.15)',
    color: '#ef4444',
    fontSize: '0.75rem',
    fontWeight: '500',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1rem',
    marginTop: '1.5rem',
  },
  pageBtn: {
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    border: '1px solid #2a2a3e',
    background: '#12121e',
    color: '#e0e0e0',
    cursor: 'pointer',
  },
  pageInfo: {
    color: '#888',
    fontSize: '0.875rem',
  },
};
