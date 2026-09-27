/**
 * CMS Training & Education API service.
 */
import { cmsFetch } from './cmsFetch';

function buildQuery(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.branch) query.set('branch', params.branch);
  if (params.status) query.set('status', params.status);
  if (params.ordering) query.set('ordering', params.ordering);
  if (params.page) query.set('page', params.page);
  if (params.page_size) query.set('page_size', params.page_size);
  const qs = query.toString();
  return qs ? `?${qs}` : '';
}

// Program CRUD
export function listPrograms(params = {}) {
  return cmsFetch(`/api/v1/cms/training/${buildQuery(params)}`);
}

export function getProgram(id) {
  return cmsFetch(`/api/v1/cms/training/${id}/`);
}

export function createProgram(data) {
  return cmsFetch('/api/v1/cms/training/', { method: 'POST', body: data });
}

export function updateProgram(id, data) {
  return cmsFetch(`/api/v1/cms/training/${id}/`, { method: 'PATCH', body: data });
}

export function deleteProgram(id) {
  return cmsFetch(`/api/v1/cms/training/${id}/`, { method: 'DELETE' });
}

export function reorderPrograms(items) {
  return cmsFetch('/api/v1/cms/training/reorder/', { method: 'POST', body: { items } });
}

// Publish / Unpublish / Archive
export function publishProgram(id) {
  return cmsFetch(`/api/v1/cms/training/${id}/publish/`, { method: 'POST' });
}

export function unpublishProgram(id) {
  return cmsFetch(`/api/v1/cms/training/${id}/unpublish/`, { method: 'POST' });
}

export function archiveProgram(id) {
  return cmsFetch(`/api/v1/cms/training/${id}/archive/`, { method: 'POST' });
}

// Nested resource reorder
export function reorderNested(model, items) {
  return cmsFetch(`/api/v1/cms/training/reorder/${model}/`, { method: 'POST', body: { items } });
}

// Modules
export function listModules(programId) {
  return cmsFetch(`/api/v1/cms/training/${programId}/modules/`);
}

export function createModule(programId, data) {
  return cmsFetch(`/api/v1/cms/training/${programId}/modules/`, { method: 'POST', body: data });
}

export function updateModule(id, data) {
  return cmsFetch(`/api/v1/cms/training/modules/${id}/`, { method: 'PATCH', body: data });
}

export function deleteModule(id) {
  return cmsFetch(`/api/v1/cms/training/modules/${id}/`, { method: 'DELETE' });
}

// Topics
export function listTopics(moduleId) {
  return cmsFetch(`/api/v1/cms/training/modules/${moduleId}/topics/`);
}

export function createTopic(moduleId, data) {
  return cmsFetch(`/api/v1/cms/training/modules/${moduleId}/topics/`, { method: 'POST', body: data });
}

export function updateTopic(id, data) {
  return cmsFetch(`/api/v1/cms/training/topics/${id}/`, { method: 'PATCH', body: data });
}

export function deleteTopic(id) {
  return cmsFetch(`/api/v1/cms/training/topics/${id}/`, { method: 'DELETE' });
}

// Instructors (reusable)
export function listInstructors(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  const qs = query.toString();
  return cmsFetch(`/api/v1/cms/training/instructors/${qs ? `?${qs}` : ''}`);
}

export function createInstructor(data) {
  return cmsFetch('/api/v1/cms/training/instructors/', { method: 'POST', body: data });
}

export function updateInstructor(id, data) {
  return cmsFetch(`/api/v1/cms/training/instructors/${id}/`, { method: 'PATCH', body: data });
}

export function deleteInstructor(id) {
  return cmsFetch(`/api/v1/cms/training/instructors/${id}/`, { method: 'DELETE' });
}

// Program-Instructor links
export function listProgramInstructors(programId) {
  return cmsFetch(`/api/v1/cms/training/${programId}/instructors/`);
}

export function assignInstructor(programId, instructorId, displayOrder = 0) {
  return cmsFetch(`/api/v1/cms/training/${programId}/instructors/`, {
    method: 'POST',
    body: { instructor: instructorId, display_order: displayOrder },
  });
}

export function removeProgramInstructor(id) {
  return cmsFetch(`/api/v1/cms/training/program-instructors/${id}/`, { method: 'DELETE' });
}

// FAQs
export function listFAQs(programId) {
  return cmsFetch(`/api/v1/cms/training/${programId}/faqs/`);
}

export function createFAQ(programId, data) {
  return cmsFetch(`/api/v1/cms/training/${programId}/faqs/`, { method: 'POST', body: data });
}

export function updateFAQ(id, data) {
  return cmsFetch(`/api/v1/cms/training/faqs/${id}/`, { method: 'PATCH', body: data });
}

export function deleteFAQ(id) {
  return cmsFetch(`/api/v1/cms/training/faqs/${id}/`, { method: 'DELETE' });
}

// Testimonials
export function listTestimonials(programId) {
  return cmsFetch(`/api/v1/cms/training/${programId}/testimonials/`);
}

export function createTestimonial(programId, data) {
  return cmsFetch(`/api/v1/cms/training/${programId}/testimonials/`, { method: 'POST', body: data });
}

export function updateTestimonial(id, data) {
  return cmsFetch(`/api/v1/cms/training/testimonials/${id}/`, { method: 'PATCH', body: data });
}

export function deleteTestimonial(id) {
  return cmsFetch(`/api/v1/cms/training/testimonials/${id}/`, { method: 'DELETE' });
}

export function approveTestimonial(id) {
  return cmsFetch(`/api/v1/cms/training/testimonials/${id}/approve/`, { method: 'POST' });
}

// Starter Campaign Form Config (singleton)
export function getStarterFormConfig() {
  return cmsFetch('/api/v1/cms/training/starter-form-config/');
}

export function updateStarterFormConfig(data) {
  return cmsFetch('/api/v1/cms/training/starter-form-config/', { method: 'PUT', body: data });
}

// --- Starter Landing Page Builder (singleton draft/publish) ---
export function getStarterLanding() {
  return cmsFetch('/api/v1/cms/training/starter-landing/');
}

export function updateStarterLanding(data) {
  return cmsFetch('/api/v1/cms/training/starter-landing/', { method: 'PUT', body: data });
}

export function publishStarterLanding() {
  return cmsFetch('/api/v1/cms/training/starter-landing/publish/', { method: 'POST' });
}

export function generateStarterLandingPreviewToken() {
  return cmsFetch('/api/v1/cms/training/starter-landing/preview-token/', { method: 'POST' });
}
