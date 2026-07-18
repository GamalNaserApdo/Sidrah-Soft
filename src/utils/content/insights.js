import {
  INSIGHT_CATEGORIES,
  insights,
} from '../../data/insights/insightsData.js';

export function getAllInsights() {
  return insights;
}

export function getFeaturedInsights(count = 3) {
  return insights.filter((item) => item.featured).slice(0, count);
}

export function getInsightsByCategory(category) {
  if (!category || category === INSIGHT_CATEGORIES.all) {
    return insights;
  }
  return insights.filter((item) => item.category === category);
}

export function sortInsights(items, sortKey) {
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

export function filterAndSortInsights(category, sortKey) {
  const filtered = getInsightsByCategory(category);
  return sortInsights(filtered, sortKey);
}

export function getInsightBySlug(slug) {
  return insights.find((item) => item.slug === slug) || null;
}

export function getInsightPath(slug) {
  return `/insights/${slug}`;
}

export function getInsightsIndexPath() {
  return '/insights';
}
