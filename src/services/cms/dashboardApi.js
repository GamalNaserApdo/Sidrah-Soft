/**
 * CMS Dashboard API service.
 */
import { cmsFetch } from './cmsFetch';

export function fetchDashboard() {
  return cmsFetch('/api/v1/cms/dashboard/');
}
