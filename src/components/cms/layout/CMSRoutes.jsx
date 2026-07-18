/**
 * CMS Routes — all routes under /cms/*.
 *
 * Wrapped by AuthProvider, CMSLanguageProvider, and CMSToastProvider in App.jsx.
 */

import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../../auth/ProtectedRoute';
import CMSLoginPage from '../../../pages/cms/CMSLoginPage';
import CMSDashboardPage from '../../../pages/cms/CMSDashboardPage';
import CMSSiteSettingsPage from '../../../pages/cms/CMSSiteSettingsPage';
import CMSHomepagePage from '../../../pages/cms/CMSHomepagePage';
import CMSNavigationPage from '../../../pages/cms/CMSNavigationPage';
import CMSPartnersPage from '../../../pages/cms/CMSPartnersPage';
import CMSPartnerFormPage from '../../../pages/cms/CMSPartnerFormPage';
import CMSServicesPage from '../../../pages/cms/CMSServicesPage';
import CMSServiceFormPage from '../../../pages/cms/CMSServiceFormPage';
import CMSCaseStudiesPage from '../../../pages/cms/CMSCaseStudiesPage';
import CMSCaseStudyFormPage from '../../../pages/cms/CMSCaseStudyFormPage';
import CMSInsightsPage from '../../../pages/cms/CMSInsightsPage';
import CMSArticleFormPage from '../../../pages/cms/CMSArticleFormPage';
import CMSCareersPage from '../../../pages/cms/CMSCareersPage';
import CMSJobFormPage from '../../../pages/cms/CMSJobFormPage';
import CMSContactPage from '../../../pages/cms/CMSContactPage';
import CMSActivityLogsPage from '../../../pages/cms/CMSActivityLogsPage';
import CMSUsersPage from '../../../pages/cms/CMSUsersPage';
import MediaLibraryPage from '../../../pages/cms/MediaLibraryPage';

export default function CMSRoutes() {
  return (
    <Routes>
      <Route path="login" element={<CMSLoginPage />} />
      <Route path="" element={<ProtectedRoute><CMSDashboardPage /></ProtectedRoute>} />
      <Route path="site-settings" element={<ProtectedRoute><CMSSiteSettingsPage /></ProtectedRoute>} />
      <Route path="homepage" element={<ProtectedRoute><CMSHomepagePage /></ProtectedRoute>} />
      <Route path="navigation" element={<ProtectedRoute><CMSNavigationPage /></ProtectedRoute>} />
      <Route path="partners" element={<ProtectedRoute><CMSPartnersPage /></ProtectedRoute>} />
      <Route path="partners/new" element={<ProtectedRoute><CMSPartnerFormPage /></ProtectedRoute>} />
      <Route path="partners/:id" element={<ProtectedRoute><CMSPartnerFormPage /></ProtectedRoute>} />
      <Route path="services" element={<ProtectedRoute><CMSServicesPage /></ProtectedRoute>} />
      <Route path="services/new" element={<ProtectedRoute><CMSServiceFormPage /></ProtectedRoute>} />
      <Route path="services/:id" element={<ProtectedRoute><CMSServiceFormPage /></ProtectedRoute>} />
      <Route path="case-studies" element={<ProtectedRoute><CMSCaseStudiesPage /></ProtectedRoute>} />
      <Route path="case-studies/new" element={<ProtectedRoute><CMSCaseStudyFormPage /></ProtectedRoute>} />
      <Route path="case-studies/:id" element={<ProtectedRoute><CMSCaseStudyFormPage /></ProtectedRoute>} />
      <Route path="insights" element={<ProtectedRoute><CMSInsightsPage /></ProtectedRoute>} />
      <Route path="insights/new" element={<ProtectedRoute><CMSArticleFormPage /></ProtectedRoute>} />
      <Route path="insights/:id" element={<ProtectedRoute><CMSArticleFormPage /></ProtectedRoute>} />
      <Route path="careers" element={<ProtectedRoute><CMSCareersPage /></ProtectedRoute>} />
      <Route path="careers/new" element={<ProtectedRoute><CMSJobFormPage /></ProtectedRoute>} />
      <Route path="careers/:id" element={<ProtectedRoute><CMSJobFormPage /></ProtectedRoute>} />
      <Route path="contact" element={<ProtectedRoute><CMSContactPage /></ProtectedRoute>} />
      <Route path="contact/inquiry-types" element={<ProtectedRoute><CMSContactPage defaultTab="inquiryTypes" /></ProtectedRoute>} />
      <Route path="contact/:id" element={<ProtectedRoute><CMSContactPage defaultTab="submissions" /></ProtectedRoute>} />
      <Route path="activity-logs" element={<ProtectedRoute><CMSActivityLogsPage /></ProtectedRoute>} />
      <Route path="users" element={<ProtectedRoute><CMSUsersPage /></ProtectedRoute>} />
      <Route path="media" element={<ProtectedRoute><MediaLibraryPage /></ProtectedRoute>} />
    </Routes>
  );
}
