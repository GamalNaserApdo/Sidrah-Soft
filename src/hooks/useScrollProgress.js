import { useEffect } from 'react';

function useScrollProgress(progressRef) {
  useEffect(() => {
    const progressElement = progressRef.current;
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frameId = null;

    const updateProgress = () => {
      frameId = null;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? Math.min(window.scrollY / maxScroll, 1) : 0;
      progressElement.style.transform = `scaleX(${progress})`;
    };

    const requestUpdate = () => {
      if (frameId === null) {
        frameId = window.requestAnimationFrame(updateProgress);
      }
    };

    const start = () => {
      if (reducedMotionQuery.matches) {
        progressElement.style.transform = 'scaleX(0)';
        return;
      }

      updateProgress();
      window.addEventListener('scroll', requestUpdate, { passive: true });
      window.addEventListener('resize', requestUpdate);
    };

    const stop = () => {
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
        frameId = null;
      }
    };

    const handleMotionChange = () => {
      stop();
      start();
    };

    start();
    reducedMotionQuery.addEventListener('change', handleMotionChange);

    return () => {
      stop();
      reducedMotionQuery.removeEventListener('change', handleMotionChange);
    };
  }, [progressRef]);
}

export default useScrollProgress;
