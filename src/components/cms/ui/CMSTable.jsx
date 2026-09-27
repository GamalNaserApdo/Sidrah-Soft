/**
 * CMS Table Component
 *
 * Accessible, responsive data table with sortable headers.
 * Wraps in overflow-x container for mobile.
 *
 * Uses premium .cms-table-wrapper CSS classes from cms.css.
 *
 * TableActionButton supports two usage patterns:
 *  - Icon mode (preferred): <TableActionButton icon="edit" label="Edit" onClick={...} />
 *  - Legacy text mode:       <TableActionButton onClick={...}>Edit</TableActionButton>
 */

import CmsIcon from './CmsIcon';

/**
 * TableActionButton — row action button.
 * variant: 'default' | 'accent' | 'danger'
 *
 * If `icon` prop is provided, renders an icon-only button (preferred).
 * Otherwise renders children as the button label (legacy text mode).
 */
export function TableActionButton({
  icon,
  label,
  onClick,
  disabled,
  variant = 'default',
  active,
  title,
  children,
  style,
  ...rest
}) {
  const resolvedTitle = title || label;
  const isIconMode = Boolean(icon);

  if (isIconMode) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title={resolvedTitle}
        aria-label={label || resolvedTitle}
        className={`cms-table-action ${variant !== 'default' ? variant : ''}`}
        style={{
          opacity: disabled ? 0.3 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
          ...(disabled ? { pointerEvents: 'none' } : {}),
          ...style,
        }}
        {...rest}
      >
        <CmsIcon name={icon} size={16} />
      </button>
    );
  }

  // Legacy text-children mode (preserves existing call sites).
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={resolvedTitle}
      className={`cms-table-action-text ${variant !== 'default' ? variant : ''}`}
      style={{
        background: active ? 'var(--cms-accent-bg)' : 'transparent',
        border: 'none',
        color:
          variant === 'danger'
            ? 'var(--cms-danger)'
            : active
              ? 'var(--cms-accent)'
              : 'var(--cms-text-muted)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: 'var(--font-size-xs)',
        padding: 'var(--space-1) var(--space-2)',
        opacity: disabled ? 0.3 : 1,
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

export function CMSTable({ columns, children }) {
  return (
    <div className="cms-table-wrapper">
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  ...(col.width ? { width: col.width } : {}),
                  ...(col.align === 'center' ? { textAlign: 'center' } : {}),
                  ...(col.align === 'right' ? { textAlign: 'end' } : {}),
                }}
                scope="col"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function CMSTableRow({ children, onClick, style }) {
  return (
    <tr
      onClick={onClick}
      style={{
        ...(onClick ? { cursor: 'pointer' } : {}),
        ...style,
      }}
    >
      {children}
    </tr>
  );
}

export function CMSTableCell({ children, align, style, colSpan }) {
  return (
    <td
      style={{
        ...(align === 'center' ? { textAlign: 'center' } : {}),
        ...(align === 'right' ? { textAlign: 'end' } : {}),
        ...style,
      }}
      colSpan={colSpan}
    >
      {children}
    </td>
  );
}
