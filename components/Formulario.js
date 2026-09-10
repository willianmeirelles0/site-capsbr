'use client';

import { useEffect, useRef, useState } from 'react';
import { linkWhatsapp } from '@/lib/tracking';
import { usePolicyModal } from '@/context/PolicyModalContext';
import { useFormularioContext } from '@/context/FormularioContext';

// Chave pública do Web3Forms (não é credencial secreta, só identifica pra
// onde o Web3Forms deve encaminhar as respostas). Veja public/assets/README.md.
const WEB3FORMS_ACCESS_KEY = 'bef4c6d0-1fb8-4147-8320-c250aa3cc40e';

export default function Formulario() {
  const formRef = useRef(null);
  const [categoria, setCategoria] = useState('Cápsulas');
  const [feedback, setFeedback] = useState(false);
  const { open: abrirPolitica } = usePolicyModal();
  const { categoriaPreSelecionada } = useFormularioContext();

  useEffect(() => {
    if (categoriaPreSelecionada) setCategoria(categoriaPreSelecionada);
  }, [categoriaPreSelecionada]);

  function handleSubmit(e) {
    e.preventDefault();
    const form = formRef.current;

    // Honeypot: se o campo invisível foi preenchido, é bot — ignora silenciosamente
    if (form.empresa_site.value) return;

    const dados = {
      nome: form.nome.value.trim(),
      marca: form.marca.value.trim(),
      whatsapp: form.whatsapp.value.trim(),
      email: form.email.value.trim(),
      modelo: form.modelo.value,
      categoria,
      marca_status: form.marca_status.value,
      volume: form.volume.value,
      mensagem: form.mensagem.value.trim()
    };

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const resumo = [
      'Olá, preenchi o formulário do site e gostaria de seguir meu atendimento',
      'Nome: ' + dados.nome,
      dados.marca ? 'Marca: ' + dados.marca : null,
      'WhatsApp: ' + dados.whatsapp,
      'E-mail: ' + dados.email,
      'Modelo: ' + dados.modelo,
      'Categoria: ' + dados.categoria,
      'Situação da marca: ' + dados.marca_status,
      'Volume estimado: ' + dados.volume,
      dados.mensagem ? 'Mensagem: ' + dados.mensagem : null
    ].filter(Boolean).join('\n');

    // (1) Envio por e-mail via Web3Forms — falha silenciosamente se a chave não estiver configurada
    if (WEB3FORMS_ACCESS_KEY && WEB3FORMS_ACCESS_KEY !== 'COLE_SUA_CHAVE_WEB3FORMS_AQUI') {
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: 'Novo lead de terceirização: ' + dados.nome,
          from_name: 'Site CapsBR',
          ...dados
        })
      }).catch(function () { /* segue o fluxo mesmo se o e-mail falhar */ });
    }

    // (2) Evento de conversão do Meta Pixel, com Advanced Matching:
    // reenviar o e-mail/telefone/nome no 'init' antes do 'track' ajuda o
    // algoritmo da Meta a casar esse lead com o perfil da pessoa nas
    // plataformas dela, o que melhora a otimização das campanhas. O
    // próprio pixel.js faz o hash desses dados no navegador antes de
    // enviar, nada sai em texto puro.
    if (typeof window.fbq === 'function') {
      const nomePartes = dados.nome.split(' ').filter(Boolean);
      let telefoneDigitos = dados.whatsapp.replace(/\D/g, '');
      if (telefoneDigitos && telefoneDigitos.slice(0, 2) !== '55') telefoneDigitos = '55' + telefoneDigitos;
      window.fbq('init', '1024961890342249', {
        em: dados.email,
        ph: telefoneDigitos,
        fn: nomePartes[0] || '',
        ln: nomePartes.length > 1 ? nomePartes[nomePartes.length - 1] : ''
      });
      window.fbq('track', 'Lead', {
        content_name: dados.modelo,
        content_category: dados.categoria
      });
    }

    // (2b) Mesmo evento espelhado no GA4/Google Ads (via dataLayer)
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'generate_lead', {
        event_category: 'formulario',
        modelo: dados.modelo,
        categoria: dados.categoria,
        volume: dados.volume
      });
      // Se você tiver o rótulo de conversão do Google Ads (Ferramentas >
      // Conversões > sua ação de lead > "Ver detalhes da tag" > pega o
      // texto depois da barra em AW-18387904448/XXXXXXXX), descomente e
      // preencha a linha abaixo para contar conversão no Ads também:
      // window.gtag('event', 'conversion', { send_to: 'AW-18387904448/COLE_O_ROTULO_AQUI' });
    }

    // (3) Sempre abre o WhatsApp com o resumo pronto
    window.open(linkWhatsapp(resumo), '_blank', 'noopener');

    setFeedback(true);
    form.reset();
    setCategoria('Cápsulas');
  }

  return (
    <section id="formulario" className="form-section">
      <div className="container">
        <div className="form-card reveal">
          <div className="form-head">
            <span className="eyebrow">Vamos conversar sobre a sua marca</span>
            <h2>Solicite seu orçamento de terceirização</h2>
            <p>Preencha os dados abaixo. Assim que você enviar, abrimos o WhatsApp com um resumo pronto pra você confirmar o envio, e a gente também recebe por e-mail.</p>
          </div>

          <form id="qualificacao-form" ref={formRef} noValidate onSubmit={handleSubmit}>
            <div className="honeypot">
              <label htmlFor="empresa_site">Não preencha este campo</label>
              <input type="text" id="empresa_site" name="empresa_site" tabIndex={-1} autoComplete="off" />
            </div>

            <div className="campo">
              <label htmlFor="nome">Nome completo</label>
              <input type="text" id="nome" name="nome" placeholder="Seu nome" required />
            </div>
            <div className="campo">
              <label htmlFor="marca">Nome da marca (se já tiver)</label>
              <input type="text" id="marca" name="marca" placeholder="Ex: Minha Marca" />
            </div>
            <div className="campo">
              <label htmlFor="whatsapp">WhatsApp com DDD</label>
              <input type="tel" id="whatsapp" name="whatsapp" placeholder="(00) 00000-0000" required />
            </div>
            <div className="campo">
              <label htmlFor="email">E-mail</label>
              <input type="email" id="email" name="email" placeholder="seu@email.com" required />
            </div>
            <div className="campo">
              <label htmlFor="modelo">Modelo de interesse</label>
              <select id="modelo" name="modelo" required defaultValue="Ainda não sei, quero orientação">
                <option value="Ainda não sei, quero orientação">Ainda não sei, quero orientação</option>
                <option value="White Label">White Label</option>
                <option value="Private Label">Private Label</option>
              </select>
            </div>
            <div className="campo">
              <label htmlFor="categoria">Categoria de interesse</label>
              <select id="categoria" name="categoria" required value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                <option value="Cápsulas">Cápsulas</option>
                <option value="Líquidos">Líquidos</option>
                <option value="Gomas e Pastilhas">Gomas e Pastilhas</option>
                <option value="Solúveis">Solúveis</option>
                <option value="Ainda não sei">Ainda não sei</option>
              </select>
            </div>
            <div className="campo">
              <label htmlFor="marca_status">Situação da marca</label>
              <select id="marca_status" name="marca_status" required defaultValue="Já tenho marca registrada">
                <option value="Já tenho marca registrada">Já tenho marca registrada</option>
                <option value="Ainda não tenho, quero criar">Ainda não tenho, quero criar</option>
              </select>
            </div>
            <div className="campo">
              <label htmlFor="volume">Volume mensal estimado</label>
              <select id="volume" name="volume" required defaultValue="Ainda não sei">
                <option value="Ainda não sei">Ainda não sei</option>
                <option value="100 a 500 unidades">100 a 500 unidades</option>
                <option value="500 a 2.000 unidades">500 a 2.000 unidades</option>
                <option value="Acima de 2.000 unidades">Acima de 2.000 unidades</option>
              </select>
            </div>
            <div className="campo form-full">
              <label htmlFor="mensagem">Conte um pouco sobre o que você precisa</label>
              <textarea id="mensagem" name="mensagem" placeholder="Ex: quero lançar uma linha de termogênico, ainda não tenho fórmula definida..." />
            </div>

            <div className="form-full form-actions">
              <button type="submit" className="btn btn-primary">Enviar e abrir WhatsApp</button>
              <p className="form-disclaimer">
                Seus dados são usados apenas para retorno comercial da CapsBR. Veja nossa{' '}
                <button type="button" className="footer-link footer-policy-trigger" style={{ textDecoration: 'underline' }} onClick={abrirPolitica}>
                  Política de Privacidade
                </button>.
              </p>
              <div className={'form-feedback' + (feedback ? ' show' : '')}>
                Recebemos seus dados! Confirme o envio na aba do WhatsApp que acabou de abrir.
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
