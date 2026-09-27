/**
 * CMS AI Automation Page API service.
 *
 * The AI Automation page is a singleton with page-level fields plus
 * child collections (items, process steps, FAQs) managed via CRUD endpoints.
 */
import { cmsFetch, buildQuery } from './cmsFetch';

const BASE = '/api/v1/cms/ai-automation';

/**
 * Fetch the AI Automation page content (singleton).
 * GET /api/v1/cms/ai-automation/
 */
export function getAIAutomationPage() {
  return cmsFetch(`${BASE}/`);
}

/**
 * Update the AI Automation page-level fields (singleton).
 * PUT /api/v1/cms/ai-automation/
 */
export function updateAIAutomationPage(data) {
  return cmsFetch(`${BASE}/`, {
    method: 'PUT',
    body: data,
  });
}

/* ── Items (problems / solutions / use_cases / why) ── */

/**
 * List items, optionally filtered by item_type.
 * GET /api/v1/cms/ai-automation/items/
 */
export function listItems(params = {}) {
  return cmsFetch(`${BASE}/items/${buildQuery(params)}`);
}

/**
 * Create a new item.
 * POST /api/v1/cms/ai-automation/items/
 */
export function createItem(data) {
  return cmsFetch(`${BASE}/items/`, {
    method: 'POST',
    body: data,
  });
}

/**
 * Update an item by id.
 * PUT /api/v1/cms/ai-automation/items/<id>/
 */
export function updateItem(id, data) {
  return cmsFetch(`${BASE}/items/${id}/`, {
    method: 'PUT',
    body: data,
  });
}

/**
 * Delete an item by id.
 * DELETE /api/v1/cms/ai-automation/items/<id>/
 */
export function deleteItem(id) {
  return cmsFetch(`${BASE}/items/${id}/`, {
    method: 'DELETE',
  });
}

/* ── Process Steps ── */

/**
 * List process steps.
 * GET /api/v1/cms/ai-automation/process-steps/
 */
export function listProcessSteps(params = {}) {
  return cmsFetch(`${BASE}/process-steps/${buildQuery(params)}`);
}

/**
 * Create a new process step.
 * POST /api/v1/cms/ai-automation/process-steps/
 */
export function createProcessStep(data) {
  return cmsFetch(`${BASE}/process-steps/`, {
    method: 'POST',
    body: data,
  });
}

/**
 * Update a process step by id.
 * PUT /api/v1/cms/ai-automation/process-steps/<id>/
 */
export function updateProcessStep(id, data) {
  return cmsFetch(`${BASE}/process-steps/${id}/`, {
    method: 'PUT',
    body: data,
  });
}

/**
 * Delete a process step by id.
 * DELETE /api/v1/cms/ai-automation/process-steps/<id>/
 */
export function deleteProcessStep(id) {
  return cmsFetch(`${BASE}/process-steps/${id}/`, {
    method: 'DELETE',
  });
}

/* ── FAQs ── */

/**
 * List FAQs.
 * GET /api/v1/cms/ai-automation/faqs/
 */
export function listFAQs(params = {}) {
  return cmsFetch(`${BASE}/faqs/${buildQuery(params)}`);
}

/**
 * Create a new FAQ.
 * POST /api/v1/cms/ai-automation/faqs/
 */
export function createFAQ(data) {
  return cmsFetch(`${BASE}/faqs/`, {
    method: 'POST',
    body: data,
  });
}

/**
 * Update a FAQ by id.
 * PUT /api/v1/cms/ai-automation/faqs/<id>/
 */
export function updateFAQ(id, data) {
  return cmsFetch(`${BASE}/faqs/${id}/`, {
    method: 'PUT',
    body: data,
  });
}

/**
 * Delete a FAQ by id.
 * DELETE /api/v1/cms/ai-automation/faqs/<id>/
 */
export function deleteFAQ(id) {
  return cmsFetch(`${BASE}/faqs/${id}/`, {
    method: 'DELETE',
  });
}
