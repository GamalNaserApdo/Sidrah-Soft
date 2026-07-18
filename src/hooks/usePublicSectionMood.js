import { useEffect, useState } from 'react';

const PUBLIC_SECTION_MOODS = {
  home: 'hero',
  foundation: 'foundation',
  capabilities: 'capabilities',
  services: 'services',
  'automation-showcase': 'automation',
  industries: 'industries',
  partners: 'partners',
  'case-studies': 'casestudies',
  insights: 'insights',
  careers: 'careers',
  contact: 'contact',
  footer: 'footer',
};

function getClosestMood(elements) {
  const viewportCenter = window.innerHeight / 2;
  let closestMood = null;
  let closestDistance = Number.POSITIVE_INFINITY;

  elements.forEach(({ element, mood }) => {
    const rect = element.getBoundingClientRect();
    const sectionCenter = rect.top + rect.height / 2;
    const distance = Math.abs(sectionCenter - viewportCenter);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestMood = mood;
    }
  });

  return closestMood;
}

function usePublicSectionMood(defaultMood = 'hero') {
  const [mood, setMood] = useState(defaultMood);

  useEffect(() => {
    setMood(defaultMood);

    const sections = Object.entries(PUBLIC_SECTION_MOODS)
      .map(([id, sectionMood]) => ({ id, element: document.getElementById(id), mood: sectionMood }))
      .filter(({ element }) => element);
    const hasHomepageSections = sections.some(({ id }) => id !== 'footer');

    if (!sections.length || !('IntersectionObserver' in window)) {
      return undefined;
    }

    const updateClosestMood = () => {
      const closestMood = getClosestMood(sections);
      if (closestMood) setMood(closestMood);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const activeSections = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => sections.find(({ element }) => element === entry.target))
          .filter(Boolean);

        if (activeSections.length) {
          const closestMood = getClosestMood(activeSections);
          if (closestMood) setMood(closestMood);
          return;
        }

        if (hasHomepageSections) updateClosestMood();
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    );

    sections.forEach(({ element }) => observer.observe(element));
    if (hasHomepageSections) updateClosestMood();

    return () => observer.disconnect();
  }, [defaultMood]);

  return mood;
}

export { PUBLIC_SECTION_MOODS };
export default usePublicSectionMood;
