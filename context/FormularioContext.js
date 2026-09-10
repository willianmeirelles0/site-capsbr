'use client';

import { createContext, useContext, useState } from 'react';

// Compartilha a categoria escolhida ao clicar em um card do catálogo com o
// <select> de categoria do formulário de qualificação, mais abaixo na página.
const FormularioContext = createContext(null);

export function FormularioProvider({ children }) {
  const [categoriaPreSelecionada, setCategoriaPreSelecionada] = useState(null);
  return (
    <FormularioContext.Provider value={{ categoriaPreSelecionada, setCategoriaPreSelecionada }}>
      {children}
    </FormularioContext.Provider>
  );
}

export function useFormularioContext() {
  return useContext(FormularioContext);
}
