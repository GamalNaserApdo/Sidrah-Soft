import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import ScrollToTop from './components/ScrollToTop';
import InteractiveNetworkBackground from './components/InteractiveNetworkBackground';
import MouseGlow from './components/MouseGlow';
import CinematicLayers from './components/cinematic/CinematicLayers';
import FloatingSocialBar from './components/FloatingSocialBar';
import SEO from './components/SEO';
import CinematicHero from './components/hero/CinematicHero';
import FoundationSection from './components/sections/FoundationSection';
import CapabilitiesMarqueeSection from './components/sections/CapabilitiesMarqueeSection';
import ServicesSection from './components/sections/ServicesSection';
import AutomationShowcaseSection from './components/sections/AutomationShowcaseSection';
import IndustriesSection from './components/sections/IndustriesSection';
import PartnersTrustSection from './components/sections/PartnersTrustSection';
import CaseStudiesSection from './components/sections/CaseStudiesSection';
import InsightsSection from './components/sections/InsightsSection';
import CareersSection from './components/sections/CareersSection';
import ContactSection from './components/sections/ContactSection';
import Footer from './components/Footer';
import Header from './components/Header';
import { PAGES } from './config/seo';
import { AuthProvider } from './contexts/AuthContext';
import { CMSLanguageProvider } from './contexts/CMSLanguageContext';
import { CMSToastProvider } from './contexts/CMSToastContext';
import { useHomepageConfig } from './hooks/useHomepageConfig';

const TrainingPage = lazy(() => import('./components/pages/TrainingPage'));
const CourseDetailPage = lazy(() => import('./pages/CourseDetailPage'));
const CaseStudiesPage = lazy(() => import('./pages/CaseStudiesPage'));
const InsightsPage = lazy(() => import('./pages/InsightsPage'));
const InsightDetailPage = lazy(() => import('./pages/InsightDetailPage'));
const CareersPage = lazy(() => import('./pages/CareersPage'));
const LeadsRoutes = lazy(() => import('./components/leads/LeadsRoutes'));

function RouteFallback() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'var(--color-bg, #0a0b10)',
    }} />
  );
}

const SECTION_COMPONENT_MAP = {
  hero: CinematicHero,
  foundation: FoundationSection,
  marquee: CapabilitiesMarqueeSection,
  services: ServicesSection,
  automation_showcase: AutomationShowcaseSection,
  industries: IndustriesSection,
  partners: PartnersTrustSection,
  case_studies: CaseStudiesSection,
  insights: InsightsSection,
  careers: CareersSection,
  contact: ContactSection,
};

const FALLBACK_SECTION_ORDER = [
  'hero',
  'foundation',
  'marquee',
  'services',
  'automation_showcase',
  'industries',
  'partners',
  'case_studies',
  'insights',
  'careers',
  'contact',
];

function HomeSections() {
  const { config } = useHomepageConfig();

  let sections;
  if (config?.sections?.length) {
    const visibleSections = config.sections
      .filter((s) => s.is_visible !== false)
      .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    const seen = new Set();
    sections = visibleSections.filter((s) => {
      if (seen.has(s.section_key)) return false;
      seen.add(s.section_key);
      return SECTION_COMPONENT_MAP[s.section_key] != null;
    });
  } else {
    sections = FALLBACK_SECTION_ORDER.map((key) => ({ section_key: key }));
  }

  return (
    <>
      {sections.map((s) => {
        const Component = SECTION_COMPONENT_MAP[s.section_key];
        if (!Component) return null;
      if (s.section_key === 'hero') {
        const heroConfig = config?.hero;
        if (heroConfig?.enabled === false) return null;
        return <Component key={s.section_key} />;
      }
      return <Component key={s.section_key} />;
    })}
    </>
  );
}

function Home() {
  return (
    <>
      <SEO {...PAGES.home} />
      <Header />
      <main>
        <HomeSections />
      </main>
      <Footer />
    </>
  );
}

function getPublicRouteMood(pathname) {
  if (pathname === '/case-studies') return 'casestudies';
  if (pathname === '/insights' || pathname.startsWith('/insights/')) return 'insights';
  if (pathname === '/careers') return 'careers';
  if (pathname === '/training' || pathname.startsWith('/training/')) return 'foundation';
  return 'hero';
}

function PublicWebsiteShell({ children }) {
  const { pathname } = useLocation();

  return (
    <div className="public-website-shell">
      <CinematicLayers defaultMood={getPublicRouteMood(pathname)} />
      <div className="public-route-content">{children}</div>
    </div>
  );
}

function App() {
  return (
    <>
      <ScrollToTop />
      <InteractiveNetworkBackground />
      <div className="app-content">
        <MouseGlow />
        <FloatingSocialBar />
        <Suspense fallback={<RouteFallback />}>
          <Routes>
          <Route path="/" element={<PublicWebsiteShell><Home /></PublicWebsiteShell>} />
          <Route path="/training" element={<PublicWebsiteShell><TrainingPage /></PublicWebsiteShell>} />
          <Route path="/training/:courseSlug" element={<PublicWebsiteShell><CourseDetailPage /></PublicWebsiteShell>} />
          <Route path="/case-studies" element={<PublicWebsiteShell><CaseStudiesPage /></PublicWebsiteShell>} />
          <Route path="/insights" element={<PublicWebsiteShell><InsightsPage /></PublicWebsiteShell>} />
          <Route path="/insights/:slug" element={<PublicWebsiteShell><InsightDetailPage /></PublicWebsiteShell>} />
          <Route path="/careers" element={<PublicWebsiteShell><CareersPage /></PublicWebsiteShell>} />
          <Route path="/leads/*" element={
            <AuthProvider>
              <CMSLanguageProvider>
                <CMSToastProvider>
                  <LeadsRoutes />
                </CMSToastProvider>
              </CMSLanguageProvider>
            </AuthProvider>
          } />
          <Route path="/cms/*" element={<Navigate to="/leads/login" replace />} />
          </Routes>
        </Suspense>
      </div>
    </>
  );
}

export default App;
