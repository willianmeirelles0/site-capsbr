'use client';

import { useMemo, useState } from 'react';
import { CATALOGO_CATEGORIAS, CATALOGO_IMAGENS, CATALOGO_PRODUTOS } from '@/lib/catalogo';
import { useFormularioContext } from '@/context/FormularioContext';

export default function Catalogo() {
  const [filtro, setFiltro] = useState('todas');
  const { setCategoriaPreSelecionada } = useFormularioContext();

  const produtos = useMemo(
    () => (filtro === 'todas' ? CATALOGO_PRODUTOS : CATALOGO_PRODUTOS.filter((p) => p.categoria === filtro)),
    [filtro]
  );

  return (
    <section id="catalogo">
      <div className="container">
        <div className="section-center section-intro reveal">
          <span className="eyebrow">Nosso catálogo</span>
          <h2>Fórmulas prontas pra sua marca</h2>
        </div>

        <div className="catalogo-cats reveal" id="catalogoFiltros">
          <button
            type="button"
            className={'catalogo-cat' + (filtro === 'todas' ? ' is-active' : '')}
            onClick={() => setFiltro('todas')}
          >
            Todas
          </button>
          {CATALOGO_CATEGORIAS.map((cat) => (
            <button
              key={cat}
              type="button"
              className={'catalogo-cat' + (filtro === cat ? ' is-active' : '')}
              onClick={() => setFiltro(cat)}
            >
              {cat === 'Gomas e Pastilhas' ? 'Gomas & Pastilhas' : cat}
            </button>
          ))}
        </div>

        <div className="catalogo-grid" id="catalogoGrid">
          {produtos.length === 0 && <p className="catalogo-vazio">Nenhum produto encontrado nesta categoria.</p>}
          {produtos.map((p, i) => {
            const delay = i % 4 === 0 ? '' : ' reveal-delay-' + ((i % 3) + 1);
            return (
              <a
                key={p.categoria + p.nome + p.formato}
                href="#formulario"
                className={'produto-card reveal' + delay}
                onClick={() => setCategoriaPreSelecionada(p.categoria)}
              >
                <div className="produto-imagem">
                  <img src={CATALOGO_IMAGENS[p.categoria]} alt={p.nome + ', ' + p.categoria + ', imagem meramente ilustrativa'} loading="lazy" />
                </div>
                <div className="produto-info">
                  <span className="produto-categoria">{p.categoria}</span>
                  <h3>{p.nome}</h3>
                  <span className="produto-formato">{p.formato}</span>
                  <ul className="produto-beneficios">
                    {p.beneficios.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                  <div className="produto-preco">
                    <span>Pedido mínimo</span>
                    <strong>{p.moq} unidades</strong>
                  </div>
                </div>
              </a>
            );
          })}
        </div>

        <div className="catalogo-cta reveal">
          <p>Todas as fórmulas passam por teste de estabilidade e seguem as normas da Anvisa. Os valores variam por negociação e quantidade, peça sua cotação completa.</p>
          <a href="#formulario" className="btn btn-primary">Quero uma cotação para minha marca</a>
        </div>
      </div>
    </section>
  );
}
