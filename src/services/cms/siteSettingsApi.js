/**
 * CMS Site Settings API service.
 * Singleton — GET and PUT only.
 */
import { cmsFetch } from './cmsFetch';

export function fetchSiteSettings() {
  return cmsFetch('/api/v1/cms/site-settings/');
}

export function updateSiteSettings(data) {
  return cmsFetch('/api/v1/cms/site-settings/', {
    method: 'PUT',
    body: data,
  });
}
