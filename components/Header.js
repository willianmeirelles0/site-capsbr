import Logo from './Logo';

export default function Header() {
  return (
    <header>
      <div className="header-inner">
        <a href="#topo" className="logo" aria-label="Página inicial da CapsBR">
          <Logo className="logo-mark" />
          <span className="logo-suffix">Terceirização de Suplementos</span>
        </a>
        <nav className="main-nav">
          <a href="#diferenciais">Diferenciais</a>
          <a href="#como-funciona">Como funciona</a>
          <a href="#catalogo">Catálogo</a>
          <a href="#sobre">Sobre</a>
          <a href="#faq">Dúvidas</a>
        </nav>
        <a href="#formulario" className="header-cta">Solicitar orçamento</a>
      </div>
    </header>
  );
}
