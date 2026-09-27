/**
 * CMS Dashboard Page — /cms
 *
 * Operations-focused dashboard layout:
 * - Page header (title, subtitle, date, refresh)
 * - Conditional operational alert (new registrations / new contact submissions)
 * - Primary KPI row (up to 4 permission-gated hero cards)
 * - Operational sections (recent registrations, contact submissions,
 *   recent activity, quick actions)
 * - Content overview grid (remaining module stats)
 *
 * All data comes from real existing endpoints:
 *   /api/v1/cms/dashboard/
 *   /api/v1/cms/training/registrations/stats/
 *   /api/v1/cms/training/registrations/?page_size=5
 * No fabricated metrics.
 */

import { useState, useEffect, useCallback } from 'react';
import CMSLayout from '../../components/cms/layout/CMSLayout';
import { CMSLoadingState, CMSErrorState, CMSEmptyState } from '../../components/cms/ui/CMSStateViews';
import {
  DashboardHeader,
  DashboardAlert,
  KpiCard,
  StatCard,
  QuickActionCard,
  ActivityItem,
  SectionCard,
  ContactSubmissionItem,
  RegistrationItem,
} from '../../components/cms/ui/CmsDashboardComponents';
import { useAuth } from '../../contexts/AuthContext';
import { useCMSLang } from '../../contexts/CMSLanguageContext';
import RegistrationDetailModal from '../../components/cms/training/RegistrationDetailModal';
import { fetchDashboard } from '../../services/cms/dashboardApi';
import { getRegistrationStats, listRegistrations } from '../../services/cms/trainingRegistrationsApi';
import { parseApiError } from '../../services/cms/cmsFetch';

export default function CMSDashboardPage() {
  const { hasModuleAccess, hasCapability } = useAuth();
  const { t } = useCMSLang();
  const [data, setData] = useState(null);
  const [regStats, setRegStats] = useState(null);
  const [recentRegistrations, setRecentRegistrations] = useState([]);
  const [regModalId, setRegModalId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const canManageUsers = hasCapability('users.manage_users');
  const canViewRegistrations = hasCapability('training_registrations.view');

  // Training data is optional — failures must not break the main dashboard.
  const loadRegistrations = useCallback(async () => {
    if (!canViewRegistrations) return;
    try {
      const [statsResult, listResult] = await Promise.all([
        getRegistrationStats(),
        listRegistrations({ page_size: 5 }),
      ]);
      setRegStats(statsResult);
      setRecentRegistrations(listResult?.results ?? []);
    } catch {
      setRegStats(null);
      setRecentRegistrations([]);
    }
  }, [canViewRegistrations]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchDashboard();
      setData(result);
    } catch (err) {
      setError(parseApiError(err));
      setLoading(false);
      return;
    }
    await loadRegistrations();
    setLoading(false);
  }, [loadRegistrations]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = data?.stats || {};

  /* ─── Primary KPI candidates (priority order, permission-gated) ─────────── */
  const kpiDefs = [
    canViewRegistrations && regStats && {
      key: 'registrations',
      module: '__registrations',
      icon: 'registrations',
      label: t('dash.registrations'),
      value: regStats.total ?? 0,
      badge: (regStats.by_enrollment_stage?.needs_contact ?? 0) > 0
        ? `${regStats.by_enrollment_stage.needs_contact} ${t('registration.kpi.needsContact')}`
        : null,
      meta: [
        { label: t('registration.kpi.pendingPayment'), value: regStats.by_payment_status?.pending ?? 0 },
        { label: t('registration.kpi.paid'), value: regStats.by_payment_status?.paid ?? 0 },
      ],
      link: '/cms/training/registrations',
    },
    hasModuleAccess('contact') && stats.contact && {
      key: 'contact',
      module: 'contact',
      icon: 'contact',
      label: t('dash.contactLeads'),
      value: stats.contact.new ?? 0,
      meta: [
        { label: t('dash.total'), value: stats.contact.total ?? 0 },
        { label: t('dash.highPriority'), value: stats.contact.high_priority ?? 0 },
      ],
      link: '/cms/contact',
    },
    hasModuleAccess('services') && stats.services && {
      key: 'services',
      module: 'services',
      icon: 'services',
      label: t('dash.activeServices'),
      value: stats.services.active ?? 0,
      meta: [
        { label: t('dash.total'), value: stats.services.total ?? 0 },
        { label: t('dash.featured'), value: stats.services.featured ?? 0 },
      ],
      link: '/cms/services',
    },
    canManageUsers && hasModuleAccess('users') && stats.users && {
      key: 'users',
      module: 'users',
      icon: 'users',
      label: t('dash.teamMembers'),
      value: stats.users.active ?? 0,
      meta: [
        { label: t('dash.total'), value: stats.users.total ?? 0 },
        { label: t('dash.inactive'), value: stats.users.inactive ?? 0 },
      ],
      link: '/cms/users',
    },
    hasModuleAccess('media') && stats.media && {
      key: 'media',
      module: 'media',
      icon: 'media',
      label: t('dash.media'),
      value: stats.media.total ?? 0,
      meta: [
        { label: t('dash.images'), value: stats.media.images ?? 0 },
        { label: t('dash.documents'), value: stats.media.documents ?? 0 },
      ],
      link: '/cms/media',
    },
    hasModuleAccess('insights') && stats.insights && {
      key: 'insights',
      module: 'insights',
      icon: 'insights',
      label: t('dash.publishedInsights'),
      value: stats.insights.published ?? 0,
      meta: [
        { label: t('dash.total'), value: stats.insights.total ?? 0 },
        { label: t('dash.draft'), value: stats.insights.draft ?? 0 },
      ],
      link: '/cms/insights',
    },
  ];

  const kpis = kpiDefs.filter(Boolean).slice(0, 4);
  const kpiModules = new Set(kpis.map((k) => k.module));

  /* ─── Operational alert items (real triggers only) ──────────────────────── */
  const alertItems = [];
  if (canViewRegistrations && (regStats?.by_enrollment_stage?.needs_contact ?? 0) > 0) {
    alertItems.push({
      key: 'registrations_needs_contact',
      count: regStats.by_enrollment_stage.needs_contact,
      label: t(regStats.by_enrollment_stage.needs_contact === 1 ? 'dash.newRegistrationAwaiting' : 'dash.newRegistrationsAwaiting'),
      link: '/cms/training/registrations',
    });
  }
  if (canViewRegistrations && (regStats?.by_payment_status?.pending ?? 0) > 0) {
    alertItems.push({
      key: 'registrations_pending_payment',
      count: regStats.by_payment_status.pending,
      label: `${regStats.by_payment_status.pending} ${t('registration.kpi.pendingPayment')}`,
      link: '/cms/training/registrations',
    });
  }
  if (hasModuleAccess('contact') && (stats.contact?.new ?? 0) > 0) {
    alertItems.push({
      key: 'contact',
      count: stats.contact.new,
      label: t(stats.contact.new === 1 ? 'dash.newLeadAwaiting' : 'dash.newLeadsAwaiting'),
      link: '/cms/contact',
    });
  }

  return (
    <CMSLayout>
      <DashboardHeader onRefresh={load} loading={loading} />

      <div style={styles.contentWrap}>
        {loading && <CMSLoadingState />}
        {error && <CMSErrorState message={error} onRetry={load} />}

        {data && !loading && !error && (
          <div className="cms-dash-grid">
            {/* ─── Operational alert (only when real items need attention) ──── */}
            <DashboardAlert items={alertItems} />

            {/* ─── Primary KPI row ─────────────────────────────────────────── */}
            {kpis.length > 0 && (
              <section>
                <div className="cms-kpi-grid">
                  {kpis.map((kpi) => (
                    <KpiCard
                      key={kpi.key}
                      icon={kpi.icon}
                      value={kpi.value}
                      label={kpi.label}
                      meta={kpi.meta}
                      badge={kpi.badge}
                      link={kpi.link}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* ─── Operational lists ───────────────────────────────────────── */}
            <div className="cms-dash-two-col">
              {canViewRegistrations && (
                <SectionCard
                  title={t('dash.recentRegistrations')}
                  icon="registrations"
                  link="/cms/training/registrations"
                >
                  {recentRegistrations.length > 0 ? (
                    <div>
                      {recentRegistrations.map((reg) => (
                        <RegistrationItem key={reg.id} reg={reg} onView={(r) => setRegModalId(r.id)} />
                      ))}
                    </div>
                  ) : (
                    <div style={styles.emptyInner}>
                      <CMSEmptyState message={t('dash.noRegistrations')} />
                    </div>
                  )}
                </SectionCard>
              )}

              {hasModuleAccess('contact') && (
                <SectionCard
                  title={t('dash.recentSubmissions')}
                  icon="inbox"
                  link="/cms/contact"
                >
                  {data.recent_contact_submissions && data.recent_contact_submissions.length > 0 ? (
                    <div>
                      {data.recent_contact_submissions.map((sub) => (
                        <ContactSubmissionItem key={sub.id} sub={sub} />
                      ))}
                    </div>
                  ) : (
                    <div style={styles.emptyInner}>
                      <CMSEmptyState message={t('dash.noSubmissions')} />
                    </div>
                  )}
                </SectionCard>
              )}
            </div>

            {/* ─── Activity + quick actions ────────────────────────────────── */}
            <div className="cms-dash-two-col">
              {hasModuleAccess('activity_logs') && (
                <SectionCard
                  title={t('dash.recentActivity')}
                  icon="activity"
                  link="/cms/activity-logs"
                >
                  {data.recent_activity && data.recent_activity.length > 0 ? (
                    <div>
                      {data.recent_activity.map((log) => (
                        <ActivityItem key={log.id} log={log} />
                      ))}
                    </div>
                  ) : (
                    <div style={styles.emptyInner}>
                      <CMSEmptyState message={t('dash.noActivity')} />
                    </div>
                  )}
                </SectionCard>
              )}

              <SectionCard title={t('dash.quickActions')} icon="plus">
                <div className="cms-quick-actions-grid">
                  {hasModuleAccess('insights') && (
                    <QuickActionCard to="/cms/insights/new" icon="insights" label={t('dash.createInsight')} />
                  )}
                  {hasModuleAccess('services') && (
                    <QuickActionCard to="/cms/services/new" icon="services" label={t('dash.addService')} />
                  )}
                  {hasModuleAccess('partners') && (
                    <QuickActionCard to="/cms/partners" icon="partners" label={t('dash.addPartner')} />
                  )}
                  {hasModuleAccess('case_studies') && (
                    <QuickActionCard to="/cms/case-studies" icon="caseStudies" label={t('dash.addCaseStudy')} />
                  )}
                  {hasModuleAccess('careers') && (
                    <QuickActionCard to="/cms/careers/new" icon="careers" label={t('dash.addJob')} />
                  )}
                  {canViewRegistrations && (
                    <QuickActionCard to="/cms/training/registrations" icon="registrations" label={t('nav.trainingRegistrations')} />
                  )}
                  {hasModuleAccess('contact') && (
                    <QuickActionCard to="/cms/contact" icon="contact" label={t('dash.openContact')} />
                  )}
                  {hasModuleAccess('media') && (
                    <QuickActionCard to="/cms/media" icon="media" label={t('dash.uploadMedia')} />
                  )}
                  {canManageUsers && (
                    <QuickActionCard to="/cms/users" icon="users" label={t('dash.manageUsers')} />
                  )}
                  {hasModuleAccess('site_settings') && (
                    <QuickActionCard to="/cms/site-settings" icon="settings" label={t('nav.siteSettings')} />
                  )}
                </div>
              </SectionCard>
            </div>

            {/* ─── Content overview (remaining module stats) ───────────────── */}
            {data.stats && Object.keys(data.stats).length > 0 && (
              <section>
                <h2 className="cms-dash-section-heading">{t('dash.contentOverview')}</h2>
                <div className="cms-dash-stat-grid">
                  {data.stats.partners && !kpiModules.has('partners') && (
                    <StatCard
                      module="partners"
                      title={t('nav.partners')}
                      stats={data.stats.partners}
                      link="/cms/partners"
                      canAccess={hasModuleAccess('partners')}
                      labels={{
                        total: t('dash.total'),
                        active: t('dash.active'),
                        featured: t('dash.featured'),
                      }}
                    />
                  )}
                  {data.stats.services && !kpiModules.has('services') && (
                    <StatCard
                      module="services"
                      title={t('nav.services')}
                      stats={data.stats.services}
                      link="/cms/services"
                      canAccess={hasModuleAccess('services')}
                      labels={{
                        total: t('dash.total'),
                        active: t('dash.active'),
                        featured: t('dash.featured'),
                        on_homepage: t('dash.onHomepage'),
                      }}
                    />
                  )}
                  {data.stats.case_studies && !kpiModules.has('case_studies') && (
                    <StatCard
                      module="case_studies"
                      title={t('nav.caseStudies')}
                      stats={data.stats.case_studies}
                      link="/cms/case-studies"
                      canAccess={hasModuleAccess('case_studies')}
                      labels={{
                        total: t('dash.total'),
                        active: t('dash.active'),
                        featured: t('dash.featured'),
                        on_homepage: t('dash.onHomepage'),
                      }}
                    />
                  )}
                  {data.stats.insights && !kpiModules.has('insights') && (
                    <StatCard
                      module="insights"
                      title={t('nav.insights')}
                      stats={{
                        total: data.stats.insights.total,
                        published: data.stats.insights.published,
                        draft: data.stats.insights.draft,
                        archived: data.stats.insights.archived,
                      }}
                      link="/cms/insights"
                      canAccess={hasModuleAccess('insights')}
                      labels={{
                        total: t('dash.total'),
                        published: t('dash.published'),
                        draft: t('dash.draft'),
                        archived: t('dash.archived'),
                      }}
                    />
                  )}
                  {data.stats.careers && !kpiModules.has('careers') && (
                    <StatCard
                      module="careers"
                      title={t('nav.careers')}
                      stats={data.stats.careers}
                      link="/cms/careers"
                      canAccess={hasModuleAccess('careers')}
                      labels={{
                        total: t('dash.total'),
                        active: t('dash.active'),
                        expired: t('dash.expired'),
                        featured: t('dash.featured'),
                      }}
                    />
                  )}
                  {data.stats.contact && !kpiModules.has('contact') && (
                    <StatCard
                      module="contact"
                      title={t('nav.contact')}
                      stats={data.stats.contact}
                      link="/cms/contact"
                      canAccess={hasModuleAccess('contact')}
                      primaryLabel="new"
                      labels={{
                        total: t('dash.total'),
                        new: t('dash.new'),
                        in_progress: t('status.inProgress'),
                        closed: t('status.closed'),
                        high_priority: t('dash.highPriority'),
                        recent_count: t('dash.recentCount'),
                        inquiry_types: t('nav.inquiryTypes'),
                      }}
                    />
                  )}
                  {data.stats.media && !kpiModules.has('media') && (
                    <StatCard
                      module="media"
                      title={t('dash.media')}
                      stats={data.stats.media}
                      link="/cms/media"
                      canAccess={hasModuleAccess('media')}
                      labels={{
                        total: t('dash.total'),
                        active: t('dash.active'),
                        images: t('dash.images'),
                        documents: t('dash.documents'),
                      }}
                    />
                  )}
                  {data.stats.users && canManageUsers && !kpiModules.has('users') && (
                    <StatCard
                      module="users"
                      title={t('dash.users')}
                      stats={data.stats.users}
                      link="/cms/users"
                      canAccess={hasModuleAccess('users')}
                      labels={{
                        total: t('dash.total'),
                        active: t('dash.active'),
                        inactive: t('dash.inactive'),
                      }}
                    />
                  )}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      {/* Registration details open in the shared modal — no navigation */}
      {regModalId && (
        <RegistrationDetailModal
          registrationId={regModalId}
          open
          onClose={() => setRegModalId(null)}
          onSaved={loadRegistrations}
          onDeleted={loadRegistrations}
        />
      )}
    </CMSLayout>
  );
}

const styles = {
  contentWrap: {
    marginTop: 'var(--space-5)',
  },
  emptyInner: {
    padding: 'var(--space-6)',
  },
};
