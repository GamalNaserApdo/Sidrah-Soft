/**
 * CMS Dashboard Page — /cms
 *
 * Aggregated stats, recent activity, recent contact submissions,
 * and quick action links based on user capabilities.
 */

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import CMSLayout from '../../components/cms/layout/CMSLayout';
import CMSPageHeader from '../../components/cms/ui/CMSPageHeader';
import { CMSLoadingState, CMSErrorState, CMSEmptyState } from '../../components/cms/ui/CMSStateViews';
import CMSButton from '../../components/cms/ui/CMSButton';
import CMSBadge from '../../components/cms/ui/CMSBadge';
import { useAuth } from '../../contexts/AuthContext';
import { useCMSLang } from '../../contexts/CMSLanguageContext';
import { fetchDashboard } from '../../services/cms/dashboardApi';
import { parseApiError } from '../../services/cms/cmsFetch';

export default function CMSDashboardPage() {
  const { user, hasModuleAccess, hasCapability } = useAuth();
  const { t } = useCMSLang();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchDashboard();
      setData(result);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const canManageUsers = hasCapability('users.manage_users');

  return (
    <CMSLayout>
      <CMSPageHeader
        title={`${t('dash.welcome')}, ${user?.display_name || user?.username}`}
        subtitle={user?.role}
        actions={
          <CMSButton variant="ghost" onClick={load} loading={loading}>
            ↻ {t('action.refresh')}
          </CMSButton>
        }
      />

      {loading && <CMSLoadingState />}
      {error && <CMSErrorState message={error} onRetry={load} />}

      {data && !loading && !error && (
        <>
          {data.stats && Object.keys(data.stats).length > 0 && (
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>{t('dash.stats')}</h2>
              <div style={styles.statsGrid}>
                {data.stats.partners && (
                  <StatCard title={t('nav.partners')} stats={data.stats.partners} link="/cms/partners" canAccess={hasModuleAccess('partners')} labels={{ total: t('dash.total'), active: t('dash.active'), featured: t('dash.featured') }} />
                )}
                {data.stats.services && (
                  <StatCard title={t('nav.services')} stats={data.stats.services} link="/cms/services" canAccess={hasModuleAccess('services')} labels={{ total: t('dash.total'), active: t('dash.active'), featured: t('dash.featured'), on_homepage: t('dash.onHomepage') }} />
                )}
                {data.stats.case_studies && (
                  <StatCard title={t('nav.caseStudies')} stats={data.stats.case_studies} link="/cms/case-studies" canAccess={hasModuleAccess('case_studies')} labels={{ total: t('dash.total'), active: t('dash.active'), featured: t('dash.featured'), on_homepage: t('dash.onHomepage') }} />
                )}
                {data.stats.insights && (
                  <StatCard title={t('nav.insights')} stats={data.stats.insights} link="/cms/insights" canAccess={hasModuleAccess('insights')} labels={{ total: t('dash.total'), published: t('dash.published'), draft: t('dash.draft'), archived: t('dash.archived'), featured: t('dash.featured') }} />
                )}
                {data.stats.careers && (
                  <StatCard title={t('nav.careers')} stats={data.stats.careers} link="/cms/careers" canAccess={hasModuleAccess('careers')} labels={{ total: t('dash.total'), active: t('dash.active'), expired: t('dash.expired'), featured: t('dash.featured') }} />
                )}
                {data.stats.contact && (
                  <StatCard title={t('nav.contact')} stats={data.stats.contact} link="/cms/contact" canAccess={hasModuleAccess('contact')} labels={{ total: t('dash.total'), new: t('dash.new'), in_progress: t('status.inProgress'), closed: t('status.closed'), high_priority: t('dash.highPriority'), recent_count: t('dash.recentCount'), inquiry_types: t('nav.inquiryTypes') }} />
                )}
                {data.stats.media && (
                  <StatCard title={t('dash.media')} stats={data.stats.media} link="/cms/media" canAccess={hasModuleAccess('media')} labels={{ total: t('dash.total'), active: t('dash.active'), images: t('dash.images'), documents: t('dash.documents') }} />
                )}
                {data.stats.users && canManageUsers && (
                  <StatCard title={t('dash.users')} stats={data.stats.users} link="/cms/users" canAccess={hasModuleAccess('users')} labels={{ total: t('dash.total'), active: t('dash.active'), inactive: t('dash.inactive') }} />
                )}
              </div>
            </section>
          )}

          <div style={styles.twoCol}>
            {hasModuleAccess('activity_logs') && (
              <section style={styles.section}>
                <h2 style={styles.sectionTitle}>{t('dash.recentActivity')}</h2>
                {data.recent_activity && data.recent_activity.length > 0 ? (
                  <div style={styles.list}>
                    {data.recent_activity.map((log) => (
                      <div key={log.id} style={styles.listItem}>
                        <div style={styles.listItemLeft}>
                          <CMSBadge type={log.is_success ? 'success' : 'danger'} size="xs">
                            {log.is_success ? '✓' : '✕'}
                          </CMSBadge>
                          <div>
                            <div style={styles.listItemTitle}>
                              {log.action} · {log.module}
                            </div>
                            <div style={styles.listItemSub}>
                              {log.display_name || log.username} · {new Date(log.created_at).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <CMSEmptyState message={t('dash.noActivity')} />
                )}
                {hasModuleAccess('activity_logs') && (
                  <Link to="/cms/activity-logs" style={styles.viewAllLink}>View all →</Link>
                )}
              </section>
            )}

            {hasModuleAccess('contact') && (
              <section style={styles.section}>
                <h2 style={styles.sectionTitle}>{t('dash.recentSubmissions')}</h2>
                {data.recent_contact_submissions && data.recent_contact_submissions.length > 0 ? (
                  <div style={styles.list}>
                    {data.recent_contact_submissions.map((sub) => (
                      <div key={sub.id} style={styles.listItem}>
                        <div style={styles.listItemLeft}>
                          <CMSBadge type="info" size="xs">{sub.status}</CMSBadge>
                          {(sub.priority === 'high' || sub.priority === 'urgent') && (
                            <CMSBadge type="warning" size="xs">{sub.priority}</CMSBadge>
                          )}
                          <div>
                            <div style={styles.listItemTitle}>{sub.full_name}</div>
                            <div style={styles.listItemSub}>
                              {sub.inquiry_type || '—'} · {new Date(sub.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <CMSEmptyState message={t('dash.noSubmissions')} />
                )}
                {hasModuleAccess('contact') && (
                  <Link to="/cms/contact" style={styles.viewAllLink}>View all →</Link>
                )}
              </section>
            )}
          </div>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>{t('dash.quickActions')}</h2>
            <div style={styles.quickActions}>
              {hasModuleAccess('insights') && (
                <Link to="/cms/insights/new" style={styles.quickAction}>
                  <span style={styles.quickActionIcon}>💡</span>
                  <span>{t('dash.createInsight')}</span>
                </Link>
              )}
              {hasModuleAccess('services') && (
                <Link to="/cms/services/new" style={styles.quickAction}>
                  <span style={styles.quickActionIcon}>✦</span>
                  <span>{t('dash.addService')}</span>
                </Link>
              )}
              {hasModuleAccess('partners') && (
                <Link to="/cms/partners" style={styles.quickAction}>
                  <span style={styles.quickActionIcon}>🤝</span>
                  <span>{t('dash.addPartner')}</span>
                </Link>
              )}
              {hasModuleAccess('case_studies') && (
                <Link to="/cms/case-studies" style={styles.quickAction}>
                  <span style={styles.quickActionIcon}>�</span>
                  <span>{t('dash.addCaseStudy')}</span>
                </Link>
              )}
              {hasModuleAccess('careers') && (
                <Link to="/cms/careers/new" style={styles.quickAction}>
                  <span style={styles.quickActionIcon}>💼</span>
                  <span>{t('dash.addJob')}</span>
                </Link>
              )}
              {hasModuleAccess('contact') && (
                <Link to="/cms/contact" style={styles.quickAction}>
                  <span style={styles.quickActionIcon}>✉</span>
                  <span>{t('dash.openContact')}</span>
                </Link>
              )}
              {hasModuleAccess('media') && (
                <Link to="/cms/media" style={styles.quickAction}>
                  <span style={styles.quickActionIcon}>🖼</span>
                  <span>{t('dash.uploadMedia')}</span>
                </Link>
              )}
              {canManageUsers && (
                <Link to="/cms/users" style={styles.quickAction}>
                  <span style={styles.quickActionIcon}>👤</span>
                  <span>{t('dash.manageUsers')}</span>
                </Link>
              )}
              {hasModuleAccess('site_settings') && (
                <Link to="/cms/site-settings" style={styles.quickAction}>
                  <span style={styles.quickActionIcon}>⚙</span>
                  <span>{t('nav.siteSettings')}</span>
                </Link>
              )}
            </div>
          </section>
        </>
      )}
    </CMSLayout>
  );
}

function StatCard({ title, stats, link, canAccess, labels }) {
  const entries = Object.entries(stats).filter(([key]) => key !== 'by_role').slice(0, 5);
  const content = (
    <div style={styles.statCard}>
      <div style={styles.statCardTitle}>{title}</div>
      <div style={styles.statCardGrid}>
        {entries.map(([key, value]) => (
          <div key={key} style={styles.statItem}>
            <span style={styles.statValue}>{value}</span>
            <span style={styles.statLabel}>{labels[key] || key}</span>
          </div>
        ))}
      </div>
    </div>
  );

  if (canAccess && link) {
    return <Link to={link} style={{ textDecoration: 'none' }}>{content}</Link>;
  }
  return content;
}

const styles = {
  section: { marginBottom: '2rem' },
  sectionTitle: { fontSize: '0.875rem', fontWeight: '600', color: '#c9a96e', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.04em' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' },
  statCard: { background: '#12121e', border: '1px solid #1e1e2e', borderRadius: '8px', padding: '1rem', transition: 'border-color 150ms ease' },
  statCardTitle: { fontSize: '0.75rem', fontWeight: '600', color: '#aaa', marginBottom: '0.75rem' },
  statCardGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' },
  statItem: { display: 'flex', flexDirection: 'column', gap: '0.125rem' },
  statValue: { fontSize: '1.25rem', fontWeight: '700', color: '#e0e0e0' },
  statLabel: { fontSize: '0.625rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.03em' },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' },
  list: { background: '#12121e', border: '1px solid #1e1e2e', borderRadius: '8px', overflow: 'hidden' },
  listItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 0.875rem', borderBottom: '1px solid #1e1e2e' },
  listItemLeft: { display: 'flex', alignItems: 'center', gap: '0.625rem' },
  listItemTitle: { fontSize: '0.75rem', fontWeight: '500', color: '#ccc' },
  listItemSub: { fontSize: '0.6875rem', color: '#888' },
  viewAllLink: { display: 'inline-block', marginTop: '0.75rem', fontSize: '0.75rem', color: '#c9a96e', textDecoration: 'none' },
  quickActions: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' },
  quickAction: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1.25rem 0.75rem', background: '#12121e', border: '1px solid #1e1e2e', borderRadius: '8px', color: '#aaa', textDecoration: 'none', fontSize: '0.75rem', fontWeight: '500', transition: 'border-color 150ms ease', textAlign: 'center' },
  quickActionIcon: { fontSize: '1.5rem' },
};
