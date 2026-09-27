import { useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nProvider.jsx';
import { useHomepageConfig } from '../../hooks/useHomepageConfig';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import resolveMediaUrl from '../../utils/resolveMediaUrl';
import getBilingual from '../../utils/getBilingual';
import publicLogo from '../../assets/logo.png';

function HeroContent() {
  const { t, lang } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const { config } = useHomepageConfig();
  const { settings } = useSiteSettings();

  const hero = config?.hero;

  // CMS-first with i18n fallback — preserves approved H1 when CMS is empty.
  const brandName = settings?.general?.site_name || t('hero.brandName');
  const logoUrl = resolveMediaUrl(settings?.branding?.primary_logo_url) || publicLogo;

  const headline = getBilingual(
    { en: hero?.headline_en, ar: hero?.headline_ar },
    lang
  ) || t('hero.slogan');

  const supporting = getBilingual(
    { en: hero?.subheadline_en, ar: hero?.subheadline_ar },
    lang
  ) || t('hero.supporting');

  const primaryCtaLabel = getBilingual(
    { en: hero?.primary_cta_label_en, ar: hero?.primary_cta_label_ar },
    lang
  ) || t('hero.primaryCta');

  const primaryCtaTarget = hero?.primary_cta_target || 'contact';

  const secondaryCtaLabel = getBilingual(
    { en: hero?.secondary_cta_label_en, ar: hero?.secondary_cta_label_ar },
    lang
  ) || t('hero.secondaryCta');

  const secondaryCtaTarget = hero?.secondary_cta_target || '/services/ai-automation';

  const handleCtaClick = useCallback((target) => (e) => {
    // Hash anchors use smooth scroll; routes use normal navigation.
    if (target.startsWith('#')) {
      e.preventDefault();
      const anchor = target.slice(1);
      if (location.pathname !== '/') {
        navigate(`/#${anchor}`);
        return;
      }
      const element = document.getElementById(anchor);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    // Non-hash targets fall through to default anchor/Link behavior.
  }, [location.pathname, navigate]);

  // Determine if secondary CTA is a hash anchor or a route.
  const secondaryIsHash = secondaryCtaTarget.startsWith('#');

  return (
    <div className="hero-content">
      <div className="hero-brand-col">
        <img
          src={logoUrl}
          alt=""
          className="hero-brand-logo"
          width="64"
          height="56"
        />
        <p className="hero-brand-name" aria-label={brandName}>
          {brandName}
        </p>
        <h1 className="hero-slogan hero-heading" id="hero-heading">
          {headline}
        </h1>
      </div>
      <div className="hero-statement-col">
        <p className="hero-supporting">
          {supporting}
        </p>
        <div className="hero-cta-group">
          <a
            href={primaryCtaTarget.startsWith('#') ? primaryCtaTarget : `#${primaryCtaTarget}`}
            className="hero-cta hero-cta--primary"
            onClick={handleCtaClick(primaryCtaTarget.startsWith('#') ? primaryCtaTarget.slice(1) : primaryCtaTarget)}
            aria-label={primaryCtaLabel}
          >
            <span>{primaryCtaLabel}</span>
            <svg className="hero-cta-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
          {secondaryIsHash ? (
            <a
              href={secondaryCtaTarget}
              className="hero-cta hero-cta--secondary"
              onClick={handleCtaClick(secondaryCtaTarget.slice(1))}
              aria-label={secondaryCtaLabel}
            >
              <span>{secondaryCtaLabel}</span>
            </a>
          ) : (
            <Link
              to={secondaryCtaTarget}
              className="hero-cta hero-cta--secondary"
              aria-label={secondaryCtaLabel}
            >
              <span>{secondaryCtaLabel}</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default HeroContent;
