/**
 * CMS Users Management Page.
 *
 * Features:
 * - Users table with search, role filter, active-status filter
 * - Pagination
 * - Create user dialog
 * - Edit user dialog
 * - Activate/deactivate actions with confirmation
 * - Reset password dialog
 * - Loading, empty, and error states
 * - Arabic/English translations and RTL support
 * - Accessible labels and descriptions
 */

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCMSLang } from '../../contexts/CMSLanguageContext';
import { useToast } from '../../contexts/CMSToastContext';
import {
  listUsers,
  createUser,
  updateUser,
  activateUser,
  deactivateUser,
  resetUserPassword,
} from '../../services/cms/usersApi';
import { parseApiError, extractFieldErrors } from '../../services/cms/cmsFetch';
import CMSLayout from '../../components/cms/layout/CMSLayout';
import CMSPageHeader from '../../components/cms/ui/CMSPageHeader';
import CMSToolbar from '../../components/cms/ui/CMSToolbar';
import { CMSTable, CMSTableRow, CMSTableCell, TableActionButton } from '../../components/cms/ui/CMSTable';
import CMSPagination from '../../components/cms/ui/CMSPagination';
import CMSButton from '../../components/cms/ui/CMSButton';
import CMSBadge from '../../components/cms/ui/CMSBadge';
import CMSDialog from '../../components/cms/ui/CMSDialog';
import CMSConfirmDialog from '../../components/cms/ui/CMSConfirmDialog';
import { CMSInput, CMSSelect } from '../../components/cms/ui/CMSFormInputs';
import { CMSLoadingState, CMSErrorState, CMSEmptyState } from '../../components/cms/ui/CMSStateViews';

const ROLE_KEYS = {
  super_admin: 'users.roleSuperAdmin',
  admin: 'users.roleAdmin',
  content_manager: 'users.roleContentManager',
  editor: 'users.roleEditor',
  marketing_manager: 'users.roleMarketingManager',
  marketing_seo: 'users.roleMarketingSeo',
  recruiter: 'users.roleRecruiter',
  support_agent: 'users.roleSupportAgent',
  support_recruiter: 'users.roleSupportRecruiter',
  lms_admin: 'users.roleLmsAdmin',
  finance_sales: 'users.roleFinanceSales',
};

const ROLE_CHOICES = Object.keys(ROLE_KEYS);

export default function CMSUsersPage() {
  const { user: currentUser } = useAuth();
  const { t } = useCMSLang();
  const { showToast } = useToast();

  const [users, setUsers] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [resetTarget, setResetTarget] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listUsers({
        page,
        page_size: pageSize,
        search: search || undefined,
        role: roleFilter || undefined,
        is_active: statusFilter || undefined,
      });
      setUsers(data.results || []);
      setCount(data.count || 0);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, roleFilter, statusFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSearchSubmit = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleRoleFilterChange = (e) => {
    setRoleFilter(e.target.value);
    setPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setSearchInput('');
    setRoleFilter('');
    setStatusFilter('');
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  const handleCreated = () => {
    setCreateOpen(false);
    loadUsers();
    showToast(t('users.created'), 'success');
  };

  const handleUpdated = () => {
    setEditTarget(null);
    loadUsers();
    showToast(t('users.updated'), 'success');
  };

  const handlePasswordReset = () => {
    setResetTarget(null);
    showToast(t('users.passwordReset'), 'success');
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    const { type, target } = confirmAction;
    try {
      if (type === 'activate') {
        await activateUser(target.id);
        showToast(t('users.activated'), 'success');
      } else if (type === 'deactivate') {
        await deactivateUser(target.id);
        showToast(t('users.deactivated'), 'success');
      }
      setConfirmAction(null);
      loadUsers();
    } catch (err) {
      const msg = type === 'activate' ? t('users.activateFailed') : t('users.deactivateFailed');
      showToast(parseApiError(err) || msg, 'error');
      throw err;
    }
  };

  return (
    <CMSLayout>
      <CMSPageHeader
        title={t('users.title')}
        subtitle={t('users.subtitle')}
        actions={
          <CMSButton variant="primary" onClick={() => setCreateOpen(true)}>
            + {t('users.createUser')}
          </CMSButton>
        }
      />

      <CMSToolbar
        search={searchInput}
        onSearchChange={setSearchInput}
        onSearchSubmit={handleSearchSubmit}
      >
        <select
          value={roleFilter}
          onChange={handleRoleFilterChange}
          style={styles.filterSelect}
          aria-label={t('form.role')}
        >
          <option value="">{t('users.allRoles')}</option>
          {ROLE_CHOICES.map((r) => (
            <option key={r} value={r}>{t(ROLE_KEYS[r])}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={handleStatusFilterChange}
          style={styles.filterSelect}
          aria-label={t('form.status')}
        >
          <option value="">{t('users.allStatuses')}</option>
          <option value="true">{t('users.active')}</option>
          <option value="false">{t('users.inactive')}</option>
        </select>
        {(roleFilter || statusFilter || search) && (
          <CMSButton variant="ghost" size="sm" onClick={clearFilters}>
            ✕
          </CMSButton>
        )}
      </CMSToolbar>

      {error && <CMSErrorState message={error} onRetry={loadUsers} />}

      {loading ? (
        <CMSLoadingState />
      ) : users.length === 0 ? (
        <CMSEmptyState message={t('users.noUsers')} />
      ) : (
        <>
          <CMSTable
            columns={[
              { key: 'name', label: t('users.name') },
              { key: 'email', label: t('form.email') },
              { key: 'role', label: t('form.role') },
              { key: 'status', label: t('form.status'), align: 'center' },
              { key: 'actions', label: t('users.actions'), align: 'right' },
            ]}
          >
            {users.map((u) => (
              <CMSTableRow key={u.id}>
                <CMSTableCell>
                  <span style={styles.userName}>{u.display_name || u.username}</span>
                  {u.id === currentUser?.id && (
                    <span style={styles.youLabel}> {t('users.you')}</span>
                  )}
                  {u.is_superuser && (
                    <CMSBadge type="accent" size="xs" style={{ marginLeft: '0.375rem' }}>
                      {t('users.roleSuperAdmin')}
                    </CMSBadge>
                  )}
                </CMSTableCell>
                <CMSTableCell style={styles.muted}>{u.email || '—'}</CMSTableCell>
                <CMSTableCell>{t(ROLE_KEYS[u.role] || 'users.roleEditor')}</CMSTableCell>
                <CMSTableCell align="center">
                  <CMSBadge type={u.is_active ? 'success' : 'default'}>
                    {u.is_active ? t('users.active') : t('users.inactive')}
                  </CMSBadge>
                </CMSTableCell>
                <CMSTableCell align="right">
                  <div style={styles.actionsCell}>
                    <TableActionButton onClick={() => setEditTarget(u)} title={t('users.editUser')}>
                      ✎
                    </TableActionButton>
                    <TableActionButton
                      onClick={() => setResetTarget(u)}
                      title={t('users.resetPassword')}
                    >
                      🔑
                    </TableActionButton>
                    {u.is_active ? (
                      <TableActionButton
                        onClick={() => setConfirmAction({ type: 'deactivate', target: u })}
                        title={t('users.deactivate')}
                        style={{ color: '#ef4444' }}
                      >
                        ⏸
                      </TableActionButton>
                    ) : (
                      <TableActionButton
                        onClick={() => setConfirmAction({ type: 'activate', target: u })}
                        title={t('users.activate')}
                        style={{ color: '#22c55e' }}
                      >
                        ▶
                      </TableActionButton>
                    )}
                  </div>
                </CMSTableCell>
              </CMSTableRow>
            ))}
          </CMSTable>

          <CMSPagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            count={count}
          />
        </>
      )}

      {/* Create User Dialog */}
      <CreateUserDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={handleCreated}
      />

      {/* Edit User Dialog */}
      <EditUserDialog
        target={editTarget}
        onClose={() => setEditTarget(null)}
        onSuccess={handleUpdated}
      />

      {/* Reset Password Dialog */}
      <ResetPasswordDialog
        target={resetTarget}
        onClose={() => setResetTarget(null)}
        onSuccess={handlePasswordReset}
      />

      {/* Confirm Activate/Deactivate */}
      <CMSConfirmDialog
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleConfirmAction}
        title={confirmAction?.type === 'deactivate' ? t('users.deactivate') : t('users.activate')}
        message={
          confirmAction?.type === 'deactivate'
            ? t('users.confirmDeactivate')
            : t('users.confirmActivate')
        }
        confirmLabel={confirmAction?.type === 'deactivate' ? t('users.deactivate') : t('users.activate')}
        variant={confirmAction?.type === 'deactivate' ? 'danger' : 'primary'}
      />
    </CMSLayout>
  );
}


// ---------------------------------------------------------------------------
// Create User Dialog
// ---------------------------------------------------------------------------

function CreateUserDialog({ open, onClose, onSuccess }) {
  const { t } = useCMSLang();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    role: 'content_manager',
    password: '',
    password_confirm: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setForm({
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      role: 'content_manager',
      password: '',
      password_confirm: '',
    });
    setFieldErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFieldErrors({});
    try {
      await createUser(form);
      resetForm();
      onSuccess();
    } catch (err) {
      const fe = extractFieldErrors(err);
      if (Object.keys(fe).length > 0) {
        setFieldErrors(fe);
      }
      showToast(parseApiError(err) || t('users.createFailed'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const update = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  return (
    <CMSDialog
      open={open}
      onClose={submitting ? undefined : handleClose}
      title={t('users.createUser')}
      size="md"
      footer={
        <>
          <CMSButton variant="secondary" onClick={handleClose} disabled={submitting}>
            {t('action.cancel')}
          </CMSButton>
          <CMSButton variant="primary" onClick={handleSubmit} loading={submitting}>
            {t('users.createUser')}
          </CMSButton>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={styles.formGrid}>
        <CMSInput
          label={t('form.username')}
          required
          value={form.username}
          onChange={update('username')}
          error={fieldErrors.username?.[0]}
          autoComplete="off"
        />
        <CMSInput
          label={t('form.email')}
          type="email"
          value={form.email}
          onChange={update('email')}
          error={fieldErrors.email?.[0]}
          autoComplete="off"
        />
        <CMSInput
          label={t('form.firstName')}
          value={form.first_name}
          onChange={update('first_name')}
          error={fieldErrors.first_name?.[0]}
        />
        <CMSInput
          label={t('form.lastName')}
          value={form.last_name}
          onChange={update('last_name')}
          error={fieldErrors.last_name?.[0]}
        />
        <CMSSelect
          label={t('form.role')}
          required
          value={form.role}
          onChange={update('role')}
          error={fieldErrors.role?.[0]}
        >
          {ROLE_CHOICES.map((r) => (
            <option key={r} value={r}>{t(ROLE_KEYS[r])}</option>
          ))}
        </CMSSelect>
        <CMSInput
          label={t('form.password')}
          type="password"
          required
          value={form.password}
          onChange={update('password')}
          error={fieldErrors.password?.[0]}
          autoComplete="new-password"
        />
        <CMSInput
          label={t('form.passwordConfirm')}
          type="password"
          required
          value={form.password_confirm}
          onChange={update('password_confirm')}
          error={fieldErrors.password_confirm?.[0]}
          autoComplete="new-password"
        />
      </form>
    </CMSDialog>
  );
}


// ---------------------------------------------------------------------------
// Edit User Dialog
// ---------------------------------------------------------------------------

function EditUserDialog({ target, onClose, onSuccess }) {
  const { t } = useCMSLang();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (target) {
      setForm({
        first_name: target.first_name || '',
        last_name: target.last_name || '',
        email: target.email || '',
        role: target.role || '',
      });
      setFieldErrors({});
    }
  }, [target]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFieldErrors({});
    try {
      await updateUser(target.id, form);
      onSuccess();
    } catch (err) {
      const fe = extractFieldErrors(err);
      if (Object.keys(fe).length > 0) {
        setFieldErrors(fe);
      }
      showToast(parseApiError(err) || t('users.updateFailed'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const update = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  return (
    <CMSDialog
      open={!!target}
      onClose={submitting ? undefined : onClose}
      title={t('users.editUser')}
      size="md"
      footer={
        <>
          <CMSButton variant="secondary" onClick={onClose} disabled={submitting}>
            {t('action.cancel')}
          </CMSButton>
          <CMSButton variant="primary" onClick={handleSubmit} loading={submitting}>
            {t('action.save')}
          </CMSButton>
        </>
      }
    >
      {target && (
        <form onSubmit={handleSubmit} style={styles.formGrid}>
          <div style={styles.readOnlyField}>
            <span style={styles.readOnlyLabel}>{t('form.username')}</span>
            <span style={styles.readOnlyValue}>{target.username}</span>
          </div>
          <CMSInput
            label={t('form.firstName')}
            value={form.first_name}
            onChange={update('first_name')}
            error={fieldErrors.first_name?.[0]}
          />
          <CMSInput
            label={t('form.lastName')}
            value={form.last_name}
            onChange={update('last_name')}
            error={fieldErrors.last_name?.[0]}
          />
          <CMSInput
            label={t('form.email')}
            type="email"
            value={form.email}
            onChange={update('email')}
            error={fieldErrors.email?.[0]}
          />
          <CMSSelect
            label={t('form.role')}
            value={form.role}
            onChange={update('role')}
            error={fieldErrors.role?.[0]}
          >
            {ROLE_CHOICES.map((r) => (
              <option key={r} value={r}>{t(ROLE_KEYS[r])}</option>
            ))}
          </CMSSelect>
        </form>
      )}
    </CMSDialog>
  );
}


// ---------------------------------------------------------------------------
// Reset Password Dialog
// ---------------------------------------------------------------------------

function ResetPasswordDialog({ target, onClose, onSuccess }) {
  const { t } = useCMSLang();
  const { showToast } = useToast();
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (target) {
      setPassword('');
      setPasswordConfirm('');
      setFieldErrors({});
    }
  }, [target]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFieldErrors({});
    try {
      await resetUserPassword(target.id, { password, password_confirm: passwordConfirm });
      onSuccess();
    } catch (err) {
      const fe = extractFieldErrors(err);
      if (Object.keys(fe).length > 0) {
        setFieldErrors(fe);
      }
      showToast(parseApiError(err) || t('users.resetFailed'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CMSDialog
      open={!!target}
      onClose={submitting ? undefined : onClose}
      title={t('users.resetPassword')}
      size="sm"
      footer={
        <>
          <CMSButton variant="secondary" onClick={onClose} disabled={submitting}>
            {t('action.cancel')}
          </CMSButton>
          <CMSButton variant="danger" onClick={handleSubmit} loading={submitting}>
            {t('users.resetPassword')}
          </CMSButton>
        </>
      }
    >
      {target && (
        <form onSubmit={handleSubmit} style={styles.formGrid}>
          <p style={styles.resetHint}>
            {t('users.confirmReset')}
          </p>
          <CMSInput
            label={t('form.password')}
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password?.[0]}
            autoComplete="new-password"
          />
          <CMSInput
            label={t('form.passwordConfirm')}
            type="password"
            required
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            error={fieldErrors.password_confirm?.[0]}
            autoComplete="new-password"
          />
        </form>
      )}
    </CMSDialog>
  );
}


const styles = {
  filterSelect: {
    padding: '0.5rem 0.75rem',
    background: '#12121e',
    border: '1px solid #2a2a3e',
    borderRadius: '6px',
    color: '#e0e0e0',
    fontSize: '0.8125rem',
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
  userName: {
    fontWeight: '500',
    color: '#e0e0e0',
  },
  youLabel: {
    fontSize: '0.75rem',
    color: '#c9a96e',
  },
  muted: {
    color: '#888',
  },
  actionsCell: {
    display: 'flex',
    gap: '0.25rem',
    justifyContent: 'flex-end',
  },
  formGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  readOnlyField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  },
  readOnlyLabel: {
    fontSize: '0.75rem',
    fontWeight: '500',
    color: '#aaa',
  },
  readOnlyValue: {
    fontSize: '0.875rem',
    color: '#e0e0e0',
    padding: '0.5rem 0.75rem',
    background: '#0a0a14',
    borderRadius: '6px',
    border: '1px solid #1e1e2e',
  },
  resetHint: {
    fontSize: '0.8125rem',
    color: '#aaa',
    lineHeight: 1.5,
    margin: 0,
    padding: '0.75rem',
    background: 'rgba(245, 158, 11, 0.08)',
    border: '1px solid rgba(245, 158, 11, 0.2)',
    borderRadius: '6px',
  },
};
