/**
 * CMS Confirm Dialog
 *
 * Reusable confirmation modal for delete, publish, archive, etc.
 */

import { useState } from 'react';
import CMSDialog from './CMSDialog';
import CMSButton from './CMSButton';
import { useCMSLang } from '../../../contexts/CMSLanguageContext';

export default function CMSConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel,
  variant = 'danger',
  loading: externalLoading,
}) {
  const { t } = useCMSLang();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch {
      // Error handling is done by the parent via toast
    } finally {
      setLoading(false);
    }
  };

  const isLoading = loading || externalLoading;

  return (
    <CMSDialog
      open={open}
      onClose={isLoading ? undefined : onClose}
      title={title || t('confirm.delete.title')}
      size="sm"
      footer={
        <>
          <CMSButton variant="secondary" onClick={onClose} disabled={isLoading}>
            {cancelLabel || t('action.cancel')}
          </CMSButton>
          <CMSButton variant={variant} onClick={handleConfirm} loading={isLoading}>
            {confirmLabel || t('action.delete')}
          </CMSButton>
        </>
      }
    >
      <p style={{ fontSize: '0.875rem', color: '#ccc', lineHeight: 1.5 }}>{message}</p>
    </CMSDialog>
  );
}
