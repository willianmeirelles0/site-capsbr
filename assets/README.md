# Assets do site

- `willian-foto.jpg` — foto do fundador, usada na seção "Sobre". ✅ recebida.
- `logo-og.png` — imagem de compartilhamento (WhatsApp, Instagram etc). ✅ recebida.
- `catalogo/catalogo-capsbr.pdf` — catálogo completo, usado no botão "Baixar
  catálogo em PDF". ✅ recebido.
- `catalogo/mockup-capsulas.jpg`, `mockup-liquidos.jpg`, `mockup-gomas.jpg`,
  `mockup-soluveis.jpg` — recortes das imagens ilustrativas do próprio PDF
  (frasco/gotejador/pote "Sua Marca"), usados como foto de cada categoria nos
  cards do catálogo em `index.html`. Gerados automaticamente a partir do PDF,
  não precisam de upload manual.

Os 33 produtos do catálogo (nome, formato, benefícios e preço a partir do
maior volume) estão no array `CATALOGO_PRODUTOS`, dentro do `<script>` no
fim do `index.html`. Para atualizar preços ou adicionar produtos novos,
edite esse array — o site re-renderiza os cards automaticamente.

Fontes da marca (Nasalization, Gotham, Codec) não precisam de arquivo aqui:
o logo já está embutido como vetor no `index.html`, e o texto do site usa
Montserrat (Google Fonts).
