/**
 * Build-time sitemap generator for Sidrah Soft.
 *
 * Fetches active training programs and published insights from the API,
 * combines them with static pages, and writes a complete sitemap.xml
 * to public/sitemap.xml before the Vite build runs.
 *
 * FAIL-FAST behavior:
 *   In production mode (default), if the API is unreachable or returns
 *   invalid data, the script prints a clear error and exits with a
 *   non-zero status code, stopping the build.
 *
 *   A developer fallback mode (SKIP_API=1) is available for local
 *   development only — it generates a static-pages-only sitemap and
 *   prints a warning. This is NOT the default and must not be used
 *   for production builds.
 *
 * Usage:
 *   node scripts/generate-sitemap.mjs              (production — fail-fast)
 *   SKIP_API=1 node scripts/generate-sitemap.mjs    (dev fallback — static only)
 *
 * Environment:
 *   VITE_API_BASE_URL — API origin (defaults to https://sidrahsoft.com)
 *   SITE_BASE_URL      — canonical base URL (defaults to https://sidrahsoft.com)
 *   SKIP_API=1         — skip API fetch, use static pages only (dev mode)
 */
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITEMAP_PATH = resolve(__dirname, '..', 'public', 'sitemap.xml');

const API_BASE = process.env.VITE_API_BASE_URL || 'https://sidrahsoft.com';
const SITE_BASE = (process.env.SITE_BASE_URL || 'https://sidrahsoft.com').replace(/\/$/, '');
const SKIP_API = process.env.SKIP_API === '1';

// Static public pages that are always indexable.
const STATIC_PAGES = [
  { loc: '/', changefreq: 'weekly', priority: '1.0' },
  { loc: '/training', changefreq: 'weekly', priority: '0.8' },
  { loc: '/training/secondary', changefreq: 'weekly', priority: '0.7' },
  { loc: '/training/starter', changefreq: 'weekly', priority: '0.7' },
  // Stable training offers landing page — always indexable, never toggled
  // by campaign state (per PM decision: no conditional noindex).
  { loc: '/training/offers', changefreq: 'daily', priority: '0.7' },
  { loc: '/case-studies', changefreq: 'weekly', priority: '0.8' },
  { loc: '/insights', changefreq: 'weekly', priority: '0.8' },
  // /careers is intentionally excluded from the sitemap while Sidrah is not
  // actively hiring. The route remains technically accessible but is noindex.
  // See pre-campaign QA report for details.
  // AI Automation service page — indexable commercial page
  { loc: '/services/ai-automation', changefreq: 'monthly', priority: '0.8' },
  // Certificate verification landing page is indexable (per PM policy).
  // Individual credential URLs are NOT included — they are noindex.
  { loc: '/certificates/verify', changefreq: 'monthly', priority: '0.5' },
];

// Private path prefixes that must NEVER appear in the sitemap.
const PRIVATE_PREFIXES = [
  '/cms/',
  '/leads/',
  '/api/',
  '/sidrah-management/',
  '/certificates/verify/',  // individual credential pages
];

function failFast(message) {
  console.error(`[sitemap] FATAL: ${message}`);
  console.error('[sitemap] Sitemap generation failed. Build stopped.');
  console.error('[sitemap] If this is a local dev build, use SKIP_API=1 to generate a static-only sitemap.');
  process.exit(1);
}

async function fetchJson(url, expectArray = true) {
  let res;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    res = await fetch(url, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' },
    });
    clearTimeout(timeout);
  } catch (err) {
    failFast(`Could not reach API at ${url}: ${err.message}`);
  }
  if (!res.ok) {
    failFast(`API returned HTTP ${res.status} for ${url}`);
  }
  let data;
  try {
    data = await res.json();
  } catch (err) {
    failFast(`API returned invalid JSON for ${url}: ${err.message}`);
  }
  if (expectArray && !Array.isArray(data)) {
    failFast(`API returned unexpected data structure for ${url} (expected array, got ${typeof data})`);
  }
  if (!expectArray && (!data || typeof data !== 'object' || Array.isArray(data))) {
    failFast(`API returned unexpected data structure for ${url} (expected object, got ${typeof data})`);
  }
  return data;
}

function isPrivatePath(loc) {
  return PRIVATE_PREFIXES.some((p) => loc.startsWith(p));
}

function collectTrainingUrls(programs) {
  const urls = [];
  const seenSlugs = new Set();
  for (const program of programs) {
    if (!program || typeof program !== 'object') continue;
    if (program.status !== 'active') continue;
    const slug = program.slug;
    if (!slug || typeof slug !== 'string') continue;
    if (seenSlugs.has(slug)) continue;
    seenSlugs.add(slug);
    const loc = `/training/${slug}`;
    if (isPrivatePath(loc)) continue;
    urls.push({ loc, changefreq: 'weekly', priority: '0.7' });
  }
  return urls;
}

/**
 * Fetch each program's detail to check landing.seo_noindex.
 * Programs with seo_noindex=True are excluded from the sitemap.
 * Also checks landing.canonical_slug for canonical URL override.
 */
async function filterIndexablePrograms(programs) {
  const indexable = [];
  for (const program of programs) {
    if (!program || typeof program !== 'object') continue;
    if (program.status !== 'active') continue;
    const slug = program.slug;
    if (!slug || typeof slug !== 'string') continue;

    // Fetch program detail to check landing.seo_noindex
    const detail = await fetchJson(`${API_BASE}/api/v1/training/programs/${slug}/`, false);
    const landing = detail?.landing;
    if (landing?.seo_noindex === true) {
      console.log(`[sitemap] Excluding /training/${slug} (seo_noindex=True)`);
      continue;
    }

    // Use canonical_slug if configured and valid
    let canonicalSlug = slug;
    const canonicalRaw = (landing?.canonical_slug || '').trim();
    if (canonicalRaw && !canonicalRaw.startsWith('http') && !canonicalRaw.includes('://') &&
        /^[a-zA-Z0-9_-]+$/.test(canonicalRaw)) {
      canonicalSlug = canonicalRaw;
    }

    indexable.push({ ...program, slug: canonicalSlug, _originalSlug: slug });
  }
  return indexable;
}

function collectInsightUrls(articles) {
  const urls = [];
  const seenSlugs = new Set();
  for (const article of articles) {
    if (!article || typeof article !== 'object') continue;
    if (article.status !== 'published') continue;
    if (article.robots_index === false) continue;
    const slug = article.slug;
    if (!slug || typeof slug !== 'string') continue;
    if (seenSlugs.has(slug)) continue;
    seenSlugs.add(slug);
    const loc = `/insights/${slug}`;
    if (isPrivatePath(loc)) continue;
    urls.push({ loc, changefreq: 'monthly', priority: '0.6' });
  }
  return urls;
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildSitemap(urls) {
  // Remove duplicates by loc
  const seen = new Set();
  const unique = [];
  for (const url of urls) {
    if (seen.has(url.loc)) continue;
    seen.add(url.loc);
    unique.push(url);
  }

  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];
  for (const url of unique) {
    const loc = `${SITE_BASE}${url.loc}`;
    // Validate: must be HTTPS and canonical host
    if (!loc.startsWith('https://sidrahsoft.com')) {
      failFast(`URL does not use canonical HTTPS host: ${loc}`);
    }
    if (isPrivatePath(url.loc)) {
      failFast(`Private URL entered sitemap: ${url.loc}`);
    }
    lines.push('  <url>');
    lines.push(`    <loc>${escapeXml(loc)}</loc>`);
    if (url.lastmod) lines.push(`    <lastmod>${url.lastmod}</lastmod>`);
    lines.push(`    <changefreq>${url.changefreq}</changefreq>`);
    lines.push(`    <priority>${url.priority}</priority>`);
    lines.push('  </url>');
  }
  lines.push('</urlset>');
  return { xml: lines.join('\n'), count: unique.length };
}

async function main() {
  console.log('[sitemap] Generating sitemap.xml...');
  console.log(`[sitemap] API base: ${API_BASE}`);
  console.log(`[sitemap] Site base: ${SITE_BASE}`);

  const urls = [...STATIC_PAGES];

  if (SKIP_API) {
    console.warn('[sitemap] SKIP_API=1 — generating static-pages-only sitemap (dev mode).');
    console.warn('[sitemap] This is NOT suitable for production. Do not deploy this sitemap.');
  } else {
    console.log('[sitemap] Fetching training programs...');
    const programs = await fetchJson(`${API_BASE}/api/v1/training/programs/`);
    console.log(`[sitemap] Found ${programs.length} programs, checking seo_noindex per program...`);
    const indexablePrograms = await filterIndexablePrograms(programs);
    const trainingUrls = collectTrainingUrls(indexablePrograms);
    urls.push(...trainingUrls);
    console.log(`[sitemap] Training URLs: ${trainingUrls.length}`);

    console.log('[sitemap] Fetching insights...');
    const articles = await fetchJson(`${API_BASE}/api/v1/insights/`);
    const insightUrls = collectInsightUrls(articles);
    urls.push(...insightUrls);
    console.log(`[sitemap] Insight URLs: ${insightUrls.length}`);
  }

  const { xml, count } = buildSitemap(urls);
  writeFileSync(SITEMAP_PATH, xml, 'utf-8');
  console.log(`[sitemap] Written ${count} URLs to ${SITEMAP_PATH}`);
}

main().catch((err) => {
  failFast(err.message);
});
