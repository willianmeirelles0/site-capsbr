'use client';

import { PolicyModalProvider } from '@/context/PolicyModalContext';
import { FormularioProvider } from '@/context/FormularioContext';
import { CookieConsentProvider } from '@/context/CookieConsentContext';

export default function Providers({ children }) {
  return (
    <CookieConsentProvider>
      <PolicyModalProvider>
        <FormularioProvider>{children}</FormularioProvider>
      </PolicyModalProvider>
    </CookieConsentProvider>
  );
}
