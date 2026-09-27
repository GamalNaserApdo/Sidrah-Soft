/**
 * Recent Activity dashboard widget.
 *
 * Shows the latest activity log entries for users who have permission.
 * Fails gracefully and never breaks the dashboard if the API errors.
 *
 * Uses CMS design tokens for visual consistency with the dashboard baseline.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCMSLang } from '../../contexts/CMSLanguageContext';
import { fetchActivityLogs } from '../../services/activityLogsApi';

export default function RecentActivityWidget() {
  const { hasCapability } = useAuth();
  const { t } = useCMSLang();
  const canView = hasCapability('activity_logs.view');

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!canView) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchActivityLogs({ page_size: 5 })
      .then((data) => {
        if (!cancelled) {
          setLogs(data.results || []);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.status === 403
            ? (t('common.accessDenied') || 'Access denied.')
            : (t('msg.loadFailed') || 'Could not load recent activity.'));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [canView, t]);

  if (!canView) {
    return null;
  }

  return (
    <section style={styles.section}>
      <div style={styles.header}>
        <h2 style={styles.title}>{t('nav.activityLogs')}</h2>
        <Link to="/cms/activity-logs" style={styles.link}>{t('action.view')}</Link>
      </div>

      {loading ? (
        <p style={styles.empty}>{t('common.loading')}</p>
      ) : error ? (
        <p style={styles.empty}>{error}</p>
      ) : logs.length === 0 ? (
        <p style={styles.empty}>{t('state.noData')}</p>
      ) : (
        <ul style={styles.list}>
          {logs.map((log) => (
            <li key={log.id} style={styles.item}>
              <div style={styles.row}>
                <span style={styles.time}>{new Date(log.created_at).toLocaleString()}</span>
                <span style={log.is_success ? styles.success : styles.failure}>
                  {log.is_success ? 'success' : 'failure'}
                </span>
              </div>
              <div style={styles.row}>
                <span style={styles.actor}>{log.user?.display_name || log.username || 'System'}</span>
                <span style={styles.action}>{log.action}</span>
                {log.module && <span style={styles.module}>{log.module}</span>}
              </div>
              {log.description && <p style={styles.description}>{log.description}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

const styles = {
  section: {
    marginBottom: '2rem',
    padding: '1.5rem',
    background: 'var(--cms-bg-surface)',
    borderRadius: 'var(--cms-radius-lg)',
    border: '1px solid var(--cms-border-subtle)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '1rem',
    fontWeight: '600',
    color: 'var(--cms-accent)',
    margin: 0,
  },
  link: {
    color: 'var(--cms-accent)',
    textDecoration: 'none',
    fontSize: '0.8125rem',
  },
  list: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },
  item: {
    padding: '0.75rem 0',
    borderBottom: '1px solid var(--cms-border-subtle)',
  },
  row: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: '0.25rem',
  },
  time: {
    color: 'var(--cms-text-muted)',
    fontSize: '0.75rem',
  },
  actor: {
    color: 'var(--cms-text-primary)',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  action: {
    color: 'var(--cms-text-secondary)',
    fontSize: '0.8125rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  module: {
    color: 'var(--cms-text-muted)',
    fontSize: '0.75rem',
  },
  description: {
    color: 'var(--cms-text-secondary)',
    fontSize: '0.8125rem',
    margin: '0.25rem 0 0',
  },
  success: {
    color: 'var(--cms-success)',
    fontSize: '0.6875rem',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  failure: {
    color: 'var(--cms-danger)',
    fontSize: '0.6875rem',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  empty: {
    color: 'var(--cms-text-muted)',
    fontSize: '0.875rem',
    margin: 0,
  },
};
