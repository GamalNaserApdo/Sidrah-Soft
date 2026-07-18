import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nProvider.jsx';

function HeroContent() {
  const { t, lang } = useI18n();
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
      <p className="hero-eyebrow" aria-hidden="true">{t('hero.eyebrow')}</p>
      <h1 className="hero-headline" id="hero-heading">
        {t('hero.headline')}
      </h1>
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
          href="#case-studies"
          className="hero-cta hero-cta--secondary"
          onClick={handleCtaClick('case-studies')}
          aria-label={t('hero.secondaryCta')}
        >
          <span>{t('hero.secondaryCta')}</span>
        </a>
      </div>
      <p className="hero-capability-line" aria-label={t('hero.capabilityLine')}>
        {t('hero.capabilityLine')}
      </p>
    </div>
  );
}

export default HeroContent;
