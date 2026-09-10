const ITENS = [
  { titulo: 'Design de rótulo', texto: 'Incluso a partir de 300 unidades no pedido.' },
  { titulo: 'Notificação Anvisa', texto: 'Cuidamos do código de notificação obrigatório do seu produto.' },
  { titulo: 'Registro de marca (INPI)', texto: 'Parceiro especializado cuida do registro da sua marca junto ao INPI, com acompanhamento completo.' },
  { titulo: 'Frete', texto: 'Calculado após a produção, com transportadoras parceiras. Grátis em pedidos de maior volume.' },
  { titulo: 'Pagamento', texto: '50% na confirmação do pedido e 50% no despacho, ou parcelamento no cartão em até 12x.' }
];

export default function CondicoesDestaque() {
  return (
    <div className="condicoes-destaque reveal">
      <div className="container">
        <span className="condicoes-titulo">Condições e serviços inclusos</span>
        <div className="condicoes-grid">
          {ITENS.map((item) => (
            <div key={item.titulo} className="condicao-item">
              <h3>{item.titulo}</h3>
              <p>{item.texto}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
