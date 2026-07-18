/**
 * CMS Toast Notification Provider
 *
 * Lightweight internal notification system — no external packages.
 * Supports success, error, warning, and info toasts.
 * Uses aria-live regions for accessibility.
 */

import { createContext, useCallback, useContext, useState, useEffect, useRef } from 'react';
import { useCMSLang } from './CMSLanguageContext';

const ToastContext = createContext(null);

let toastId = 0;

export function CMSToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
  }, []);

  const showToast = useCallback(
    (message, type = 'info', duration = 4000) => {
      const id = ++toastId;
      setToasts((prev) => [...prev, { id, message, type }]);
      if (duration > 0) {
        timersRef.current[id] = setTimeout(() => removeToast(id), duration);
      }
      return id;
    },
    [removeToast],
  );

  const showSuccess = useCallback((msg, dur) => showToast(msg, 'success', dur), [showToast]);
  const showError = useCallback((msg, dur) => showToast(msg, 'error', dur ?? 6000), [showToast]);
  const showWarning = useCallback((msg, dur) => showToast(msg, 'warning', dur), [showToast]);
  const showInfo = useCallback((msg, dur) => showToast(msg, 'info', dur), [showToast]);

  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach(clearTimeout);
    };
  }, []);

  const value = { showToast, showSuccess, showError, showWarning, showInfo, removeToast };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onClose }) {
  if (toasts.length === 0) return null;

  return (
    <div
      style={styles.container}
      aria-live="polite"
      aria-atomic="true"
      role="status"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={() => onClose(toast.id)} />
      ))}
    </div>
  );
}

function Toast({ toast, onClose }) {
  const { t } = useCMSLang();
  const typeStyles = {
    success: styles.success,
    error: styles.error,
    warning: styles.warning,
    info: styles.info,
  };

  const iconMap = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };

  return (
    <div style={{ ...styles.toast, ...typeStyles[toast.type] }} className="cms-toast-enter">
      <span style={styles.icon} aria-hidden="true">{iconMap[toast.type]}</span>
      <span style={styles.message}>{toast.message}</span>
      <button style={styles.closeBtn} onClick={onClose} aria-label={t('a11y.dismissNotification')}>
        ✕
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within CMSToastProvider');
  }
  return ctx;
}

const styles = {
  container: {
    position: 'fixed',
    top: '1rem',
    right: '1rem',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    maxWidth: '400px',
    pointerEvents: 'none',
  },
  toast: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    fontSize: '0.8125rem',
    fontWeight: '500',
    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
    border: '1px solid',
    pointerEvents: 'auto',
    minWidth: '280px',
  },
  success: {
    background: 'rgba(34, 197, 94, 0.15)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
    color: '#22c55e',
  },
  error: {
    background: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    color: '#ef4444',
  },
  warning: {
    background: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    color: '#f59e0b',
  },
  info: {
    background: 'rgba(59, 130, 246, 0.15)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
    color: '#3b82f6',
  },
  icon: {
    fontSize: '0.875rem',
    flexShrink: 0,
  },
  message: {
    flex: 1,
    lineHeight: 1.4,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'inherit',
    opacity: 0.6,
    cursor: 'pointer',
    fontSize: '0.75rem',
    padding: '0.125rem',
    flexShrink: 0,
  },
};
