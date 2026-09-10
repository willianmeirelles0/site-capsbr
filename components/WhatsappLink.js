'use client';

import { linkWhatsapp, WHATSAPP_MENSAGEM_PADRAO } from '@/lib/tracking';

// Evento padrão da Meta: 'Contact' é para quando a pessoa inicia contato
// direto (WhatsApp) SEM preencher formulário antes. 'Lead' fica reservado
// só para a submissão do formulário de qualificação (ver Formulario.js).
export default function WhatsappLink({ mensagem, children, ...props }) {
  function handleClick() {
    if (typeof window.fbq === 'function') window.fbq('track', 'Contact');
    if (typeof window.gtag === 'function') window.gtag('event', 'contact_whatsapp', { event_category: 'engajamento' });
  }

  return (
    <a
      href={linkWhatsapp(mensagem || WHATSAPP_MENSAGEM_PADRAO)}
      target="_blank"
      rel="noopener"
      onClick={handleClick}
      {...props}
    >
      {children}
    </a>
  );
}
