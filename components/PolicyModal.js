'use client';

import { usePolicyModal } from '@/context/PolicyModalContext';

export default function PolicyModal() {
  const { isOpen, close } = usePolicyModal();

  return (
    <div className={'policy-modal' + (isOpen ? ' open' : '')} role="dialog" aria-modal="true" aria-hidden={!isOpen}>
      <div className="policy-modal-backdrop" onClick={close} />
      <div className="policy-modal-dialog">
        <button type="button" className="policy-modal-close" aria-label="Fechar" onClick={close}>✕</button>
        <div className="policy-modal-content">
          <span className="eyebrow" style={{ color: '#7a8a00' }}>CapsBR</span>
          <h2>Política de Privacidade</h2>
          <p>
            Este site é operado pela CAPSBR NUTRACEUTICOS LTDA, inscrita no CNPJ nº 68.259.906/0001-69, doravante
            &quot;CapsBR&quot;, &quot;nós&quot;. Este documento explica como tratamos os dados pessoais de quem
            preenche o formulário de contato nesta página. Dúvidas podem ser enviadas para{' '}
            <a href="mailto:contato@capsbr.com.br">contato@capsbr.com.br</a>.
          </p>

          <h3>1. Quais dados coletamos</h3>
          <p>Ao preencher o formulário de solicitação de orçamento, coletamos nome, nome da marca (se informado), WhatsApp, e-mail, e as demais respostas fornecidas sobre o interesse na terceirização de produção.</p>

          <h3>2. Como usamos seus dados</h3>
          <p>Usamos esses dados exclusivamente para entrar em contato e apresentar uma proposta comercial referente à terceirização de produção de suplementos. Não vendemos nem compartilhamos seus dados com terceiros para fins de marketing.</p>

          <h3>3. Onde as respostas ficam armazenadas</h3>
          <p>As respostas do formulário são enviadas por e-mail para a equipe CapsBR e, opcionalmente, encaminhadas por você via WhatsApp com um resumo gerado automaticamente pelo site.</p>

          <h3>4. Cookies e publicidade (Meta Pixel, Google Analytics e Google Ads)</h3>
          <p>
            Este site usa cookies, o Meta Pixel (Facebook/Instagram Ads), o Google Analytics e o Google Ads (via
            Google Tag Manager) para entender como os visitantes usam a página e mostrar anúncios mais relevantes
            sobre a CapsBR nessas plataformas. Nenhuma dessas ferramentas é ativada até você aceitar o aviso de
            cookies exibido no site; até lá, nenhum dado de navegação é enviado para Meta ou Google. Ao aceitar,
            essas ferramentas podem registrar eventos como visualização de página, envio do formulário e cliques no
            WhatsApp, incluindo nome, e-mail e telefone informados no formulário (usados de forma protegida para
            melhorar a segmentação dos anúncios). Você pode gerenciar ou bloquear cookies a qualquer momento nas
            configurações do seu navegador, e pode revogar o consentimento apagando os dados de navegação deste
            site. Saiba mais em{' '}
            <a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noopener">facebook.com/privacy/policy</a>{' '}
            e <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">policies.google.com/privacy</a>.
          </p>

          <h3>5. Seus direitos (LGPD)</h3>
          <p>Nos termos da Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você pode solicitar a qualquer momento a confirmação, o acesso, a correção, a anonimização, a portabilidade ou a eliminação dos seus dados pessoais, além de revogar consentimentos previamente dados. Para exercer qualquer desses direitos, entre em contato pelo e-mail acima.</p>

          <h3>6. Foro</h3>
          <p>Eventuais controvérsias serão preferencialmente resolvidas por contato direto com a CapsBR; não sendo possível, fica eleito o foro do domicílio do consumidor.</p>
        </div>
      </div>
    </div>
  );
}
