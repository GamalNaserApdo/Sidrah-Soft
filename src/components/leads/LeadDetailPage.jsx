/**
 * Lead Detail Page.
 *
 * Shows full lead information and lets authorized users update status,
 * priority, and internal notes. Also supports quick spam/archive actions.
 */

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCMSLang } from '../../contexts/CMSLanguageContext';
import { useToast } from '../../contexts/CMSToastContext';
import { getLead, updateLead, listInquiryTypes } from '../../services/leadsApi';
import { parseApiError } from '../../services/cms/cmsFetch';
import Button from '../ui/Button.jsx';
import LeadsBadge from './LeadsBadge.jsx';
import { Select, Textarea } from '../ui/Input.jsx';
import { LoadingState, ErrorState } from '../ui/StateViews.jsx';

const STATUS_OPTIONS = ['new', 'contacted', 'in_progress', 'closed', 'spam', 'archived'];
const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'urgent'];

function formatDate(isoString, lang) {
  if (!isoString) return '-';
  const d = new Date(isoString);
  return d.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function LeadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useCMSLang();
  const { showSuccess, showError } = useToast();

  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [inquiryTypes, setInquiryTypes] = useState([]);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    status: 'new',
    priority: 'medium',
    internal_notes: '',
  });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      getLead(id),
      listInquiryTypes({ active: true }),
    ])
      .then(([leadData, typesData]) => {
        if (cancelled) return;
        setLead(leadData);
        setInquiryTypes(typesData.results || []);
        setFormData({
          status: leadData.status || 'new',
          priority: leadData.priority || 'medium',
          internal_notes: leadData.internal_notes || '',
        });
      })
      .catch((err) => {
        if (!cancelled) setError(parseApiError(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [id]);

  const inquiryLabel = useMemo(() => {
    if (!lead?.inquiry_type) return '-';
    const it = inquiryTypes.find((type) => type.id === lead.inquiry_type);
    if (it) {
      return lang === 'ar' && it.name_ar ? it.name_ar : it.name_en;
    }
    return lead.inquiry_type_name || '-';
  }, [lead, inquiryTypes, lang]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateLead(id, {
        status: formData.status,
        priority: formData.priority,
        internal_notes: formData.internal_notes,
      });
      setLead(updated);
      showSuccess(t('leads.saveSuccess'));
    } catch (err) {
      showError(parseApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleSetStatus = useCallback(async (status) => {
    const confirmKey = status === 'spam' ? 'leads.confirmSpam' : 'leads.confirmArchive';
    if (!window.confirm(t(confirmKey, { name: lead.full_name }))) return;

    setSaving(true);
    try {
      const updated = await updateLead(id, { status });
      setLead(updated);
      setFormData((prev) => ({ ...prev, status }));
      showSuccess(status === 'spam' ? t('leads.markedSpam') : t('leads.archived'));
    } catch (err) {
      showError(parseApiError(err));
    } finally {
      setSaving(false);
    }
  }, [id, lead, t, showSuccess, showError]);

  const handleCopyEmail = async () => {
    if (!lead?.email) return;
    try {
      await navigator.clipboard.writeText(lead.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      showError(t('leads.copyFailed'));
    }
  };

  if (loading) {
    return (
      <div className="leads-page leads-empty">
        <LoadingState />
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="leads-page leads-empty">
        <ErrorState
          message={error || t('leads.notFound')}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const statusChanged = formData.status !== lead.status;
  const priorityChanged = formData.priority !== lead.priority;
  const notesChanged = formData.internal_notes !== (lead.internal_notes || '');
  const canSave = statusChanged || priorityChanged || notesChanged;

  return (
    <div className="leads-page">
      <div className="leads-detail__top-bar">
        <Button
          variant="secondary"
          size="small"
          onClick={() => navigate('/leads')}
          className="leads-detail__back"
        >
          ← {t('leads.backToLeads')}
        </Button>

        <div className="leads-detail__actions">
          <Button variant="ghost" size="small" onClick={handleCopyEmail}>
            {copied ? t('leads.emailCopied') : t('leads.copyEmail')}
          </Button>
          <Button
            variant="secondary"
            size="small"
            as="a"
            href={`mailto:${lead.email}`}
          >
            {t('leads.openEmailClient')}
          </Button>
          {lead.status !== 'spam' && (
            <Button
              variant="warning"
              size="small"
              onClick={() => handleSetStatus('spam')}
              loading={saving}
            >
              {t('leads.markSpam')}
            </Button>
          )}
          {lead.status !== 'archived' && (
            <Button
              variant="secondary"
              size="small"
              onClick={() => handleSetStatus('archived')}
              loading={saving}
            >
              {t('leads.archive')}
            </Button>
          )}
        </div>
      </div>

      <div className="leads-detail__grid">
        <div className="leads-card">
          <section className="leads-detail__section">
            <div className="leads-detail__section-title">
              <span aria-hidden="true">👤</span>
              {lead.full_name}
            </div>
            <LeadsBadge type="status" value={lead.status} />
          </section>

          <section className="leads-detail__section">
            <h2 className="leads-detail__section-title">
              <span className="leads-detail__section-title-icon" aria-hidden="true">⊕</span>
              {t('leads.contactInfo')}
            </h2>
            <div className="leads-detail__fields">
              <InfoRow label={t('form.email')}>
                <a href={`mailto:${lead.email}`} className="leads-detail__link">{lead.email}</a>
              </InfoRow>
              {lead.phone && (
                <InfoRow label={t('form.phone')}>
                  <a href={`tel:${lead.phone}`} className="leads-detail__link">{lead.phone}</a>
                </InfoRow>
              )}
              {lead.company && (
                <InfoRow label={t('form.company')}>{lead.company}</InfoRow>
              )}
              {lead.job_title && (
                <InfoRow label={t('leads.jobTitle')}>{lead.job_title}</InfoRow>
              )}
              <InfoRow label={t('leads.inquiryType')}>{inquiryLabel}</InfoRow>
              {lead.subject && (
                <InfoRow label={t('leads.subject')}>{lead.subject}</InfoRow>
              )}
              <InfoRow label={t('form.date')}>{formatDate(lead.created_at, lang)}</InfoRow>
              {lead.language && (
                <InfoRow label={t('leads.language')}>{lead.language}</InfoRow>
              )}
              {lead.source_page && (
                <InfoRow label={t('leads.source')}>{lead.source_page}</InfoRow>
              )}
            </div>
          </section>

          <section className="leads-detail__section">
            <h2 className="leads-detail__section-title">
              <span className="leads-detail__section-title-icon" aria-hidden="true">✉</span>
              {t('leads.message')}
            </h2>
            <p className="leads-detail__value leads-detail__value--message">{lead.message || '-'}</p>
          </section>
        </div>

        <div className="leads-card">
          <h2 className="leads-detail__section-title">
            <span className="leads-detail__section-title-icon" aria-hidden="true">⚙</span>
            {t('leads.manageLead')}
          </h2>
          <div className="leads-detail__section leads-detail__section--internal">
            <h3 className="leads-detail__section-title">
              <span aria-hidden="true">🔒</span>
              {t('leads.internalNotes')}
            </h3>
            <Select
              label={t('leads.status')}
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {t(`status.${s}`) || s.replace(/_/g, ' ')}
                </option>
              ))}
            </Select>

            <Select
              label={t('leads.priority')}
              value={formData.priority}
              onChange={(e) => handleChange('priority', e.target.value)}
            >
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {t(`priority.${p}`) || p}
                </option>
              ))}
            </Select>

            <Textarea
              label={t('leads.internalNotes')}
              hint={t('leads.notesHint')}
              rows={6}
              value={formData.internal_notes}
              onChange={(e) => handleChange('internal_notes', e.target.value)}
            />

            <div className="leads-detail__save-actions">
              {canSave && (
                <span className="leads-detail__unsaved" aria-live="polite">
                  <span aria-hidden="true">●</span>
                  {t('msg.unsavedIndicator')}
                </span>
              )}
              <Button
                variant="primary"
                onClick={handleSave}
                loading={saving}
                disabled={!canSave}
              >
                {t('action.save')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, children }) {
  return (
    <div className="leads-detail__field">
      <span className="leads-detail__label">{label}</span>
      <span className="leads-detail__value">{children}</span>
    </div>
  );
}
