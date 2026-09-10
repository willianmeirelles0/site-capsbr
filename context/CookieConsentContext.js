'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { iniciarRastreamento } from '@/lib/tracking';

const CONSENT_KEY = 'capsbr_cookie_consent';
const CookieConsentContext = createContext(null);

export function CookieConsentProvider({ children }) {
  const [consentido, setConsentido] = useState(false);
  const [avisoVisivel, setAvisoVisivel] = useState(false);

  useEffect(() => {
    if (window.localStorage.getItem(CONSENT_KEY) === 'aceito') {
      setConsentido(true);
      iniciarRastreamento();
    } else {
      setAvisoVisivel(true);
    }
  }, []);

  function aceitar() {
    window.localStorage.setItem(CONSENT_KEY, 'aceito');
    setConsentido(true);
    setAvisoVisivel(false);
    iniciarRastreamento();
  }

  useEffect(() => {
    document.body.classList.toggle('tem-aviso-cookie', avisoVisivel);
  }, [avisoVisivel]);

  return (
    <CookieConsentContext.Provider value={{ consentido, avisoVisivel, aceitar }}>
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  return useContext(CookieConsentContext);
}
