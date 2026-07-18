import { useEffect, useState } from 'react';
import { getHeaderNavigation } from '../services/navigationApi';

/**
 * Hardcoded fallback matching the existing Header UI.
 */
const FALLBACK_NAV_LINKS = [
  { key: 'services', target: 'services' },
  { key: 'solutions', target: 'services' },
  { key: 'caseStudies', target: 'case-studies' },
  { key: 'trainingCourses', path: '/training' },
  { key: 'insights', path: '/insights' },
  { key: 'about', target: 'foundation' },
  { key: 'contact', target: 'contact' },
];

function transformNavigationItem(item) {
  return {
    id: item.id,
    label: item.label,
    href: item.href,
    linkType: item.link_type,
    openInNewTab: item.open_in_new_tab,
    order: item.order,
    children: (item.children || []).map(transformNavigationItem),
  };
}

function isMenuUsable(items) {
  return Array.isArray(items) && items.length > 0;
}

/**
 * Load the CMS header navigation and fall back to the existing hardcoded
 * navigation when the CMS structure is not yet aligned with the current UI.
 *
 * @returns {{ links: Array, source: 'cms' | 'fallback' }}
 */
export function useHeaderNavigation() {
  const [links, setLinks] = useState(FALLBACK_NAV_LINKS);
  const [source, setSource] = useState('fallback');

  useEffect(() => {
    const controller = new AbortController();

    getHeaderNavigation({ signal: controller.signal })
      .then((menus) => {
        const menu = Array.isArray(menus) ? menus[0] : null;
        if (menu && isMenuUsable(menu.items)) {
          const cmsLinks = (menu.items || [])
            .map(transformNavigationItem)
            .sort((a, b) => a.order - b.order);
          setLinks(cmsLinks);
          setSource('cms');
        }
      })
      .catch((error) => {
        // Status 0 means the request was aborted; no need to log.
        if (error?.status !== 0) {
          console.error('Header navigation fetch failed:', error.message);
        }
      });

    return () => controller.abort();
  }, []);

  return { links, source };
}
