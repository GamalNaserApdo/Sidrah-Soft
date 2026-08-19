import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nProvider.jsx';
import publicLogo from '../../assets/logo.png';

function HeroContent() {
  const { t } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();

  const handleCtaClick = useCallback((target) => (e) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate(`/#${target}`);
      return;
    }
    const element = document.getElementById(target);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.pathname, navigate]);

  return (
    <div className="hero-content">
      <div className="hero-brand-col">
        <img
          src={publicLogo}
          alt=""
          className="hero-brand-logo"
          width="64"
          height="56"
        />
        <h1 className="hero-brand-name" id="hero-heading">
          {t('hero.brandName')}
        </h1>
        <p className="hero-slogan">{t('hero.slogan')}</p>
      </div>
      <div className="hero-statement-col">
        <p className="hero-supporting">
          {t('hero.supporting')}
        </p>
        <div className="hero-cta-group">
          <a
            href="#contact"
            className="hero-cta hero-cta--primary"
            onClick={handleCtaClick('contact')}
            aria-label={t('hero.primaryCta')}
          >
            <span>{t('hero.primaryCta')}</span>
            <svg className="hero-cta-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
          <a
            href="#capabilities"
            className="hero-cta hero-cta--secondary"
            onClick={handleCtaClick('capabilities')}
            aria-label={t('hero.secondaryCta')}
          >
            <span>{t('hero.secondaryCta')}</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default HeroContent;
