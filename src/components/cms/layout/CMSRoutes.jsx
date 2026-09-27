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
import CMSStaticSEOPage from '../../../pages/cms/CMSStaticSEOPage';
import CMSAIAutomationPage from '../../../pages/cms/CMSAIAutomationPage';
import CMSHomepagePage from '../../../pages/cms/CMSHomepagePage';
import CMSNavigationPage from '../../../pages/cms/CMSNavigationPage';
import CMSPartnersPage from '../../../pages/cms/CMSPartnersPage';
import CMSPartnerFormPage from '../../../pages/cms/CMSPartnerFormPage';
import CMSTrainingPage from '../../../pages/cms/CMSTrainingPage';
import CMSTrainingFormPage from '../../../pages/cms/CMSTrainingFormPage';
import CMSTrainingLandingPage from '../../../pages/cms/CMSTrainingLandingPage';
import CMSOffersPage from '../../../pages/cms/CMSOffersPage';
import CMSOfferFormPage from '../../../pages/cms/CMSOfferFormPage';
import CMSTrainingRegistrationsPage from '../../../pages/cms/CMSTrainingRegistrationsPage';
import CMSTrainingRegistrationDetailPage from '../../../pages/cms/CMSTrainingRegistrationDetailPage';
import CMSTrainingStarterFormConfigPage from '../../../pages/cms/CMSTrainingStarterFormConfigPage';
import CMSStarterLandingPage from '../../../pages/cms/CMSStarterLandingPage';
import CMSStarterLandingPreviewPage from '../../../pages/cms/CMSStarterLandingPreviewPage';
import CMSTrainingCertificatesPage from '../../../pages/cms/CMSTrainingCertificatesPage';
import CMSTrainingCertificateDetailPage from '../../../pages/cms/CMSTrainingCertificateDetailPage';
import CMSServicesPage from '../../../pages/cms/CMSServicesPage';
import CMSServiceFormPage from '../../../pages/cms/CMSServiceFormPage';
import CMSCaseStudiesPage from '../../../pages/cms/CMSCaseStudiesPage';
import CMSCaseStudyFormPage from '../../../pages/cms/CMSCaseStudyFormPage';
import CMSInsightsPage from '../../../pages/cms/CMSInsightsPage';
import CMSArticleFormPage from '../../../pages/cms/CMSArticleFormPage';
import CMSCareersPage from '../../../pages/cms/CMSCareersPage';
import CMSJobFormPage from '../../../pages/cms/CMSJobFormPage';
import CMSContactPage from '../../../pages/cms/CMSContactPage';
import CMSFormsPage from '../../../pages/cms/CMSFormsPage';
import CMSFormFormPage from '../../../pages/cms/CMSFormFormPage';
import CMSFormSubmissionsPage from '../../../pages/cms/CMSFormSubmissionsPage';
import CMSActivityLogsPage from '../../../pages/cms/CMSActivityLogsPage';
import CMSUsersPage from '../../../pages/cms/CMSUsersPage';
import MediaLibraryPage from '../../../pages/cms/MediaLibraryPage';

export default function CMSRoutes() {
  return (
    <Routes>
      <Route path="login" element={<CMSLoginPage />} />
      <Route path="" element={<ProtectedRoute redirectTo="/cms/login"><CMSDashboardPage /></ProtectedRoute>} />
      <Route path="site-settings" element={<ProtectedRoute redirectTo="/cms/login"><CMSSiteSettingsPage /></ProtectedRoute>} />
      <Route path="static-seo" element={<ProtectedRoute redirectTo="/cms/login"><CMSStaticSEOPage /></ProtectedRoute>} />
      <Route path="ai-automation" element={<ProtectedRoute redirectTo="/cms/login" requiredModule="ai_automation"><CMSAIAutomationPage /></ProtectedRoute>} />
      <Route path="homepage" element={<ProtectedRoute redirectTo="/cms/login"><CMSHomepagePage /></ProtectedRoute>} />
      <Route path="navigation" element={<ProtectedRoute redirectTo="/cms/login"><CMSNavigationPage /></ProtectedRoute>} />
      <Route path="partners" element={<ProtectedRoute redirectTo="/cms/login"><CMSPartnersPage /></ProtectedRoute>} />
      <Route path="partners/new" element={<ProtectedRoute redirectTo="/cms/login"><CMSPartnerFormPage /></ProtectedRoute>} />
      <Route path="partners/:id" element={<ProtectedRoute redirectTo="/cms/login"><CMSPartnerFormPage /></ProtectedRoute>} />
      <Route path="training" element={<ProtectedRoute redirectTo="/cms/login" requiredModule="training"><CMSTrainingPage /></ProtectedRoute>} />
      <Route path="training/new" element={<ProtectedRoute redirectTo="/cms/login" requiredModule="training"><CMSTrainingFormPage /></ProtectedRoute>} />
      <Route path="training/:id" element={<ProtectedRoute redirectTo="/cms/login" requiredModule="training"><CMSTrainingFormPage /></ProtectedRoute>} />
      <Route path="training/:id/landing" element={<ProtectedRoute redirectTo="/cms/login" requiredModule="training"><CMSTrainingLandingPage /></ProtectedRoute>} />
      <Route path="training/offers" element={<ProtectedRoute redirectTo="/cms/login" requiredModule="training"><CMSOffersPage /></ProtectedRoute>} />
      <Route path="training/offers/new" element={<ProtectedRoute redirectTo="/cms/login" requiredModule="training"><CMSOfferFormPage /></ProtectedRoute>} />
      <Route path="training/offers/:id" element={<ProtectedRoute redirectTo="/cms/login" requiredModule="training"><CMSOfferFormPage /></ProtectedRoute>} />
      <Route path="training/starter-form" element={<ProtectedRoute redirectTo="/cms/login" requiredModule="training"><CMSTrainingStarterFormConfigPage /></ProtectedRoute>} />
      <Route path="training/starter-landing" element={<ProtectedRoute redirectTo="/cms/login" requiredModule="training"><CMSStarterLandingPage /></ProtectedRoute>} />
      <Route path="training/starter-landing/preview" element={<ProtectedRoute redirectTo="/cms/login" requiredModule="training"><CMSStarterLandingPreviewPage /></ProtectedRoute>} />
      <Route path="training/registrations" element={<ProtectedRoute redirectTo="/cms/login" requiredModule="training_registrations"><CMSTrainingRegistrationsPage /></ProtectedRoute>} />
      <Route path="training/registrations/new" element={<ProtectedRoute redirectTo="/cms/login" requiredModule="training_registrations"><CMSTrainingRegistrationDetailPage /></ProtectedRoute>} />
      <Route path="training/registrations/:id" element={<ProtectedRoute redirectTo="/cms/login" requiredModule="training_registrations"><CMSTrainingRegistrationDetailPage /></ProtectedRoute>} />
      <Route path="training/certificates" element={<ProtectedRoute redirectTo="/cms/login" requiredModule="certificates"><CMSTrainingCertificatesPage /></ProtectedRoute>} />
      <Route path="training/certificates/new" element={<ProtectedRoute redirectTo="/cms/login" requiredModule="certificates"><CMSTrainingCertificateDetailPage /></ProtectedRoute>} />
      <Route path="training/certificates/:id" element={<ProtectedRoute redirectTo="/cms/login" requiredModule="certificates"><CMSTrainingCertificateDetailPage /></ProtectedRoute>} />
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
      <Route path="forms" element={<ProtectedRoute redirectTo="/cms/login" requiredModule="forms"><CMSFormsPage /></ProtectedRoute>} />
      <Route path="forms/new" element={<ProtectedRoute redirectTo="/cms/login" requiredModule="forms"><CMSFormFormPage /></ProtectedRoute>} />
      <Route path="forms/:id" element={<ProtectedRoute redirectTo="/cms/login" requiredModule="forms"><CMSFormFormPage /></ProtectedRoute>} />
      <Route path="forms/:id/submissions" element={<ProtectedRoute redirectTo="/cms/login" requiredModule="forms"><CMSFormSubmissionsPage /></ProtectedRoute>} />
      <Route path="activity-logs" element={<ProtectedRoute redirectTo="/cms/login"><CMSActivityLogsPage /></ProtectedRoute>} />
      <Route path="users" element={<ProtectedRoute redirectTo="/cms/login" requiredModule="users"><CMSUsersPage /></ProtectedRoute>} />
      <Route path="media" element={<ProtectedRoute redirectTo="/cms/login"><MediaLibraryPage /></ProtectedRoute>} />
    </Routes>
  );
}
