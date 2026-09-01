---
description: Melhora o visual da aplicação frontend aplicando Tailwind CSS 3 aos componentes existentes.
name: melhorar-visual
agent: ui-stylist
---

# Melhorar o visual do frontend com Tailwind CSS 3

Melhore o visual da aplicação em `frontend/` usando Tailwind CSS 3, sem alterar
comportamento, contratos de API ou a lógica dos componentes.

## Etapa 1 - Instalar e configurar o Tailwind CSS 3

1. Instale as dependências de desenvolvimento em `frontend/`:
   `tailwindcss@3`, `postcss` e `autoprefixer`.
2. Crie `frontend/tailwind.config.js` com `content` apontando para
   `./index.html` e `./src/**/*.{js,jsx}`.
3. Crie `frontend/postcss.config.js` com os plugins `tailwindcss` e
   `autoprefixer`.
4. Crie `frontend/src/index.css` com as diretivas `@tailwind base`,
   `@tailwind components` e `@tailwind utilities`, e importe-o em
   `frontend/src/main.jsx`.

## Etapa 2 - Estilizar os componentes existentes

Aplique classes utilitárias do Tailwind nos componentes atuais:

- `App.jsx`: layout centralizado com largura máxima, espaçamento vertical
  entre as seções e cabeçalho com hierarquia tipográfica clara.
- `components/UploadComponent.jsx`: formulário em card com borda e sombra
  suaves, input de arquivo estilizado, botão primário com estados de hover,
  focus e disabled, e mensagem de erro em destaque (`role="alert"`).
- `components/DocumentList.jsx`: tabela com cabeçalho diferenciado, linhas com
  hover, espaçamento confortável e estados de carregamento, erro e lista vazia
  visualmente distintos.
- `components/DownloadButton.jsx`: aparência de botão secundário consistente
  com o botão de upload.

## Restrições

- Não altere hooks, handlers, props ou o cliente de API.
- Preserve os atributos de acessibilidade existentes e mantenha foco visível.
- Não adicione bibliotecas de componentes prontos (ex. daisyUI, Flowbite).
- Evite duplicação: extraia componentes pequenos se padrões de classe se
  repetirem.

## Validação

Execute `npm run build` em `frontend/` e confirme que a compilação passa.
