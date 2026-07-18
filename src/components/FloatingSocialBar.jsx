import { useSiteSettings } from '../hooks/useSiteSettings';
import { useI18n } from '../i18n/I18nProvider';

const ICONS = {
  whatsapp: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
      <path d="M9 10a.5.5 0 0 0-1 0v.003a2.5 2.5 0 0 0 .662 1.786A5.5 5.5 0 0 0 13 14.5c.005 0 .008 0 .013 0a.5.5 0 0 0 .487-.5c0-.173-.08-.333-.214-.44l-1.26-1.052a.5.5 0 0 0-.632-.013 2.5 2.5 0 0 1-2.88-.366 2.5 2.5 0 0 1-.66-1.785.5.5 0 0 0-.5-.5H9" />
    </svg>
  ),
  telegram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 3L2 10.5l7.5 3.5L12 21l2.5-7 7.5-3.5L22 3z" />
      <path d="M11.5 13.5l2.5-3" />
    </svg>
  ),
  email: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M2 7l10 7 10-7" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  ),
};

function FloatingSocialBar() {
  const { settings } = useSiteSettings();
  const { t } = useI18n();

  const contact = settings?.contact || {};
  const social = settings?.social || {};

  const socialLinks = [
    {
      key: 'whatsapp',
      label: t('social.whatsapp'),
      href: contact.whatsapp_url || 'https://wa.me/PLACEHOLDER',
      icon: ICONS.whatsapp,
    },
    {
      key: 'telegram',
      label: t('social.telegram'),
      href: contact.telegram_url || 'https://t.me/PLACEHOLDER',
      icon: ICONS.telegram,
    },
    {
      key: 'email',
      label: t('social.email'),
      href: contact.contact_email ? `mailto:${contact.contact_email}` : 'mailto:hello@sidrahsoft.com',
      icon: ICONS.email,
    },
    {
      key: 'linkedin',
      label: t('social.linkedin'),
      href: social.linkedin_url || 'https://linkedin.com/company/PLACEHOLDER',
      icon: ICONS.linkedin,
    },
  ];

  return (
    <aside className="floating-social-bar" aria-label={t('social.ariaLabel')}>
      <ul className="floating-social-list">
        {socialLinks.map((link) => (
          <li key={link.key} className="floating-social-item">
            <a
              className={`floating-social-link floating-social-link--${link.key}`}
              href={link.href}
              target={link.href.startsWith('http') ? '_blank' : undefined}
              rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              aria-label={link.label}
            >
              <span className="floating-social-icon">{link.icon}</span>
              <span className="floating-social-label">{link.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default FloatingSocialBar;
