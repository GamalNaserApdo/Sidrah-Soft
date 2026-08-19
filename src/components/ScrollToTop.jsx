import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (hash) {
      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (target) {
        target.scrollIntoView({ block: 'start' });
      }
      return;
    }

    if (navigationType !== 'POP') {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto',
      });
    }
  }, [pathname, hash, navigationType]);

  return null;
}
