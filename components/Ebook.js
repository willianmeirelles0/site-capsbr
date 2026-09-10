import Logo from './Logo';

export default function Ebook() {
  return (
    <section id="ebook" className="ebook-section">
      <div className="container">
        <div className="ebook-card section-escura reveal">
          <div className="ebook-mockup">
            <div className="ebook-cover">
              <Logo className="logo-mark" />
              <span className="ebook-cover-titulo">Como Construir Sua Marca de Suplementos no Brasil</span>
            </div>
          </div>
          <div className="ebook-texto">
            <span className="eyebrow">Ainda com dúvidas?</span>
            <h2>Aprenda o caminho certo antes de terceirizar</h2>
            <p>Se você ainda tem dúvidas de como entrar no mundo dos nutracêuticos da forma certa, ou precisa se estruturar melhor antes de dar o próximo passo, o ebook da CapsBR reúne o guia completo, direto de quem vive esse mercado.</p>
            <a href="https://capsbr.com.br/ebook/" target="_blank" rel="noopener" className="btn btn-primary">Quero conhecer o ebook</a>
          </div>
        </div>
      </div>
    </section>
  );
}
