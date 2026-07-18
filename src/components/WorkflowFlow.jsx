/**
 * WorkflowFlow — CSS-only node/connector visual for automation flows.
 *
 * Renders a horizontal (desktop) / vertical (mobile) chain of labeled nodes
 * connected by gradient lines with arrow tips. No canvas, no JS libraries.
 *
 * Usage:
 * <WorkflowFlow
 *   label="Lead Processing Pipeline"
 *   nodes={[
 *     { label: 'Lead', sublabel: 'Inbound', variant: 'gold' },
 *     { label: 'AI Qualification', variant: 'ai' },
 *     { label: 'Workflow', variant: 'accent' },
 *     { label: 'CRM', sublabel: 'Sync' },
 *     { label: 'ERP', sublabel: 'Operations' },
 *   ]}
 * />
 */

function WorkflowNode({ label, sublabel, variant, icon }) {
  return (
    <div className={`wf-node${variant ? ` wf-node--${variant}` : ''}`} role="listitem">
      {icon && <div className="wf-node__icon" aria-hidden="true">{icon}</div>}
      <span className="wf-node__label">{label}</span>
      {sublabel && <span className="wf-node__sublabel">{sublabel}</span>}
    </div>
  );
}

function WorkflowConnector({ dashed }) {
  return (
    <div className={`wf-connector${dashed ? ' wf-connector--dashed' : ''}`} aria-hidden="true">
      <div className="wf-connector__line" />
      <div className="wf-connector__arrow" aria-hidden="true" />
    </div>
  );
}

export default function WorkflowFlow({
  nodes = [],
  label = null,
  caption = null,
  variant = 'default',
  dashed = false,
  className = '',
  ariaLabel = null,
}) {
  if (!nodes.length) return null;

  return (
    <div className={className}>
      {label && <p className="wf-flow-label">{label}</p>}
      <div className={`wf-flow-wrap${variant === 'gradient' ? ' wf-flow-wrap--gradient' : ''}`}>
        <div className="wf-flow" role="list" aria-label={ariaLabel || label || undefined}>
          {nodes.map((node, index) => (
            <div key={`wf-${index}`} className="wf-flow__item" style={{ display: 'contents' }}>
              <WorkflowNode
                label={node.label}
                sublabel={node.sublabel}
                variant={node.variant}
                icon={node.icon}
              />
              {index < nodes.length - 1 && (
                <WorkflowConnector dashed={dashed} />
              )}
            </div>
          ))}
        </div>
      </div>
      {caption && <p className="wf-flow-caption">{caption}</p>}
    </div>
  );
}
