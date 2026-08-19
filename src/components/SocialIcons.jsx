import { useI18n } from '../i18n/I18nProvider';

export const ICONS = {
  whatsapp: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
      <path d="M9 10a.5.5 0 0 0-1 0v.003a2.5 2.5 0 0 0 .662 1.786A5.5 5.5 0 0 0 13 14.5c.005 0 .008 0 .013 0a.5.5 0 0 0 .487-.5c0-.173-.08-.333-.214-.44l-1.26-1.052a.5.5 0 0 0-.632-.013 2.5 2.5 0 0 1-2.88-.366 2.5 2.5 0 0 1-.66-1.785.5.5 0 0 0-.5-.5H9" />
    </svg>
  ),
  email: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M2 7l10 7 10-7" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22 12.07c0-5.52-4.48-10-10-10s-10 4.48-10 10c0 4.99 3.66 9.12 8.44 9.88v-6.99h-2.54v-2.89h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.89h-2.33v6.99C18.34 21.19 22 17.06 22 12.07z" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" />
    </svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25v-.55a1 1 0 01-1-1h-4.93v15.07a3.06 3.06 0 01-2.55 2.93 3.08 3.08 0 01-3.38-2.39 3.08 3.08 0 012.41-3.66 3.25 3.25 0 01.93.08V9.62a7.84 7.84 0 00-1-.06A7.72 7.72 0 00.72 17.27a7.72 7.72 0 0014.17 4.51v-9.06a9.42 9.42 0 005.39 1.69V6.68z" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.5 6.19a3.02 3.02 0 00-2.12-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.55A3.02 3.02 0 00.5 6.19 31.5 31.5 0 000 12a31.5 31.5 0 00.5 5.81 3.02 3.02 0 002.12 2.14c1.88.55 9.38.55 9.38.55s7.5 0 9.38-.55a3.02 3.02 0 002.12-2.14A31.5 31.5 0 0024 12a31.5 31.5 0 00-.5-5.81zM9.55 15.5V8.5l6.27 3.5-6.27 3.5z" />
    </svg>
  ),
};

const SOCIAL_LINKS = [
  { key: 'facebook', href: 'https://www.facebook.com/sidrahsoft/' },
  { key: 'instagram', href: 'https://www.instagram.com/sidrah.soft/' },
  { key: 'tiktok', href: 'https://www.tiktok.com/sidrah.soft/' },
  { key: 'linkedin', href: 'https://www.linkedin.com/sidrah.soft/' },
  { key: 'youtube', href: 'https://www.youtupe.com/sidrah.soft/' },
];

const labels = {
  en: { facebook: 'Facebook', instagram: 'Instagram', tiktok: 'TikTok', linkedin: 'LinkedIn', youtube: 'YouTube' },
  ar: { facebook: 'فيسبوك', instagram: 'إنستغرام', tiktok: 'تيك توك', linkedin: 'لينكدإن', youtube: 'يوتيوب' },
};

function SocialLinks({ className = '', linkClassName = '', iconClassName = '' }) {
  const { lang } = useI18n();

  return (
    <div className={className} role="list" aria-label={lang === 'ar' ? 'روابط التواصل الاجتماعي' : 'Social media links'}>
      {SOCIAL_LINKS.map((link) => (
        <a
          key={link.key}
          href={link.href}
          className={linkClassName}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={labels[lang][link.key]}
          role="listitem"
        >
          <span className={iconClassName}>{ICONS[link.key]}</span>
        </a>
      ))}
    </div>
  );
}

export default SocialLinks;
