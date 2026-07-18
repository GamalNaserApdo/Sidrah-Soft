/**
 * CMS Dialog / Modal Component
 *
 * Accessible modal with focus trap, Escape to close, and backdrop click.
 * Used by confirm dialogs, forms, and detail views.
 */

import { useEffect, useRef, useCallback } from 'react';
import { useCMSLang } from '../../../contexts/CMSLanguageContext';

export default function CMSDialog({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
}) {
  const { t } = useCMSLang();
  const dialogRef = useRef(null);
  const previouslyFocused = useRef(null);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape' && onClose) {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (open) {
      previouslyFocused.current = document.activeElement;
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      // Focus first focusable element
      setTimeout(() => {
        if (dialogRef.current) {
          const focusable = dialogRef.current.querySelector(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          );
          if (focusable) focusable.focus();
        }
      }, 50);
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      if (previouslyFocused.current) {
        previouslyFocused.current.focus();
      }
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  const sizeStyles = {
    sm: { maxWidth: '420px' },
    md: { maxWidth: '600px' },
    lg: { maxWidth: '900px' },
    xl: { maxWidth: '1100px' },
  };

  return (
    <div
      style={styles.overlay}
      onClick={closeOnBackdrop ? onClose : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cms-dialog-title"
    >
      <div
        ref={dialogRef}
        style={{ ...styles.modal, ...sizeStyles[size] }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div style={styles.header}>
            <h2 id="cms-dialog-title" style={styles.title}>{title}</h2>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                style={styles.closeBtn}
                aria-label={t('a11y.closeDialog')}
              >
                ✕
              </button>
            )}
          </div>
        )}
        <div style={styles.body}>{children}</div>
        {footer && <div style={styles.footer}>{footer}</div>}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '2rem 1rem',
    overflowY: 'auto',
  },
  modal: {
    background: '#12121e',
    borderRadius: '10px',
    border: '1px solid #2a2a3e',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.5rem',
    borderBottom: '1px solid #1e1e2e',
    position: 'sticky',
    top: 0,
    background: '#12121e',
    zIndex: 1,
  },
  title: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#c9a96e',
    margin: 0,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#888',
    cursor: 'pointer',
    fontSize: '1rem',
    padding: '0.25rem',
    borderRadius: '4px',
  },
  body: {
    padding: '1.5rem',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    padding: '1rem 1.5rem',
    borderTop: '1px solid #1e1e2e',
    position: 'sticky',
    bottom: 0,
    background: '#12121e',
  },
};
