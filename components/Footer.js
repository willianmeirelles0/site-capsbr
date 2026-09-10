'use client';

import Logo from './Logo';
import WhatsappLink from './WhatsappLink';
import { usePolicyModal } from '@/context/PolicyModalContext';

export default function Footer() {
  const { open } = usePolicyModal();

  return (
    <footer>
      <div className="container">
        <div className="footer-logo">
          <Logo className="logo-mark" />
        </div>
        <p className="footer-contact">
          <a href="mailto:contato@capsbr.com.br" className="footer-link">contato@capsbr.com.br</a>
          <span className="footer-dot">·</span>
          <WhatsappLink className="footer-link">(54) 99709-0147</WhatsappLink>
          <span className="footer-dot">·</span>
          <a href="https://www.instagram.com/capsbr.nutra/" target="_blank" rel="noopener" className="footer-link">@capsbr.nutra</a>
        </p>
        <p>CapsBR Nutracêuticos Ltda &middot; CNPJ 68.259.906/0001-69</p>
        <p>© 2026 CapsBR. Todos os direitos reservados.</p>
        <p>
          <button type="button" className="footer-link footer-policy-trigger" onClick={open}>
            Política de Privacidade
          </button>
        </p>
      </div>
    </footer>
  );
}
