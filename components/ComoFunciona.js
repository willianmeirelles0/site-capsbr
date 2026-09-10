const PASSOS = [
  { titulo: 'Briefing e escolha da fórmula', texto: 'Entendemos sua marca e ajudamos você a escolher entre White Label ou Private Label.' },
  { titulo: 'Rótulo e aprovação', texto: 'Desenvolvemos o rótulo com sua identidade visual e você aprova cada detalhe antes da produção.' },
  { titulo: 'Produção com teste de estabilidade', texto: 'Fabricação dentro das normas da Anvisa, com teste de estabilidade em todas as fórmulas.' },
  { titulo: 'Entrega no prazo combinado', texto: 'Você recebe o produto pronto pra vender, com acompanhamento até a entrega.' }
];

export default function ComoFunciona() {
  return (
    <section id="como-funciona" className="section-suave">
      <div className="container">
        <div className="section-center section-intro reveal">
          <span className="eyebrow">Do briefing à entrega</span>
          <h2>Como funciona a terceirização com a CapsBR Nutracêuticos</h2>
        </div>
        <div className="steps-grid">
          {PASSOS.map((passo, i) => (
            <div key={passo.titulo} className={'step-card reveal' + (i ? ' reveal-delay-' + i : '')}>
              <span className="step-num">{i + 1}</span>
              <h3>{passo.titulo}</h3>
              <p>{passo.texto}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
