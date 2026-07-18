/**
 * CMS Navigation Page — /cms/navigation
 *
 * Tabbed view: Menus CRUD + Items CRUD.
 */

import { useState, useCallback, useEffect } from 'react';
import CMSLayout from '../../components/cms/layout/CMSLayout';
import CMSPageHeader from '../../components/cms/ui/CMSPageHeader';
import { CMSTable, CMSTableRow, CMSTableCell, TableActionButton } from '../../components/cms/ui/CMSTable';
import CMSPagination from '../../components/cms/ui/CMSPagination';
import CMSButton from '../../components/cms/ui/CMSButton';
import CMSBadge, { StatusBadge } from '../../components/cms/ui/CMSBadge';
import CMSDialog from '../../components/cms/ui/CMSDialog';
import { CMSInput, CMSTextarea, CMSCheckbox, CMSSelect } from '../../components/cms/ui/CMSFormInputs';
import CMSMediaField from '../../components/cms/ui/CMSMediaField';
import { CMSLoadingState, CMSErrorState, CMSEmptyState } from '../../components/cms/ui/CMSStateViews';
import CMSConfirmDialog from '../../components/cms/ui/CMSConfirmDialog';
import { useCMSList } from '../../hooks/cms/useCMSList';
import { useAuth } from '../../contexts/AuthContext';
import { useCMSLang } from '../../contexts/CMSLanguageContext';
import { useToast } from '../../contexts/CMSToastContext';
import {
  listMenus, createMenu, updateMenu, deleteMenu,
  listItems, createItem, updateItem, deleteItem,
} from '../../services/cms/navigationApi';
import { parseApiError, extractFieldErrors } from '../../services/cms/cmsFetch';

export default function CMSNavigationPage() {
  const [tab, setTab] = useState('menus');
  const { hasCapability } = useAuth();
  const { t } = useCMSLang();
  const canCreate = hasCapability('navigation.create');
  const canUpdate = hasCapability('navigation.update');
  const canDelete = hasCapability('navigation.delete');

  return (
    <CMSLayout>
      <CMSPageHeader title={t('nav.navigation')} />
      <div style={styles.tabs}>
        <button style={{ ...styles.tab, ...(tab === 'menus' ? styles.tabActive : {}) }} onClick={() => setTab('menus')}>{t('nav.menu')}</button>
        <button style={{ ...styles.tab, ...(tab === 'items' ? styles.tabActive : {}) }} onClick={() => setTab('items')}>{t('nav.item')}</button>
      </div>
      {tab === 'menus' && <MenusTab canCreate={canCreate} canUpdate={canUpdate} canDelete={canDelete} t={t} />}
      {tab === 'items' && <ItemsTab canCreate={canCreate} canUpdate={canUpdate} canDelete={canDelete} t={t} />}
    </CMSLayout>
  );
}

// ─── Menus Tab ──────────────────────────────────────────────────────────────

function MenusTab({ canCreate, canUpdate, canDelete, t }) {
  const { showSuccess, showError } = useToast();
  const list = useCMSList(listMenus);
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState({ name: '', slug: '', location: 'header', description: '', order: 0, is_active: true });
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const openCreate = () => {
    setEditData(null);
    setFormData({ name: '', slug: '', location: 'header', description: '', order: 0, is_active: true });
    setFieldErrors({});
    setEditOpen(true);
  };

  const openEdit = (item) => {
    setEditData(item);
    setFormData({ name: item.name, slug: item.slug, location: item.location, description: item.description || '', order: item.order || 0, is_active: item.is_active ?? true });
    setFieldErrors({});
    setEditOpen(true);
  };

  const handleSave = async () => {
    setSaving(true); setFieldErrors({});
    try {
      if (editData) await updateMenu(editData.id, formData);
      else await createMenu(formData);
      showSuccess(t('msg.saved'));
      setEditOpen(false);
      list.refresh();
    } catch (err) {
      const fe = extractFieldErrors(err);
      if (Object.keys(fe).length > 0) setFieldErrors(fe);
      showError(parseApiError(err));
    } finally { setSaving(false); }
  };

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteMenu(deleteTarget.id);
      showSuccess(t('msg.deleted'));
      list.refresh();
    } catch (err) { showError(parseApiError(err)); throw err; }
    finally { setDeleting(false); }
  }, [deleteTarget, showSuccess, showError, t, list]);

  return (
    <>
      {canCreate && <div style={{ marginBottom: '1rem' }}><CMSButton variant="primary" onClick={openCreate}>+ {t('action.addNew')}</CMSButton></div>}
      {list.loading && <CMSLoadingState />}
      {list.error && <CMSErrorState message={list.error} onRetry={list.refresh} />}
      {!list.loading && !list.error && list.items.length === 0 && <CMSEmptyState message={t('state.empty')} />}
      {!list.loading && !list.error && list.items.length > 0 && (
        <>
          <CMSTable columns={[
            { key: 'name', label: t('form.name') },
            { key: 'slug', label: t('form.slug') },
            { key: 'location', label: t('form.location') },
            { key: 'items', label: t('nav.item'), align: 'center' },
            { key: 'status', label: t('form.status') },
            { key: 'actions', label: '', align: 'right' },
          ]}>
            {list.items.map((menu) => (
              <CMSTableRow key={menu.id}>
                <CMSTableCell>{menu.name}</CMSTableCell>
                <CMSTableCell><code style={styles.slug}>{menu.slug}</code></CMSTableCell>
                <CMSTableCell><CMSBadge type="default" size="xs">{menu.location}</CMSBadge></CMSTableCell>
                <CMSTableCell align="center">{menu.item_count}</CMSTableCell>
                <CMSTableCell><StatusBadge status={menu.is_active ? 'active' : 'inactive'} /></CMSTableCell>
                <CMSTableCell align="right">
                  {canUpdate && <TableActionButton onClick={() => openEdit(menu)}>{t('action.edit')}</TableActionButton>}
                  {canDelete && <TableActionButton onClick={() => setDeleteTarget(menu)} style={{ color: '#ef4444' }}>{t('action.delete')}</TableActionButton>}
                </CMSTableCell>
              </CMSTableRow>
            ))}
          </CMSTable>
          <CMSPagination page={list.page} totalPages={list.totalPages} onPageChange={list.setPage} count={list.count} />
        </>
      )}

      <CMSDialog open={editOpen} onClose={() => setEditOpen(false)} title={editData ? `${t('action.edit')} ${t('nav.menu')}` : `${t('action.addNew')} ${t('nav.menu')}`} size="md"
        footer={<><CMSButton variant="secondary" onClick={() => setEditOpen(false)}>{t('action.cancel')}</CMSButton><CMSButton variant="primary" onClick={handleSave} loading={saving}>{t('action.save')}</CMSButton></>}>
        <div style={styles.form}>
          <CMSInput label={t('form.name')} required value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} error={fieldErrors.name} />
          <CMSInput label={t('form.slug')} required value={formData.slug} onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))} error={fieldErrors.slug} />
          <CMSSelect label={t('form.location')} value={formData.location} onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))} error={fieldErrors.location}>
            <option value="header">Header</option>
            <option value="footer">Footer</option>
            <option value="mobile">Mobile</option>
            <option value="sidebar">Sidebar</option>
          </CMSSelect>
          <CMSTextarea label={t('form.description')} value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} rows={2} />
          <div className="cms-form-grid">
            <CMSInput label={t('form.order')} type="number" value={formData.order} onChange={(e) => setFormData((p) => ({ ...p, order: parseInt(e.target.value) || 0 }))} />
          </div>
          <CMSCheckbox label={t('form.active')} checked={formData.is_active} onChange={(e) => setFormData((p) => ({ ...p, is_active: e.target.checked }))} />
        </div>
      </CMSDialog>

      <CMSConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting}
        message={t('confirm.delete.message', { name: deleteTarget?.name })} />
    </>
  );
}

// ─── Items Tab ──────────────────────────────────────────────────────────────

function ItemsTab({ canCreate, canUpdate, canDelete, t }) {
  const { showSuccess, showError } = useToast();
  const list = useCMSList(listItems);
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState({
    menu: '', parent: null, label_en: '', label_ar: '',
    link_type: 'route', url: '', route_name: '', anchor: '', email: '', phone: '',
    order: 0, open_in_new_tab: false, icon: '', icon_asset: null, is_visible: true,
  });
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [menus, setMenus] = useState([]);

  // Load menus for the select dropdown
  const loadMenus = useCallback(async () => {
    try {
      const data = await listMenus({ page_size: 100 });
      setMenus(data.results || []);
    } catch (err) { /* silent */ }
  }, []);

  // Load menus on mount
  useEffect(() => { loadMenus(); }, [loadMenus]);

  const openCreate = () => {
    setEditData(null);
    setFormData({ menu: menus[0]?.id || '', parent: null, label_en: '', label_ar: '', link_type: 'route', url: '', route_name: '', anchor: '', email: '', phone: '', order: 0, open_in_new_tab: false, icon: '', icon_asset: null, is_visible: true });
    setFieldErrors({});
    setEditOpen(true);
  };

  const openEdit = (item) => {
    setEditData(item);
    setFormData({
      menu: item.menu, parent: item.parent, label_en: item.label_en || '', label_ar: item.label_ar || '',
      link_type: item.link_type || 'route', url: item.url || '', route_name: item.route_name || '',
      anchor: item.anchor || '', email: item.email || '', phone: item.phone || '',
      order: item.order || 0, open_in_new_tab: item.open_in_new_tab ?? false,
      icon: item.icon || '', icon_asset: item.icon_asset || null, is_visible: item.is_visible ?? true,
    });
    setFieldErrors({});
    setEditOpen(true);
  };

  const handleSave = async () => {
    setSaving(true); setFieldErrors({});
    try {
      const payload = { ...formData };
      if (payload.icon_asset && typeof payload.icon_asset === 'object') payload.icon_asset = payload.icon_asset.id;
      if (editData) await updateItem(editData.id, payload);
      else await createItem(payload);
      showSuccess(t('msg.saved'));
      setEditOpen(false);
      list.refresh();
    } catch (err) {
      const fe = extractFieldErrors(err);
      if (Object.keys(fe).length > 0) setFieldErrors(fe);
      showError(parseApiError(err));
    } finally { setSaving(false); }
  };

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteItem(deleteTarget.id);
      showSuccess(t('msg.deleted'));
      list.refresh();
    } catch (err) { showError(parseApiError(err)); throw err; }
    finally { setDeleting(false); }
  }, [deleteTarget, showSuccess, showError, t, list]);

  return (
    <>
      {canCreate && <div style={{ marginBottom: '1rem' }}><CMSButton variant="primary" onClick={openCreate}>+ {t('action.addNew')}</CMSButton></div>}
      {list.loading && <CMSLoadingState />}
      {list.error && <CMSErrorState message={list.error} onRetry={list.refresh} />}
      {!list.loading && !list.error && list.items.length === 0 && <CMSEmptyState message={t('state.empty')} />}
      {!list.loading && !list.error && list.items.length > 0 && (
        <>
          <CMSTable columns={[
            { key: 'label', label: t('form.label') },
            { key: 'menu', label: t('nav.menu') },
            { key: 'type', label: t('form.linkType') },
            { key: 'target', label: t('form.target') },
            { key: 'order', label: t('form.order'), align: 'center' },
            { key: 'visible', label: t('form.visible'), align: 'center' },
            { key: 'actions', label: '', align: 'right' },
          ]}>
            {list.items.map((item) => (
              <CMSTableRow key={item.id}>
                <CMSTableCell>{item.label_en || item.label_ar}</CMSTableCell>
                <CMSTableCell>{item.menu_name}</CMSTableCell>
                <CMSTableCell><CMSBadge type="default" size="xs">{item.link_type}</CMSBadge></CMSTableCell>
                <CMSTableCell>{item.url || item.route_name || item.anchor || item.email || item.phone || '—'}</CMSTableCell>
                <CMSTableCell align="center">{item.order}</CMSTableCell>
                <CMSTableCell align="center">{item.is_visible ? '✓' : '✕'}</CMSTableCell>
                <CMSTableCell align="right">
                  {canUpdate && <TableActionButton onClick={() => openEdit(item)}>{t('action.edit')}</TableActionButton>}
                  {canDelete && <TableActionButton onClick={() => setDeleteTarget(item)} style={{ color: '#ef4444' }}>{t('action.delete')}</TableActionButton>}
                </CMSTableCell>
              </CMSTableRow>
            ))}
          </CMSTable>
          <CMSPagination page={list.page} totalPages={list.totalPages} onPageChange={list.setPage} count={list.count} />
        </>
      )}

      <CMSDialog open={editOpen} onClose={() => setEditOpen(false)} title={editData ? `${t('action.edit')} ${t('nav.item')}` : `${t('action.addNew')} ${t('nav.item')}`} size="md"
        footer={<><CMSButton variant="secondary" onClick={() => setEditOpen(false)}>{t('action.cancel')}</CMSButton><CMSButton variant="primary" onClick={handleSave} loading={saving}>{t('action.save')}</CMSButton></>}>
        <div style={styles.form}>
          <CMSSelect label={t('nav.menu')} required value={formData.menu} onChange={(e) => setFormData((p) => ({ ...p, menu: parseInt(e.target.value) }))} error={fieldErrors.menu}>
            <option value="">Select menu…</option>
            {menus.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </CMSSelect>
          <div className="cms-bilingual-row">
            <CMSInput label={`${t('form.label')} (${t('form.english')})`} required value={formData.label_en} onChange={(e) => setFormData((p) => ({ ...p, label_en: e.target.value }))} error={fieldErrors.label_en} />
            <CMSInput label={`${t('form.label')} (${t('form.arabic')})`} value={formData.label_ar} onChange={(e) => setFormData((p) => ({ ...p, label_ar: e.target.value }))} dir="rtl" />
          </div>
          <CMSSelect label={t('form.linkType')} value={formData.link_type} onChange={(e) => setFormData((p) => ({ ...p, link_type: e.target.value }))}>
            <option value="route">Route (Internal)</option>
            <option value="url">URL (External)</option>
            <option value="anchor">Anchor</option>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
          </CMSSelect>
          {formData.link_type === 'route' && (
            <CMSInput label={t('form.routeName')} value={formData.route_name} onChange={(e) => setFormData((p) => ({ ...p, route_name: e.target.value }))} hint="e.g. home, insights, about" />
          )}
          {formData.link_type === 'url' && (
            <CMSInput label={t('form.url')} value={formData.url} onChange={(e) => setFormData((p) => ({ ...p, url: e.target.value }))} />
          )}
          {formData.link_type === 'anchor' && (
            <CMSInput label={t('form.anchor')} value={formData.anchor} onChange={(e) => setFormData((p) => ({ ...p, anchor: e.target.value }))} />
          )}
          {formData.link_type === 'email' && (
            <CMSInput label={t('form.email')} type="email" value={formData.email} onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} />
          )}
          {formData.link_type === 'phone' && (
            <CMSInput label={t('form.phone')} value={formData.phone} onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))} />
          )}
          <div className="cms-form-grid">
            <CMSInput label={t('form.order')} type="number" value={formData.order} onChange={(e) => setFormData((p) => ({ ...p, order: parseInt(e.target.value) || 0 }))} />
            <CMSInput label={t('form.iconCssClass')} value={formData.icon} onChange={(e) => setFormData((p) => ({ ...p, icon: e.target.value }))} hint="e.g. fa-home" />
          </div>
          <CMSMediaField label={t('form.iconAsset')} value={formData.icon_asset} onChange={(_id, asset) => setFormData((p) => ({ ...p, icon_asset: asset }))} usageLabel="navigation-icon" />
          <div style={styles.checkboxes}>
            <CMSCheckbox label={t('form.openInNewTab')} checked={formData.open_in_new_tab} onChange={(e) => setFormData((p) => ({ ...p, open_in_new_tab: e.target.checked }))} />
            <CMSCheckbox label={t('form.visible')} checked={formData.is_visible} onChange={(e) => setFormData((p) => ({ ...p, is_visible: e.target.checked }))} />
          </div>
        </div>
      </CMSDialog>

      <CMSConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting}
        message={t('confirm.delete.message', { name: deleteTarget?.label_en })} />
    </>
  );
}

const styles = {
  tabs: { display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', borderBottom: '1px solid #1e1e2e' },
  tab: { padding: '0.625rem 1rem', background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: '500', borderBottom: '2px solid transparent', fontFamily: 'inherit' },
  tabActive: { color: '#c9a96e', borderBottomColor: '#c9a96e' },
  slug: { fontSize: '0.6875rem', background: '#1a1a2e', padding: '0.125rem 0.375rem', borderRadius: '3px', color: '#888' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  checkboxes: { display: 'flex', gap: '1.5rem', flexWrap: 'wrap' },
};
