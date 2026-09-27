/**
 * CMS Offer Campaign Form Page — /cms/training/offers/new and /cms/training/offers/:id
 *
 * Two sections:
 * 1. Campaign editor — title EN/AR, description EN/AR, default badge EN/AR,
 *    start/end dates, is_active, priority, SEO fields.
 * 2. Offer items manager (existing campaigns only) — add course, edit per-course
 *    overrides (badge/copy/CTA/order/promo price/price visibility/active),
 *    remove course, reorder with up/down controls.
 *
 * Staff never edit raw JSON; all item configuration is real form UI.
 * Price-leakage guard: show_promo_price_publicly defaults to off and the
 * field hint explains the Professional pricing policy.
 */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CMSLayout from '../../components/cms/layout/CMSLayout';
import CMSPageHeader from '../../components/cms/ui/CMSPageHeader';
import CMSButton from '../../components/cms/ui/CMSButton';
import { CMSInput, CMSTextarea, CMSCheckbox, CMSSelect } from '../../components/cms/ui/CMSFormInputs';
import CMSDialog from '../../components/cms/ui/CMSDialog';
import CMSConfirmDialog from '../../components/cms/ui/CMSConfirmDialog';
import { CMSLoadingState, CMSErrorState } from '../../components/cms/ui/CMSStateViews';
import { useAuth } from '../../contexts/AuthContext';
import { useCMSLang } from '../../contexts/CMSLanguageContext';
import { useToast } from '../../contexts/CMSToastContext';
import { parseApiError, extractFieldErrors } from '../../services/cms/cmsFetch';
import {
  getOfferCampaign,
  createOfferCampaign,
  updateOfferCampaign,
  addOfferItem,
  updateOfferItem,
  deleteOfferItem,
  reorderOfferItems,
} from '../../services/cms/offersApi';
import { listPrograms } from '../../services/cms/trainingApi';

const fieldGridStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '1rem',
};

const fullFieldStyle = { gridColumn: '1 / -1' };

const sectionCardStyle = {
  background: 'var(--cms-bg-surface)',
  border: '1px solid var(--cms-border-default)',
  borderRadius: 'var(--cms-radius-lg)',
  padding: '1.25rem',
  marginBottom: '1.25rem',
};

const itemRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.75rem 1rem',
  background: 'var(--cms-bg-input)',
  border: '1px solid var(--cms-border-subtle)',
  borderRadius: 'var(--cms-radius-md)',
  marginBottom: '0.5rem',
  flexWrap: 'wrap',
};

const EMPTY_CAMPAIGN = {
  slug: '',
  title_en: '',
  title_ar: '',
  description_en: '',
  description_ar: '',
  badge_en: '',
  badge_ar: '',
  start_date: '',
  end_date: '',
  is_active: false,
  priority: 0,
  seo_title_en: '',
  seo_title_ar: '',
  seo_description_en: '',
  seo_description_ar: '',
};

const EMPTY_ITEM = {
  program: '',
  badge_en: '',
  badge_ar: '',
  promotional_copy_en: '',
  promotional_copy_ar: '',
  cta_label_en: '',
  cta_label_ar: '',
  cta_url: '',
  display_order: 0,
  promo_price: '',
  promo_currency: 'EGP',
  show_promo_price_publicly: false,
  is_active: true,
};

function toDatetimeLocal(value) {
  if (!value) return '';
  try {
    const d = new Date(value);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return '';
  }
}

export default function CMSOfferFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;
  const { t } = useCMSLang();
  const { hasCapability } = useAuth();
  const { showSuccess, showError } = useToast();

  const canUpdate = hasCapability('training.update');

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const [campaign, setCampaign] = useState(EMPTY_CAMPAIGN);
  const [items, setItems] = useState([]);

  // Programs for the selector
  const [programs, setPrograms] = useState([]);

  // Item dialog state
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // null = adding
  const [itemForm, setItemForm] = useState(EMPTY_ITEM);
  const [itemErrors, setItemErrors] = useState({});
  const [itemSaving, setItemSaving] = useState(false);
  const [deleteItemTarget, setDeleteItemTarget] = useState(null);
  const [deletingItem, setDeletingItem] = useState(false);

  // ── Load campaign + programs ──
  const load = useCallback(async () => {
    if (isNew) return;
    setLoading(true);
    setError(null);
    try {
      const [data, programData] = await Promise.all([
        getOfferCampaign(id),
        listPrograms({ page_size: 100 }),
      ]);
      setCampaign({
        ...data,
        start_date: toDatetimeLocal(data.start_date),
        end_date: toDatetimeLocal(data.end_date),
      });
      setItems(data.items || []);
      setPrograms(programData.results || programData || []);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  }, [id, isNew]);

  useEffect(() => {
    if (isNew) {
      listPrograms({ page_size: 100 })
        .then((data) => setPrograms(data.results || data || []))
        .catch(() => {});
    } else {
      load();
    }
  }, [isNew, load]);

  // ── Campaign save ──
  const handleSave = async () => {
    setSaving(true);
    setFieldErrors({});
    try {
      const payload = { ...campaign };
      if (!payload.end_date) payload.end_date = null;
      const saved = isNew
        ? await createOfferCampaign(payload)
        : await updateOfferCampaign(id, payload);
      showSuccess(t('msg.saved'));
      if (isNew) {
        navigate(`/cms/training/offers/${saved.id}`, { replace: true });
      }
    } catch (err) {
      setFieldErrors(extractFieldErrors(err));
      showError(parseApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const updateField = (key, value) => setCampaign((prev) => ({ ...prev, [key]: value }));

  // ── Item dialog ──
  const openAddItem = () => {
    setEditingItem(null);
    setItemForm({ ...EMPTY_ITEM, display_order: items.length });
    setItemErrors({});
    setItemDialogOpen(true);
  };

  const openEditItem = (item) => {
    setEditingItem(item);
    setItemForm({
      program: item.program,
      badge_en: item.badge_en || '',
      badge_ar: item.badge_ar || '',
      promotional_copy_en: item.promotional_copy_en || '',
      promotional_copy_ar: item.promotional_copy_ar || '',
      cta_label_en: item.cta_label_en || '',
      cta_label_ar: item.cta_label_ar || '',
      cta_url: item.cta_url || '',
      display_order: item.display_order ?? 0,
      promo_price: item.promo_price ?? '',
      promo_currency: item.promo_currency || 'EGP',
      show_promo_price_publicly: Boolean(item.show_promo_price_publicly),
      is_active: item.is_active !== false,
    });
    setItemErrors({});
    setItemDialogOpen(true);
  };

  const handleSaveItem = async () => {
    setItemSaving(true);
    setItemErrors({});
    try {
      const payload = {
        ...itemForm,
        promo_price: itemForm.promo_price === '' ? null : itemForm.promo_price,
      };
      if (editingItem) {
        await updateOfferItem(editingItem.id, payload);
        showSuccess(t('msg.updated') || 'Updated');
      } else {
        await addOfferItem(id, payload);
        showSuccess(t('msg.saved'));
      }
      setItemDialogOpen(false);
      load();
    } catch (err) {
      setItemErrors(extractFieldErrors(err));
      showError(parseApiError(err));
    } finally {
      setItemSaving(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!deleteItemTarget) return;
    setDeletingItem(true);
    try {
      await deleteOfferItem(deleteItemTarget.id);
      showSuccess(t('msg.deleted'));
      setDeleteItemTarget(null);
      load();
    } catch (err) {
      showError(parseApiError(err));
    } finally {
      setDeletingItem(false);
    }
  };

  const moveItem = async (item, direction) => {
    const index = items.findIndex((i) => i.id === item.id);
    const swapIndex = index + direction;
    if (index < 0 || swapIndex < 0 || swapIndex >= items.length) return;
    const reordered = [...items];
    [reordered[index], reordered[swapIndex]] = [reordered[swapIndex], reordered[index]];
    setItems(reordered);
    try {
      await reorderOfferItems(id, reordered.map((i, idx) => ({ id: i.id, order: idx })));
    } catch (err) {
      showError(parseApiError(err));
      load();
    }
  };

  const programOptions = programs
    .filter((p) => p.status === 'active')
    .map((p) => ({ value: p.id, label: `${p.title_en}${p.branch ? ` (${p.branch})` : ''}` }));

  if (loading) return <CMSLayout><CMSLoadingState /></CMSLayout>;
  if (error) return <CMSLayout><CMSErrorState message={error} onRetry={load} /></CMSLayout>;

  return (
    <CMSLayout>
      <CMSPageHeader
        title={isNew ? 'New Offer Campaign' : `Edit: ${campaign.title_en || campaign.slug}`}
        onBack={() => navigate('/cms/training/offers')}
      />

      {/* ── Campaign fields ── */}
      <div style={sectionCardStyle}>
        <h3 style={{ margin: '0 0 1rem', fontSize: '0.9375rem', fontWeight: 600 }}>Campaign</h3>
        <div style={fieldGridStyle}>
          <CMSInput
            label={t('form.title') + ' (EN)'}
            value={campaign.title_en}
            onChange={(e) => updateField('title_en', e.target.value)}
            error={fieldErrors.title_en}
            disabled={!canUpdate}
            required
          />
          <CMSInput
            label={t('form.title') + ' (AR)'}
            value={campaign.title_ar}
            onChange={(e) => updateField('title_ar', e.target.value)}
            error={fieldErrors.title_ar}
            dir="rtl"
            disabled={!canUpdate}
          />
          <CMSInput
            label={t('form.slug')}
            value={campaign.slug}
            onChange={(e) => updateField('slug', e.target.value)}
            error={fieldErrors.slug}
            disabled={!canUpdate || !isNew}
            hint="Unique identifier, e.g. september-training-offers"
            required
          />
          <CMSCheckbox
            label="Active (visible when schedule window includes now)"
            checked={campaign.is_active}
            onChange={(e) => updateField('is_active', e.target.checked)}
            disabled={!canUpdate}
          />
          <CMSTextarea
            label="Description (EN) — global promotional message"
            value={campaign.description_en}
            onChange={(e) => updateField('description_en', e.target.value)}
            error={fieldErrors.description_en}
            rows={3}
            disabled={!canUpdate}
          />
          <CMSTextarea
            label="Description (AR)"
            value={campaign.description_ar}
            onChange={(e) => updateField('description_ar', e.target.value)}
            error={fieldErrors.description_ar}
            rows={3}
            dir="rtl"
            disabled={!canUpdate}
          />
          <CMSInput
            label="Default Badge (EN)"
            value={campaign.badge_en}
            onChange={(e) => updateField('badge_en', e.target.value)}
            error={fieldErrors.badge_en}
            maxLength={80}
            hint="e.g. Limited-Time Offer — items can override"
            disabled={!canUpdate}
          />
          <CMSInput
            label="Default Badge (AR)"
            value={campaign.badge_ar}
            onChange={(e) => updateField('badge_ar', e.target.value)}
            error={fieldErrors.badge_ar}
            dir="rtl"
            maxLength={80}
            disabled={!canUpdate}
          />
          <CMSInput
            label="Start Date"
            type="datetime-local"
            value={campaign.start_date}
            onChange={(e) => updateField('start_date', e.target.value)}
            error={fieldErrors.start_date}
            disabled={!canUpdate}
            required
          />
          <CMSInput
            label="End Date (empty = open-ended)"
            type="datetime-local"
            value={campaign.end_date}
            onChange={(e) => updateField('end_date', e.target.value)}
            error={fieldErrors.end_date}
            disabled={!canUpdate}
          />
          <CMSInput
            label="Priority (lower appears first)"
            type="number"
            value={campaign.priority}
            onChange={(e) => updateField('priority', Number(e.target.value))}
            error={fieldErrors.priority}
            disabled={!canUpdate}
          />
        </div>
      </div>

      {/* ── SEO ── */}
      <div style={sectionCardStyle}>
        <h3 style={{ margin: '0 0 1rem', fontSize: '0.9375rem', fontWeight: 600 }}>SEO</h3>
        <div style={fieldGridStyle}>
          <CMSInput
            label="SEO Title (EN)"
            value={campaign.seo_title_en}
            onChange={(e) => updateField('seo_title_en', e.target.value)}
            error={fieldErrors.seo_title_en}
            maxLength={255}
            disabled={!canUpdate}
          />
          <CMSInput
            label="SEO Title (AR)"
            value={campaign.seo_title_ar}
            onChange={(e) => updateField('seo_title_ar', e.target.value)}
            error={fieldErrors.seo_title_ar}
            dir="rtl"
            maxLength={255}
            disabled={!canUpdate}
          />
          <CMSTextarea
            label="SEO Description (EN)"
            value={campaign.seo_description_en}
            onChange={(e) => updateField('seo_description_en', e.target.value)}
            rows={2}
            disabled={!canUpdate}
          />
          <CMSTextarea
            label="SEO Description (AR)"
            value={campaign.seo_description_ar}
            onChange={(e) => updateField('seo_description_ar', e.target.value)}
            rows={2}
            dir="rtl"
            disabled={!canUpdate}
          />
        </div>
      </div>

      {canUpdate && (
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <CMSButton variant="primary" onClick={handleSave} loading={saving}>
            {t('action.save')}
          </CMSButton>
        </div>
      )}

      {/* ── Offer items manager (existing campaigns only) ── */}
      {!isNew && canUpdate && (
        <div style={sectionCardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600 }}>
              Courses in this campaign ({items.length})
            </h3>
            <CMSButton variant="primary" onClick={openAddItem}>+ Add Course</CMSButton>
          </div>

          {items.length === 0 && (
            <p style={{ color: 'var(--cms-text-muted)', fontSize: '0.8125rem' }}>
              No courses yet. Add courses to include them in this campaign.
            </p>
          )}

          {items.map((item, index) => (
            <div key={item.id} style={itemRowStyle}>
              <strong style={{ minWidth: '140px' }}>
                {item.program_title_en || item.program_title_ar}
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--cms-text-muted)' }}>
                {item.program_branch}
              </span>
              {item.badge_en && (
                <span style={{ fontSize: '0.6875rem', padding: '0.125rem 0.5rem', borderRadius: '9999px', background: 'var(--cms-accent-bg)', color: 'var(--cms-accent)' }}>
                  {item.badge_en}
                </span>
              )}
              {item.promo_price && (
                <span style={{ fontSize: '0.75rem' }}>
                  {item.show_promo_price_publicly
                    ? `${item.promo_price} ${item.promo_currency} (public)`
                    : `${item.promo_price} ${item.promo_currency} (hidden)`}
                </span>
              )}
              <span style={{ fontSize: '0.75rem', color: item.is_active ? 'var(--cms-success)' : 'var(--cms-text-muted)' }}>
                {item.is_active ? 'Active' : 'Disabled'}
              </span>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.375rem' }}>
                <CMSButton
                  variant="ghost"
                  onClick={() => moveItem(item, -1)}
                  disabled={index === 0}
                  aria-label="Move up"
                >↑</CMSButton>
                <CMSButton
                  variant="ghost"
                  onClick={() => moveItem(item, 1)}
                  disabled={index === items.length - 1}
                  aria-label="Move down"
                >↓</CMSButton>
                <CMSButton variant="ghost" onClick={() => openEditItem(item)}>
                  {t('action.edit')}
                </CMSButton>
                <CMSButton variant="danger" onClick={() => setDeleteItemTarget(item)}>
                  {t('action.delete')}
                </CMSButton>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Item add/edit dialog ── */}
      <CMSDialog
        open={itemDialogOpen}
        onClose={() => setItemDialogOpen(false)}
        title={editingItem ? `Edit: ${editingItem.program_title_en}` : 'Add Course to Campaign'}
        maxWidth="700px"
      >
        <div style={fieldGridStyle}>
          {!editingItem && (
            <CMSSelect
              label="Program"
              value={itemForm.program}
              onChange={(e) => setItemForm((prev) => ({ ...prev, program: e.target.value }))}
              error={itemErrors.program}
              required
            >
              <option value="">Select a course…</option>
              {programOptions.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </CMSSelect>
          )}
          <CMSInput
            label="Badge Override (EN)"
            value={itemForm.badge_en}
            onChange={(e) => setItemForm((prev) => ({ ...prev, badge_en: e.target.value }))}
            error={itemErrors.badge_en}
            maxLength={80}
            hint="Empty = use campaign default badge"
          />
          <CMSInput
            label="Badge Override (AR)"
            value={itemForm.badge_ar}
            onChange={(e) => setItemForm((prev) => ({ ...prev, badge_ar: e.target.value }))}
            error={itemErrors.badge_ar}
            dir="rtl"
            maxLength={80}
          />
          <CMSTextarea
            label="Promotional Copy Override (EN)"
            value={itemForm.promotional_copy_en}
            onChange={(e) => setItemForm((prev) => ({ ...prev, promotional_copy_en: e.target.value }))}
            error={itemErrors.promotional_copy_en}
            rows={2}
            hint="Empty = use campaign description"
          />
          <CMSTextarea
            label="Promotional Copy Override (AR)"
            value={itemForm.promotional_copy_ar}
            onChange={(e) => setItemForm((prev) => ({ ...prev, promotional_copy_ar: e.target.value }))}
            error={itemErrors.promotional_copy_ar}
            rows={2}
            dir="rtl"
          />
          <CMSInput
            label="CTA Label Override (EN)"
            value={itemForm.cta_label_en}
            onChange={(e) => setItemForm((prev) => ({ ...prev, cta_label_en: e.target.value }))}
            error={itemErrors.cta_label_en}
            maxLength={120}
          />
          <CMSInput
            label="CTA Label Override (AR)"
            value={itemForm.cta_label_ar}
            onChange={(e) => setItemForm((prev) => ({ ...prev, cta_label_ar: e.target.value }))}
            error={itemErrors.cta_label_ar}
            dir="rtl"
            maxLength={120}
          />
          <div style={fullFieldStyle}>
            <CMSInput
              label="CTA URL Override"
              value={itemForm.cta_url}
              onChange={(e) => setItemForm((prev) => ({ ...prev, cta_url: e.target.value }))}
              error={itemErrors.cta_url}
              maxLength={255}
              hint="Empty = course landing page. Must be an internal path or https:// URL."
            />
          </div>
          <CMSInput
            label="Promo Price (optional)"
            type="number"
            value={itemForm.promo_price}
            onChange={(e) => setItemForm((prev) => ({ ...prev, promo_price: e.target.value }))}
            error={itemErrors.promo_price}
            hint="Optional — offers can be promotional without a numeric price."
          />
          <CMSSelect
            label="Promo Currency"
            value={itemForm.promo_currency}
            onChange={(e) => setItemForm((prev) => ({ ...prev, promo_currency: e.target.value }))}
          >
            <option value="EGP">EGP</option>
            <option value="USD">USD</option>
          </CMSSelect>
          <div style={fullFieldStyle}>
            <CMSCheckbox
              label="Show promo price publicly (leave OFF for Professional courses — price on inquiry only)"
              checked={itemForm.show_promo_price_publicly}
              onChange={(e) => setItemForm((prev) => ({ ...prev, show_promo_price_publicly: e.target.checked }))}
            />
          </div>
          <div style={fullFieldStyle}>
            <CMSCheckbox
              label="Item active (disable a single course without ending the campaign)"
              checked={itemForm.is_active}
              onChange={(e) => setItemForm((prev) => ({ ...prev, is_active: e.target.checked }))}
            />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
          <CMSButton variant="ghost" onClick={() => setItemDialogOpen(false)}>
            {t('action.cancel')}
          </CMSButton>
          <CMSButton variant="primary" onClick={handleSaveItem} loading={itemSaving}>
            {t('action.save')}
          </CMSButton>
        </div>
      </CMSDialog>

      {/* ── Item delete confirm ── */}
      <CMSConfirmDialog
        open={Boolean(deleteItemTarget)}
        title={t('action.delete')}
        message={`Remove "${deleteItemTarget?.program_title_en}" from this campaign?`}
        confirmLabel={t('action.delete')}
        onConfirm={handleDeleteItem}
        onCancel={() => setDeleteItemTarget(null)}
        loading={deletingItem}
      />
    </CMSLayout>
  );
}
