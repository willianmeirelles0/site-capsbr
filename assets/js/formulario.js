/* =========================================================
   CapsBR · Formulário de qualificação (alternativa pra quem prefere
   não abrir o WhatsApp direto). Ao enviar: tenta mandar por e-mail
   (Web3Forms) e sempre abre o WhatsApp com um resumo pronto.
   ========================================================= */
(() => {
  const form = document.getElementById('qualificacao-form');
  if (!form) return;

  // Chave pública do Web3Forms (não é credencial secreta, só identifica
  // pra onde o Web3Forms deve encaminhar as respostas).
  const WEB3FORMS_ACCESS_KEY = 'bef4c6d0-1fb8-4147-8320-c250aa3cc40e';

  form.addEventListener('submit', e => {
    e.preventDefault();

    // Honeypot: se o campo invisível foi preenchido, é bot — ignora silenciosamente
    if (form.empresa_site.value) return;

    const dados = {
      nome: form.nome.value.trim(),
      marca: form.marca.value.trim(),
      whatsapp: form.whatsapp.value.trim(),
      email: form.email.value.trim(),
      linha: form.linha.value,
      marca_status: form.marca_status.value,
      volume: form.volume.value,
      mensagem: form.mensagem.value.trim(),
    };

    if (!form.checkValidity()) { form.reportValidity(); return; }

    const resumo = [
      'Olá, preenchi o formulário do site e gostaria de seguir meu atendimento',
      'Nome: ' + dados.nome,
      dados.marca ? 'Marca: ' + dados.marca : null,
      'WhatsApp: ' + dados.whatsapp,
      'E-mail: ' + dados.email,
      'Linha de interesse: ' + dados.linha,
      'Situação da marca: ' + dados.marca_status,
      'Volume estimado: ' + dados.volume,
      dados.mensagem ? 'Mensagem: ' + dados.mensagem : null,
    ].filter(Boolean).join('\n');

    // (1) Envio por e-mail via Web3Forms — falha silenciosamente se der erro
    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: 'Novo lead de terceirização: ' + dados.nome,
        from_name: 'Site CapsBR',
        ...dados,
      }),
    }).catch(() => { /* segue o fluxo mesmo se o e-mail falhar */ });

    // (2) Meta Pixel — Lead, com Advanced Matching (fbq hasheia no navegador)
    if (typeof window.fbq === 'function') {
      const nomePartes = dados.nome.split(' ').filter(Boolean);
      let telefoneDigitos = dados.whatsapp.replace(/\D/g, '');
      if (telefoneDigitos && telefoneDigitos.slice(0, 2) !== '55') telefoneDigitos = '55' + telefoneDigitos;
      window.fbq('init', '1024961890342249', {
        em: dados.email,
        ph: telefoneDigitos,
        fn: nomePartes[0] || '',
        ln: nomePartes.length > 1 ? nomePartes[nomePartes.length - 1] : '',
      });
      window.fbq('track', 'Lead', { content_name: dados.linha, content_category: dados.marca_status });
    }

    // (2b) Espelha no GA4
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'generate_lead', { event_category: 'formulario', linha: dados.linha, volume: dados.volume });
    }

    // (3) Sempre abre o WhatsApp com o resumo pronto
    const link = window.Caps && window.Caps.waLink ? window.Caps.waLink(resumo) : ('https://wa.me/5554997090147?text=' + encodeURIComponent(resumo));
    window.open(link, '_blank', 'noopener');

    const feedback = document.querySelector('.js-form-feedback');
    if (feedback) feedback.classList.add('show');
    form.reset();
  });
})();
