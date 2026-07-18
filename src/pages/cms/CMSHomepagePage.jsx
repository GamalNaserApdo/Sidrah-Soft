/**
 * CMS Homepage Management Page — /cms/homepage
 *
 * Tabs: Hero, Foundation, Marquee, Industries, Layout, Section Headings
 * Reuses existing CMS components (CMSLayout, CMSFormInputs, CMSMediaField, etc.)
 */

import { useState, useEffect, useCallback } from 'react';
import CMSLayout from '../../components/cms/layout/CMSLayout';
import CMSPageHeader from '../../components/cms/ui/CMSPageHeader';
import { CMSLoadingState, CMSErrorState } from '../../components/cms/ui/CMSStateViews';
import CMSButton from '../../components/cms/ui/CMSButton';
import { CMSInput, CMSTextarea, CMSCheckbox } from '../../components/cms/ui/CMSFormInputs';
import CMSMediaField from '../../components/cms/ui/CMSMediaField';
import CMSDialog from '../../components/cms/ui/CMSDialog';
import CMSConfirmDialog from '../../components/cms/ui/CMSConfirmDialog';
import { useAuth } from '../../contexts/AuthContext';
import { useCMSLang } from '../../contexts/CMSLanguageContext';
import { useToast } from '../../contexts/CMSToastContext';
import { parseApiError, extractFieldErrors } from '../../services/cms/cmsFetch';
import {
  fetchHomepageSettings,
  updateHomepageSettings,
  listMarqueeItems,
  createMarqueeItem,
  updateMarqueeItem,
  deleteMarqueeItem,
  reorderMarqueeItems,
  listIndustries,
  createIndustry,
  updateIndustry,
  deleteIndustry,
  reorderIndustries,
  listSectionConfigs,
  updateSectionConfig,
  deleteSectionConfig,
  createSectionConfig,
} from '../../services/cms/homepageApi';

const TABS = ['hero', 'foundation', 'marquee', 'industries', 'layout', 'sectionHeadings'];

const tabStyle = (active) => ({
  padding: '0.5rem 1rem',
  fontSize: '0.8125rem',
  fontWeight: '500',
  color: active ? '#c9a96e' : '#888',
  background: active ? 'rgba(201, 169, 110, 0.08)' : 'transparent',
  border: 'none',
  borderBottom: active ? '2px solid #c9a96e' : '2px solid transparent',
  cursor: 'pointer',
  fontFamily: 'inherit',
  transition: '150ms ease',
});

const fieldGridStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '1rem',
};

const fullFieldStyle = {
  gridColumn: '1 / -1',
};

const sectionCardStyle = {
  background: '#0a0a14',
  border: '1px solid #2a2a3e',
  borderRadius: '8px',
  padding: '1.25rem',
  marginBottom: '1rem',
};

const listItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.75rem 1rem',
  background: '#0a0a14',
  border: '1px solid #2a2a3e',
  borderRadius: '6px',
  marginBottom: '0.5rem',
};

export default function CMSHomepagePage() {
  const { hasCapability } = useAuth();
  const { t } = useCMSLang();
  const { showSuccess, showError } = useToast();

  const canView = hasCapability('site_settings.view');
  const canEdit = hasCapability('site_settings.update');

  const [activeTab, setActiveTab] = useState('hero');
  const [settings, setSettings] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [dirty, setDirty] = useState(false);

  // Marquee state
  const [marqueeItems, setMarqueeItems] = useState([]);
  const [marqueeLoading, setMarqueeLoading] = useState(false);
  const [marqueeDialogOpen, setMarqueeDialogOpen] = useState(false);
  const [editingMarquee, setEditingMarquee] = useState(null);
  const [marqueeFormData, setMarqueeFormData] = useState({});
  const [marqueeDeleteTarget, setMarqueeDeleteTarget] = useState(null);

  // Industry state
  const [industries, setIndustries] = useState([]);
  const [industriesLoading, setIndustriesLoading] = useState(false);
  const [industryDialogOpen, setIndustryDialogOpen] = useState(false);
  const [editingIndustry, setEditingIndustry] = useState(null);
  const [industryFormData, setIndustryFormData] = useState({});
  const [industryDeleteTarget, setIndustryDeleteTarget] = useState(null);

  // Section config state
  const [sections, setSections] = useState([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [sectionDeleteTarget, setSectionDeleteTarget] = useState(null);

  // ── Load settings ──
  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHomepageSettings();
      setSettings(data);
      setFormData(data);
      setDirty(false);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Load marquee items ──
  const loadMarqueeItems = useCallback(async () => {
    setMarqueeLoading(true);
    try {
      const data = await listMarqueeItems({ page_size: 100 });
      setMarqueeItems(data.results || data);
    } catch {
      // Non-fatal
    } finally {
      setMarqueeLoading(false);
    }
  }, []);

  // ── Load industries ──
  const loadIndustries = useCallback(async () => {
    setIndustriesLoading(true);
    try {
      const data = await listIndustries({ page_size: 100 });
      setIndustries(data.results || data);
    } catch {
      // Non-fatal
    } finally {
      setIndustriesLoading(false);
    }
  }, []);

  // ── Load section configs ──
  const loadSections = useCallback(async () => {
    setSectionsLoading(true);
    try {
      const data = await listSectionConfigs();
      setSections(data.results || data);
    } catch {
      // Non-fatal
    } finally {
      setSectionsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (canView) {
      loadSettings();
      loadMarqueeItems();
      loadIndustries();
      loadSections();
    }
  }, [canView, loadSettings, loadMarqueeItems, loadIndustries, loadSections]);

  // ── Save settings (Hero, Foundation, Section Headings) ──
  const handleSaveSettings = async () => {
    setSaving(true);
    setFieldErrors({});
    try {
      const data = await updateHomepageSettings(formData);
      setSettings(data);
      setFormData(data);
      setDirty(false);
      showSuccess(t('homepage.settingsSaved'));
    } catch (err) {
      setFieldErrors(extractFieldErrors(err));
      showError(parseApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const updateField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  // ── Marquee CRUD ──
  const handleOpenMarqueeDialog = (item = null) => {
    setEditingMarquee(item);
    setMarqueeFormData(
      item
        ? { title_en: item.title_en, title_ar: item.title_ar, description_en: item.description_en, description_ar: item.description_ar, display_order: item.display_order, is_visible: item.is_visible }
        : { title_en: '', title_ar: '', description_en: '', description_ar: '', display_order: marqueeItems.length, is_visible: true }
    );
    setMarqueeDialogOpen(true);
  };

  const handleSaveMarquee = async () => {
    try {
      if (editingMarquee) {
        await updateMarqueeItem(editingMarquee.id, marqueeFormData);
        showSuccess(t('homepage.itemUpdated'));
      } else {
        await createMarqueeItem(marqueeFormData);
        showSuccess(t('homepage.itemCreated'));
      }
      setMarqueeDialogOpen(false);
      loadMarqueeItems();
    } catch (err) {
      showError(parseApiError(err));
    }
  };

  const handleDeleteMarquee = async () => {
    if (!marqueeDeleteTarget) return;
    try {
      await deleteMarqueeItem(marqueeDeleteTarget.id);
      showSuccess(t('homepage.itemDeleted'));
      setMarqueeDeleteTarget(null);
      loadMarqueeItems();
    } catch (err) {
      showError(parseApiError(err));
    }
  };

  // ── Industry CRUD ──
  const handleOpenIndustryDialog = (item = null) => {
    setEditingIndustry(item);
    setIndustryFormData(
      item
        ? {
            title_en: item.title_en,
            title_ar: item.title_ar,
            description_en: item.description_en,
            description_ar: item.description_ar,
            focus_areas_en: (item.focus_areas_en || []).join('\n'),
            focus_areas_ar: (item.focus_areas_ar || []).join('\n'),
            icon_id: item.icon?.id || null,
            icon: item.icon || null,
            display_order: item.display_order,
            is_visible: item.is_visible,
          }
        : {
            title_en: '',
            title_ar: '',
            description_en: '',
            description_ar: '',
            focus_areas_en: '',
            focus_areas_ar: '',
            icon_id: null,
            icon: null,
            display_order: industries.length,
            is_visible: true,
          }
    );
    setIndustryDialogOpen(true);
  };

  const handleSaveIndustry = async () => {
    const payload = {
      ...industryFormData,
      focus_areas_en: typeof industryFormData.focus_areas_en === 'string'
        ? industryFormData.focus_areas_en.split('\n').map((s) => s.trim()).filter(Boolean)
        : industryFormData.focus_areas_en,
      focus_areas_ar: typeof industryFormData.focus_areas_ar === 'string'
        ? industryFormData.focus_areas_ar.split('\n').map((s) => s.trim()).filter(Boolean)
        : industryFormData.focus_areas_ar,
    };
    delete payload.icon;
    try {
      if (editingIndustry) {
        await updateIndustry(editingIndustry.id, payload);
        showSuccess(t('homepage.itemUpdated'));
      } else {
        await createIndustry(payload);
        showSuccess(t('homepage.itemCreated'));
      }
      setIndustryDialogOpen(false);
      loadIndustries();
    } catch (err) {
      showError(parseApiError(err));
    }
  };

  const handleDeleteIndustry = async () => {
    if (!industryDeleteTarget) return;
    try {
      await deleteIndustry(industryDeleteTarget.id);
      showSuccess(t('homepage.itemDeleted'));
      setIndustryDeleteTarget(null);
      loadIndustries();
    } catch (err) {
      showError(parseApiError(err));
    }
  };

  // ── Section config update ──
  const handleSectionToggle = async (section) => {
    try {
      await updateSectionConfig(section.id, { is_visible: !section.is_visible });
      loadSections();
    } catch (err) {
      showError(parseApiError(err));
    }
  };

  const handleSectionOrderChange = async (section, newOrder) => {
    try {
      await updateSectionConfig(section.id, { display_order: parseInt(newOrder, 10) || 0 });
      loadSections();
    } catch (err) {
      showError(parseApiError(err));
    }
  };

  const handleDeleteSection = async () => {
    if (!sectionDeleteTarget) return;
    try {
      await deleteSectionConfig(sectionDeleteTarget.id);
      showSuccess(t('homepage.sectionDeleted'));
      setSectionDeleteTarget(null);
      loadSections();
    } catch (err) {
      showError(parseApiError(err));
    }
  };

  if (!canView) {
    return (
      <CMSLayout>
        <CMSErrorState message={t('homepage.loadFailed')} />
      </CMSLayout>
    );
  }

  if (loading) {
    return (
      <CMSLayout>
        <CMSLoadingState />
      </CMSLayout>
    );
  }

  if (error && !settings) {
    return (
      <CMSLayout>
        <CMSErrorState message={error} onRetry={loadSettings} />
      </CMSLayout>
    );
  }

  return (
    <CMSLayout>
      <CMSPageHeader title={t('homepage.title')} subtitle={t('homepage.subtitle')} />

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '0.25rem', borderBottom: '1px solid #1e1e2e', marginBottom: '1.5rem', overflowX: 'auto' }}>
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            style={tabStyle(activeTab === tab)}
            onClick={() => setActiveTab(tab)}
          >
            {t(`homepage.tab.${tab}`)}
          </button>
        ))}
      </div>

      {/* ── Hero Tab ── */}
      {activeTab === 'hero' && (
        <div style={sectionCardStyle}>
          <p style={{ fontSize: '0.75rem', color: '#666', marginBottom: '1rem' }}>
            {t('homepage.heroScopeNote')}
          </p>
          <div style={fieldGridStyle}>
            <div style={fullFieldStyle}>
              <CMSCheckbox
                label={t('homepage.heroEnabled')}
                checked={formData.hero_enabled ?? true}
                onChange={(e) => updateField('hero_enabled', e.target.checked)}
                disabled={!canEdit}
              />
            </div>
            <div style={fullFieldStyle}>
              <CMSCheckbox
                label={t('homepage.heroShowLocationCard')}
                checked={formData.hero_show_location_card ?? true}
                onChange={(e) => updateField('hero_show_location_card', e.target.checked)}
                disabled={!canEdit}
              />
            </div>
          </div>
          {canEdit && (
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
              <CMSButton variant="primary" onClick={handleSaveSettings} loading={saving} disabled={!dirty}>
                {t('action.save')}
              </CMSButton>
              {dirty && (
                <CMSButton variant="ghost" onClick={() => { setFormData(settings); setDirty(false); }}>
                  {t('action.cancel')}
                </CMSButton>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Foundation Tab ── */}
      {activeTab === 'foundation' && (
        <div style={sectionCardStyle}>
          <div style={fieldGridStyle}>
            <div style={fullFieldStyle}>
              <CMSCheckbox
                label={t('homepage.foundationEnabled')}
                checked={formData.foundation_enabled ?? true}
                onChange={(e) => updateField('foundation_enabled', e.target.checked)}
                disabled={!canEdit}
              />
            </div>
            <CMSInput
              label={t('homepage.foundationEyebrowEn')}
              value={formData.foundation_eyebrow_en || ''}
              onChange={(e) => updateField('foundation_eyebrow_en', e.target.value)}
              disabled={!canEdit}
              maxLength={80}
            />
            <CMSInput
              label={t('homepage.foundationEyebrowAr')}
              value={formData.foundation_eyebrow_ar || ''}
              onChange={(e) => updateField('foundation_eyebrow_ar', e.target.value)}
              disabled={!canEdit}
              dir="rtl"
              maxLength={80}
            />
            <CMSInput
              label={t('homepage.foundationHeadingEn')}
              value={formData.foundation_heading_en || ''}
              onChange={(e) => updateField('foundation_heading_en', e.target.value)}
              disabled={!canEdit}
              maxLength={200}
            />
            <CMSInput
              label={t('homepage.foundationHeadingAr')}
              value={formData.foundation_heading_ar || ''}
              onChange={(e) => updateField('foundation_heading_ar', e.target.value)}
              disabled={!canEdit}
              dir="rtl"
              maxLength={200}
            />
            <CMSTextarea
              label={t('homepage.foundationDescriptionEn')}
              value={formData.foundation_description_en || ''}
              onChange={(e) => updateField('foundation_description_en', e.target.value)}
              disabled={!canEdit}
              rows={3}
            />
            <CMSTextarea
              label={t('homepage.foundationDescriptionAr')}
              value={formData.foundation_description_ar || ''}
              onChange={(e) => updateField('foundation_description_ar', e.target.value)}
              disabled={!canEdit}
              dir="rtl"
              rows={3}
            />
            <CMSTextarea
              label={t('homepage.foundationProofPointsEn')}
              value={Array.isArray(formData.foundation_proof_points_en) ? formData.foundation_proof_points_en.join('\n') : ''}
              onChange={(e) => updateField('foundation_proof_points_en', e.target.value.split('\n').map((s) => s.trim()).filter(Boolean))}
              disabled={!canEdit}
              rows={4}
              hint={t('homepage.foundationProofPointsHint')}
            />
            <CMSTextarea
              label={t('homepage.foundationProofPointsAr')}
              value={Array.isArray(formData.foundation_proof_points_ar) ? formData.foundation_proof_points_ar.join('\n') : ''}
              onChange={(e) => updateField('foundation_proof_points_ar', e.target.value.split('\n').map((s) => s.trim()).filter(Boolean))}
              disabled={!canEdit}
              dir="rtl"
              rows={4}
              hint={t('homepage.foundationProofPointsHint')}
            />
            <CMSInput
              label={t('homepage.foundationCtaLabelEn')}
              value={formData.foundation_cta_label_en || ''}
              onChange={(e) => updateField('foundation_cta_label_en', e.target.value)}
              disabled={!canEdit}
              maxLength={60}
            />
            <CMSInput
              label={t('homepage.foundationCtaLabelAr')}
              value={formData.foundation_cta_label_ar || ''}
              onChange={(e) => updateField('foundation_cta_label_ar', e.target.value)}
              disabled={!canEdit}
              dir="rtl"
              maxLength={60}
            />
            <CMSInput
              label={t('homepage.foundationCtaTarget')}
              value={formData.foundation_cta_target || ''}
              onChange={(e) => updateField('foundation_cta_target', e.target.value)}
              disabled={!canEdit}
              maxLength={255}
              hint="#services"
            />
          </div>
          {canEdit && (
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
              <CMSButton variant="primary" onClick={handleSaveSettings} loading={saving} disabled={!dirty}>
                {t('action.save')}
              </CMSButton>
              {dirty && (
                <CMSButton variant="ghost" onClick={() => { setFormData(settings); setDirty(false); }}>
                  {t('action.cancel')}
                </CMSButton>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Marquee Tab ── */}
      {activeTab === 'marquee' && (
        <div>
          <div style={sectionCardStyle}>
            <div style={fieldGridStyle}>
              <CMSInput
                label={t('homepage.marqueeHeadingEn')}
                value={formData.marquee_heading_en || ''}
                onChange={(e) => updateField('marquee_heading_en', e.target.value)}
                disabled={!canEdit}
                maxLength={120}
              />
              <CMSInput
                label={t('homepage.marqueeHeadingAr')}
                value={formData.marquee_heading_ar || ''}
                onChange={(e) => updateField('marquee_heading_ar', e.target.value)}
                disabled={!canEdit}
                dir="rtl"
                maxLength={120}
              />
            </div>
            {canEdit && dirty && (
              <div style={{ marginTop: '1rem' }}>
                <CMSButton variant="primary" onClick={handleSaveSettings} loading={saving}>
                  {t('action.save')}
                </CMSButton>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.875rem', color: '#ccc', margin: 0 }}>Marquee Items</h3>
            {canEdit && (
              <CMSButton variant="primary" size="sm" onClick={() => handleOpenMarqueeDialog()}>
                {t('homepage.marqueeAddItem')}
              </CMSButton>
            )}
          </div>

          {marqueeLoading ? (
            <CMSLoadingState />
          ) : marqueeItems.length === 0 ? (
            <p style={{ color: '#555', fontSize: '0.8125rem' }}>{t('homepage.noItems')}</p>
          ) : (
            marqueeItems.map((item) => (
              <div key={item.id} style={listItemStyle}>
                <span style={{ fontSize: '0.75rem', color: '#555', minWidth: '24px' }}>{item.display_order}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.8125rem', color: '#ccc' }}>{item.title_en}</div>
                  {item.description_en && (
                    <div style={{ fontSize: '0.75rem', color: '#666' }}>{item.description_en}</div>
                  )}
                </div>
                {!item.is_visible && (
                  <span style={{ fontSize: '0.6875rem', color: '#555' }}>hidden</span>
                )}
                {canEdit && (
                  <>
                    <CMSButton variant="ghost" size="sm" onClick={() => handleOpenMarqueeDialog(item)}>
                      {t('action.edit')}
                    </CMSButton>
                    <CMSButton variant="danger" size="sm" onClick={() => setMarqueeDeleteTarget(item)}>
                      {t('action.delete')}
                    </CMSButton>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Industries Tab ── */}
      {activeTab === 'industries' && (
        <div>
          <div style={sectionCardStyle}>
            <div style={fieldGridStyle}>
              <CMSInput
                label={t('homepage.industriesHeadingEn')}
                value={formData.industries_heading_en || ''}
                onChange={(e) => updateField('industries_heading_en', e.target.value)}
                disabled={!canEdit}
                maxLength={200}
              />
              <CMSInput
                label={t('homepage.industriesHeadingAr')}
                value={formData.industries_heading_ar || ''}
                onChange={(e) => updateField('industries_heading_ar', e.target.value)}
                disabled={!canEdit}
                dir="rtl"
                maxLength={200}
              />
              <CMSTextarea
                label={t('homepage.industriesDescriptionEn')}
                value={formData.industries_description_en || ''}
                onChange={(e) => updateField('industries_description_en', e.target.value)}
                disabled={!canEdit}
                rows={2}
              />
              <CMSTextarea
                label={t('homepage.industriesDescriptionAr')}
                value={formData.industries_description_ar || ''}
                onChange={(e) => updateField('industries_description_ar', e.target.value)}
                disabled={!canEdit}
                dir="rtl"
                rows={2}
              />
            </div>
            {canEdit && dirty && (
              <div style={{ marginTop: '1rem' }}>
                <CMSButton variant="primary" onClick={handleSaveSettings} loading={saving}>
                  {t('action.save')}
                </CMSButton>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.875rem', color: '#ccc', margin: 0 }}>Industries</h3>
            {canEdit && (
              <CMSButton variant="primary" size="sm" onClick={() => handleOpenIndustryDialog()}>
                {t('homepage.industriesAdd')}
              </CMSButton>
            )}
          </div>

          {industriesLoading ? (
            <CMSLoadingState />
          ) : industries.length === 0 ? (
            <p style={{ color: '#555', fontSize: '0.8125rem' }}>{t('homepage.noItems')}</p>
          ) : (
            industries.map((item) => (
              <div key={item.id} style={listItemStyle}>
                <span style={{ fontSize: '0.75rem', color: '#555', minWidth: '24px' }}>{item.display_order}</span>
                {item.icon_url && (
                  <img src={item.icon_url} alt="" style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px' }} />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.8125rem', color: '#ccc' }}>{item.title_en}</div>
                  {item.description_en && (
                    <div style={{ fontSize: '0.75rem', color: '#666' }}>{item.description_en}</div>
                  )}
                </div>
                {!item.is_visible && (
                  <span style={{ fontSize: '0.6875rem', color: '#555' }}>hidden</span>
                )}
                {canEdit && (
                  <>
                    <CMSButton variant="ghost" size="sm" onClick={() => handleOpenIndustryDialog(item)}>
                      {t('action.edit')}
                    </CMSButton>
                    <CMSButton variant="danger" size="sm" onClick={() => setIndustryDeleteTarget(item)}>
                      {t('action.delete')}
                    </CMSButton>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Layout Tab ── */}
      {activeTab === 'layout' && (
        <div>
          <p style={{ fontSize: '0.75rem', color: '#666', marginBottom: '1rem' }}>{t('homepage.layoutHint')}</p>
          {sectionsLoading ? (
            <CMSLoadingState />
          ) : (
            sections.map((section) => (
              <div key={section.id} style={listItemStyle}>
                <span style={{ fontSize: '0.8125rem', color: '#ccc', flex: 1, textTransform: 'capitalize' }}>
                  {section.section_key.replace(/_/g, ' ')}
                </span>
                <input
                  type="number"
                  min="0"
                  value={section.display_order}
                  onChange={(e) => handleSectionOrderChange(section, e.target.value)}
                  disabled={!canEdit}
                  style={{
                    width: '60px',
                    padding: '0.25rem 0.5rem',
                    background: '#0a0a14',
                    border: '1px solid #2a2a3e',
                    borderRadius: '4px',
                    color: '#e0e0e0',
                    fontSize: '0.75rem',
                    textAlign: 'center',
                  }}
                />
                <CMSCheckbox
                  checked={section.is_visible}
                  onChange={() => handleSectionToggle(section)}
                  disabled={!canEdit}
                />
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Section Headings Tab ── */}
      {activeTab === 'sectionHeadings' && (
        <div style={sectionCardStyle}>
          <div style={fieldGridStyle}>
            <CMSInput
              label={t('homepage.partnersHeadingEn')}
              value={formData.partners_heading_en || ''}
              onChange={(e) => updateField('partners_heading_en', e.target.value)}
              disabled={!canEdit}
              maxLength={200}
            />
            <CMSInput
              label={t('homepage.partnersHeadingAr')}
              value={formData.partners_heading_ar || ''}
              onChange={(e) => updateField('partners_heading_ar', e.target.value)}
              disabled={!canEdit}
              dir="rtl"
              maxLength={200}
            />
            <CMSTextarea
              label={t('homepage.partnersDescriptionEn')}
              value={formData.partners_description_en || ''}
              onChange={(e) => updateField('partners_description_en', e.target.value)}
              disabled={!canEdit}
              rows={2}
            />
            <CMSTextarea
              label={t('homepage.partnersDescriptionAr')}
              value={formData.partners_description_ar || ''}
              onChange={(e) => updateField('partners_description_ar', e.target.value)}
              disabled={!canEdit}
              dir="rtl"
              rows={2}
            />
            <CMSInput
              label={t('homepage.caseStudiesHeadingEn')}
              value={formData.case_studies_heading_en || ''}
              onChange={(e) => updateField('case_studies_heading_en', e.target.value)}
              disabled={!canEdit}
              maxLength={200}
            />
            <CMSInput
              label={t('homepage.caseStudiesHeadingAr')}
              value={formData.case_studies_heading_ar || ''}
              onChange={(e) => updateField('case_studies_heading_ar', e.target.value)}
              disabled={!canEdit}
              dir="rtl"
              maxLength={200}
            />
            <CMSTextarea
              label={t('homepage.caseStudiesDescriptionEn')}
              value={formData.case_studies_description_en || ''}
              onChange={(e) => updateField('case_studies_description_en', e.target.value)}
              disabled={!canEdit}
              rows={2}
            />
            <CMSTextarea
              label={t('homepage.caseStudiesDescriptionAr')}
              value={formData.case_studies_description_ar || ''}
              onChange={(e) => updateField('case_studies_description_ar', e.target.value)}
              disabled={!canEdit}
              dir="rtl"
              rows={2}
            />
            <CMSInput
              label={t('homepage.insightsHeadingEn')}
              value={formData.insights_heading_en || ''}
              onChange={(e) => updateField('insights_heading_en', e.target.value)}
              disabled={!canEdit}
              maxLength={200}
            />
            <CMSInput
              label={t('homepage.insightsHeadingAr')}
              value={formData.insights_heading_ar || ''}
              onChange={(e) => updateField('insights_heading_ar', e.target.value)}
              disabled={!canEdit}
              dir="rtl"
              maxLength={200}
            />
            <CMSTextarea
              label={t('homepage.insightsDescriptionEn')}
              value={formData.insights_description_en || ''}
              onChange={(e) => updateField('insights_description_en', e.target.value)}
              disabled={!canEdit}
              rows={2}
            />
            <CMSTextarea
              label={t('homepage.insightsDescriptionAr')}
              value={formData.insights_description_ar || ''}
              onChange={(e) => updateField('insights_description_ar', e.target.value)}
              disabled={!canEdit}
              dir="rtl"
              rows={2}
            />
            <CMSInput
              label={t('homepage.careersHeadingEn')}
              value={formData.careers_heading_en || ''}
              onChange={(e) => updateField('careers_heading_en', e.target.value)}
              disabled={!canEdit}
              maxLength={200}
            />
            <CMSInput
              label={t('homepage.careersHeadingAr')}
              value={formData.careers_heading_ar || ''}
              onChange={(e) => updateField('careers_heading_ar', e.target.value)}
              disabled={!canEdit}
              dir="rtl"
              maxLength={200}
            />
            <CMSTextarea
              label={t('homepage.careersDescriptionEn')}
              value={formData.careers_description_en || ''}
              onChange={(e) => updateField('careers_description_en', e.target.value)}
              disabled={!canEdit}
              rows={2}
            />
            <CMSTextarea
              label={t('homepage.careersDescriptionAr')}
              value={formData.careers_description_ar || ''}
              onChange={(e) => updateField('careers_description_ar', e.target.value)}
              disabled={!canEdit}
              dir="rtl"
              rows={2}
            />
          </div>
          {canEdit && (
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
              <CMSButton variant="primary" onClick={handleSaveSettings} loading={saving} disabled={!dirty}>
                {t('action.save')}
              </CMSButton>
              {dirty && (
                <CMSButton variant="ghost" onClick={() => { setFormData(settings); setDirty(false); }}>
                  {t('action.cancel')}
                </CMSButton>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Marquee Dialog ── */}
      <CMSDialog
        open={marqueeDialogOpen}
        onClose={() => setMarqueeDialogOpen(false)}
        title={editingMarquee ? t('homepage.marqueeEditItem') : t('homepage.marqueeAddItem')}
        size="md"
        footer={
          <>
            <CMSButton variant="secondary" onClick={() => setMarqueeDialogOpen(false)}>
              {t('action.cancel')}
            </CMSButton>
            <CMSButton variant="primary" onClick={handleSaveMarquee}>
              {t('action.save')}
            </CMSButton>
          </>
        }
      >
        <div style={fieldGridStyle}>
          <CMSInput
            label={t('homepage.marqueeTitleEn')}
            value={marqueeFormData.title_en || ''}
            onChange={(e) => setMarqueeFormData((p) => ({ ...p, title_en: e.target.value }))}
            maxLength={120}
          />
          <CMSInput
            label={t('homepage.marqueeTitleAr')}
            value={marqueeFormData.title_ar || ''}
            onChange={(e) => setMarqueeFormData((p) => ({ ...p, title_ar: e.target.value }))}
            dir="rtl"
            maxLength={120}
          />
          <CMSInput
            label={t('homepage.marqueeDescriptionEn')}
            value={marqueeFormData.description_en || ''}
            onChange={(e) => setMarqueeFormData((p) => ({ ...p, description_en: e.target.value }))}
            maxLength={255}
          />
          <CMSInput
            label={t('homepage.marqueeDescriptionAr')}
            value={marqueeFormData.description_ar || ''}
            onChange={(e) => setMarqueeFormData((p) => ({ ...p, description_ar: e.target.value }))}
            dir="rtl"
            maxLength={255}
          />
          <CMSInput
            label={t('homepage.layoutOrder')}
            type="number"
            min="0"
            value={marqueeFormData.display_order ?? 0}
            onChange={(e) => setMarqueeFormData((p) => ({ ...p, display_order: parseInt(e.target.value, 10) || 0 }))}
          />
          <div style={{ display: 'flex', alignItems: 'center', paddingTop: '1.5rem' }}>
            <CMSCheckbox
              label={t('homepage.layoutVisible')}
              checked={marqueeFormData.is_visible ?? true}
              onChange={(e) => setMarqueeFormData((p) => ({ ...p, is_visible: e.target.checked }))}
            />
          </div>
        </div>
      </CMSDialog>

      {/* ── Industry Dialog ── */}
      <CMSDialog
        open={industryDialogOpen}
        onClose={() => setIndustryDialogOpen(false)}
        title={editingIndustry ? t('homepage.industriesEdit') : t('homepage.industriesAdd')}
        size="md"
        footer={
          <>
            <CMSButton variant="secondary" onClick={() => setIndustryDialogOpen(false)}>
              {t('action.cancel')}
            </CMSButton>
            <CMSButton variant="primary" onClick={handleSaveIndustry}>
              {t('action.save')}
            </CMSButton>
          </>
        }
      >
        <div style={fieldGridStyle}>
          <CMSInput
            label={t('homepage.industriesTitleEn')}
            value={industryFormData.title_en || ''}
            onChange={(e) => setIndustryFormData((p) => ({ ...p, title_en: e.target.value }))}
            maxLength={120}
          />
          <CMSInput
            label={t('homepage.industriesTitleAr')}
            value={industryFormData.title_ar || ''}
            onChange={(e) => setIndustryFormData((p) => ({ ...p, title_ar: e.target.value }))}
            dir="rtl"
            maxLength={120}
          />
          <CMSTextarea
            label={t('homepage.industriesDescriptionEn2')}
            value={industryFormData.description_en || ''}
            onChange={(e) => setIndustryFormData((p) => ({ ...p, description_en: e.target.value }))}
            rows={3}
          />
          <CMSTextarea
            label={t('homepage.industriesDescriptionAr2')}
            value={industryFormData.description_ar || ''}
            onChange={(e) => setIndustryFormData((p) => ({ ...p, description_ar: e.target.value }))}
            dir="rtl"
            rows={3}
          />
          <CMSTextarea
            label={t('homepage.industriesFocusAreasEn')}
            value={industryFormData.focus_areas_en || ''}
            onChange={(e) => setIndustryFormData((p) => ({ ...p, focus_areas_en: e.target.value }))}
            rows={3}
            hint={t('homepage.industriesFocusAreasHint')}
          />
          <CMSTextarea
            label={t('homepage.industriesFocusAreasAr')}
            value={industryFormData.focus_areas_ar || ''}
            onChange={(e) => setIndustryFormData((p) => ({ ...p, focus_areas_ar: e.target.value }))}
            dir="rtl"
            rows={3}
            hint={t('homepage.industriesFocusAreasHint')}
          />
          <div style={fullFieldStyle}>
            <CMSMediaField
              label={t('homepage.industriesIcon')}
              value={industryFormData.icon ? { url: industryFormData.icon.url, title: industryFormData.icon.title, alt_text: industryFormData.icon.alt_text } : null}
              onChange={(id) => setIndustryFormData((p) => ({ ...p, icon_id: id }))}
            />
          </div>
          <CMSInput
            label={t('homepage.layoutOrder')}
            type="number"
            min="0"
            value={industryFormData.display_order ?? 0}
            onChange={(e) => setIndustryFormData((p) => ({ ...p, display_order: parseInt(e.target.value, 10) || 0 }))}
          />
          <div style={{ display: 'flex', alignItems: 'center', paddingTop: '1.5rem' }}>
            <CMSCheckbox
              label={t('homepage.layoutVisible')}
              checked={industryFormData.is_visible ?? true}
              onChange={(e) => setIndustryFormData((p) => ({ ...p, is_visible: e.target.checked }))}
            />
          </div>
        </div>
      </CMSDialog>

      {/* ── Delete confirmations ── */}
      <CMSConfirmDialog
        open={!!marqueeDeleteTarget}
        onClose={() => setMarqueeDeleteTarget(null)}
        onConfirm={handleDeleteMarquee}
        message={t('homepage.marqueeConfirmDelete')}
      />
      <CMSConfirmDialog
        open={!!industryDeleteTarget}
        onClose={() => setIndustryDeleteTarget(null)}
        onConfirm={handleDeleteIndustry}
        message={t('homepage.industriesConfirmDelete')}
      />
    </CMSLayout>
  );
}
