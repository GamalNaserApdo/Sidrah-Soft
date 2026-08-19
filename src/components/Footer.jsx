import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n/I18nProvider.jsx';
import { useSiteSettings } from '../hooks/useSiteSettings';
import companyLocation from '../data/company/companyLocation';
import getBilingual from '../utils/getBilingual';
import resolveMediaUrl from '../utils/resolveMediaUrl';
import SocialIcons from './SocialIcons';
const publicLogo = '/assets/logo.png';

const companyLinks = [
  { key: 'about', target: 'foundation' },
  { key: 'services', target: 'services' },
  { key: 'solutions', target: 'services' },
  { key: 'caseStudies', target: 'case-studies' },
  { key: 'insights', path: '/insights' },
  { key: 'careers', path: '/careers' },
];

const serviceLinks = [
  { key: 'businessAutomation', target: 'services' },
  { key: 'erpSystems', target: 'services' },
  { key: 'aiSolutions', target: 'services' },
  { key: 'webDevelopment', target: 'services' },
  { key: 'mobileApplications', target: 'services' },
  { key: 'systemIntegration', target: 'services' },
];

const legalLinks = [
  { key: 'privacy', href: '#privacy' },
  { key: 'terms', href: '#terms' },
];

function Footer() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const { settings } = useSiteSettings();

  const logoUrl = resolveMediaUrl(settings?.branding?.primary_logo_url) || publicLogo;
  const brandName = settings?.general?.site_name || 'Sidrah Soft';

  const contactEmail = settings?.contact?.contact_email || 'sidrahsoft@gmail.com';
  const whatsappUrl = settings?.contact?.whatsapp_url || 'https://wa.me/PLACEHOLDER';
  const linkedinUrl = settings?.social?.linkedin_url || 'https://linkedin.com/company/PLACEHOLDER';

  const contactLinks = [
    { key: 'email', href: `mailto:${contactEmail}`, external: false },
    { key: 'whatsapp', href: whatsappUrl, external: true },
    { key: 'linkedin', href: linkedinUrl, external: true },
  ];

  const address = getBilingual(settings?.location?.address || companyLocation.address, lang);
  const googleMapsUrl = settings?.location?.google_maps_url || companyLocation.googleMapsUrl;

  const trustItems = lang === 'ar'
    ? ['الذكاء الاصطناعي', 'أنظمة ERP', 'الأتمتة', 'تطبيقات الجوال', 'تطوير الويب', 'تكامل الأنظمة']
    : ['AI', 'ERP', 'Automation', 'Mobile Apps', 'Web Development', 'System Integration'];

  // Social media icons are rendered via the SocialIcons component.

  const handleAnchorNav = (target) => {
    if (location.pathname !== '/') {
      navigate(`/#${target}`);
      return;
    }
    const element = document.getElementById(target);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const renderLink = (link) => {
    if (link.path) {
      return (
        <Link key={link.key} to={link.path} className="footer-link">
          {t(`footer.links.${link.key}`)}
        </Link>
      );
    }

    if (link.target) {
      return (
        <a
          key={link.key}
          href={`#${link.target}`}
          className="footer-link"
          onClick={(e) => {
            e.preventDefault();
            handleAnchorNav(link.target);
          }}
        >
          {t(`footer.links.${link.key}`)}
        </a>
      );
    }

    if (link.href) {
      return (
        <a
          key={link.key}
          href={link.href}
          className="footer-link"
          target={link.external ? '_blank' : undefined}
          rel={link.external ? 'noopener noreferrer' : undefined}
        >
          {t(`footer.links.${link.key}`)}
        </a>
      );
    }

    return (
      <span key={link.key} className="footer-link footer-link--static">
        {t(`footer.links.${link.key}`)}
      </span>
    );
  };

  return (
    <footer id="footer" className="footer">
      <div className="footer-inner">
        {/* ── Final CTA Zone ── */}
        <div className="footer-cta-zone motion-clip-reveal is-visible">
          <p className="footer-cta-zone__eyebrow">
            {lang === 'ar' ? 'هيا بنا نبني شيئاً استثنائياً' : "Let's Build Something Exceptional"}
          </p>
          <h2 className="footer-cta-zone__heading">
            {lang === 'ar'
              ? 'هل أنت مستعد لتحويل رؤيتك إلى برمجيات؟'
              : 'Ready to turn your vision into software?'}
          </h2>
          <button
            type="button"
            className="footer-cta-zone__button"
            onClick={() => handleAnchorNav('contact')}
          >
            <span>{lang === 'ar' ? 'ابدأ مشروعاً' : 'Start a Project'}</span>
            <span className="footer-cta-zone__button-arrow" aria-hidden="true">→</span>
          </button>
        </div>

        {/* ── Trust Strip ── */}
        <div className="footer-trust-strip motion-fade-in is-visible" aria-label={lang === 'ar' ? 'خدماتنا' : 'Our capabilities'}>
          {trustItems.map((item) => (
            <span key={item} className="footer-trust-strip__item">
              {item}
            </span>
          ))}
        </div>

        {/* ── Accent Line ── */}
        <div className="footer-accent-line" aria-hidden="true">
          <span className="footer-accent-node" />
          <span className="footer-accent-connector" />
          <span className="footer-accent-node footer-accent-node--purple" />
          <span className="footer-accent-connector" />
          <span className="footer-accent-node footer-accent-node--gold" />
        </div>

        {/* ── 4-Zone Footer Grid ── */}
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-brand-link" aria-label={`${brandName} Home`}>
              <img
                src={logoUrl}
                alt={brandName}
                className="footer-logo"
                width="40"
                height="35"
              />
              <div className="footer-brand-text">
                <span className="footer-brand-name">{brandName}</span>
                <span className="footer-brand-subtitle">{t('header.brandSubtitle')}</span>
              </div>
            </Link>
            <p className="footer-description">{t('footer.description')}</p>
            <SocialIcons
              className="footer-social"
              linkClassName="footer-social__link"
              iconClassName="footer-social__icon"
            />
          </div>

          <div className="footer-column">
            <h3 className="footer-column-title">{t('footer.companyTitle')}</h3>
            <nav aria-label={t('footer.companyTitle')}>
              <ul className="footer-link-list">
                {companyLinks.map((link) => (
                  <li key={link.key}>{renderLink(link)}</li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="footer-column">
            <h3 className="footer-column-title">{t('footer.serviceTitle')}</h3>
            <nav aria-label={t('footer.serviceTitle')}>
              <ul className="footer-link-list">
                {serviceLinks.map((link) => (
                  <li key={link.key}>{renderLink(link)}</li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="footer-column">
            <h3 className="footer-column-title">{t('footer.contactTitle')}</h3>
            <nav aria-label={t('footer.contactTitle')}>
              <ul className="footer-link-list">
                {contactLinks.map((link) => (
                  <li key={link.key}>{renderLink(link)}</li>
                ))}
                <li key="location">
                  <a
                    href={googleMapsUrl}
                    className="footer-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {address}
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">{t('footer.copyright')}</p>
          <nav className="footer-legal" aria-label={t('footer.links.privacy')}>
            {legalLinks.map((link) => (
              <a
                key={link.key}
                href={link.href}
                className="footer-link footer-link--legal"
                onClick={(e) => e.preventDefault()}
              >
                {t(`footer.links.${link.key}`)}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
