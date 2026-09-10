'use client';

import { useCookieConsent } from '@/context/CookieConsentContext';
import { usePolicyModal } from '@/context/PolicyModalContext';

export default function CookieAviso() {
  const { avisoVisivel, aceitar } = useCookieConsent();
  const { open } = usePolicyModal();

  return (
    <div className={'cookie-aviso' + (avisoVisivel ? ' show' : '')} role="dialog" aria-live="polite">
      <p>
        Usamos cookies e o Meta Pixel para melhorar sua experiência e mostrar anúncios mais relevantes. Ao continuar
        navegando, você concorda com nossa{' '}
        <button type="button" className="cookie-aviso-link" onClick={open}>Política de Privacidade</button>.
      </p>
      <div className="cookie-aviso-acoes">
        <button type="button" className="btn btn-primary cookie-aviso-btn" onClick={aceitar}>Aceitar</button>
      </div>
    </div>
  );
}
