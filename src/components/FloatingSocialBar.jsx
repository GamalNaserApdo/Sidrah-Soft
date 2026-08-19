import { useSiteSettings } from '../hooks/useSiteSettings';
import { useI18n } from '../i18n/I18nProvider';
import { ICONS } from './SocialIcons';

function FloatingSocialBar() {
  const { settings } = useSiteSettings();
  const { t, lang } = useI18n();

  const contact = settings?.contact || {};

  const contactLinks = [
    {
      key: 'whatsapp',
      label: lang === 'ar' ? 'واتساب' : 'WhatsApp',
      href: contact.whatsapp_url || 'https://wa.me/PLACEHOLDER',
      icon: ICONS.whatsapp,
    },
    {
      key: 'email',
      label: lang === 'ar' ? 'البريد' : 'Email',
      href: contact.contact_email ? `mailto:${contact.contact_email}` : 'mailto:hello@sidrahsoft.com',
      icon: ICONS.email,
    },
  ];

  const socialLinks = [
    { key: 'facebook', label: 'Facebook', href: 'https://www.facebook.com/sidrahsoft/', icon: ICONS.facebook },
    { key: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/sidrah.soft/', icon: ICONS.instagram },
    { key: 'tiktok', label: 'TikTok', href: 'https://www.tiktok.com/sidrah.soft/', icon: ICONS.tiktok },
    { key: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/sidrah.soft/', icon: ICONS.linkedin },
    { key: 'youtube', label: 'YouTube', href: 'https://www.youtupe.com/sidrah.soft/', icon: ICONS.youtube },
  ];

  const allLinks = [...socialLinks, ...contactLinks];

  return (
    <aside className="floating-social-bar" aria-label={t('social.ariaLabel')}>
      <ul className="floating-social-list">
        {allLinks.map((link) => (
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
