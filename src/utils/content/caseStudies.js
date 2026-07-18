import {
  CASE_STUDY_INDUSTRIES,
  caseStudies,
} from '../../data/caseStudies/caseStudiesData.js';

export function getAllCaseStudies() {
  return caseStudies;
}

export function getFeaturedCaseStudies(count = 3) {
  return caseStudies.filter((item) => item.featured).slice(0, count);
}

export function getCaseStudyBySlug(slug) {
  return caseStudies.find((item) => item.slug === slug) || null;
}

export function filterCaseStudiesByIndustry(industry) {
  if (!industry || industry === CASE_STUDY_INDUSTRIES.all) {
    return caseStudies;
  }
  return caseStudies.filter((item) => item.industry === industry);
}

export function sortCaseStudies(items, sortKey) {
  const list = [...items];
  switch (sortKey) {
    case 'newest':
      return list.sort(
        (a, b) => new Date(b.publishDate) - new Date(a.publishDate)
      );
    case 'oldest':
      return list.sort(
        (a, b) => new Date(a.publishDate) - new Date(b.publishDate)
      );
    case 'featured':
      return list.sort((a, b) => {
        if (a.featured === b.featured) {
          return new Date(b.publishDate) - new Date(a.publishDate);
        }
        return b.featured ? 1 : -1;
      });
    default:
      return list;
  }
}

export function filterAndSortCaseStudies(industry, sortKey) {
  const filtered = filterCaseStudiesByIndustry(industry);
  return sortCaseStudies(filtered, sortKey);
}

export function filterCMSCaseStudiesByIndustry(caseStudies, industry) {
  if (!industry || industry === CASE_STUDY_INDUSTRIES.all) {
    return caseStudies;
  }
  return caseStudies.filter((item) => item.industry === industry);
}

export function getIndustriesFromCMS(caseStudies) {
  const industries = new Set(
    caseStudies.map((item) => item.industry).filter(Boolean)
  );
  return [CASE_STUDY_INDUSTRIES.all, ...Array.from(industries).sort()];
}

export function getCaseStudyPath(slug) {
  return `/case-studies/${slug}`;
}

export function getCaseStudiesIndexPath() {
  return '/case-studies';
}

export { CASE_STUDY_INDUSTRIES };
