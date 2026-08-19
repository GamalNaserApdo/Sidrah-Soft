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
import CMSTrainingPage from '../../../pages/cms/CMSTrainingPage';
import CMSTrainingFormPage from '../../../pages/cms/CMSTrainingFormPage';
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
      <Route path="" element={<ProtectedRoute redirectTo="/cms/login"><CMSDashboardPage /></ProtectedRoute>} />
      <Route path="site-settings" element={<ProtectedRoute redirectTo="/cms/login"><CMSSiteSettingsPage /></ProtectedRoute>} />
      <Route path="homepage" element={<ProtectedRoute redirectTo="/cms/login"><CMSHomepagePage /></ProtectedRoute>} />
      <Route path="navigation" element={<ProtectedRoute redirectTo="/cms/login"><CMSNavigationPage /></ProtectedRoute>} />
      <Route path="partners" element={<ProtectedRoute redirectTo="/cms/login"><CMSPartnersPage /></ProtectedRoute>} />
      <Route path="partners/new" element={<ProtectedRoute redirectTo="/cms/login"><CMSPartnerFormPage /></ProtectedRoute>} />
      <Route path="partners/:id" element={<ProtectedRoute redirectTo="/cms/login"><CMSPartnerFormPage /></ProtectedRoute>} />
      <Route path="training" element={<ProtectedRoute redirectTo="/cms/login"><CMSTrainingPage /></ProtectedRoute>} />
      <Route path="training/new" element={<ProtectedRoute redirectTo="/cms/login"><CMSTrainingFormPage /></ProtectedRoute>} />
      <Route path="training/:id" element={<ProtectedRoute redirectTo="/cms/login"><CMSTrainingFormPage /></ProtectedRoute>} />
      <Route path="services" element={<ProtectedRoute redirectTo="/cms/login"><CMSServicesPage /></ProtectedRoute>} />
      <Route path="services/new" element={<ProtectedRoute redirectTo="/cms/login"><CMSServiceFormPage /></ProtectedRoute>} />
      <Route path="services/:id" element={<ProtectedRoute redirectTo="/cms/login"><CMSServiceFormPage /></ProtectedRoute>} />
      <Route path="case-studies" element={<ProtectedRoute redirectTo="/cms/login"><CMSCaseStudiesPage /></ProtectedRoute>} />
      <Route path="case-studies/new" element={<ProtectedRoute redirectTo="/cms/login"><CMSCaseStudyFormPage /></ProtectedRoute>} />
      <Route path="case-studies/:id" element={<ProtectedRoute redirectTo="/cms/login"><CMSCaseStudyFormPage /></ProtectedRoute>} />
      <Route path="insights" element={<ProtectedRoute redirectTo="/cms/login"><CMSInsightsPage /></ProtectedRoute>} />
      <Route path="insights/new" element={<ProtectedRoute redirectTo="/cms/login"><CMSArticleFormPage /></ProtectedRoute>} />
      <Route path="insights/:id" element={<ProtectedRoute redirectTo="/cms/login"><CMSArticleFormPage /></ProtectedRoute>} />
      <Route path="careers" element={<ProtectedRoute redirectTo="/cms/login"><CMSCareersPage /></ProtectedRoute>} />
      <Route path="careers/new" element={<ProtectedRoute redirectTo="/cms/login"><CMSJobFormPage /></ProtectedRoute>} />
      <Route path="careers/:id" element={<ProtectedRoute redirectTo="/cms/login"><CMSJobFormPage /></ProtectedRoute>} />
      <Route path="contact" element={<ProtectedRoute redirectTo="/cms/login"><CMSContactPage /></ProtectedRoute>} />
      <Route path="contact/inquiry-types" element={<ProtectedRoute redirectTo="/cms/login"><CMSContactPage defaultTab="inquiryTypes" /></ProtectedRoute>} />
      <Route path="contact/:id" element={<ProtectedRoute redirectTo="/cms/login"><CMSContactPage defaultTab="submissions" /></ProtectedRoute>} />
      <Route path="activity-logs" element={<ProtectedRoute redirectTo="/cms/login"><CMSActivityLogsPage /></ProtectedRoute>} />
      <Route path="users" element={<ProtectedRoute redirectTo="/cms/login"><CMSUsersPage /></ProtectedRoute>} />
      <Route path="media" element={<ProtectedRoute redirectTo="/cms/login"><MediaLibraryPage /></ProtectedRoute>} />
    </Routes>
  );
}
