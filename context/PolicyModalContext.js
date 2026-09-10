'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const PolicyModalContext = createContext(null);

export function PolicyModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(e) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  return (
    <PolicyModalContext.Provider value={{ isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) }}>
      {children}
    </PolicyModalContext.Provider>
  );
}

export function usePolicyModal() {
  return useContext(PolicyModalContext);
}
