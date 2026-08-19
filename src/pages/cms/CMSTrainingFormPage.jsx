import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import CMSLayout from '../../components/cms/layout/CMSLayout';
import CMSPageHeader from '../../components/cms/ui/CMSPageHeader';
import CMSButton from '../../components/cms/ui/CMSButton';
import { CMSInput, CMSTextarea, CMSSelect } from '../../components/cms/ui/CMSFormInputs';
import CMSMediaField from '../../components/cms/ui/CMSMediaField';
import { CMSLoadingState, CMSErrorState } from '../../components/cms/ui/CMSStateViews';
import { useAuth } from '../../contexts/AuthContext';
import { useCMSLang } from '../../contexts/CMSLanguageContext';
import { useToast } from '../../contexts/CMSToastContext';
import { getProgram, createProgram, updateProgram } from '../../services/cms/trainingApi';
import { parseApiError, extractFieldErrors } from '../../services/cms/cmsFetch';

const BRANCH_OPTIONS = [
  { value: 'professional', label: 'Professional Training' },
  { value: 'secondary', label: 'Secondary / Baccalaureate' },
];

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
];

const AUDIENCE_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'first_secondary', label: 'First Secondary' },
  { value: 'second_secondary', label: 'Second Secondary' },
  { value: 'baccalaureate', label: 'Baccalaureate' },
];

function emptyListString(rows) {
  return (rows || []).map((r) => (typeof r === 'string' ? r : (r.title || ''))).filter(Boolean).join('\n');
}

function parseListString(value) {
  return value.split('\n').map((line) => line.trim()).filter(Boolean).map((title) => ({ title }));
}

export default function CMSTrainingFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasCapability } = useAuth();
  const { t } = useCMSLang();
  const { showSuccess, showError } = useToast();

  const isEdit = !!id;
  const canCreate = hasCapability('training.create');
  const canUpdate = hasCapability('training.update');

  const [formData, setFormData] = useState({
    slug: '',
    branch: 'secondary',
    status: 'draft',
    title_en: '',
    title_ar: '',
    short_description_en: '',
    short_description_ar: '',
    overview_en: '',
    overview_ar: '',
    audience_levels: [],
    image: null,
    modules_en: '',
    modules_ar: '',
    skills_en: '',
    skills_ar: '',
    learning_outcomes_en: '',
    learning_outcomes_ar: '',
    practical_project_en: '',
    practical_project_ar: '',
    duration_en: '',
    duration_ar: '',
    format_en: '',
    format_ar: '',
    schedule_en: '',
    schedule_ar: '',
    cta_text_en: '',
    cta_text_ar: '',
    display_order: 0,
  });

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [dirty, setDirty] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProgram(id);
      setFormData({
        slug: data.slug || '',
        branch: data.branch || 'secondary',
        status: data.status || 'draft',
        title_en: data.title_en || '',
        title_ar: data.title_ar || '',
        short_description_en: data.short_description_en || '',
        short_description_ar: data.short_description_ar || '',
        overview_en: data.overview_en || '',
        overview_ar: data.overview_ar || '',
        audience_levels: data.audience_levels || [],
        image: data.image || null,
        modules_en: emptyListString(data.modules_en),
        modules_ar: emptyListString(data.modules_ar),
        skills_en: emptyListString(data.skills_en),
        skills_ar: emptyListString(data.skills_ar),
        learning_outcomes_en: emptyListString(data.learning_outcomes_en),
        learning_outcomes_ar: emptyListString(data.learning_outcomes_ar),
        practical_project_en: data.practical_project_en || '',
        practical_project_ar: data.practical_project_ar || '',
        duration_en: data.duration_en || '',
        duration_ar: data.duration_ar || '',
        format_en: data.format_en || '',
        format_ar: data.format_ar || '',
        schedule_en: data.schedule_en || '',
        schedule_ar: data.schedule_ar || '',
        cta_text_en: data.cta_text_en || '',
        cta_text_ar: data.cta_text_ar || '',
        display_order: data.display_order || 0,
      });
      setDirty(false);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (isEdit) load();
  }, [isEdit, load]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const toggleAudience = (value) => {
    setFormData((prev) => ({
      ...prev,
      audience_levels: prev.audience_levels.includes(value)
        ? prev.audience_levels.filter((v) => v !== value)
        : [...prev.audience_levels, value],
    }));
    setDirty(true);
  };

  const buildPayload = () => {
    const payload = { ...formData };
    if (payload.image && typeof payload.image === 'object') {
      payload.image = payload.image.id;
    }
    payload.modules_en = parseListString(payload.modules_en);
    payload.modules_ar = parseListString(payload.modules_ar);
    payload.skills_en = parseListString(payload.skills_en);
    payload.skills_ar = parseListString(payload.skills_ar);
    payload.learning_outcomes_en = parseListString(payload.learning_outcomes_en);
    payload.learning_outcomes_ar = parseListString(payload.learning_outcomes_ar);
    return payload;
  };

  const handleSave = async () => {
    setSaving(true);
    setFieldErrors({});
    try {
      const payload = buildPayload();
      if (isEdit) {
        await updateProgram(id, payload);
      } else {
        await createProgram(payload);
      }
      setDirty(false);
      showSuccess(t('msg.saved'));
      navigate('/cms/training');
    } catch (err) {
      const fe = extractFieldErrors(err);
      if (Object.keys(fe).length > 0) setFieldErrors(fe);
      showError(parseApiError(err));
    } finally {
      setSaving(false);
    }
  };

  if (isEdit && !canUpdate && !loading) {
    return <CMSLayout><CMSErrorState message={t('common.accessDenied')} /></CMSLayout>;
  }
  if (!isEdit && !canCreate && !loading) {
    return <CMSLayout><CMSErrorState message={t('common.accessDenied')} /></CMSLayout>;
  }

  return (
    <CMSLayout unsavedChanges={dirty}>
      <CMSPageHeader
        title={isEdit ? `${t('action.edit')} ${formData.title_en || t('training.title')}` : `${t('action.addNew')} ${t('training.title')}`}
        actions={
          <>
            <Link to="/cms/training">
              <CMSButton variant="secondary">{t('action.cancel')}</CMSButton>
            </Link>
            <CMSButton variant="primary" onClick={handleSave} loading={saving} disabled={!dirty && isEdit}>
              {t('action.save')}
            </CMSButton>
          </>
        }
      />

      {loading && <CMSLoadingState />}
      {error && <CMSErrorState message={error} onRetry={load} />}

      {!loading && !error && (
        <div style={styles.form}>
          <div className="cms-form-grid" style={styles.grid2}>
            <CMSSelect label={t('form.branch')} value={formData.branch} onChange={(e) => handleChange('branch', e.target.value)} error={fieldErrors.branch}>
              {BRANCH_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
            </CMSSelect>
            <CMSSelect label={t('form.status')} value={formData.status} onChange={(e) => handleChange('status', e.target.value)} error={fieldErrors.status}>
              {STATUS_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
            </CMSSelect>
          </div>

          <CMSInput label={t('form.slug')} required value={formData.slug} onChange={(e) => handleChange('slug', e.target.value)} error={fieldErrors.slug} hint={t('form.slugHint')} />

          <div className="cms-bilingual-row">
            <CMSInput label={`${t('form.title')} (${t('form.english')})`} required value={formData.title_en} onChange={(e) => handleChange('title_en', e.target.value)} error={fieldErrors.title_en} />
            <CMSInput label={`${t('form.title')} (${t('form.arabic')})`} value={formData.title_ar} onChange={(e) => handleChange('title_ar', e.target.value)} error={fieldErrors.title_ar} dir="rtl" />
          </div>

          <div className="cms-bilingual-row">
            <CMSTextarea label={`${t('form.shortDescription')} (${t('form.english')})`} value={formData.short_description_en} onChange={(e) => handleChange('short_description_en', e.target.value)} error={fieldErrors.short_description_en} rows={3} />
            <CMSTextarea label={`${t('form.shortDescription')} (${t('form.arabic')})`} value={formData.short_description_ar} onChange={(e) => handleChange('short_description_ar', e.target.value)} error={fieldErrors.short_description_ar} rows={3} dir="rtl" />
          </div>

          <div className="cms-bilingual-row">
            <CMSTextarea label={`${t('form.overview')} (${t('form.english')})`} value={formData.overview_en} onChange={(e) => handleChange('overview_en', e.target.value)} error={fieldErrors.overview_en} rows={5} />
            <CMSTextarea label={`${t('form.overview')} (${t('form.arabic')})`} value={formData.overview_ar} onChange={(e) => handleChange('overview_ar', e.target.value)} error={fieldErrors.overview_ar} rows={5} dir="rtl" />
          </div>

          <CMSMediaField
            label={t('form.image')}
            value={formData.image}
            onChange={(_id, asset) => handleChange('image', asset)}
            usageLabel="program-cover"
          />

          <div style={styles.audience}>
            <label style={styles.audienceLabel}>{t('form.audienceLevels')}</label>
            <div style={styles.audienceOptions}>
              {AUDIENCE_OPTIONS.map((o) => (
                <label key={o.value} style={styles.audienceOption}>
                  <input
                    type="checkbox"
                    checked={formData.audience_levels.includes(o.value)}
                    onChange={() => toggleAudience(o.value)}
                  />
                  <span>{o.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="cms-bilingual-row">
            <CMSTextarea label={`${t('form.modules')} (${t('form.english')})`} value={formData.modules_en} onChange={(e) => handleChange('modules_en', e.target.value)} error={fieldErrors.modules_en} rows={5} hint={t('form.listHint')} />
            <CMSTextarea label={`${t('form.modules')} (${t('form.arabic')})`} value={formData.modules_ar} onChange={(e) => handleChange('modules_ar', e.target.value)} error={fieldErrors.modules_ar} rows={5} dir="rtl" hint={t('form.listHint')} />
          </div>

          <div className="cms-bilingual-row">
            <CMSTextarea label={`${t('form.skills')} (${t('form.english')})`} value={formData.skills_en} onChange={(e) => handleChange('skills_en', e.target.value)} error={fieldErrors.skills_en} rows={4} hint={t('form.listHint')} />
            <CMSTextarea label={`${t('form.skills')} (${t('form.arabic')})`} value={formData.skills_ar} onChange={(e) => handleChange('skills_ar', e.target.value)} error={fieldErrors.skills_ar} rows={4} dir="rtl" hint={t('form.listHint')} />
          </div>

          <div className="cms-bilingual-row">
            <CMSTextarea label={`${t('form.learningOutcomes')} (${t('form.english')})`} value={formData.learning_outcomes_en} onChange={(e) => handleChange('learning_outcomes_en', e.target.value)} error={fieldErrors.learning_outcomes_en} rows={4} hint={t('form.listHint')} />
            <CMSTextarea label={`${t('form.learningOutcomes')} (${t('form.arabic')})`} value={formData.learning_outcomes_ar} onChange={(e) => handleChange('learning_outcomes_ar', e.target.value)} error={fieldErrors.learning_outcomes_ar} rows={4} dir="rtl" hint={t('form.listHint')} />
          </div>

          <div className="cms-bilingual-row">
            <CMSTextarea label={`${t('form.practicalProject')} (${t('form.english')})`} value={formData.practical_project_en} onChange={(e) => handleChange('practical_project_en', e.target.value)} error={fieldErrors.practical_project_en} rows={4} />
            <CMSTextarea label={`${t('form.practicalProject')} (${t('form.arabic')})`} value={formData.practical_project_ar} onChange={(e) => handleChange('practical_project_ar', e.target.value)} error={fieldErrors.practical_project_ar} rows={4} dir="rtl" />
          </div>

          <div className="cms-form-grid" style={styles.grid2}>
            <CMSInput label={`${t('form.duration')} (${t('form.english')})`} value={formData.duration_en} onChange={(e) => handleChange('duration_en', e.target.value)} error={fieldErrors.duration_en} />
            <CMSInput label={`${t('form.duration')} (${t('form.arabic')})`} value={formData.duration_ar} onChange={(e) => handleChange('duration_ar', e.target.value)} error={fieldErrors.duration_ar} dir="rtl" />
            <CMSInput label={`${t('form.format')} (${t('form.english')})`} value={formData.format_en} onChange={(e) => handleChange('format_en', e.target.value)} error={fieldErrors.format_en} />
            <CMSInput label={`${t('form.format')} (${t('form.arabic')})`} value={formData.format_ar} onChange={(e) => handleChange('format_ar', e.target.value)} error={fieldErrors.format_ar} dir="rtl" />
            <CMSInput label={`${t('form.ctaText')} (${t('form.english')})`} value={formData.cta_text_en} onChange={(e) => handleChange('cta_text_en', e.target.value)} error={fieldErrors.cta_text_en} />
            <CMSInput label={`${t('form.ctaText')} (${t('form.arabic')})`} value={formData.cta_text_ar} onChange={(e) => handleChange('cta_text_ar', e.target.value)} error={fieldErrors.cta_text_ar} dir="rtl" />
            <CMSInput label={t('form.displayOrder')} type="number" value={formData.display_order} onChange={(e) => handleChange('display_order', parseInt(e.target.value) || 0)} error={fieldErrors.display_order} />
          </div>

          <div className="cms-bilingual-row">
            <CMSTextarea label={`${t('form.schedule')} (${t('form.english')})`} value={formData.schedule_en} onChange={(e) => handleChange('schedule_en', e.target.value)} error={fieldErrors.schedule_en} rows={3} />
            <CMSTextarea label={`${t('form.schedule')} (${t('form.arabic')})`} value={formData.schedule_ar} onChange={(e) => handleChange('schedule_ar', e.target.value)} error={fieldErrors.schedule_ar} rows={3} dir="rtl" />
          </div>
        </div>
      )}
    </CMSLayout>
  );
}

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    maxWidth: '960px',
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  audience: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  audienceLabel: {
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: '#aaa',
  },
  audienceOptions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem 1.5rem',
  },
  audienceOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    fontSize: '0.875rem',
    color: '#ddd',
  },
};
