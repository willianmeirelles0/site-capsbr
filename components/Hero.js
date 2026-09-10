import WhatsappLink from './WhatsappLink';

export default function Hero() {
  return (
    <section className="hero section-escura">
      <div className="container hero-inner">
        <span className="hero-tag reveal">
          TERCEIRIZAÇÃO WHITE LABEL <span className="hero-tag-quebra">&amp; PRIVATE LABEL</span>
        </span>
        <h1 className="reveal reveal-delay-1">Sua nova marca de suplementos no mercado, sem abrir fábrica.</h1>
        <p className="subheadline reveal reveal-delay-2">
          A CapsBR cuida da fórmula, do teste de estabilidade, do rótulo e da produção, 100% dentro das normas da
          Anvisa, com o melhor prazo do Brasil para White Label. Você foca em vender.
        </p>
        <div className="price-anchor reveal reveal-delay-2">
          <span className="price-anchor-tag">Projetos a partir de R$ 1.640,00</span>
          <span className="price-anchor-detail">
            Inclui produto e design de rótulo. Não inclui impressão do rótulo, frete, notificação Anvisa nem
            registro de marca (INPI).
          </span>
        </div>
        <div className="cta-row reveal reveal-delay-3">
          <a href="#formulario" className="btn btn-primary">Quero terceirizar minha produção</a>
          <WhatsappLink className="btn btn-secondary">Falar agora no WhatsApp</WhatsappLink>
        </div>
        <p className="hero-note reveal reveal-delay-3">
          Respondemos em até 1h útil (geralmente bem mais rápido) &middot; atendimento direto com quem produz
        </p>
      </div>
    </section>
  );
}
