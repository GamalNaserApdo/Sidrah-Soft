/**
 * Leads Routes — all routes under /leads/*.
 *
 * Wrapped by AuthProvider, CMSLanguageProvider, and CMSToastProvider in App.jsx.
 */

import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../auth/ProtectedRoute';
import LeadsLayout from './LeadsLayout';
import LeadsLoginPage from './LeadsLoginPage';
import LeadsDashboardPage from './LeadsDashboardPage';
import LeadDetailPage from './LeadDetailPage';

export default function LeadsRoutes() {
  return (
    <Routes>
      <Route path="login" element={<LeadsLoginPage />} />
      <Route path="" element={
        <ProtectedRoute requiredModule="contact">
          <LeadsLayout>
            <LeadsDashboardPage />
          </LeadsLayout>
        </ProtectedRoute>
      } />
      <Route path=":id" element={
        <ProtectedRoute requiredModule="contact">
          <LeadsLayout>
            <LeadDetailPage />
          </LeadsLayout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}
