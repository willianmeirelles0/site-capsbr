const DORES = [
  'Fábrica atrasa a entrega e você fica sem estoque',
  'Rótulo amador que não passa confiança pro seu cliente',
  'Fórmula sem teste de estabilidade, um risco pra sua marca',
  'Insegurança se o produto está mesmo dentro das normas da Anvisa',
  'Ninguém te explica o processo, você só recebe prazo e cobrança',
  'Pouca variedade de fórmulas pra você diferenciar seu catálogo'
];

export default function Dor() {
  return (
    <section id="dor">
      <div className="container">
        <div className="section-center section-intro reveal">
          <span className="eyebrow">Se isso já aconteceu com você</span>
          <h2>Terceirizar mal custa mais caro do que parece</h2>
        </div>
        <div className="pain-grid">
          {DORES.map((texto, i) => {
            const delay = i % 4;
            return (
              <div key={texto} className={'pain-card reveal' + (delay ? ' reveal-delay-' + delay : '')}>
                <p>{texto}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
