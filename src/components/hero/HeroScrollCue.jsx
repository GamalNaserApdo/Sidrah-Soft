import { useI18n } from '../../i18n/I18nProvider.jsx';

function HeroScrollCue() {
  const { t } = useI18n();
  return (
    <div className="hero-scroll-cue" aria-hidden="true">
      <span className="hero-scroll-cue-text">{t('hero.scrollCue')}</span>
      <span className="hero-scroll-cue-line" />
    </div>
  );
}

export default HeroScrollCue;
