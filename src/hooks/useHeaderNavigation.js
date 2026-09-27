import { useEffect, useState } from 'react';
import { getHeaderNavigation } from '../services/navigationApi';

/**
 * Hardcoded fallback that mirrors the canonical CMS header navigation.
 * Uses the same bilingual label format as CMS items so that renderCmsLink
 * handles both fallback and CMS links through the same code path, including
 * support for nested children.
 *
 * Structure (6 user-visible items):
 *   Home
 *   Services
 *     AI Automation
 *     Case Studies
 *   Training
 *     Professional Courses
 *     Starter Courses
 *     Summer Training
 *     Offers
 *   Industries
 *   Insights
 *   Contact
 *
 * Note: The Offers link under Training points to the stable /training/offers
 * landing page and remains in the navbar even when no campaigns are active.
 * Note: Careers is intentionally excluded from the public navigation while
 * Sidrah is not actively hiring. The /careers route remains technically
 * accessible but is noindex and not advertised. See pre-campaign QA report.
 * Partners is excluded from the top-level navbar (trust content lives in
 * the homepage Partners section and the footer); the Partners homepage
 * section is preserved.
 */
const FALLBACK_NAV_LINKS = [
  {
    id: 'fb-home',
    label: { en: 'Home', ar: 'الرئيسية' },
    href: '/',
    linkType: 'internal',
    openInNewTab: false,
    order: 1,
    children: [],
  },
  {
    id: 'fb-services',
    label: { en: 'Services', ar: 'الخدمات' },
    href: '/services',
    linkType: 'internal',
    openInNewTab: false,
    order: 2,
    children: [
      {
        id: 'fb-services-web',
        label: { en: 'Web Development', ar: 'تطوير الويب' },
        href: '/services/web-development',
        linkType: 'internal',
        openInNewTab: false,
        order: 1,
        children: [],
      },
      {
        id: 'fb-services-mobile',
        label: { en: 'Mobile App Development', ar: 'تطوير تطبيقات الجوال' },
        href: '/services/mobile-app-development',
        linkType: 'internal',
        openInNewTab: false,
        order: 2,
        children: [],
      },
      {
        id: 'fb-services-erp',
        label: { en: 'ERP & Business Systems', ar: 'أنظمة ERP وحلول الأعمال' },
        href: '/services/erp-business-systems',
        linkType: 'internal',
        openInNewTab: false,
        order: 3,
        children: [],
      },
      {
        id: 'fb-services-ai',
        label: { en: 'AI & Automation', ar: 'الذكاء الاصطناعي والأتمتة' },
        href: '/services/ai-automation',
        linkType: 'internal',
        openInNewTab: false,
        order: 4,
        children: [],
      },
      {
        id: 'fb-services-custom',
        label: { en: 'Custom Software', ar: 'برمجيات مخصصة' },
        href: '/services/custom-software-development',
        linkType: 'internal',
        openInNewTab: false,
        order: 5,
        children: [],
      },
      {
        id: 'fb-services-data',
        label: { en: 'Data & Analytics', ar: 'البيانات والتحليلات' },
        href: '/services/data-analytics',
        linkType: 'internal',
        openInNewTab: false,
        order: 6,
        children: [],
      },
      {
        id: 'fb-services-integration',
        label: { en: 'System Integration', ar: 'تكامل الأنظمة' },
        href: '/services/system-integration',
        linkType: 'internal',
        openInNewTab: false,
        order: 7,
        children: [],
      },
      {
        id: 'fb-services-case-studies',
        label: { en: 'Case Studies', ar: 'دراسات الحالة' },
        href: '/case-studies',
        linkType: 'internal',
        openInNewTab: false,
        order: 8,
        children: [],
      },
    ],
  },
  {
    id: 'fb-training',
    label: { en: 'Training', ar: 'التدريب' },
    href: '/training',
    linkType: 'internal',
    openInNewTab: false,
    order: 3,
    children: [
      {
        id: 'fb-training-professional',
        label: { en: 'Professional Courses', ar: 'الكورسات الاحترافية' },
        href: '/training#professional-courses',
        linkType: 'internal',
        openInNewTab: false,
        order: 1,
        children: [],
      },
      {
        id: 'fb-training-starter',
        label: { en: 'Starter Courses', ar: 'كورسات المبتدئين' },
        href: '/training/starter',
        linkType: 'internal',
        openInNewTab: false,
        order: 2,
        children: [],
      },
      {
        id: 'fb-training-summer',
        label: { en: 'Summer Training', ar: 'التدريب الصيفي' },
        href: '/training/summer-training',
        linkType: 'internal',
        openInNewTab: false,
        order: 3,
        children: [],
      },
      {
        id: 'fb-training-offers',
        label: { en: 'Offers', ar: 'العروض' },
        href: '/training/offers',
        linkType: 'internal',
        openInNewTab: false,
        order: 4,
        children: [],
      },
    ],
  },
  {
    id: 'fb-industries',
    label: { en: 'Industries', ar: 'الصناعات' },
    href: '#industries',
    linkType: 'anchor',
    openInNewTab: false,
    order: 4,
    children: [],
  },
  {
    id: 'fb-insights',
    label: { en: 'Insights', ar: 'الرؤى' },
    href: '/insights',
    linkType: 'internal',
    openInNewTab: false,
    order: 5,
    children: [],
  },
  {
    id: 'fb-contact',
    label: { en: 'Contact', ar: 'تواصل معنا' },
    href: '#contact',
    linkType: 'anchor',
    openInNewTab: false,
    order: 6,
    children: [],
  },
];

/**
 * Navigation items that must be suppressed from the public header even if
 * the CMS still has them configured. This allows hiding a public offering
 * (e.g. Careers while not hiring) without deleting CMS data.
 *
 * Matching is based on the resolved href: any link whose href is '/careers'
 * or '#careers' is filtered out before rendering.
 */
const SUPPRESSED_PUBLIC_HREFS = new Set(['/careers', '#careers']);

function isSuppressedPublicLink(link) {
  if (!link) return false;
  if (SUPPRESSED_PUBLIC_HREFS.has(link.href)) return true;
  // Also suppress nested children that point to careers
  if (Array.isArray(link.children) && link.children.length > 0) {
    link.children = link.children.filter((child) => !isSuppressedPublicLink(child));
  }
  return false;
}

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
            .filter((link) => !isSuppressedPublicLink(link))
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
