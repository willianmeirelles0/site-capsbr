'use client';

import { useEffect } from 'react';

// Scroll reveal: observa todo elemento .reveal presente na página e também
// os que aparecem depois (ex: cards do catálogo, ao trocar de filtro).
export default function RevealSystem() {
  useEffect(() => {
    try {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
      );

      document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

      const mutationObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType !== 1) return;
            if (node.classList?.contains('reveal')) observer.observe(node);
            node.querySelectorAll?.('.reveal').forEach((el) => observer.observe(el));
          });
        });
      });
      mutationObserver.observe(document.body, { childList: true, subtree: true });

      return () => {
        observer.disconnect();
        mutationObserver.disconnect();
      };
    } catch (e) {
      document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
    }
  }, []);

  return null;
}
