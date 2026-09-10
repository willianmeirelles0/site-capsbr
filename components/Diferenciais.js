const CARDS = [
  { titulo: 'Teste de estabilidade sempre', texto: 'Só trabalhamos com fórmulas que passam por teste de estabilidade. Não abrimos exceção, porque a segurança do seu produto é a segurança da sua marca.' },
  { titulo: '100% dentro das normas da Anvisa', texto: 'Seguimos as regras da Anvisa à risca, do processo produtivo ao rótulo. Sem atalho, sem risco regulatório pro seu negócio.' },
  { titulo: 'Design de rótulo de altíssima qualidade', texto: 'Rótulo pensado pra vender: identidade visual profissional, que passa confiança na prateleira e no e-commerce.' },
  { titulo: 'Acompanhamento personalizado', texto: 'Você não fala com um SAC genérico. Tem acompanhamento direto em cada etapa, do briefing à entrega.' },
  { titulo: 'Melhor prazo do Brasil', texto: 'Estrutura pensada pra colocar sua marca no mercado no menor prazo possível em White Label.' },
  { titulo: 'White Label e Private Label', texto: 'Trabalhamos os dois modelos, pra você escolher o que faz mais sentido pro momento da sua marca.' }
];

export default function Diferenciais() {
  return (
    <section id="diferenciais" className="section-suave">
      <div className="container">
        <div className="section-center section-intro reveal">
          <span className="eyebrow">Por que a CapsBR</span>
          <h2>O que garantimos em cada lote, sem exceção</h2>
        </div>
        <div className="cards-grid">
          {CARDS.map((card, i) => {
            const delay = i % 3;
            return (
              <div key={card.titulo} className={'card reveal' + (delay ? ' reveal-delay-' + delay : '')}>
                <span className="card-num">{String(i + 1).padStart(2, '0')}</span>
                <h3>{card.titulo}</h3>
                <p>{card.texto}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
