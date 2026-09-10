const ITENS = ['Teste de estabilidade', '100% Anvisa', 'White Label', 'Private Label', 'Rótulo premium', 'Melhor prazo do Brasil'];

export default function Ticker() {
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-track">
        {[...ITENS, ...ITENS].map((item, i) => (
          <span key={i}>{item}</span>
        ))}
      </div>
    </div>
  );
}
