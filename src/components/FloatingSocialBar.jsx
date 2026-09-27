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
      href: contact.whatsapp_url || 'https://wa.me/201027285487',
      icon: ICONS.whatsapp,
    },
    {
      key: 'email',
      label: lang === 'ar' ? 'البريد' : 'Email',
      href: contact.contact_email ? `mailto:${contact.contact_email}` : 'mailto:hello@sidrahsoft.com',
      icon: ICONS.email,
    },
  ];

  const social = settings?.social || {};

  const socialLinks = [
    { key: 'facebook', label: lang === 'ar' ? 'فيسبوك' : 'Facebook', href: social.facebook_url || '', icon: ICONS.facebook },
    { key: 'instagram', label: lang === 'ar' ? 'إنستغرام' : 'Instagram', href: social.instagram_url || '', icon: ICONS.instagram },
    { key: 'linkedin', label: lang === 'ar' ? 'لينكدإن' : 'LinkedIn', href: social.linkedin_url || '', icon: ICONS.linkedin },
    { key: 'youtube', label: lang === 'ar' ? 'يوتيوب' : 'YouTube', href: social.youtube_url || '', icon: ICONS.youtube },
    { key: 'tiktok', label: lang === 'ar' ? 'تيك توك' : 'TikTok', href: social.tiktok_url || '', icon: ICONS.tiktok },
  ].filter((link) => link.href); // Hide icons with empty/null CMS URLs

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
