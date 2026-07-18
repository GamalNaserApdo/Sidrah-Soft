import { useRef } from 'react';

const MAGNETIC_STRENGTH = 0.18;

/**
 * Wraps an anchor with a subtle magnetic attraction toward the cursor.
 *
 * Updates CSS transform via refs to avoid React re-renders on mousemove.
 */
function MagneticLink({ children, className = '', href = '#', ...props }) {
  const linkRef = useRef(null);

  const handleMouseMove = (e) => {
    const link = linkRef.current;
    if (!link) return;

    const rect = link.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    link.style.setProperty('--magnetic-x', `${x * MAGNETIC_STRENGTH}px`);
    link.style.setProperty('--magnetic-y', `${y * MAGNETIC_STRENGTH}px`);
  };

  const handleMouseLeave = () => {
    const link = linkRef.current;
    if (!link) return;
    link.style.setProperty('--magnetic-x', '0px');
    link.style.setProperty('--magnetic-y', '0px');
  };

  return (
    <a
      ref={linkRef}
      href={href}
      className={`magnetic-link ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </a>
  );
}

export default MagneticLink;
