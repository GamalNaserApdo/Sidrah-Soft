/**
 * CMS Dynamic Forms API service.
 */
import { cmsFetch, buildQuery } from './cmsFetch';

// Form definitions
export function listForms(params = {}) {
  return cmsFetch(`/api/v1/cms/forms/definitions/${buildQuery(params)}`);
}

export function getForm(id) {
  return cmsFetch(`/api/v1/cms/forms/definitions/${id}/`);
}

export function createForm(data) {
  return cmsFetch('/api/v1/cms/forms/definitions/', { method: 'POST', body: data });
}

export function updateForm(id, data) {
  return cmsFetch(`/api/v1/cms/forms/definitions/${id}/`, { method: 'PATCH', body: data });
}

export function deleteForm(id) {
  return cmsFetch(`/api/v1/cms/forms/definitions/${id}/`, { method: 'DELETE' });
}

// Form fields (nested under form)
export function listFields(formId) {
  return cmsFetch(`/api/v1/cms/forms/definitions/${formId}/fields/`);
}

export function createField(formId, data) {
  return cmsFetch(`/api/v1/cms/forms/definitions/${formId}/fields/`, { method: 'POST', body: data });
}

export function updateField(formId, fieldId, data) {
  return cmsFetch(`/api/v1/cms/forms/definitions/${formId}/fields/${fieldId}/`, { method: 'PATCH', body: data });
}

export function deleteField(formId, fieldId) {
  return cmsFetch(`/api/v1/cms/forms/definitions/${formId}/fields/${fieldId}/`, { method: 'DELETE' });
}

// Field options (nested under field)
export function listOptions(fieldId) {
  return cmsFetch(`/api/v1/cms/forms/fields/${fieldId}/options/`);
}

export function createOption(fieldId, data) {
  return cmsFetch(`/api/v1/cms/forms/fields/${fieldId}/options/`, { method: 'POST', body: data });
}

export function updateOption(fieldId, optionId, data) {
  return cmsFetch(`/api/v1/cms/forms/fields/${fieldId}/options/${optionId}/`, { method: 'PATCH', body: data });
}

export function deleteOption(fieldId, optionId) {
  return cmsFetch(`/api/v1/cms/forms/fields/${fieldId}/options/${optionId}/`, { method: 'DELETE' });
}

// Assignments
export function listAssignments() {
  return cmsFetch('/api/v1/cms/forms/assignments/');
}

export function listAssignmentTargets() {
  return cmsFetch('/api/v1/cms/forms/assignments/targets/');
}

export function createAssignment(data) {
  return cmsFetch('/api/v1/cms/forms/assignments/', { method: 'POST', body: data });
}

export function updateAssignment(id, data) {
  return cmsFetch(`/api/v1/cms/forms/assignments/${id}/`, { method: 'PATCH', body: data });
}

export function deleteAssignment(id) {
  return cmsFetch(`/api/v1/cms/forms/assignments/${id}/`, { method: 'DELETE' });
}

// Submissions
export function listSubmissions(params = {}) {
  return cmsFetch(`/api/v1/cms/forms/submissions/${buildQuery(params)}`);
}

export function getSubmission(id) {
  return cmsFetch(`/api/v1/cms/forms/submissions/${id}/`);
}

export function updateSubmission(id, data) {
  return cmsFetch(`/api/v1/cms/forms/submissions/${id}/`, { method: 'PATCH', body: data });
}

export function exportSubmissionsUrl(formId) {
  return `/api/v1/cms/forms/submissions/export/?form=${formId}`;
}
