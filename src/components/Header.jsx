import { useEffect, useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n/I18nProvider.jsx';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { useHeaderNavigation } from '../hooks/useHeaderNavigation';
import getBilingual from '../utils/getBilingual';
import resolveMediaUrl from '../utils/resolveMediaUrl';
import logo from '../assets/logo.svg';

function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { lang, t } = useI18n();
  const { settings } = useSiteSettings();
  const { links } = useHeaderNavigation();

  const logoUrl = resolveMediaUrl(settings?.branding?.primary_logo_url) || logo;
  const brandName = settings?.general?.site_name || 'Sidrah Soft';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleAnchorNav = useCallback((target) => {
    setIsMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate(`/#${target}`);
      return;
    }
    const element = document.getElementById(target);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.pathname, navigate]);

  const handleBookConsultation = useCallback(() => {
    handleAnchorNav('contact');
  }, [handleAnchorNav]);

  const handleHomeClick = (e) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  const isExternal = (href) => /^https?:\/\//i.test(href);
  const isAnchor = (href) => typeof href === 'string' && href.startsWith('#');
  const isEmailOrPhone = (linkType) => linkType === 'email' || linkType === 'phone';

  const renderCmsLink = (link, mobilePrefix = '') => {
    const label = getBilingual(link.label, lang);
    const baseClass = `header-link ${mobilePrefix ? 'header-link--mobile' : ''}`.trim();
    const hasChildren = Array.isArray(link.children) && link.children.length > 0;

    let parentElement;

    if (link.linkType === 'internal' && link.href) {
      parentElement = (
        <Link
          to={link.href}
          className={baseClass}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          {label}
        </Link>
      );
    } else if (link.linkType === 'external' || isExternal(link.href)) {
      parentElement = (
        <a
          href={link.href}
          className={baseClass}
          target={link.openInNewTab ? '_blank' : undefined}
          rel={link.openInNewTab ? 'noopener noreferrer' : undefined}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          {label}
        </a>
      );
    } else if (link.linkType === 'anchor' || isAnchor(link.href)) {
      const target = (link.href || '').replace('#', '');
      parentElement = (
        <a
          href={link.href}
          className={baseClass}
          onClick={(e) => {
            e.preventDefault();
            handleAnchorNav(target);
          }}
        >
          {label}
        </a>
      );
    } else if (isEmailOrPhone(link.linkType)) {
      parentElement = (
        <a
          href={link.href}
          className={baseClass}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          {label}
        </a>
      );
    } else {
      parentElement = <span className={baseClass}>{label}</span>;
    }

    if (!hasChildren) {
      return <span key={`${mobilePrefix}cms-${link.id}`}>{parentElement}</span>;
    }

    return (
      <span key={`${mobilePrefix}cms-${link.id}`} className="header-link-wrapper">
        {parentElement}
        <span className="header-link-dropdown">
          {link.children.map((child) => renderCmsLink(child, mobilePrefix))}
        </span>
      </span>
    );
  };

  const renderFallbackLink = (link, mobilePrefix = '') => {
    if (link.path) {
      return (
        <Link
          key={`${mobilePrefix}${link.key}`}
          to={link.path}
          className={`header-link ${mobilePrefix ? 'header-link--mobile' : ''}`}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          {t(`header.nav.${link.key}`)}
        </Link>
      );
    }

    return (
      <a
        key={`${mobilePrefix}${link.key}`}
        href={`#${link.target}`}
        className={`header-link ${mobilePrefix ? 'header-link--mobile' : ''}`}
        onClick={(e) => {
          e.preventDefault();
          handleAnchorNav(link.target);
        }}
      >
        {t(`header.nav.${link.key}`)}
      </a>
    );
  };

  const renderLink = (link, mobilePrefix = '') => {
    if (link.label) {
      return renderCmsLink(link, mobilePrefix);
    }
    return renderFallbackLink(link, mobilePrefix);
  };

  return (
    <header className={`header ${isScrolled ? 'header--scrolled' : ''}`}>
      <div className="header-inner">
        <a
          href="/"
          className="header-brand"
          aria-label={`${brandName} Home`}
          onClick={handleHomeClick}
        >
          <img
            src={logoUrl}
            alt={brandName}
            className="header-logo-mark"
            width="40"
            height="35"
          />
          <div className="header-brand-text">
            <span className="header-brand-name">{brandName}</span>
            <span className="header-brand-subtitle">{t('header.brandSubtitle')}</span>
          </div>
        </a>

        <nav className="header-nav" aria-label="Main navigation">
          {links.map((link) => renderLink(link))}
        </nav>

        <button
          type="button"
          className="header-cta header-cta--desktop"
          onClick={handleBookConsultation}
        >
          {t('header.cta')}
        </button>

        <LanguageSwitcher variant="desktop" />

        <button
          type="button"
          className="header-menu-button"
          aria-label={t('header.menuAria')}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
        >
          <svg
            className="header-menu-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {isMobileMenuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      <nav
        id="mobile-menu"
        className={`header-nav--mobile ${isMobileMenuOpen ? 'header-nav--open' : ''}`}
        aria-label="Mobile navigation"
      >
        <div className="header-nav--mobile-inner">
          {links.map((link) => renderLink(link, 'mobile-'))}
          <button
            type="button"
            className="header-cta header-cta--mobile"
            onClick={handleBookConsultation}
          >
            {t('header.cta')}
          </button>
          <LanguageSwitcher variant="mobile" />
        </div>
      </nav>
    </header>
  );
}

function LanguageSwitcher({ variant }) {
  const { lang, setLanguage, languages } = useI18n();
  const nextLang = lang === 'en' ? 'ar' : 'en';

  return (
    <button
      type="button"
      className={`header-language-switcher header-language-switcher--${variant}`}
      onClick={() => setLanguage(nextLang)}
      aria-label={languages[nextLang].label}
    >
      {languages[nextLang].localLabel}
    </button>
  );
}

export default Header;
