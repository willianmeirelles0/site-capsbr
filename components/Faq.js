'use client';

import { useState } from 'react';
import { FAQ_ITEMS } from '@/lib/faq';

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section id="faq">
      <div className="container">
        <div className="section-center section-intro reveal">
          <span className="eyebrow">Dúvidas frequentes</span>
          <h2>Perguntas que mais recebemos</h2>
        </div>
        <div className="faq-list">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={item.pergunta} className={'faq-item reveal' + (isOpen ? ' open' : '')}>
                <button
                  type="button"
                  className="faq-question"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                >
                  {item.pergunta}
                  <span className="faq-icon">+</span>
                </button>
                <div className="faq-answer">
                  <p>{item.resposta}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
