/**
 * ConsentBanner — minimal cookie/tracking consent UI.
 *
 * Supports:
 * - Accept All
 * - Reject Optional
 * - Customize (Analytics + Marketing toggles)
 *
 * Visual design uses the existing Sidrah dark premium palette.
 * Fully bilingual (EN/AR) and RTL-aware.
 */
import { useState } from 'react';
import { useI18n } from '../i18n/I18nProvider.jsx';
import { useAnalyticsConsent } from '../contexts/AnalyticsContext';

export default function ConsentBanner() {
  const { t } = useI18n();
  const { consent, showBanner, acceptAll, rejectOptional, setCategory, hideBanner } = useAnalyticsConsent();
  const [customize, setCustomize] = useState(false);

  if (!showBanner) return null;

  const handleSaveCustom = () => {
    hideBanner();
  };

  return (
    <div className="consent-banner" role="dialog" aria-live="polite" aria-label={t('consent.title')}>
      <div className="consent-banner__content">
        <p className="consent-banner__text">{t('consent.message')}</p>

        {customize && (
          <div className="consent-banner__options">
            <label className="consent-banner__option">
              <input
                type="checkbox"
                checked={consent.analytics === 'granted'}
                onChange={(e) => setCategory('analytics', e.target.checked ? 'granted' : 'denied')}
                data-testid="consent-toggle-analytics"
              />
              <span>{t('consent.analytics')}</span>
            </label>
            <label className="consent-banner__option">
              <input
                type="checkbox"
                checked={consent.marketing === 'granted'}
                onChange={(e) => setCategory('marketing', e.target.checked ? 'granted' : 'denied')}
                data-testid="consent-toggle-marketing"
              />
              <span>{t('consent.marketing')}</span>
            </label>
          </div>
        )}

        <div className="consent-banner__actions">
          {customize ? (
            <>
              <button type="button" className="consent-banner__btn consent-banner__btn--primary" onClick={handleSaveCustom} data-testid="consent-save-custom">
                {t('consent.save')}
              </button>
              <button type="button" className="consent-banner__btn" onClick={() => setCustomize(false)} data-testid="consent-back">
                {t('consent.back')}
              </button>
            </>
          ) : (
            <>
              <button type="button" className="consent-banner__btn consent-banner__btn--primary" onClick={acceptAll} data-testid="consent-accept-all">
                {t('consent.acceptAll')}
              </button>
              <button type="button" className="consent-banner__btn" onClick={rejectOptional} data-testid="consent-reject-optional">
                {t('consent.rejectOptional')}
              </button>
              <button type="button" className="consent-banner__btn consent-banner__btn--text" onClick={() => setCustomize(true)} data-testid="consent-customize">
                {t('consent.customize')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
