import { useEffect, useRef } from 'react';

const SMOOTHING_FACTOR = 0.12;

function isTouchDevice() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(hover: none)').matches ||
    window.matchMedia('(pointer: coarse)').matches ||
    navigator.maxTouchPoints > 0
  );
}

function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Tracks smoothed mouse position using requestAnimationFrame.
 *
 * Exposes CSS custom properties on :root:
 *  --cursor-x, --cursor-y : pixel coordinates
 *  --mouse-x, --mouse-y   : normalized -1..1 from viewport center
 *
 * Disabled automatically on touch devices and when reduced motion is preferred.
 */
function useMousePosition() {
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || isTouchDevice() || prefersReducedMotion()) {
      return;
    }

    const root = document.documentElement;

    const handleMouseMove = (e) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
    };

    const animate = () => {
      const targetX = targetRef.current.x;
      const targetY = targetRef.current.y;

      currentRef.current.x += (targetX - currentRef.current.x) * SMOOTHING_FACTOR;
      currentRef.current.y += (targetY - currentRef.current.y) * SMOOTHING_FACTOR;

      const normalizedX = (currentRef.current.x / window.innerWidth) * 2 - 1;
      const normalizedY = (currentRef.current.y / window.innerHeight) * 2 - 1;

      root.style.setProperty('--cursor-x', `${currentRef.current.x.toFixed(1)}px`);
      root.style.setProperty('--cursor-y', `${currentRef.current.y.toFixed(1)}px`);
      root.style.setProperty('--mouse-x', normalizedX.toFixed(4));
      root.style.setProperty('--mouse-y', normalizedY.toFixed(4));

      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);
}

export default useMousePosition;
