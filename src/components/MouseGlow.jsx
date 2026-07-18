import useMousePosition from '../hooks/useMousePosition';

/**
 * Subtle cursor-following ambient glow.
 *
 * Uses CSS variables set by useMousePosition. Automatically disabled on
 * touch devices and when the user prefers reduced motion.
 */
function MouseGlow() {
  useMousePosition();

  return (
    <div
      className="mouse-glow"
      aria-hidden="true"
    />
  );
}

export default MouseGlow;
