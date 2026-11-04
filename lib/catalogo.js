// Dados sincronizados com o catálogo completo (catalogo.capsbr.com.br).
// Preço NÃO é exibido no site por decisão de negócio — só o MOQ. O código e
// a composição/nome aqui são os mesmos usados no catálogo oficial.

export const CATALOGO_IMAGENS = {
  'Cápsulas': '/assets/catalogo/mockup-capsulas.jpg',
  'Líquidos': '/assets/catalogo/mockup-liquidos.jpg',
  'Gomas e Pastilhas': '/assets/catalogo/mockup-gomas.jpg',
  'Solúveis': '/assets/catalogo/mockup-soluveis.jpg'
};

export const CATALOGO_CATEGORIAS = ['Cápsulas', 'Líquidos', 'Gomas e Pastilhas', 'Solúveis'];

export const CATALOGO_PRODUTOS = [
  { codigo: 'C-001', categoria: 'Cápsulas', nome: 'Hair, Skin & Nails', formato: '60 cápsulas', moq: 100 },
  { codigo: 'C-002', categoria: 'Cápsulas', nome: '3 Magnésios', formato: '60 cápsulas', moq: 100 },
  { codigo: 'C-003', categoria: 'Cápsulas', nome: '5 Magnésios', formato: '60 cápsulas', moq: 100 },
  { codigo: 'C-004', categoria: 'Cápsulas', nome: 'Café Verde', formato: '60 cápsulas', moq: 100 },
  { codigo: 'C-006', categoria: 'Cápsulas', nome: 'Coenzima Q10 (200mg)', formato: '30 cápsulas', moq: 500 },
  { codigo: 'C-007', categoria: 'Cápsulas', nome: 'Coenzima Q10 e L-Triptofano', formato: '30 cápsulas', moq: 500 },
  { codigo: 'C-008', categoria: 'Cápsulas', nome: 'Colágeno Tipo 2', formato: '30 cápsulas', moq: 500 },
  { codigo: 'C-009', categoria: 'Cápsulas', nome: 'Cúrcuma, Colágeno Tipo II, MSM, Zinco, Vitaminas D3 & K2', formato: '60 cápsulas', moq: 100 },
  { codigo: 'C-010', categoria: 'Cápsulas', nome: 'Colágeno Tipo II, Condroitina, Glucosamina, Vitamina K2 & Magnésio', formato: '60 comprimidos', moq: 100 },
  { codigo: 'C-011', categoria: 'Cápsulas', nome: 'Extrato de Laranja Moro, Cafeína, Guaraná, Vitaminas e Cromo', formato: '60 cápsulas', moq: 100 },
  { codigo: 'C-012', categoria: 'Cápsulas', nome: 'Arginina, Cafeína, Magnésio, Zinco e Vitaminas do Complexo B / Estimulante', formato: '60 cápsulas', moq: 100 },
  { codigo: 'C-014', categoria: 'Cápsulas', nome: 'Magnésio Dimalato', formato: '60 cápsulas', moq: 500 },
  { codigo: 'C-015', categoria: 'Cápsulas', nome: 'Magnésio Quelato', formato: '30 cápsulas', moq: 500 },
  { codigo: 'C-016', categoria: 'Cápsulas', nome: 'Magnésio e L-Treonina', formato: '30 cápsulas', moq: 500 },
  { codigo: 'C-017', categoria: 'Cápsulas', nome: 'Cafeína, Carnitina, Taurina e Tirosina / Pré-Treino', formato: '60 cápsulas', moq: 100 },
  { codigo: 'C-018', categoria: 'Cápsulas', nome: 'Picolinato de Cromo', formato: '60 cápsulas', moq: 100 },

  { codigo: 'L-001', categoria: 'Líquidos', nome: 'Estimulante Líquido', formato: '30 ml · gotas', moq: 100 },
  { codigo: 'L-002', categoria: 'Líquidos', nome: 'Melatonina Líquida', formato: '30 ml · gotas', moq: 100 },
  { codigo: 'L-003', categoria: 'Líquidos', nome: 'Óleo de Abacate', formato: '30 ml · gotas', moq: 100 },
  { codigo: 'L-004', categoria: 'Líquidos', nome: 'Óleo de Semente de Uva', formato: '30 ml · gotas', moq: 100 },
  { codigo: 'L-005', categoria: 'Líquidos', nome: 'Óleo de Prímula, Linhaça e Borragem', formato: '30 ml · gotas', moq: 100 },
  { codigo: 'L-006', categoria: 'Líquidos', nome: 'Óleo de Semente de Abóbora com Vitamina E', formato: '30 ml · gotas', moq: 300 },
  { codigo: 'L-007', categoria: 'Líquidos', nome: 'Vitamina B12 Líquida', formato: '30 ml · gotas', moq: 300 },
  { codigo: 'L-009', categoria: 'Líquidos', nome: 'Vitamina D3 e K2 Líquida', formato: '30 ml · gotas', moq: 300 },

  { codigo: 'G-002', categoria: 'Gomas e Pastilhas', nome: 'Creatina em Gomas, sabor Laranja', formato: '90 gomas', moq: 100 },
  { codigo: 'G-003', categoria: 'Gomas e Pastilhas', nome: 'Creatina em Gomas, sabor Maçã Verde', formato: '90 gomas', moq: 100 },
  { codigo: 'G-004', categoria: 'Gomas e Pastilhas', nome: 'Creatina em Gomas, sabor Morango', formato: '90 gomas', moq: 100 },
  { codigo: 'G-005', categoria: 'Gomas e Pastilhas', nome: 'Hair & Skin em Pastilha de Goma', formato: '30 gomas', moq: 100 },
  { codigo: 'G-007', categoria: 'Gomas e Pastilhas', nome: 'Melatonina Vegana em Pastilha de Goma', formato: '30 gomas', moq: 100 },
  { codigo: 'G-008', categoria: 'Gomas e Pastilhas', nome: 'Melatonina em Pastilha de Goma', formato: '30 gomas', moq: 100 },
  { codigo: 'G-009', categoria: 'Gomas e Pastilhas', nome: 'Pastilha de Creatina, sabor Framboesa', formato: '90 pastilhas', moq: 100 },

  { codigo: 'S-002', categoria: 'Solúveis', nome: 'Creatina Solúvel', formato: 'pó · 300 g', moq: 100 },
  { codigo: 'S-003', categoria: 'Solúveis', nome: 'Pré-treino Sem Cafeína', formato: 'pó · 280 g', moq: 300 },
  { codigo: 'S-004', categoria: 'Solúveis', nome: 'Pré-treino Com Cafeína', formato: 'pó · 300 g', moq: 300 }
];
