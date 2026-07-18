/**
 * Recent Activity dashboard widget.
 *
 * Shows the latest activity log entries for users who have permission.
 * Fails gracefully and never breaks the dashboard if the API errors.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { fetchActivityLogs } from '../../services/activityLogsApi';

export default function RecentActivityWidget() {
  const { hasCapability } = useAuth();
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
          setError(err.status === 403 ? 'Access denied.' : 'Could not load recent activity.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [canView]);

  if (!canView) {
    return null;
  }

  return (
    <section style={styles.section}>
      <div style={styles.header}>
        <h2 style={styles.title}>Recent Activity</h2>
        <Link to="/cms/activity-logs" style={styles.link}>View all</Link>
      </div>

      {loading ? (
        <p style={styles.empty}>Loading...</p>
      ) : error ? (
        <p style={styles.empty}>{error}</p>
      ) : logs.length === 0 ? (
        <p style={styles.empty}>No recent activity.</p>
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
    background: '#12121e',
    borderRadius: '8px',
    border: '1px solid #1e1e2e',
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
    color: '#c9a96e',
    margin: 0,
  },
  link: {
    color: '#c9a96e',
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
    borderBottom: '1px solid #1e1e2e',
  },
  row: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: '0.25rem',
  },
  time: {
    color: '#888',
    fontSize: '0.75rem',
  },
  actor: {
    color: '#e0e0e0',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  action: {
    color: '#aaa',
    fontSize: '0.8125rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  module: {
    color: '#888',
    fontSize: '0.75rem',
  },
  description: {
    color: '#aaa',
    fontSize: '0.8125rem',
    margin: '0.25rem 0 0',
  },
  success: {
    color: '#22c55e',
    fontSize: '0.6875rem',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  failure: {
    color: '#ef4444',
    fontSize: '0.6875rem',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  empty: {
    color: '#888',
    fontSize: '0.875rem',
    margin: 0,
  },
};
