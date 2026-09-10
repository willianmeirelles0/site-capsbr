// Dados extraídos do catálogo em PDF (33 produtos).
// MOQ = pedido mínimo, em unidades, no maior volume de cada fórmula.

export const CATALOGO_IMAGENS = {
  'Cápsulas': '/assets/catalogo/mockup-capsulas.jpg',
  'Líquidos': '/assets/catalogo/mockup-liquidos.jpg',
  'Gomas e Pastilhas': '/assets/catalogo/mockup-gomas.jpg',
  'Solúveis': '/assets/catalogo/mockup-soluveis.jpg'
};

export const CATALOGO_CATEGORIAS = ['Cápsulas', 'Líquidos', 'Gomas e Pastilhas', 'Solúveis'];

export const CATALOGO_PRODUTOS = [
  { categoria: 'Cápsulas', nome: 'Hair, Skin e Nails', formato: '60 cápsulas', moq: 100, beneficios: ['Saúde de cabelos, pele e unhas', 'Ação antioxidante', 'Suporte ao sistema imunológico'] },
  { categoria: 'Cápsulas', nome: 'Emagrecedor', formato: '60 cápsulas', moq: 100, beneficios: ['Auxilia o metabolismo', 'Rico em antioxidantes', 'Auxilia o metabolismo energético'] },
  { categoria: 'Cápsulas', nome: 'Taurina', formato: '60 cápsulas', moq: 500, beneficios: ['Ação antioxidante', 'Suporte à resistência física', 'Reduz a fadiga mental'] },
  { categoria: 'Cápsulas', nome: 'Magnésio e L-Treonina', formato: '30 cápsulas', moq: 500, beneficios: ['Suporte à saúde óssea', 'Auxilia na síntese de proteínas', 'Suporte à recuperação dos tecidos'] },
  { categoria: 'Cápsulas', nome: 'Magnésio Quelato', formato: '30 cápsulas', moq: 500, beneficios: ['Suporte ao funcionamento celular', 'Contribui para produção de energia', 'Auxilia na saúde óssea e dental'] },
  { categoria: 'Cápsulas', nome: 'Magnésio Dimalato', formato: '60 cápsulas', moq: 500, beneficios: ['Equilíbrio de minerais essenciais', 'Suporte ao funcionamento muscular', 'Contribui para o metabolismo energético'] },
  { categoria: 'Cápsulas', nome: 'Blend 3 Magnésios', formato: '60 cápsulas', moq: 100, beneficios: ['Suporte ao funcionamento muscular', 'Contribui para saúde óssea', 'Suporte ao equilíbrio eletrolítico'] },
  { categoria: 'Cápsulas', nome: 'Vitamina D3 e K2', formato: '30 cápsulas', moq: 500, beneficios: ['Absorção de cálcio', 'Suporte ao sistema imunológico', 'Auxilia na saúde óssea e muscular'] },
  { categoria: 'Cápsulas', nome: 'Coenzima Q10 e L-Triptofano', formato: '30 cápsulas', moq: 500, beneficios: ['Ação antioxidante', 'Qualidade do descanso noturno', 'Suporte ao foco e equilíbrio mental'] },
  { categoria: 'Cápsulas', nome: 'Coenzima Q10 e Vitamina E', formato: '30 cápsulas', moq: 500, beneficios: ['Ação antioxidante', 'Suporte à integridade celular', 'Contribui para o metabolismo energético'] },
  { categoria: 'Cápsulas', nome: 'Blend Colágeno Tipo II', formato: '60 cápsulas', moq: 100, beneficios: ['Saúde das articulações e ossos', 'Suporte ao sistema imunológico', 'Ação antioxidante'] },
  { categoria: 'Cápsulas', nome: 'Colágeno Tipo II', formato: '30 cápsulas', moq: 500, beneficios: ['Saúde das articulações', 'Elasticidade dos tecidos', 'Auxilia na manutenção da cartilagem'] },
  { categoria: 'Cápsulas', nome: 'Pré-Treino', formato: '60 cápsulas', moq: 100, beneficios: ['Redução do cansaço e fadiga', 'Suporte ao foco e estado de alerta', 'Auxilia no desempenho físico'] },
  { categoria: 'Cápsulas', nome: 'Estimulante', formato: '60 cápsulas', moq: 100, beneficios: ['Redução do cansaço e fadiga', 'Suporte ao foco e desempenho mental', 'Auxilia no metabolismo energético'] },
  { categoria: 'Cápsulas', nome: 'Tirosina', formato: '60 cápsulas', moq: 500, beneficios: ['Redução do cansaço e fadiga', 'Suporte ao desempenho cognitivo', 'Participa da síntese de proteínas'] },
  { categoria: 'Líquidos', nome: 'Melatonina', formato: '30 ml · gotas', moq: 100, beneficios: ['Qualidade do sono', 'Regulação do ciclo circadiano', 'Ajuste do ritmo biológico (jet lag)'] },
  { categoria: 'Líquidos', nome: 'Óleo Semente de Abóbora c/ Vitamina E', formato: '30 ml · gotas', moq: 300, beneficios: ['Rico em Vitamina E, ação antioxidante', 'Suporte à saúde do trato urinário', 'Suporte ao bem-estar masculino'] },
  { categoria: 'Líquidos', nome: 'Estimulante', formato: '30 ml · gotas', moq: 100, beneficios: ['Redução do cansaço e fadiga', 'Suporte à disposição', 'Auxilia no sistema imunológico'] },
  { categoria: 'Líquidos', nome: 'Vitamina D3 e K2', formato: '30 ml · gotas', moq: 300, beneficios: ['Suporte à saúde óssea', 'Suporte ao sistema imunológico', 'Auxilia no aproveitamento do cálcio'] },
  { categoria: 'Líquidos', nome: 'Vitamina D3', formato: '20 ml · gotas', moq: 300, beneficios: ['Suporte à saúde óssea', 'Suporte ao sistema imunológico', 'Absorção de cálcio e fósforo'] },
  { categoria: 'Líquidos', nome: 'Vitamina B12', formato: '30 ml · gotas', moq: 300, beneficios: ['Formação das células sanguíneas', 'Suporte ao sistema nervoso', 'Forma ativa (metilcobalamina)'] },
  { categoria: 'Gomas e Pastilhas', nome: 'Creatina', formato: '216 g · pastilhas', moq: 100, beneficios: ['Desempenho em alta intensidade', 'Suporte ao ganho de massa muscular', 'Auxilia na recuperação muscular'] },
  { categoria: 'Gomas e Pastilhas', nome: 'Creatina', formato: '360 g · gomas', moq: 100, beneficios: ['Desempenho em alta intensidade', 'Suporte ao ganho de massa muscular', '3 sabores disponíveis'] },
  { categoria: 'Gomas e Pastilhas', nome: 'Melatonina', formato: '105 g · gomas', moq: 100, beneficios: ['Qualidade do sono', 'Regulação do ciclo circadiano', 'Zero açúcar, adoçado com stevia'] },
  { categoria: 'Gomas e Pastilhas', nome: 'Melatonina II', formato: '120 g · pastilhas', moq: 100, beneficios: ['Qualidade do sono', 'Ajuste do relógio biológico', 'Produto vegano'] },
  { categoria: 'Gomas e Pastilhas', nome: 'Pele & Cabelo', formato: '105 g · gomas', moq: 100, beneficios: ['Saúde de cabelos e pele', 'Ação antioxidante', 'Suporte ao sistema imunológico'] },
  { categoria: 'Gomas e Pastilhas', nome: 'Imunidade Kids', formato: '120 g · gomas', moq: 100, beneficios: ['Suporte ao sistema imunológico', 'Saúde de ossos e dentes', 'Indicado a partir de 4 anos'] },
  { categoria: 'Gomas e Pastilhas', nome: 'Multivitamínico', formato: '60 chicletes', moq: 100, beneficios: ['Saúde de cabelos, pele e unhas', 'Multivitamínico para toda a família', 'Ação antioxidante'] },
  { categoria: 'Solúveis', nome: 'Creatina', formato: '300 g · pó', moq: 100, beneficios: ['Ganho de força e massa muscular', 'Reposição energética muscular', 'Sem sabor, alta pureza'] },
  { categoria: 'Solúveis', nome: 'Beta Alanina', formato: '300 g · pó', moq: 100, beneficios: ['Redução do cansaço muscular', 'Desempenho em alta intensidade', 'Suporte ao rendimento esportivo'] },
  { categoria: 'Solúveis', nome: 'Detox', formato: '150 g · pó', moq: 300, beneficios: ['Suporte às funções de eliminação', 'Rica fonte de vitaminas e minerais', 'Ação antioxidante'] },
  { categoria: 'Solúveis', nome: 'Colágeno', formato: '360 g · pó', moq: 300, beneficios: ['Saúde de pele, cabelos e unhas', 'Suporte à saúde óssea', 'Suporte ao sistema imunológico'] }
];
