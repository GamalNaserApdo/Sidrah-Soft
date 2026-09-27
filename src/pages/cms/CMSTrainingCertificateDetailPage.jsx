import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import CMSLayout from '../../components/cms/layout/CMSLayout';
import CMSPageHeader from '../../components/cms/ui/CMSPageHeader';
import CMSButton from '../../components/cms/ui/CMSButton';
import { CMSInput, CMSTextarea, CMSSelect } from '../../components/cms/ui/CMSFormInputs';
import CMSMediaField from '../../components/cms/ui/CMSMediaField';
import { CMSLoadingState, CMSErrorState } from '../../components/cms/ui/CMSStateViews';
import { useAuth } from '../../contexts/AuthContext';
import { useCMSLang } from '../../contexts/CMSLanguageContext';
import { useToast } from '../../contexts/CMSToastContext';
import {
  getCertificate,
  createCertificate,
  updateCertificate,
  issueCertificate,
  revokeCertificate,
  uploadCertificateFile,
  removeCertificateFile,
  getQrCodeUrl,
} from '../../services/cms/certificatesApi';
import { listRegistrations } from '../../services/cms/trainingRegistrationsApi';
import { parseApiError, extractFieldErrors } from '../../services/cms/cmsFetch';
import { API_BASE_URL } from '../../services/apiClient';

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'issued', label: 'Issued' },
  { value: 'revoked', label: 'Revoked' },
];

// Certificate types are now first-class in the backend (completion, recognition, instructor).
// No mapping needed — the UI type is the backend type.

const empty = {
  ui_type: 'completion',
  training_registration: '',
  recipient_name: '',
  certificate_title: '',
  certificate_number: '',
  training_start_date: '',
  training_end_date: '',
  grade: '',
  result: '',
  recognition_reason: '',
  media_asset: null,
};

export default function CMSTrainingCertificateDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useCMSLang();
  const { hasCapability } = useAuth();
  const { showSuccess, showError } = useToast();

  const isNew = !id;
  const canCreate = hasCapability('certificates.create');
  const canUpdate = hasCapability('certificates.update');
  const canEdit = isNew ? canCreate : canUpdate;
  const canIssue = hasCapability('certificates.issue');
  const canRevoke = hasCapability('certificates.revoke');

  const [data, setData] = useState(empty);
  const [meta, setMeta] = useState({
    reference: '',
    certificate_type: 'completion',
    status: 'draft',
    revoked_at: '',
    revoked_by: '',
    revoked_reason: '',
    issued_at: '',
    certificate_file: '',
    verification_url: '',
    qr_code_url: '',
  });
  const [completedRegs, setCompletedRegs] = useState([]);
  const [loading, setLoading] = useState(!isNew);
  const [regsLoading, setRegsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [acting, setActing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [revokeReason, setRevokeReason] = useState('');
  const [showRevokeReason, setShowRevokeReason] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [dirty, setDirty] = useState(isNew);
  const [qrSrc, setQrSrc] = useState('');
  const fileInputRef = useRef(null);

  const loadCompletedRegistrations = useCallback(async () => {
    setRegsLoading(true);
    try {
      const res = await listRegistrations({ status: 'completed', page_size: 1000 });
      setCompletedRegs(res.results || []);
    } catch {
      setCompletedRegs([]);
    } finally {
      setRegsLoading(false);
    }
  }, []);

  const load = useCallback(async () => {
    if (isNew) return;
    setLoading(true);
    setError(null);
    try {
      const d = await getCertificate(id);
      const backendType = d.certificate_type || 'completion';
      setData({
        ui_type: backendType,
        training_registration: d.training_registration || '',
        recipient_name: d.recipient_name || '',
        certificate_title: d.certificate_title || '',
        certificate_number: d.certificate_number || '',
        training_start_date: d.training_start_date || '',
        training_end_date: d.training_end_date || '',
        grade: d.grade || '',
        result: d.result || '',
        recognition_reason: d.recognition_reason || '',
        media_asset: d.media_asset || null,
      });
      setMeta({
        reference: d.reference || '',
        certificate_type: backendType,
        status: d.status || 'draft',
        revoked_at: d.revoked_at || '',
        revoked_by: d.revoked_by || '',
        revoked_reason: d.revoked_reason || '',
        issued_at: d.issued_at || '',
        certificate_file: d.certificate_file || '',
        verification_url: d.verification_url || '',
        qr_code_url: d.qr_code_url || '',
      });
      setDirty(false);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  }, [id, isNew]);

  useEffect(() => {
    loadCompletedRegistrations();
    load();
  }, [load, loadCompletedRegistrations]);

  // Load QR preview when we have a qr_code_url
  useEffect(() => {
    if (meta.qr_code_url && meta.reference) {
      setQrSrc(`${API_BASE_URL}${meta.qr_code_url}`);
    } else {
      setQrSrc('');
    }
  }, [meta.qr_code_url, meta.reference]);

  const handleChange = (field, value) => {
    setData((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const buildPayload = () => {
    const payload = { ...data };
    // certificate_type is now first-class (completion, recognition, instructor)
    payload.certificate_type = payload.ui_type;
    delete payload.ui_type;
    // Don't send recognition_reason for completion certs
    if (payload.certificate_type === 'completion') {
      delete payload.recognition_reason;
    }
    if (payload.media_asset && typeof payload.media_asset === 'object') {
      payload.media_asset = payload.media_asset.id;
    }
    return payload;
  };

  const handleGenerateCredential = async () => {
    if (!canCreate) return;
    // Validate minimum fields
    const backendType = data.ui_type;
    if (backendType === 'completion' && !data.training_registration) {
      showError(t('certificate.completedRegistration') + ' is required.');
      return;
    }
    if ((backendType === 'recognition' || backendType === 'instructor') && !data.recipient_name) {
      showError(t('certificate.recipientName') + ' is required.');
      return;
    }
    setGenerating(true);
    setFieldErrors({});
    try {
      const payload = buildPayload();
      const result = await createCertificate(payload);
      showSuccess(t('certificate.credentialGenerated'));
      // Navigate to the edit page for the new certificate
      navigate(`/cms/training/certificates/${result.id}`, { replace: true });
    } catch (err) {
      const fe = extractFieldErrors(err);
      if (Object.keys(fe).length > 0) setFieldErrors(fe);
      showError(parseApiError(err));
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!canEdit) return;
    setSaving(true);
    setFieldErrors({});
    try {
      const payload = buildPayload();
      await updateCertificate(id, payload);
      showSuccess(t('msg.saved'));
      setDirty(false);
      load();
    } catch (err) {
      const fe = extractFieldErrors(err);
      if (Object.keys(fe).length > 0) setFieldErrors(fe);
      showError(parseApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleIssue = async () => {
    if (!canIssue || isNew) return;
    setActing(true);
    try {
      await issueCertificate(id);
      showSuccess(t('certificate.issued'));
      load();
    } catch (err) {
      showError(parseApiError(err));
    } finally {
      setActing(false);
    }
  };

  const handleRevoke = async () => {
    if (!canRevoke || isNew) return;
    if (!showRevokeReason) {
      setShowRevokeReason(true);
      return;
    }
    setActing(true);
    try {
      await revokeCertificate(id, { revoked_reason: revokeReason });
      showSuccess(t('certificate.revoked'));
      setShowRevokeReason(false);
      setRevokeReason('');
      load();
    } catch (err) {
      showError(parseApiError(err));
    } finally {
      setActing(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!canEdit || isNew) return;
    setUploading(true);
    try {
      await uploadCertificateFile(id, file);
      showSuccess(t('msg.saved'));
      load();
    } catch (err) {
      showError(parseApiError(err));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileRemove = async () => {
    if (!canEdit || isNew) return;
    setUploading(true);
    try {
      await removeCertificateFile(id);
      showSuccess(t('msg.saved'));
      load();
    } catch (err) {
      showError(parseApiError(err));
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = (text, successMsg) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => showSuccess(successMsg)).catch(() => {});
  };

  const copyLinkedInDetails = () => {
    const lines = [
      `Certificate Name: ${data.certificate_title || meta.reference || ''}`,
      `Issuing Organization: Sidrah Soft`,
      `Issue Date: ${meta.issued_at ? new Date(meta.issued_at).toLocaleDateString() : ''}`,
      `Credential ID: ${meta.reference}`,
      `Credential URL: ${meta.verification_url || ''}`,
    ];
    copyToClipboard(lines.join('\n'), t('certificate.linkedInCopied'));
  };

  const downloadQr = () => {
    if (!qrSrc) return;
    const a = document.createElement('a');
    a.href = qrSrc;
    a.download = `QR_${meta.reference}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (loading) return <CMSLayout><CMSLoadingState /></CMSLayout>;
  if (error) return <CMSLayout><CMSErrorState message={error} onRetry={load} /></CMSLayout>;

  const selectedReg = completedRegs.find((r) => String(r.id) === String(data.training_registration));
  const regDisplay = selectedReg
    ? `${selectedReg.full_name || ''} — ${selectedReg.program_title || selectedReg.program || `#${selectedReg.id}`}`.trim()
    : (data.training_registration ? `#${data.training_registration}` : '—');

  const isCompletion = data.ui_type === 'completion';
  const isRecognition = data.ui_type === 'recognition';
  const isInstructor = data.ui_type === 'instructor';
  const hasCredential = !isNew && meta.reference;
  const verificationUrl = meta.verification_url || (meta.reference ? `${window.location.origin}/certificates/verify/${meta.reference}` : '');

  return (
    <CMSLayout unsavedChanges={dirty}>
      <CMSPageHeader
        title={isNew ? t('certificate.new') || 'New Certificate' : (meta.reference || t('certificate.title'))}
        actions={
          <>
            {!isNew && meta.status === 'issued' && canRevoke && (
              <>
                {showRevokeReason && (
                  <CMSInput
                    value={revokeReason}
                    onChange={(e) => setRevokeReason(e.target.value)}
                    placeholder={t('certificate.revokedReason') || 'Reason for revocation'}
                    style={{ width: '220px' }}
                  />
                )}
                <CMSButton variant="danger" onClick={handleRevoke} loading={acting}>
                  {t('certificate.revoke')}
                </CMSButton>
              </>
            )}
            {!isNew && meta.status === 'draft' && canIssue && (
              <CMSButton variant="primary" onClick={handleIssue} loading={acting}>
                {t('certificate.issue')}
              </CMSButton>
            )}
            <Link to="/cms/training/certificates">
              <CMSButton variant="secondary">{t('action.cancel')}</CMSButton>
            </Link>
            {isNew && canCreate && (
              <CMSButton variant="primary" onClick={handleGenerateCredential} loading={generating} disabled={generating}>
                {generating ? t('certificate.generating') : t('certificate.generateCredential')}
              </CMSButton>
            )}
            {!isNew && canEdit && (
              <CMSButton variant="primary" onClick={handleSave} loading={saving} disabled={!dirty}>
                {t('action.save')}
              </CMSButton>
            )}
          </>
        }
      />

      <div style={styles.form}>
        {/* Section 1: Certificate Type */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>{t('certificate.type')}</h3>
          <CMSSelect
            value={data.ui_type}
            onChange={(e) => handleChange('ui_type', e.target.value)}
            error={fieldErrors.certificate_type}
            disabled={!canEdit}
          >
            <option value="completion">{t('certificate.type.completion')}</option>
            <option value="recognition">{t('certificate.type.recognition')}</option>
            <option value="instructor">{t('certificate.type.instructor')}</option>
          </CMSSelect>
          {data.ui_type === 'instructor' && (
            <div style={styles.hint}>{t('certificate.typeHint')}</div>
          )}
        </div>

        {/* Section 2: Certificate Identity */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>{t('certificate.identity')}</h3>
          <div className="cms-form-grid" style={styles.grid2}>
            <CMSInput
              label={t('certificate.recipientName')}
              value={data.recipient_name}
              onChange={(e) => handleChange('recipient_name', e.target.value)}
              error={fieldErrors.recipient_name}
              required={isRecognition}
              readOnly={!canEdit}
            />
            <CMSInput
              label={t('certificate.trackTitle')}
              value={data.certificate_title}
              onChange={(e) => handleChange('certificate_title', e.target.value)}
              error={fieldErrors.certificate_title}
              readOnly={!canEdit}
            />
          </div>
          {(isRecognition || isInstructor) && (
            <CMSTextarea
              label={t('certificate.recognitionReason')}
              value={data.recognition_reason}
              onChange={(e) => handleChange('recognition_reason', e.target.value)}
              error={fieldErrors.recognition_reason}
              rows={2}
              readOnly={!canEdit}
            />
          )}
        </div>

        {/* Section 3: Training Details (only for completion) */}
        {isCompletion && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>{t('certificate.trainingDetails')}</h3>
            <CMSSelect
              label={t('certificate.completedRegistration') || 'Completed Registration'}
              value={data.training_registration}
              onChange={(e) => handleChange('training_registration', e.target.value)}
              error={fieldErrors.training_registration}
              disabled={!canEdit || regsLoading}
            >
              <option value="">{t('form.selectImage') || 'Select…'}</option>
              {completedRegs.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.full_name || r.email || `#${r.id}`} — {r.program_title || r.program || `#${r.program}`}
                </option>
              ))}
            </CMSSelect>
            {!canEdit && <div style={styles.readOnlyValue}>{regDisplay}</div>}
            <div className="cms-form-grid" style={styles.grid2}>
              <CMSInput type="date" label={t('certificate.trainingStartDate')} value={data.training_start_date} onChange={(e) => handleChange('training_start_date', e.target.value)} error={fieldErrors.training_start_date} readOnly={!canEdit} />
              <CMSInput type="date" label={t('certificate.trainingEndDate')} value={data.training_end_date} onChange={(e) => handleChange('training_end_date', e.target.value)} error={fieldErrors.training_end_date} readOnly={!canEdit} />
            </div>
            <div className="cms-form-grid" style={styles.grid2}>
              <CMSInput label={t('certificate.certificateNumber')} value={data.certificate_number} onChange={(e) => handleChange('certificate_number', e.target.value)} error={fieldErrors.certificate_number} readOnly={!canEdit} />
              <CMSInput label={t('certificate.grade')} value={data.grade} onChange={(e) => handleChange('grade', e.target.value)} error={fieldErrors.grade} readOnly={!canEdit} />
            </div>
            <CMSTextarea label={t('certificate.result')} value={data.result} onChange={(e) => handleChange('result', e.target.value)} error={fieldErrors.result} rows={2} readOnly={!canEdit} />
          </div>
        )}

        {/* Section 3b: Optional dates for recognition/instructor */}
        {(isRecognition || isInstructor) && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>{t('certificate.trainingDetails')}</h3>
            <div className="cms-form-grid" style={styles.grid2}>
              <CMSInput type="date" label={t('certificate.trainingStartDate')} value={data.training_start_date} onChange={(e) => handleChange('training_start_date', e.target.value)} error={fieldErrors.training_start_date} readOnly={!canEdit} />
              <CMSInput type="date" label={t('certificate.trainingEndDate')} value={data.training_end_date} onChange={(e) => handleChange('training_end_date', e.target.value)} error={fieldErrors.training_end_date} readOnly={!canEdit} />
            </div>
          </div>
        )}

        {/* Section 4: Credential Panel */}
        {hasCredential && (
          <div style={styles.credentialPanel}>
            <h3 style={styles.sectionTitle}>{t('certificate.credential')}</h3>
            <div style={styles.credentialGrid}>
              <div style={styles.credentialInfo}>
                <div style={styles.credentialRow}>
                  <span style={styles.credentialLabel}>{t('certificate.reference')}</span>
                  <span style={styles.credentialValue}>{meta.reference}</span>
                </div>
                <div style={styles.credentialRow}>
                  <span style={styles.credentialLabel}>{t('form.status')}</span>
                  <span style={styles.credentialValue}>{t(`certificate.status.${meta.status}`)}</span>
                </div>
                {meta.issued_at && (
                  <div style={styles.credentialRow}>
                    <span style={styles.credentialLabel}>{t('certificate.issueDate')}</span>
                    <span style={styles.credentialValue}>{new Date(meta.issued_at).toLocaleDateString()}</span>
                  </div>
                )}
                <div style={styles.credentialRow}>
                  <span style={styles.credentialLabel}>{t('certificate.verificationLink')}</span>
                  <span style={styles.credentialValueSmall}>{verificationUrl}</span>
                </div>
                <div style={styles.credentialActions}>
                  <button type="button" style={styles.credBtn} onClick={() => copyToClipboard(meta.reference, t('certificate.referenceCopied'))}>
                    {t('certificate.copyReference')}
                  </button>
                  <button type="button" style={styles.credBtn} onClick={() => copyToClipboard(verificationUrl, t('certificate.urlCopied'))}>
                    {t('certificate.copyVerificationUrl')}
                  </button>
                  <button type="button" style={styles.credBtn} onClick={copyLinkedInDetails}>
                    {t('certificate.copyLinkedIn')}
                  </button>
                  {verificationUrl && (
                    <a href={verificationUrl} target="_blank" rel="noopener noreferrer" style={styles.credBtn}>
                      {t('certificate.viewVerification')}
                    </a>
                  )}
                </div>
              </div>
              <div style={styles.qrBox}>
                {qrSrc ? (
                  <>
                    <img src={qrSrc} alt={t('certificate.qrCode')} style={styles.qrImg} />
                    <button type="button" style={styles.credBtn} onClick={downloadQr}>
                      {t('certificate.downloadQr')}
                    </button>
                  </>
                ) : (
                  <div style={styles.qrPlaceholder}>{t('certificate.qrCode')}</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Section 5: Certificate File (PDF upload) */}
        {!isNew && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>{t('certificate.certificateFile')}</h3>
            {meta.certificate_file ? (
              <div style={styles.filePreview}>
                <span style={styles.fileIcon}>PDF</span>
                <div style={styles.fileInfo}>
                  <span style={styles.filename}>{meta.certificate_file.split('/').pop()}</span>
                  <div style={styles.previewActions}>
                    <a href={meta.certificate_file} target="_blank" rel="noopener noreferrer" style={styles.changeBtn}>
                      {t('certificate.openPdf')}
                    </a>
                    {canEdit && (
                      <>
                        <button type="button" onClick={() => fileInputRef.current?.click()} style={styles.changeBtn}>
                          {t('certificate.changeFile')}
                        </button>
                        <button type="button" onClick={handleFileRemove} style={styles.removeBtn}>
                          {t('certificate.removeFile')}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div style={styles.emptyFile}>
                <span style={styles.emptyText}>{t('certificate.noFile')}</span>
                {canEdit && (
                  <button type="button" onClick={() => fileInputRef.current?.click()} style={styles.selectBtn} disabled={uploading}>
                    {uploading ? t('certificate.uploading') : t('certificate.uploadPdf')}
                  </button>
                )}
                <div style={styles.hint}>{t('certificate.fileHint')}</div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />
          </div>
        )}

        {/* Section 6: Media Asset (optional image) */}
        {!isNew && (
          <CMSMediaField
            label={t('certificate.file')}
            value={data.media_asset}
            onChange={(_id, asset) => handleChange('media_asset', asset)}
            usageLabel="certificate-file"
            disabled={!canEdit}
          />
        )}

        {/* Revoked status box */}
        {meta.status === 'revoked' && (
          <div style={styles.revokedBox}>
            <strong>{t('certificate.revoked')}</strong>
            {meta.revoked_reason && <p>{meta.revoked_reason}</p>}
            {meta.revoked_at && <span>{new Date(meta.revoked_at).toLocaleString()}</span>}
            {meta.revoked_by && <span> — {meta.revoked_by}</span>}
          </div>
        )}
      </div>
    </CMSLayout>
  );
}

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    maxWidth: '760px',
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  section: {
    background: 'var(--cms-bg-surface)',
    border: '1px solid var(--cms-border-default)',
    borderRadius: 'var(--cms-radius-lg)',
    padding: '1rem 1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  sectionTitle: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'var(--cms-accent)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    margin: 0,
  },
  hint: {
    fontSize: '0.75rem',
    color: 'var(--cms-text-dim)',
  },
  readOnlyValue: {
    fontSize: '0.875rem',
    color: 'var(--cms-text-secondary)',
    padding: '0.25rem 0',
  },
  credentialPanel: {
    background: 'var(--cms-accent-bg)',
    border: '1px solid var(--cms-accent)',
    borderRadius: 'var(--cms-radius-lg)',
    padding: '1rem 1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  credentialGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: '1.5rem',
    alignItems: 'flex-start',
  },
  credentialInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  credentialRow: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'baseline',
  },
  credentialLabel: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'var(--cms-text-secondary)',
    minWidth: '120px',
  },
  credentialValue: {
    fontSize: '0.875rem',
    color: 'var(--cms-text-primary)',
    fontWeight: '500',
    wordBreak: 'break-all',
  },
  credentialValueSmall: {
    fontSize: '0.75rem',
    color: 'var(--cms-text-secondary)',
    wordBreak: 'break-all',
  },
  credentialActions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  credBtn: {
    background: 'transparent',
    border: '1px solid var(--cms-accent)',
    color: 'var(--cms-accent)',
    borderRadius: 'var(--cms-radius-sm)',
    padding: '0.25rem 0.75rem',
    fontSize: '0.75rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textDecoration: 'none',
    display: 'inline-block',
  },
  qrBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
  },
  qrImg: {
    width: '140px',
    height: '140px',
    borderRadius: 'var(--cms-radius-sm)',
    border: '1px solid var(--cms-border-default)',
  },
  qrPlaceholder: {
    width: '140px',
    height: '140px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px dashed var(--cms-border-default)',
    borderRadius: 'var(--cms-radius-sm)',
    fontSize: '0.75rem',
    color: 'var(--cms-text-muted)',
  },
  filePreview: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
  },
  fileIcon: {
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--cms-danger-bg)',
    border: '1px solid var(--cms-danger-border)',
    borderRadius: 'var(--cms-radius-sm)',
    color: 'var(--cms-danger)',
    fontSize: '0.75rem',
    fontWeight: '700',
    flexShrink: 0,
  },
  fileInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  filename: {
    fontSize: '0.875rem',
    color: 'var(--cms-text-primary)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  previewActions: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  changeBtn: {
    background: 'transparent',
    border: '1px solid var(--cms-accent)',
    color: 'var(--cms-accent)',
    borderRadius: 'var(--cms-radius-sm)',
    padding: '0.25rem 0.5rem',
    fontSize: '0.75rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textDecoration: 'none',
    display: 'inline-block',
  },
  removeBtn: {
    background: 'transparent',
    border: '1px solid var(--cms-danger-border)',
    color: 'var(--cms-danger)',
    borderRadius: 'var(--cms-radius-sm)',
    padding: '0.25rem 0.5rem',
    fontSize: '0.75rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  emptyFile: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '1.25rem',
  },
  emptyText: {
    fontSize: '0.875rem',
    color: 'var(--cms-text-muted)',
  },
  selectBtn: {
    background: 'var(--cms-accent-bg)',
    border: '1px solid var(--cms-accent)',
    color: 'var(--cms-accent)',
    borderRadius: 'var(--cms-radius-md)',
    padding: '0.25rem 1rem',
    fontSize: '0.875rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  revokedBox: {
    padding: '1rem',
    background: 'var(--cms-danger-bg)',
    border: '1px solid var(--cms-danger-border)',
    borderRadius: 'var(--cms-radius-md)',
    color: 'var(--cms-danger)',
  },
};
