/**
 * CMS Partner Form Page — /cms/partners/new and /cms/partners/:id
 *
 * Create and edit partner records.
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import CMSLayout from '../../components/cms/layout/CMSLayout';
import CMSPageHeader from '../../components/cms/ui/CMSPageHeader';
import CMSButton from '../../components/cms/ui/CMSButton';
import { CMSInput, CMSTextarea, CMSCheckbox, CMSSelect } from '../../components/cms/ui/CMSFormInputs';
import CMSMediaField from '../../components/cms/ui/CMSMediaField';
import { CMSLoadingState, CMSErrorState } from '../../components/cms/ui/CMSStateViews';
import { useAuth } from '../../contexts/AuthContext';
import { useCMSLang } from '../../contexts/CMSLanguageContext';
import { useToast } from '../../contexts/CMSToastContext';
import { getPartner, createPartner, updatePartner } from '../../services/cms/partnersApi';
import { parseApiError, extractFieldErrors } from '../../services/cms/cmsFetch';

export default function CMSPartnerFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasCapability } = useAuth();
  const { t } = useCMSLang();
  const { showSuccess, showError } = useToast();

  const isEdit = !!id;
  const canCreate = hasCapability('partners.create');
  const canUpdate = hasCapability('partners.update');

  const [formData, setFormData] = useState({
    name_en: '', name_ar: '', slug: '',
    description_en: '', description_ar: '',
    logo: null,
    website_url: '', open_in_new_tab: true,
    partner_type: 'partner', display_order: 0,
    is_featured: false, is_active: true,
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
      const data = await getPartner(id);
      setFormData({
        name_en: data.name_en || '', name_ar: data.name_ar || '', slug: data.slug || '',
        description_en: data.description_en || '', description_ar: data.description_ar || '',
        logo: data.logo || null,
        website_url: data.website_url || '', open_in_new_tab: data.open_in_new_tab ?? true,
        partner_type: data.partner_type || 'partner', display_order: data.display_order || 0,
        is_featured: data.is_featured ?? false, is_active: data.is_active ?? true,
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

  const handleSave = async () => {
    setSaving(true);
    setFieldErrors({});
    try {
      const payload = { ...formData };
      // Send logo as ID
      if (payload.logo && typeof payload.logo === 'object') {
        payload.logo = payload.logo.id;
      }
      if (isEdit) {
        await updatePartner(id, payload);
      } else {
        await createPartner(payload);
      }
      setDirty(false);
      showSuccess(t('msg.saved'));
      navigate('/cms/partners');
    } catch (err) {
      const fe = extractFieldErrors(err);
      if (Object.keys(fe).length > 0) setFieldErrors(fe);
      showError(parseApiError(err));
    } finally {
      setSaving(false);
    }
  };

  if (isEdit && !canUpdate && !loading) {
    return <CMSLayout><CMSErrorState message="You do not have permission to edit partners." /></CMSLayout>;
  }
  if (!isEdit && !canCreate && !loading) {
    return <CMSLayout><CMSErrorState message="You do not have permission to create partners." /></CMSLayout>;
  }

  return (
    <CMSLayout unsavedChanges={dirty}>
      <CMSPageHeader
        title={isEdit ? `${t('action.edit')} ${formData.name_en || 'Partner'}` : `${t('action.addNew')} ${t('nav.partners')}`}
        actions={
          <>
            <Link to="/cms/partners">
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
          <div className="cms-bilingual-row">
            <CMSInput label={`${t('form.name')} (${t('form.english')})`} required value={formData.name_en} onChange={(e) => handleChange('name_en', e.target.value)} error={fieldErrors.name_en} />
            <CMSInput label={`${t('form.name')} (${t('form.arabic')})`} value={formData.name_ar} onChange={(e) => handleChange('name_ar', e.target.value)} error={fieldErrors.name_ar} dir="rtl" />
          </div>

          <CMSInput label={t('form.slug')} required value={formData.slug} onChange={(e) => handleChange('slug', e.target.value)} error={fieldErrors.slug} hint="URL-friendly identifier" />

          <div className="cms-bilingual-row">
            <CMSTextarea label={`${t('form.description')} (${t('form.english')})`} value={formData.description_en} onChange={(e) => handleChange('description_en', e.target.value)} error={fieldErrors.description_en} rows={3} />
            <CMSTextarea label={`${t('form.description')} (${t('form.arabic')})`} value={formData.description_ar} onChange={(e) => handleChange('description_ar', e.target.value)} error={fieldErrors.description_ar} rows={3} dir="rtl" />
          </div>

          <CMSMediaField
            label={t('form.logo')}
            value={formData.logo}
            onChange={(_id, asset) => handleChange('logo', asset)}
            usageLabel="partner-logo"
          />

          <div className="cms-form-grid">
            <CMSInput label={t('form.websiteUrl')} value={formData.website_url} onChange={(e) => handleChange('website_url', e.target.value)} error={fieldErrors.website_url} />
            <CMSSelect label={t('form.partnerType')} value={formData.partner_type} onChange={(e) => handleChange('partner_type', e.target.value)} error={fieldErrors.partner_type}>
              <option value="partner">Partner</option>
              <option value="client">Client</option>
              <option value="technology">Technology Partner</option>
              <option value="strategic">Strategic Partner</option>
            </CMSSelect>
            <CMSInput label={t('form.order')} type="number" value={formData.display_order} onChange={(e) => handleChange('display_order', parseInt(e.target.value) || 0)} error={fieldErrors.display_order} />
          </div>

          <div style={styles.checkboxes}>
            <CMSCheckbox label={t('form.openInNewTab')} checked={formData.open_in_new_tab} onChange={(e) => handleChange('open_in_new_tab', e.target.checked)} />
            <CMSCheckbox label={t('form.featured')} checked={formData.is_featured} onChange={(e) => handleChange('is_featured', e.target.checked)} />
            <CMSCheckbox label={t('form.active')} checked={formData.is_active} onChange={(e) => handleChange('is_active', e.target.checked)} />
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
    maxWidth: '800px',
  },
  checkboxes: {
    display: 'flex',
    gap: '1.5rem',
    flexWrap: 'wrap',
  },
};
