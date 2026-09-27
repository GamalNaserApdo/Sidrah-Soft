import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { useI18n } from '../i18n/I18nProvider';

/**
 * Client-side 404 / NotFound page.
 *
 * SEO behavior:
 * - meta robots = noindex, follow
 * - canonical = / (safe fallback; the page is not indexable)
 * - title = "Page Not Found | Sidrah Soft"
 *
 * Note: The SPA hosting layer (e.g. `serve --single` or Nginx try_files)
 * returns HTTP 200 for all routes. True HTTP 404 requires server-side
 * configuration (Nginx/Railway). This page prevents unknown URLs from
 * inheriting valid page SEO metadata and advertises itself as noindex.
 */
function NotFoundPage() {
  const { t, lang, dir } = useI18n();
  const isAr = lang === 'ar';

  return (
    <>
      <SEO
        title={isAr ? 'الصفحة غير موجودة | Sidrah Soft' : 'Page Not Found | Sidrah Soft'}
        description={isAr ? 'الصفحة التي تبحث عنها غير موجودة.' : 'The page you are looking for does not exist.'}
        canonical="/"
        robotsIndex={false}
        robotsFollow={true}
      />
      <Header />
      <main className="not-found-page" dir={dir}>
        <section className="not-found__content">
          <h1 className="not-found__title">
            {isAr ? '٤٠٤ — الصفحة غير موجودة' : '404 — Page Not Found'}
          </h1>
          <p className="not-found__text">
            {isAr
              ? 'الصفحة التي تبحث عنها غير موجودة أو تم نقلها.'
              : 'The page you are looking for does not exist or has been moved.'}
          </p>
          <Link to="/" className="not-found__link">
            {isAr ? '← العودة إلى الرئيسية' : '← Back to Home'}
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default NotFoundPage;
