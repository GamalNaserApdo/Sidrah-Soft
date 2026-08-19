import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import ScrollToTop from './components/ScrollToTop';
import SidrahGridBackground from './components/SidrahGridBackground';
import SEO from './components/SEO';
import CinematicHero from './components/hero/CinematicHero';
import FoundationSection from './components/sections/FoundationSection';
import CapabilitiesMarqueeSection from './components/sections/CapabilitiesMarqueeSection';
import IndustriesSection from './components/sections/IndustriesSection';
import TrainingEducationEntry from './components/sections/TrainingEducationEntry';
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
const SecondaryEducationPage = lazy(() => import('./pages/SecondaryEducationPage'));
const SecondaryProgramDetailPage = lazy(() => import('./pages/SecondaryProgramDetailPage'));
const CaseStudiesPage = lazy(() => import('./pages/CaseStudiesPage'));
const InsightsPage = lazy(() => import('./pages/InsightsPage'));
const InsightDetailPage = lazy(() => import('./pages/InsightDetailPage'));
const CareersPage = lazy(() => import('./pages/CareersPage'));
const LeadsRoutes = lazy(() => import('./components/leads/LeadsRoutes'));
const CMSRoutes = lazy(() => import('./components/cms/layout/CMSRoutes'));

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
  industries: IndustriesSection,
  training_education: TrainingEducationEntry,
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
  'industries',
  'training_education',
  'partners',
  'case_studies',
  'insights',
  'careers',
  'contact',
];

const HIDDEN_HOMEPAGE_SECTIONS = new Set(['services', 'automation_showcase']);

const REQUIRED_SECTIONS = ['training_education'];

function mergeWithFallback(configSections = []) {
  // Preserve the CMS section ordering, but ensure newly required sections
  // (e.g. training_education) are not silently dropped just because the
  // stored configuration predates them.
  const byKey = new Map();
  configSections.forEach((s) => {
    if (!byKey.has(s.section_key)) {
      byKey.set(s.section_key, { ...s });
    }
  });

  const fallbackIndex = new Map(FALLBACK_SECTION_ORDER.map((k, i) => [k, i]));

  // CMS order is primary. Use display_order, fallback index as tie-breaker.
  const cmsOrdered = configSections
    .filter((s) => s.is_visible !== false && SECTION_COMPONENT_MAP[s.section_key] != null)
    .map((s) => ({ ...s, _fallbackIndex: fallbackIndex.get(s.section_key) ?? 999 }))
    .sort((a, b) => {
      const orderA = a.display_order ?? a._fallbackIndex;
      const orderB = b.display_order ?? b._fallbackIndex;
      if (orderA !== orderB) return orderA - orderB;
      return a._fallbackIndex - b._fallbackIndex;
    });

  const added = new Set(cmsOrdered.map((s) => s.section_key));
  const result = [];

  cmsOrdered.forEach((section) => {
    const key = section.section_key;
    const thisFallback = fallbackIndex.get(key) ?? 999;
    // Insert a missing required section just before the first CMS section
    // whose fallback position is at or after the required one.
    REQUIRED_SECTIONS.forEach((required) => {
      const reqFallback = fallbackIndex.get(required) ?? 999;
      if (!added.has(required) && thisFallback >= reqFallback) {
        result.push({ section_key: required, is_visible: true });
        added.add(required);
      }
    });
    result.push(section);
  });

  // Append any required sections whose fallback position is after all CMS ones.
  REQUIRED_SECTIONS.forEach((required) => {
    if (!added.has(required)) {
      result.push({ section_key: required, is_visible: true });
    }
  });

  return result;
}

function HomeSections() {
  const { config } = useHomepageConfig();

  const sections = config?.sections?.length
    ? mergeWithFallback(config.sections)
    : FALLBACK_SECTION_ORDER.map((key) => ({ section_key: key }));

  return (
    <>
      {sections
        .filter((s) => !HIDDEN_HOMEPAGE_SECTIONS.has(s.section_key))
        .map((s) => {
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

function PublicWebsiteShell({ children }) {
  return (
    <div className="public-website-shell sidrah-grid-shell">
      <div className="public-route-content">{children}</div>
    </div>
  );
}

function App() {
  return (
    <>
      <ScrollToTop />
      <SidrahGridBackground />
      <div className="app-content">
        <Suspense fallback={<RouteFallback />}>
          <Routes>
          <Route path="/" element={<PublicWebsiteShell><Home /></PublicWebsiteShell>} />
          <Route path="/training" element={<PublicWebsiteShell><TrainingPage /></PublicWebsiteShell>} />
          <Route path="/training/:courseSlug" element={<PublicWebsiteShell><CourseDetailPage /></PublicWebsiteShell>} />
          <Route path="/training/secondary" element={<PublicWebsiteShell><SecondaryEducationPage /></PublicWebsiteShell>} />
          <Route path="/training/secondary/:programSlug" element={<PublicWebsiteShell><SecondaryProgramDetailPage /></PublicWebsiteShell>} />
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
          <Route path="/cms/*" element={
            <AuthProvider>
              <CMSLanguageProvider>
                <CMSToastProvider>
                  <CMSRoutes />
                </CMSToastProvider>
              </CMSLanguageProvider>
            </AuthProvider>
          } />
          </Routes>
        </Suspense>
      </div>
    </>
  );
}

export default App;
