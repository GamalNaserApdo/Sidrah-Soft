import { useRef } from 'react';

const MAGNETIC_STRENGTH = 0.18;

/**
 * Wraps a button with a subtle magnetic attraction toward the cursor.
 *
 * Updates CSS transform via refs to avoid React re-renders on mousemove.
 * Movement is capped naturally by the strength factor (max ~6-10px).
 */
function MagneticButton({ children, className = '', ...props }) {
  const buttonRef = useRef(null);

  const handleMouseMove = (e) => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    button.style.setProperty('--magnetic-x', `${x * MAGNETIC_STRENGTH}px`);
    button.style.setProperty('--magnetic-y', `${y * MAGNETIC_STRENGTH}px`);
  };

  const handleMouseLeave = () => {
    const button = buttonRef.current;
    if (!button) return;
    button.style.setProperty('--magnetic-x', '0px');
    button.style.setProperty('--magnetic-y', '0px');
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      className={`magnetic-button ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </button>
  );
}

export default MagneticButton;
