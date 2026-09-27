import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { useI18n } from '../i18n/I18nProvider';
import { verifyCertificate } from '../services/certificatesApi';

/* ── Date formatting ──────────────────────────────────────────────── */

function formatDate(value, lang) {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d)) return String(value);
  const locale = lang === 'ar' ? 'ar-EG' : 'en-US';
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatDateRange(start, end, lang) {
  const s = formatDate(start, lang);
  const e = formatDate(end, lang);
  if (!s && !e) return '';
  if (!s) return e;
  if (!e) return s;
  return `${s} — ${e}`;
}

/* ── Credential type labels ────────────────────────────────────────── */

function getCredentialTypeLabel(type, lang) {
  if (lang === 'ar') {
    switch (type) {
      case 'completion': return 'شهادة إتمام تدريب';
      case 'recognition': return 'شهادة تقدير';
      case 'instructor': return 'شهادة مدرب';
      default: return 'شهادة';
    }
  }
  switch (type) {
    case 'completion': return 'Training Completion Credential';
    case 'recognition': return 'Recognition Credential';
    case 'instructor': return 'Instructor Credential';
    default: return 'Credential';
  }
}

function getVerifiedHeroLabel(type, lang) {
  if (lang === 'ar') {
    switch (type) {
      case 'completion': return 'شهادة إتمام موثقة';
      case 'recognition': return 'شهادة تقدير موثقة';
      case 'instructor': return 'شهادة مدرب موثقة';
      default: return 'شهادة موثقة';
    }
  }
  switch (type) {
    case 'completion': return 'Verified Completion Credential';
    case 'recognition': return 'Verified Recognition Credential';
    case 'instructor': return 'Verified Instructor Credential';
    default: return 'Verified Credential';
  }
}

/* ── Clipboard hook ───────────────────────────────────────────────── */

function useClipboard() {
  const [copied, setCopied] = useState(false);
  const copy = useCallback((text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {});
    } else {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch (_) {}
      document.body.removeChild(ta);
    }
  }, []);
  return { copied, copy };
}

/* ── Main component ────────────────────────────────────────────────── */

function CertificateVerifyPage() {
  const { reference } = useParams();
  const navigate = useNavigate();
  const { lang, dir } = useI18n();
  const isAr = lang === 'ar';
  const { copied, copy } = useClipboard();

  const [loading, setLoading] = useState(!!reference);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    if (!reference) {
      setLoading(false);
      return;
    }
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const data = await verifyCertificate(reference);
        if (mounted) {
          setResult(data);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err);
          setResult(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [reference]);

  const handleSearch = (e) => {
    e.preventDefault();
    const ref = searchInput.trim();
    if (ref) {
      navigate(`/certificates/verify/${encodeURIComponent(ref)}`);
    }
  };

  // SEO: landing page (no reference) is indexable; individual credential pages are noindex
  const isLandingPage = !reference;
  const pageTitle = isLandingPage
    ? (isAr ? 'التحقق من الشهادات | Sidrah Soft' : 'Certificate Verification | Sidrah Soft')
    : (isAr ? 'التحقق من الشهادة | Sidrah Soft' : 'Verify Certificate | Sidrah Soft');
  const pageDesc = isLandingPage
    ? (isAr
        ? 'تحقق من الشهادات والشهادات الرقمية الصادرة من Sidrah Soft باستخدام رقم الشهادة الرسمي.'
        : 'Verify certificates and digital credentials issued by Sidrah Soft using an official Credential ID.')
    : (isAr ? 'تحقق من صحة الشهادة التدريبية.' : 'Verify the authenticity of a training certificate.');

  /* ── Search form strings ─────────────────────────────────────────── */
  const searchTitle = isAr ? 'التحقق من الشهادات' : 'Certificate Verification';
  const searchDesc = isAr
    ? 'أدخل رقم مرجع الشهادة للتحقق من صحتها.'
    : 'Enter the certificate reference number to verify its authenticity.';
  const searchPlaceholder = isAr ? 'مثال: SDR-TRN-2026-A7K9P2' : 'e.g., SDR-TRN-2026-A7K9P2';
  const searchButton = isAr ? 'تحقق' : 'Verify';

  /* ── Status strings ──────────────────────────────────────────────── */
  const verifiedText = isAr
    ? 'تم إصدار هذه الشهادة والتحقق منها رسمياً من قبل Sidrah Soft.'
    : 'This credential has been officially issued and verified by Sidrah Soft.';
  const revokedTitle = isAr ? 'تم إلغاء الشهادة' : 'Credential Revoked';
  const revokedText = isAr
    ? 'لم تعد هذه الشهادة صالحة. يرجى التواصل مع المُصدِّر لمزيد من التفاصيل.'
    : 'This credential is no longer valid. Please contact the issuer for more details.';
  const notFoundTitle = isAr ? 'الشهادة غير موجودة' : 'Credential Not Found';
  const notFoundText = isAr
    ? 'لم نتمكن من التحقق من شهادة بهذا الرقم.'
    : "We couldn't verify a credential with this ID.";
  const loadingText = isAr ? 'جارٍ التحقق...' : 'Verifying...';

  /* ── Detail labels ───────────────────────────────────────────────── */
  const lbl = {
    issuedTo: isAr ? 'مُصدرة إلى' : 'Issued to',
    credentialType: isAr ? 'نوع الشهادة' : 'Credential Type',
    credentialId: isAr ? 'رقم الشهادة' : 'Credential ID',
    issued: isAr ? 'تاريخ الإصدار' : 'Issued',
    trainingPeriod: isAr ? 'فترة التدريب' : 'Training Period',
    issuer: isAr ? 'الجهة المُصدِرة' : 'Issuer',
    status: isAr ? 'الحالة' : 'Status',
    valid: isAr ? 'سارية' : 'Valid',
    revoked: isAr ? 'ملغاة' : 'Revoked',
    viewCertificate: isAr ? 'عرض الشهادة' : 'View Certificate',
    copyId: isAr ? 'نسخ رقم الشهادة' : 'Copy Credential ID',
    copied: isAr ? 'تم النسخ' : 'Copied',
    verifyAnother: isAr ? 'تحقق من شهادة أخرى' : 'Verify another credential',
    issuedBy: isAr ? 'صادرة وموثقة من Sidrah Soft' : 'Issued & Verified by Sidrah Soft',
    trustText: isAr
      ? 'تم التحقق من هذه الشهادة مقابل سجلات الشهادات الرسمية لـ Sidrah Soft.'
      : "This digital credential is verified against Sidrah Soft's official credential records.",
    enterEra: isAr ? 'ادخل العصر القادم.' : 'Enter The Next Era.',
  };

  /* ── Determine status ────────────────────────────────────────────── */
  let status = 'search';
  if (reference && loading) status = 'loading';
  else if (reference && !loading && error) status = 'not_found';
  else if (reference && !loading && result) {
    if (result.status === 'revoked' || result.is_valid === false) status = 'revoked';
    else status = 'verified';
  }

  const programTitle = isAr && result?.program_title_ar ? result.program_title_ar : result?.program_title;
  const certTitle = result?.certificate_title || programTitle;
  const certType = result?.certificate_type;
  const trainingPeriod = formatDateRange(result?.training_start_date, result?.training_end_date, lang);
  const issuedDate = formatDate(result?.issued_at, lang);
  const fileUrl = result?.file_url;

  /* ── Render ──────────────────────────────────────────────────────── */

  return (
    <>
      <SEO
        title={pageTitle}
        description={pageDesc}
        canonical={isLandingPage ? '/certificates/verify' : `/certificates/verify/${reference}`}
        robotsIndex={isLandingPage}
      />
      <Header />
      <main className="cert-verify-page" dir={dir}>
        <div className="cert-verify__container">
          {/* ── Search form ────────────────────────────────────────── */}
          {(status === 'search' || status === 'not_found') && (
            <div className="cert-verify__search" dir={dir}>
              <div className="cert-verify__search-brand">
                <span className="cert-verify__search-brand-name">Sidrah Soft</span>
                <span className="cert-verify__search-brand-sub">
                  {isAr ? 'الشهادات الرقمية' : 'Digital Credentials'}
                </span>
              </div>
              <h1 className="cert-verify__search-title">{searchTitle}</h1>
              <p className="cert-verify__search-desc">{searchDesc}</p>
              <form onSubmit={handleSearch} className="cert-verify__search-form">
                <input
                  type="text"
                  className="cert-verify__search-input"
                  placeholder={searchPlaceholder}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  maxLength={64}
                  required
                  dir="ltr"
                  autoFocus
                  aria-label={searchPlaceholder}
                />
                <button type="submit" className="cert-verify__search-btn">
                  {searchButton}
                </button>
              </form>
            </div>
          )}

          {/* ── Loading ────────────────────────────────────────────── */}
          {status === 'loading' && (
            <div className="cert-verify__loading" dir={dir} role="status" aria-live="polite">
              <div className="cert-verify__loading-spinner" aria-hidden="true" />
              <span>{loadingText}</span>
            </div>
          )}

          {/* ── Verified ───────────────────────────────────────────── */}
          {status === 'verified' && (
            <article className="cert-credential cert-credential--verified" dir={dir}>
              {/* Hero */}
              <header className="cert-credential__hero">
                <div className="cert-credential__status-badge cert-credential__status-badge--verified" role="img" aria-label={lbl.valid}>
                  <svg className="cert-credential__status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span>{lbl.valid}</span>
                </div>
                <h1 className="cert-credential__hero-title">
                  {getVerifiedHeroLabel(certType, lang)}
                </h1>
                <p className="cert-credential__hero-text">{verifiedText}</p>
              </header>

              {/* Recipient */}
              <div className="cert-credential__recipient">
                <span className="cert-credential__recipient-label">{lbl.issuedTo}</span>
                <div className="cert-credential__recipient-name">{result?.recipient_name || ''}</div>
                {certTitle && (
                  <div className="cert-credential__recipient-title">{certTitle}</div>
                )}
              </div>

              {/* Details */}
              <dl className="cert-credential__details">
                <div className="cert-credential__detail-row">
                  <dt>{lbl.credentialType}</dt>
                  <dd>{getCredentialTypeLabel(certType, lang)}</dd>
                </div>
                <div className="cert-credential__detail-row">
                  <dt>{lbl.credentialId}</dt>
                  <dd className="cert-credential__detail-id" dir="ltr">
                    {result?.reference || reference}
                  </dd>
                </div>
                {issuedDate && (
                  <div className="cert-credential__detail-row">
                    <dt>{lbl.issued}</dt>
                    <dd>{issuedDate}</dd>
                  </div>
                )}
                {trainingPeriod && (
                  <div className="cert-credential__detail-row">
                    <dt>{lbl.trainingPeriod}</dt>
                    <dd dir="ltr">{trainingPeriod}</dd>
                  </div>
                )}
                <div className="cert-credential__detail-row">
                  <dt>{lbl.issuer}</dt>
                  <dd>Sidrah Soft</dd>
                </div>
                <div className="cert-credential__detail-row">
                  <dt>{lbl.status}</dt>
                  <dd>
                    <span className="cert-credential__status-text cert-credential__status-text--valid">
                      {lbl.valid}
                    </span>
                  </dd>
                </div>
              </dl>

              {/* Actions */}
              <div className="cert-credential__actions">
                {fileUrl && (
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cert-credential__btn cert-credential__btn--primary"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="cert-credential__btn-icon">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    {lbl.viewCertificate}
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => copy(result?.reference || reference || '')}
                  className="cert-credential__btn cert-credential__btn--secondary"
                  aria-label={lbl.copyId}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="cert-credential__btn-icon">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  {copied ? lbl.copied : lbl.copyId}
                </button>
              </div>

              {/* Trust */}
              <div className="cert-credential__trust">
                <div className="cert-credential__trust-line" />
                <div className="cert-credential__trust-content">
                  <span className="cert-credential__trust-issuer">{lbl.issuedBy}</span>
                  <span className="cert-credential__trust-desc">{lbl.trustText}</span>
                </div>
              </div>

              {/* Secondary action */}
              <Link to="/certificates/verify" className="cert-credential__verify-another">
                {lbl.verifyAnother}
              </Link>
            </article>
          )}

          {/* ── Revoked ────────────────────────────────────────────── */}
          {status === 'revoked' && (
            <article className="cert-credential cert-credential--revoked" dir={dir}>
              <header className="cert-credential__hero">
                <div className="cert-credential__status-badge cert-credential__status-badge--revoked" role="img" aria-label={lbl.revoked}>
                  <svg className="cert-credential__status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                  <span>{lbl.revoked}</span>
                </div>
                <h1 className="cert-credential__hero-title cert-credential__hero-title--revoked">
                  {revokedTitle}
                </h1>
                <p className="cert-credential__hero-text">{revokedText}</p>
              </header>

              {/* Identity for revoked (enough to identify which credential) */}
              <dl className="cert-credential__details">
                {result?.reference && (
                  <div className="cert-credential__detail-row">
                    <dt>{lbl.credentialId}</dt>
                    <dd className="cert-credential__detail-id" dir="ltr">{result.reference}</dd>
                  </div>
                )}
                {result?.recipient_name && (
                  <div className="cert-credential__detail-row">
                    <dt>{lbl.issuedTo}</dt>
                    <dd>{result.recipient_name}</dd>
                  </div>
                )}
                {certTitle && (
                  <div className="cert-credential__detail-row">
                    <dt>{isAr ? 'الشهادة' : 'Credential'}</dt>
                    <dd>{certTitle}</dd>
                  </div>
                )}
                <div className="cert-credential__detail-row">
                  <dt>{lbl.status}</dt>
                  <dd>
                    <span className="cert-credential__status-text cert-credential__status-text--revoked">
                      {lbl.revoked}
                    </span>
                  </dd>
                </div>
              </dl>

              <Link to="/certificates/verify" className="cert-credential__verify-another">
                {lbl.verifyAnother}
              </Link>
            </article>
          )}

          {/* ── Not Found ──────────────────────────────────────────── */}
          {status === 'not_found' && (
            <div className="cert-credential cert-credential--not-found" dir={dir}>
              <div className="cert-credential__not-found-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h2 className="cert-credential__hero-title">{notFoundTitle}</h2>
              <p className="cert-credential__hero-text">{notFoundText}</p>
              <Link to="/certificates/verify" className="cert-credential__btn cert-credential__btn--primary">
                {lbl.verifyAnother}
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default CertificateVerifyPage;
