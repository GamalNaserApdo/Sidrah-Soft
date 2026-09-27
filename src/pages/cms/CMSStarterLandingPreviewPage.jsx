/**
 * CMS Starter Landing Preview — /cms/training/starter-landing/preview
 *
 * Renders the REAL public page inside an iframe pointed at the draft
 * payload (?preview=<signed-token>), so preview output can never drift
 * from production rendering. Device toggle only constrains the iframe
 * width; language is passed through the public i18n query param.
 *
 * Registration submission is inert inside preview (StarterCampaignRenderer
 * isPreview flag) — no TrainingRegistration, email, or analytics event.
 */
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import CMSLayout from '../../components/cms/layout/CMSLayout';
import CMSPageHeader from '../../components/cms/ui/CMSPageHeader';
import { CMSLoadingState, CMSErrorState } from '../../components/cms/ui/CMSStateViews';
import CMSButton from '../../components/cms/ui/CMSButton';
import { useAuth } from '../../contexts/AuthContext';
import { useCMSLang } from '../../contexts/CMSLanguageContext';
import { useToast } from '../../contexts/CMSToastContext';
import { generateStarterLandingPreviewToken } from '../../services/cms/trainingApi';
import { parseApiError } from '../../services/cms/cmsFetch';

const DEVICES = {
  desktop: { label: 'Desktop', width: '100%' },
  mobile: { label: 'Mobile', width: '390px' },
};

export default function CMSStarterLandingPreviewPage() {
  const { hasCapability } = useAuth();
  const { t } = useCMSLang();
  const { showError } = useToast();

  const canView = hasCapability('training.view') || hasCapability('training.update');

  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);
  const [device, setDevice] = useState('desktop');
  const [lang, setLang] = useState('en');
  const [frameKey, setFrameKey] = useState(0);

  const mintToken = useCallback(async () => {
    setError(null);
    try {
      const data = await generateStarterLandingPreviewToken();
      setToken(data.token);
    } catch (err) {
      setError(parseApiError(err));
    }
  }, []);

  useEffect(() => {
    if (canView) mintToken();
  }, [canView, mintToken]);

  if (!canView) {
    return (
      <CMSLayout>
        <CMSErrorState message={t('siteSettings.permissionDenied')} />
      </CMSLayout>
    );
  }

  const iframeSrc = token
    ? `/training/starter/register?preview=${token}&lang=${lang}`
    : null;

  return (
    <CMSLayout>
      <CMSPageHeader
        title={t('landing.previewTitle')}
        subtitle={t('landing.previewSubtitle')}
        actions={
          <>
            <Link to="/cms/training/starter-landing">
              <CMSButton variant="ghost">← {t('landing.backToBuilder')}</CMSButton>
            </Link>
            <CMSButton variant="secondary" onClick={() => { mintToken(); setFrameKey((k) => k + 1); }}>
              {t('landing.refreshPreview')}
            </CMSButton>
          </>
        }
      />

      <div style={styles.controls}>
        <div style={styles.controlGroup} role="group" aria-label="Device">
          {Object.entries(DEVICES).map(([key, cfg]) => (
            <button
              key={key}
              style={{ ...styles.toggleBtn, ...(device === key ? styles.toggleBtnActive : {}) }}
              onClick={() => setDevice(key)}
            >
              {cfg.label}
            </button>
          ))}
        </div>
        <div style={styles.controlGroup} role="group" aria-label="Language">
          {['en', 'ar'].map((code) => (
            <button
              key={code}
              style={{ ...styles.toggleBtn, ...(lang === code ? styles.toggleBtnActive : {}) }}
              onClick={() => setLang(code)}
            >
              {code === 'en' ? 'English' : 'العربية'}
            </button>
          ))}
        </div>
      </div>

      {error && <CMSErrorState message={error} onRetry={mintToken} />}
      {!error && !token && <CMSLoadingState />}

      {iframeSrc && (
        <div style={styles.frameWrap}>
          <iframe
            key={`${frameKey}-${device}-${lang}`}
            src={iframeSrc}
            title="Starter landing draft preview"
            style={{
              ...styles.frame,
              width: DEVICES[device].width,
              maxWidth: '100%',
            }}
          />
        </div>
      )}
    </CMSLayout>
  );
}

const styles = {
  controls: {
    display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap',
  },
  controlGroup: {
    display: 'flex', border: '1px solid var(--cms-border-default)',
    borderRadius: '8px', overflow: 'hidden',
  },
  toggleBtn: {
    background: 'transparent', border: 'none', padding: '0.45rem 1rem',
    color: 'var(--cms-text-secondary)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
  },
  toggleBtnActive: {
    background: 'var(--cms-accent)', color: '#fff',
  },
  frameWrap: {
    display: 'flex', justifyContent: 'center',
    background: 'var(--cms-bg-base, #0f1220)',
    border: '1px solid var(--cms-border-default)',
    borderRadius: 'var(--cms-radius-lg)',
    padding: '1rem',
  },
  frame: {
    height: '78vh',
    border: '1px solid var(--cms-border-default)',
    borderRadius: '10px',
    background: '#fff',
  },
};
