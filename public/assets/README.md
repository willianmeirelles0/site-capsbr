# Assets do site

- `willian-foto.jpg` — foto do fundador, usada na seção "Sobre". ✅ recebida.
- `logo-og.png` — imagem de compartilhamento (WhatsApp, Instagram etc). ✅ recebida.
- `catalogo/catalogo-capsbr.pdf` — catálogo completo em PDF, mantido aqui como
  referência (não está mais linkado no site).
- `catalogo/mockup-capsulas.jpg`, `mockup-liquidos.jpg`, `mockup-gomas.jpg`,
  `mockup-soluveis.jpg` — recortes das imagens ilustrativas do próprio PDF
  (frasco/gotejador/pote "Sua Marca"), usados como foto de cada categoria nos
  cards do catálogo.

Os produtos do catálogo (nome, formato, benefícios e MOQ) estão em
`lib/catalogo.js`, na raiz do projeto. Para atualizar ou adicionar produtos
novos, edite esse arquivo — o site re-renderiza os cards automaticamente.

Fontes da marca (Nasalization, Gotham) não precisam de arquivo aqui: o logo
já está embutido como vetor em `components/LogoSprite.js`, e o texto do site
usa Montserrat (via `next/font/google`, self-hospedada pela Vercel).
