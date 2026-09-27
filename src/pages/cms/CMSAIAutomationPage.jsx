/**
 * CMS AI Automation Page — /cms/ai-automation
 *
 * Singleton page with page-level fields plus child collections:
 *   - Items (problems, solutions, use_cases, why) — CRUD via /items/
 *   - Process steps — CRUD via /process-steps/
 *   - FAQs — CRUD via /faqs/
 *
 * Uses collapsible sections for a practical long-form layout.
 */

import { useState, useEffect, useCallback } from 'react';
import CMSLayout from '../../components/cms/layout/CMSLayout';
import CMSPageHeader from '../../components/cms/ui/CMSPageHeader';
import { CMSLoadingState, CMSErrorState } from '../../components/cms/ui/CMSStateViews';
import CMSButton from '../../components/cms/ui/CMSButton';
import { CMSInput, CMSTextarea, CMSCheckbox } from '../../components/cms/ui/CMSFormInputs';
import CMSDialog from '../../components/cms/ui/CMSDialog';
import CMSConfirmDialog from '../../components/cms/ui/CMSConfirmDialog';
import { useAuth } from '../../contexts/AuthContext';
import { useCMSLang } from '../../contexts/CMSLanguageContext';
import { useToast } from '../../contexts/CMSToastContext';
import { parseApiError, extractFieldErrors } from '../../services/cms/cmsFetch';
import {
  getAIAutomationPage,
  updateAIAutomationPage,
  listItems,
  createItem,
  updateItem,
  deleteItem,
  listProcessSteps,
  createProcessStep,
  updateProcessStep,
  deleteProcessStep,
  listFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
} from '../../services/cms/aiAutomationApi';

// Item types grouped under the "Items" collection
const ITEM_TYPES = ['problems', 'solutions', 'use_cases', 'why'];

// Section header keys — each has _title_en/ar and _description_en/ar
const SECTION_HEADERS = ['problems', 'solutions', 'process', 'use_cases', 'why', 'faq'];

export default function CMSAIAutomationPage() {
  const { hasCapability } = useAuth();
  const { t } = useCMSLang();
  const { showSuccess, showError } = useToast();

  const canView = hasCapability('ai_automation.view');
  const canEdit = hasCapability('ai_automation.update');

  // Page-level state
  const [pageData, setPageData] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [dirty, setDirty] = useState(false);

  // Collapsible sections
  const [openSections, setOpenSections] = useState({
    hero: true,
    sectionHeaders: true,
    problems: true,
    solutions: true,
    process: true,
    use_cases: true,
    why: true,
    faq: true,
    finalCta: true,
  });

  // Items state (problems, solutions, use_cases, why)
  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemDialogType, setItemDialogType] = useState('problems');
  const [itemFormData, setItemFormData] = useState({});
  const [itemDeleteTarget, setItemDeleteTarget] = useState(null);

  // Process steps state
  const [processSteps, setProcessSteps] = useState([]);
  const [processLoading, setProcessLoading] = useState(false);
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [editingProcess, setEditingProcess] = useState(null);
  const [processFormData, setProcessFormData] = useState({});
  const [processDeleteTarget, setProcessDeleteTarget] = useState(null);

  // FAQ state
  const [faqs, setFaqs] = useState([]);
  const [faqLoading, setFaqLoading] = useState(false);
  const [faqDialogOpen, setFaqDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [faqFormData, setFaqFormData] = useState({});
  const [faqDeleteTarget, setFaqDeleteTarget] = useState(null);

  // ── Load page ──
  const loadPage = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAIAutomationPage();
      setPageData(data);
      setFormData(data);
      setDirty(false);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Load items ──
  const loadItems = useCallback(async () => {
    setItemsLoading(true);
    try {
      const data = await listItems({ page_size: 100 });
      setItems(data.results || data);
    } catch {
      // Non-fatal
    } finally {
      setItemsLoading(false);
    }
  }, []);

  // ── Load process steps ──
  const loadProcessSteps = useCallback(async () => {
    setProcessLoading(true);
    try {
      const data = await listProcessSteps({ page_size: 100 });
      setProcessSteps(data.results || data);
    } catch {
      // Non-fatal
    } finally {
      setProcessLoading(false);
    }
  }, []);

  // ── Load FAQs ──
  const loadFAQs = useCallback(async () => {
    setFaqLoading(true);
    try {
      const data = await listFAQs({ page_size: 100 });
      setFaqs(data.results || data);
    } catch {
      // Non-fatal
    } finally {
      setFaqLoading(false);
    }
  }, []);

  useEffect(() => {
    if (canView) {
      loadPage();
      loadItems();
      loadProcessSteps();
      loadFAQs();
    }
  }, [canView, loadPage, loadItems, loadProcessSteps, loadFAQs]);

  // ── Page-level field helpers ──
  const updateField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSavePage = async () => {
    setSaving(true);
    setFieldErrors({});
    try {
      const updated = await updateAIAutomationPage(formData);
      setPageData(updated);
      setFormData(updated);
      setDirty(false);
      showSuccess(t('msg.saved'));
    } catch (err) {
      const fieldErrs = extractFieldErrors(err);
      if (Object.keys(fieldErrs).length > 0) setFieldErrors(fieldErrs);
      showError(parseApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleCancelPage = () => {
    setFormData(pageData);
    setDirty(false);
    setFieldErrors({});
  };

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // ── Item CRUD ──
  const itemsByType = (type) => items.filter((it) => it.item_type === type);

  const handleOpenItemDialog = (type, item = null) => {
    setItemDialogType(type);
    setEditingItem(item);
    setItemFormData(
      item
        ? {
            item_type: type,
            title_en: item.title_en || '',
            title_ar: item.title_ar || '',
            description_en: item.description_en || '',
            description_ar: item.description_ar || '',
            display_order: item.display_order ?? itemsByType(type).length,
            is_active: item.is_active ?? true,
          }
        : {
            item_type: type,
            title_en: '',
            title_ar: '',
            description_en: '',
            description_ar: '',
            display_order: itemsByType(type).length,
            is_active: true,
          }
    );
    setItemDialogOpen(true);
  };

  const handleSaveItem = async () => {
    try {
      if (editingItem) {
        await updateItem(editingItem.id, itemFormData);
        showSuccess(t('msg.saved'));
      } else {
        await createItem(itemFormData);
        showSuccess(t('msg.created'));
      }
      setItemDialogOpen(false);
      loadItems();
    } catch (err) {
      showError(parseApiError(err));
    }
  };

  const handleDeleteItem = async () => {
    if (!itemDeleteTarget) return;
    try {
      await deleteItem(itemDeleteTarget.id);
      showSuccess(t('msg.deleted'));
      setItemDeleteTarget(null);
      loadItems();
    } catch (err) {
      showError(parseApiError(err));
    }
  };

  const handleItemMove = async (item, direction) => {
    const siblings = [...itemsByType(item.item_type)].sort((a, b) => a.display_order - b.display_order);
    const idx = siblings.findIndex((it) => it.id === item.id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= siblings.length) return;
    const swapItem = siblings[swapIdx];
    try {
      await updateItem(item.id, { display_order: swapItem.display_order });
      await updateItem(swapItem.id, { display_order: item.display_order });
      loadItems();
    } catch (err) {
      showError(parseApiError(err));
    }
  };

  // ── Process step CRUD ──
  const handleOpenProcessDialog = (step = null) => {
    setEditingProcess(step);
    setProcessFormData(
      step
        ? {
            title_en: step.title_en || '',
            title_ar: step.title_ar || '',
            description_en: step.description_en || '',
            description_ar: step.description_ar || '',
            display_order: step.display_order ?? processSteps.length,
            is_active: step.is_active ?? true,
          }
        : {
            title_en: '',
            title_ar: '',
            description_en: '',
            description_ar: '',
            display_order: processSteps.length,
            is_active: true,
          }
    );
    setProcessDialogOpen(true);
  };

  const handleSaveProcess = async () => {
    try {
      if (editingProcess) {
        await updateProcessStep(editingProcess.id, processFormData);
        showSuccess(t('msg.saved'));
      } else {
        await createProcessStep(processFormData);
        showSuccess(t('msg.created'));
      }
      setProcessDialogOpen(false);
      loadProcessSteps();
    } catch (err) {
      showError(parseApiError(err));
    }
  };

  const handleDeleteProcess = async () => {
    if (!processDeleteTarget) return;
    try {
      await deleteProcessStep(processDeleteTarget.id);
      showSuccess(t('msg.deleted'));
      setProcessDeleteTarget(null);
      loadProcessSteps();
    } catch (err) {
      showError(parseApiError(err));
    }
  };

  const handleProcessMove = async (step, direction) => {
    const sorted = [...processSteps].sort((a, b) => a.display_order - b.display_order);
    const idx = sorted.findIndex((s) => s.id === step.id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const swapStep = sorted[swapIdx];
    try {
      await updateProcessStep(step.id, { display_order: swapStep.display_order });
      await updateProcessStep(swapStep.id, { display_order: step.display_order });
      loadProcessSteps();
    } catch (err) {
      showError(parseApiError(err));
    }
  };

  // ── FAQ CRUD ──
  const handleOpenFaqDialog = (faq = null) => {
    setEditingFaq(faq);
    setFaqFormData(
      faq
        ? {
            question_en: faq.question_en || '',
            question_ar: faq.question_ar || '',
            answer_en: faq.answer_en || '',
            answer_ar: faq.answer_ar || '',
            display_order: faq.display_order ?? faqs.length,
            is_active: faq.is_active ?? true,
          }
        : {
            question_en: '',
            question_ar: '',
            answer_en: '',
            answer_ar: '',
            display_order: faqs.length,
            is_active: true,
          }
    );
    setFaqDialogOpen(true);
  };

  const handleSaveFaq = async () => {
    try {
      if (editingFaq) {
        await updateFAQ(editingFaq.id, faqFormData);
        showSuccess(t('msg.saved'));
      } else {
        await createFAQ(faqFormData);
        showSuccess(t('msg.created'));
      }
      setFaqDialogOpen(false);
      loadFAQs();
    } catch (err) {
      showError(parseApiError(err));
    }
  };

  const handleDeleteFaq = async () => {
    if (!faqDeleteTarget) return;
    try {
      await deleteFAQ(faqDeleteTarget.id);
      showSuccess(t('msg.deleted'));
      setFaqDeleteTarget(null);
      loadFAQs();
    } catch (err) {
      showError(parseApiError(err));
    }
  };

  const handleFaqMove = async (faq, direction) => {
    const sorted = [...faqs].sort((a, b) => a.display_order - b.display_order);
    const idx = sorted.findIndex((f) => f.id === faq.id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const swapFaq = sorted[swapIdx];
    try {
      await updateFAQ(faq.id, { display_order: swapFaq.display_order });
      await updateFAQ(swapFaq.id, { display_order: faq.display_order });
      loadFAQs();
    } catch (err) {
      showError(parseApiError(err));
    }
  };

  if (!canView) {
    return (
      <CMSLayout>
        <CMSErrorState message={t('siteSettings.permissionDenied')} />
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

  if (error && !pageData) {
    return (
      <CMSLayout>
        <CMSErrorState message={error} onRetry={loadPage} />
      </CMSLayout>
    );
  }

  return (
    <CMSLayout unsavedChanges={dirty}>
      <CMSPageHeader
        title="AI Automation Page"
        subtitle="Manage the AI Automation landing page content"
        actions={
          canEdit && (
            <CMSButton variant="primary" onClick={handleSavePage} loading={saving} disabled={!dirty}>
              {t('action.save')}
            </CMSButton>
          )
        }
      />

      <div style={styles.formContainer}>
        {/* ── Hero Section ── */}
        <CollapsibleSection
          title="Hero Section"
          isOpen={openSections.hero}
          onToggle={() => toggleSection('hero')}
        >
          <div className="cms-form-grid">
            <CMSInput
              label={`Eyebrow (${t('form.english')})`}
              value={formData.hero_eyebrow_en || ''}
              onChange={(e) => updateField('hero_eyebrow_en', e.target.value)}
              disabled={!canEdit}
              maxLength={80}
            />
            <CMSInput
              label={`Eyebrow (${t('form.arabic')})`}
              value={formData.hero_eyebrow_ar || ''}
              onChange={(e) => updateField('hero_eyebrow_ar', e.target.value)}
              disabled={!canEdit}
              dir="rtl"
              maxLength={80}
            />
            <CMSInput
              label={`Title (${t('form.english')})`}
              value={formData.hero_title_en || ''}
              onChange={(e) => updateField('hero_title_en', e.target.value)}
              error={fieldErrors.hero_title_en}
              disabled={!canEdit}
              maxLength={200}
            />
            <CMSInput
              label={`Title (${t('form.arabic')})`}
              value={formData.hero_title_ar || ''}
              onChange={(e) => updateField('hero_title_ar', e.target.value)}
              error={fieldErrors.hero_title_ar}
              disabled={!canEdit}
              dir="rtl"
              maxLength={200}
            />
          </div>
          <div style={{ marginTop: '1rem' }}>
            <CMSTextarea
              label={`Subtitle (${t('form.english')})`}
              value={formData.hero_subtitle_en || ''}
              onChange={(e) => updateField('hero_subtitle_en', e.target.value)}
              disabled={!canEdit}
              rows={2}
            />
          </div>
          <div style={{ marginTop: '1rem' }}>
            <CMSTextarea
              label={`Subtitle (${t('form.arabic')})`}
              value={formData.hero_subtitle_ar || ''}
              onChange={(e) => updateField('hero_subtitle_ar', e.target.value)}
              disabled={!canEdit}
              dir="rtl"
              rows={2}
            />
          </div>
          <div className="cms-form-grid" style={{ marginTop: '1rem' }}>
            <CMSInput
              label={`Primary CTA Label (${t('form.english')})`}
              value={formData.hero_cta_label_en || ''}
              onChange={(e) => updateField('hero_cta_label_en', e.target.value)}
              disabled={!canEdit}
              maxLength={60}
            />
            <CMSInput
              label={`Primary CTA Label (${t('form.arabic')})`}
              value={formData.hero_cta_label_ar || ''}
              onChange={(e) => updateField('hero_cta_label_ar', e.target.value)}
              disabled={!canEdit}
              dir="rtl"
              maxLength={60}
            />
            <CMSInput
              label="Primary CTA Destination"
              value={formData.hero_cta_destination || ''}
              onChange={(e) => updateField('hero_cta_destination', e.target.value)}
              disabled={!canEdit}
              maxLength={255}
              hint="#contact"
            />
            <CMSInput
              label={`Secondary CTA Label (${t('form.english')})`}
              value={formData.hero_secondary_cta_label_en || ''}
              onChange={(e) => updateField('hero_secondary_cta_label_en', e.target.value)}
              disabled={!canEdit}
              maxLength={60}
            />
            <CMSInput
              label={`Secondary CTA Label (${t('form.arabic')})`}
              value={formData.hero_secondary_cta_label_ar || ''}
              onChange={(e) => updateField('hero_secondary_cta_label_ar', e.target.value)}
              disabled={!canEdit}
              dir="rtl"
              maxLength={60}
            />
            <CMSInput
              label="Secondary CTA Destination"
              value={formData.hero_secondary_cta_destination || ''}
              onChange={(e) => updateField('hero_secondary_cta_destination', e.target.value)}
              disabled={!canEdit}
              maxLength={255}
              hint="#case-studies"
            />
          </div>
        </CollapsibleSection>

        {/* ── Section Headers ── */}
        <CollapsibleSection
          title="Section Headers"
          isOpen={openSections.sectionHeaders}
          onToggle={() => toggleSection('sectionHeaders')}
        >
          <p style={styles.helperText}>
            Titles and descriptions for each content section on the page.
          </p>
          {SECTION_HEADERS.map((section) => (
            <div key={section} style={styles.subSection}>
              <div style={styles.subSectionTitle}>{section.replace(/_/g, ' ')}</div>
              <div className="cms-form-grid">
                <CMSInput
                  label={`Title (${t('form.english')})`}
                  value={formData[`${section}_title_en`] || ''}
                  onChange={(e) => updateField(`${section}_title_en`, e.target.value)}
                  disabled={!canEdit}
                  maxLength={200}
                />
                <CMSInput
                  label={`Title (${t('form.arabic')})`}
                  value={formData[`${section}_title_ar`] || ''}
                  onChange={(e) => updateField(`${section}_title_ar`, e.target.value)}
                  disabled={!canEdit}
                  dir="rtl"
                  maxLength={200}
                />
                <CMSTextarea
                  label={`Description (${t('form.english')})`}
                  value={formData[`${section}_description_en`] || ''}
                  onChange={(e) => updateField(`${section}_description_en`, e.target.value)}
                  disabled={!canEdit}
                  rows={2}
                />
                <CMSTextarea
                  label={`Description (${t('form.arabic')})`}
                  value={formData[`${section}_description_ar`] || ''}
                  onChange={(e) => updateField(`${section}_description_ar`, e.target.value)}
                  disabled={!canEdit}
                  dir="rtl"
                  rows={2}
                />
              </div>
            </div>
          ))}
        </CollapsibleSection>

        {/* ── Repeatable item sections (problems, solutions, use_cases, why) ── */}
        {ITEM_TYPES.map((type) => (
          <CollapsibleSection
            key={type}
            title={`${type.replace(/_/g, ' ')} items`}
            isOpen={openSections[type]}
            onToggle={() => toggleSection(type)}
          >
            <ItemList
              items={itemsByType(type)}
              loading={itemsLoading}
              canEdit={canEdit}
              onAdd={() => handleOpenItemDialog(type)}
              onEdit={(item) => handleOpenItemDialog(type, item)}
              onDelete={(item) => setItemDeleteTarget(item)}
              onMoveUp={(item) => handleItemMove(item, 'up')}
              onMoveDown={(item) => handleItemMove(item, 'down')}
              t={t}
            />
          </CollapsibleSection>
        ))}

        {/* ── Process Steps ── */}
        <CollapsibleSection
          title="Process Steps"
          isOpen={openSections.process}
          onToggle={() => toggleSection('process')}
        >
          <ProcessList
            steps={processSteps}
            loading={processLoading}
            canEdit={canEdit}
            onAdd={() => handleOpenProcessDialog()}
            onEdit={(step) => handleOpenProcessDialog(step)}
            onDelete={(step) => setProcessDeleteTarget(step)}
            onMoveUp={(step) => handleProcessMove(step, 'up')}
            onMoveDown={(step) => handleProcessMove(step, 'down')}
            t={t}
          />
        </CollapsibleSection>

        {/* ── FAQs ── */}
        <CollapsibleSection
          title="FAQs"
          isOpen={openSections.faq}
          onToggle={() => toggleSection('faq')}
        >
          <FaqList
            faqs={faqs}
            loading={faqLoading}
            canEdit={canEdit}
            onAdd={() => handleOpenFaqDialog()}
            onEdit={(faq) => handleOpenFaqDialog(faq)}
            onDelete={(faq) => setFaqDeleteTarget(faq)}
            onMoveUp={(faq) => handleFaqMove(faq, 'up')}
            onMoveDown={(faq) => handleFaqMove(faq, 'down')}
            t={t}
          />
        </CollapsibleSection>

        {/* ── Final CTA ── */}
        <CollapsibleSection
          title="Final CTA"
          isOpen={openSections.finalCta}
          onToggle={() => toggleSection('finalCta')}
        >
          <div className="cms-form-grid">
            <CMSInput
              label={`Title (${t('form.english')})`}
              value={formData.final_cta_title_en || ''}
              onChange={(e) => updateField('final_cta_title_en', e.target.value)}
              disabled={!canEdit}
              maxLength={200}
            />
            <CMSInput
              label={`Title (${t('form.arabic')})`}
              value={formData.final_cta_title_ar || ''}
              onChange={(e) => updateField('final_cta_title_ar', e.target.value)}
              disabled={!canEdit}
              dir="rtl"
              maxLength={200}
            />
          </div>
          <div style={{ marginTop: '1rem' }}>
            <CMSTextarea
              label={`Text (${t('form.english')})`}
              value={formData.final_cta_text_en || ''}
              onChange={(e) => updateField('final_cta_text_en', e.target.value)}
              disabled={!canEdit}
              rows={2}
            />
          </div>
          <div style={{ marginTop: '1rem' }}>
            <CMSTextarea
              label={`Text (${t('form.arabic')})`}
              value={formData.final_cta_text_ar || ''}
              onChange={(e) => updateField('final_cta_text_ar', e.target.value)}
              disabled={!canEdit}
              dir="rtl"
              rows={2}
            />
          </div>
          <div className="cms-form-grid" style={{ marginTop: '1rem' }}>
            <CMSInput
              label={`Button Label (${t('form.english')})`}
              value={formData.final_cta_button_label_en || ''}
              onChange={(e) => updateField('final_cta_button_label_en', e.target.value)}
              disabled={!canEdit}
              maxLength={60}
            />
            <CMSInput
              label={`Button Label (${t('form.arabic')})`}
              value={formData.final_cta_button_label_ar || ''}
              onChange={(e) => updateField('final_cta_button_label_ar', e.target.value)}
              disabled={!canEdit}
              dir="rtl"
              maxLength={60}
            />
            <CMSInput
              label="Button Destination"
              value={formData.final_cta_button_destination || ''}
              onChange={(e) => updateField('final_cta_button_destination', e.target.value)}
              disabled={!canEdit}
              maxLength={255}
              hint="#contact"
            />
          </div>
        </CollapsibleSection>

        {/* ── Page save bar ── */}
        {canEdit && (
          <div style={styles.saveBar}>
            <CMSButton variant="primary" onClick={handleSavePage} loading={saving} disabled={!dirty}>
              {t('action.save')}
            </CMSButton>
            {dirty && (
              <CMSButton variant="ghost" onClick={handleCancelPage} disabled={saving}>
                {t('action.cancel')}
              </CMSButton>
            )}
            {dirty && <span style={styles.dirtyIndicator}>{t('msg.unsavedIndicator')}</span>}
          </div>
        )}
      </div>

      {/* ── Item Dialog ── */}
      <CMSDialog
        open={itemDialogOpen}
        onClose={() => setItemDialogOpen(false)}
        title={editingItem ? `Edit ${itemDialogType.replace(/_/g, ' ')} item` : `Add ${itemDialogType.replace(/_/g, ' ')} item`}
        size="md"
        footer={
          <>
            <CMSButton variant="secondary" onClick={() => setItemDialogOpen(false)}>
              {t('action.cancel')}
            </CMSButton>
            <CMSButton variant="primary" onClick={handleSaveItem}>
              {t('action.save')}
            </CMSButton>
          </>
        }
      >
        <div className="cms-form-grid">
          <CMSInput
            label={`Title (${t('form.english')})`}
            value={itemFormData.title_en || ''}
            onChange={(e) => setItemFormData((p) => ({ ...p, title_en: e.target.value }))}
            maxLength={200}
          />
          <CMSInput
            label={`Title (${t('form.arabic')})`}
            value={itemFormData.title_ar || ''}
            onChange={(e) => setItemFormData((p) => ({ ...p, title_ar: e.target.value }))}
            dir="rtl"
            maxLength={200}
          />
          <CMSTextarea
            label={`Description (${t('form.english')})`}
            value={itemFormData.description_en || ''}
            onChange={(e) => setItemFormData((p) => ({ ...p, description_en: e.target.value }))}
            rows={3}
          />
          <CMSTextarea
            label={`Description (${t('form.arabic')})`}
            value={itemFormData.description_ar || ''}
            onChange={(e) => setItemFormData((p) => ({ ...p, description_ar: e.target.value }))}
            dir="rtl"
            rows={3}
          />
          <CMSInput
            label={t('form.order')}
            type="number"
            min="0"
            value={itemFormData.display_order ?? 0}
            onChange={(e) => setItemFormData((p) => ({ ...p, display_order: parseInt(e.target.value, 10) || 0 }))}
          />
          <div style={{ display: 'flex', alignItems: 'center', paddingTop: '1.5rem' }}>
            <CMSCheckbox
              label={t('form.active')}
              checked={itemFormData.is_active ?? true}
              onChange={(e) => setItemFormData((p) => ({ ...p, is_active: e.target.checked }))}
            />
          </div>
        </div>
      </CMSDialog>

      {/* ── Process Step Dialog ── */}
      <CMSDialog
        open={processDialogOpen}
        onClose={() => setProcessDialogOpen(false)}
        title={editingProcess ? 'Edit Process Step' : 'Add Process Step'}
        size="md"
        footer={
          <>
            <CMSButton variant="secondary" onClick={() => setProcessDialogOpen(false)}>
              {t('action.cancel')}
            </CMSButton>
            <CMSButton variant="primary" onClick={handleSaveProcess}>
              {t('action.save')}
            </CMSButton>
          </>
        }
      >
        <div className="cms-form-grid">
          <CMSInput
            label={`Title (${t('form.english')})`}
            value={processFormData.title_en || ''}
            onChange={(e) => setProcessFormData((p) => ({ ...p, title_en: e.target.value }))}
            maxLength={200}
          />
          <CMSInput
            label={`Title (${t('form.arabic')})`}
            value={processFormData.title_ar || ''}
            onChange={(e) => setProcessFormData((p) => ({ ...p, title_ar: e.target.value }))}
            dir="rtl"
            maxLength={200}
          />
          <CMSTextarea
            label={`Description (${t('form.english')})`}
            value={processFormData.description_en || ''}
            onChange={(e) => setProcessFormData((p) => ({ ...p, description_en: e.target.value }))}
            rows={3}
          />
          <CMSTextarea
            label={`Description (${t('form.arabic')})`}
            value={processFormData.description_ar || ''}
            onChange={(e) => setProcessFormData((p) => ({ ...p, description_ar: e.target.value }))}
            dir="rtl"
            rows={3}
          />
          <CMSInput
            label={t('form.order')}
            type="number"
            min="0"
            value={processFormData.display_order ?? 0}
            onChange={(e) => setProcessFormData((p) => ({ ...p, display_order: parseInt(e.target.value, 10) || 0 }))}
          />
          <div style={{ display: 'flex', alignItems: 'center', paddingTop: '1.5rem' }}>
            <CMSCheckbox
              label={t('form.active')}
              checked={processFormData.is_active ?? true}
              onChange={(e) => setProcessFormData((p) => ({ ...p, is_active: e.target.checked }))}
            />
          </div>
        </div>
      </CMSDialog>

      {/* ── FAQ Dialog ── */}
      <CMSDialog
        open={faqDialogOpen}
        onClose={() => setFaqDialogOpen(false)}
        title={editingFaq ? 'Edit FAQ' : 'Add FAQ'}
        size="md"
        footer={
          <>
            <CMSButton variant="secondary" onClick={() => setFaqDialogOpen(false)}>
              {t('action.cancel')}
            </CMSButton>
            <CMSButton variant="primary" onClick={handleSaveFaq}>
              {t('action.save')}
            </CMSButton>
          </>
        }
      >
        <div className="cms-form-grid">
          <CMSInput
            label={`Question (${t('form.english')})`}
            value={faqFormData.question_en || ''}
            onChange={(e) => setFaqFormData((p) => ({ ...p, question_en: e.target.value }))}
            maxLength={300}
          />
          <CMSInput
            label={`Question (${t('form.arabic')})`}
            value={faqFormData.question_ar || ''}
            onChange={(e) => setFaqFormData((p) => ({ ...p, question_ar: e.target.value }))}
            dir="rtl"
            maxLength={300}
          />
          <CMSTextarea
            label={`Answer (${t('form.english')})`}
            value={faqFormData.answer_en || ''}
            onChange={(e) => setFaqFormData((p) => ({ ...p, answer_en: e.target.value }))}
            rows={4}
          />
          <CMSTextarea
            label={`Answer (${t('form.arabic')})`}
            value={faqFormData.answer_ar || ''}
            onChange={(e) => setFaqFormData((p) => ({ ...p, answer_ar: e.target.value }))}
            dir="rtl"
            rows={4}
          />
          <CMSInput
            label={t('form.order')}
            type="number"
            min="0"
            value={faqFormData.display_order ?? 0}
            onChange={(e) => setFaqFormData((p) => ({ ...p, display_order: parseInt(e.target.value, 10) || 0 }))}
          />
          <div style={{ display: 'flex', alignItems: 'center', paddingTop: '1.5rem' }}>
            <CMSCheckbox
              label={t('form.active')}
              checked={faqFormData.is_active ?? true}
              onChange={(e) => setFaqFormData((p) => ({ ...p, is_active: e.target.checked }))}
            />
          </div>
        </div>
      </CMSDialog>

      {/* ── Delete confirmations ── */}
      <CMSConfirmDialog
        open={!!itemDeleteTarget}
        onClose={() => setItemDeleteTarget(null)}
        onConfirm={handleDeleteItem}
        message={t('confirm.delete.message', { name: itemDeleteTarget?.title_en || itemDeleteTarget?.title_ar })}
      />
      <CMSConfirmDialog
        open={!!processDeleteTarget}
        onClose={() => setProcessDeleteTarget(null)}
        onConfirm={handleDeleteProcess}
        message={t('confirm.delete.message', { name: processDeleteTarget?.title_en || processDeleteTarget?.title_ar })}
      />
      <CMSConfirmDialog
        open={!!faqDeleteTarget}
        onClose={() => setFaqDeleteTarget(null)}
        onConfirm={handleDeleteFaq}
        message={t('confirm.delete.message', { name: faqDeleteTarget?.question_en || faqDeleteTarget?.question_ar })}
      />
    </CMSLayout>
  );
}

/* ── Collapsible Section ── */
function CollapsibleSection({ title, isOpen, onToggle, children }) {
  return (
    <div style={styles.section}>
      <button type="button" style={styles.sectionHeader} onClick={onToggle}>
        <span style={styles.sectionTitle}>{title}</span>
        <span style={styles.chevron}>{isOpen ? '▾' : '▸'}</span>
      </button>
      {isOpen && <div style={styles.sectionBody}>{children}</div>}
    </div>
  );
}

/* ── Item List (problems, solutions, use_cases, why) ── */
function ItemList({ items, loading, canEdit, onAdd, onEdit, onDelete, onMoveUp, onMoveDown, t }) {
  const sorted = [...items].sort((a, b) => a.display_order - b.display_order);
  return (
    <div>
      <div style={styles.listHeader}>
        <span style={styles.listCount}>{sorted.length} item(s)</span>
        {canEdit && (
          <CMSButton variant="primary" size="sm" onClick={onAdd}>
            {t('action.addNew')}
          </CMSButton>
        )}
      </div>
      {loading ? (
        <CMSLoadingState />
      ) : sorted.length === 0 ? (
        <p style={styles.muted}>{t('state.empty')}</p>
      ) : (
        sorted.map((item, idx) => (
          <ListItemRow
            key={item.id}
            title={item.title_en || item.title_ar}
            subtitle={item.description_en}
            order={item.display_order}
            hidden={!item.is_active}
            canEdit={canEdit}
            isFirst={idx === 0}
            isLast={idx === sorted.length - 1}
            onEdit={() => onEdit(item)}
            onDelete={() => onDelete(item)}
            onMoveUp={() => onMoveUp(item)}
            onMoveDown={() => onMoveDown(item)}
            t={t}
          />
        ))
      )}
    </div>
  );
}

/* ── Process List ── */
function ProcessList({ steps, loading, canEdit, onAdd, onEdit, onDelete, onMoveUp, onMoveDown, t }) {
  const sorted = [...steps].sort((a, b) => a.display_order - b.display_order);
  return (
    <div>
      <div style={styles.listHeader}>
        <span style={styles.listCount}>{sorted.length} step(s)</span>
        {canEdit && (
          <CMSButton variant="primary" size="sm" onClick={onAdd}>
            {t('action.addNew')}
          </CMSButton>
        )}
      </div>
      {loading ? (
        <CMSLoadingState />
      ) : sorted.length === 0 ? (
        <p style={styles.muted}>{t('state.empty')}</p>
      ) : (
        sorted.map((step, idx) => (
          <ListItemRow
            key={step.id}
            title={step.title_en || step.title_ar}
            subtitle={step.description_en}
            order={step.display_order}
            hidden={!step.is_active}
            canEdit={canEdit}
            isFirst={idx === 0}
            isLast={idx === sorted.length - 1}
            onEdit={() => onEdit(step)}
            onDelete={() => onDelete(step)}
            onMoveUp={() => onMoveUp(step)}
            onMoveDown={() => onMoveDown(step)}
            t={t}
          />
        ))
      )}
    </div>
  );
}

/* ── FAQ List ── */
function FaqList({ faqs, loading, canEdit, onAdd, onEdit, onDelete, onMoveUp, onMoveDown, t }) {
  const sorted = [...faqs].sort((a, b) => a.display_order - b.display_order);
  return (
    <div>
      <div style={styles.listHeader}>
        <span style={styles.listCount}>{sorted.length} FAQ(s)</span>
        {canEdit && (
          <CMSButton variant="primary" size="sm" onClick={onAdd}>
            {t('action.addNew')}
          </CMSButton>
        )}
      </div>
      {loading ? (
        <CMSLoadingState />
      ) : sorted.length === 0 ? (
        <p style={styles.muted}>{t('state.empty')}</p>
      ) : (
        sorted.map((faq, idx) => (
          <ListItemRow
            key={faq.id}
            title={faq.question_en || faq.question_ar}
            subtitle={faq.answer_en}
            order={faq.display_order}
            hidden={!faq.is_active}
            canEdit={canEdit}
            isFirst={idx === 0}
            isLast={idx === sorted.length - 1}
            onEdit={() => onEdit(faq)}
            onDelete={() => onDelete(faq)}
            onMoveUp={() => onMoveUp(faq)}
            onMoveDown={() => onMoveDown(faq)}
            t={t}
          />
        ))
      )}
    </div>
  );
}

/* ── Generic list row ── */
function ListItemRow({ title, subtitle, order, hidden, canEdit, isFirst, isLast, onEdit, onDelete, onMoveUp, onMoveDown, t }) {
  return (
    <div style={styles.listItem}>
      <span style={styles.orderBadge}>{order}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={styles.itemTitle}>{title}</div>
        {subtitle && <div style={styles.itemSubtitle}>{subtitle}</div>}
      </div>
      {hidden && <span style={styles.hiddenTag}>hidden</span>}
      {canEdit && (
        <div style={styles.rowActions}>
          <CMSButton variant="ghost" size="sm" onClick={onMoveUp} disabled={isFirst}>
            ↑
          </CMSButton>
          <CMSButton variant="ghost" size="sm" onClick={onMoveDown} disabled={isLast}>
            ↓
          </CMSButton>
          <CMSButton variant="ghost" size="sm" onClick={onEdit}>
            {t('action.edit')}
          </CMSButton>
          <CMSButton variant="danger" size="sm" onClick={onDelete}>
            {t('action.delete')}
          </CMSButton>
        </div>
      )}
    </div>
  );
}

const styles = {
  formContainer: { maxWidth: '860px' },
  section: {
    background: 'var(--cms-bg-surface)',
    border: '1px solid var(--cms-border-default)',
    borderRadius: 'var(--cms-radius-lg)',
    marginBottom: '1rem',
    overflow: 'hidden',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: '1rem 1.25rem',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'start',
  },
  sectionTitle: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'var(--cms-accent)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  chevron: {
    fontSize: '0.75rem',
    color: 'var(--cms-text-muted)',
  },
  sectionBody: {
    padding: '0 1.25rem 1.25rem',
  },
  helperText: {
    fontSize: '0.75rem',
    color: 'var(--cms-text-muted)',
    marginBottom: '1rem',
  },
  subSection: {
    paddingTop: '1rem',
    borderTop: '1px solid var(--cms-border-subtle)',
    marginTop: '1rem',
  },
  subSectionTitle: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'var(--cms-text-secondary)',
    textTransform: 'capitalize',
    marginBottom: '0.75rem',
  },
  listHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  listCount: {
    fontSize: '0.75rem',
    color: 'var(--cms-text-muted)',
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    background: 'var(--cms-bg-input)',
    border: '1px solid var(--cms-border-subtle)',
    borderRadius: 'var(--cms-radius-md)',
    marginBottom: '0.5rem',
  },
  orderBadge: {
    fontSize: '0.75rem',
    color: 'var(--cms-text-muted)',
    minWidth: '24px',
    textAlign: 'center',
  },
  itemTitle: {
    fontSize: '0.8125rem',
    color: 'var(--cms-text-primary)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  itemSubtitle: {
    fontSize: '0.75rem',
    color: 'var(--cms-text-muted)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  hiddenTag: {
    fontSize: '0.6875rem',
    color: 'var(--cms-text-muted)',
  },
  rowActions: {
    display: 'flex',
    gap: '0.25rem',
    flexShrink: 0,
  },
  saveBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem 0',
  },
  dirtyIndicator: {
    fontSize: '0.75rem',
    color: 'var(--cms-warning, #f59e0b)',
  },
  muted: {
    color: 'var(--cms-text-muted)',
    fontSize: '0.8125rem',
  },
};
