---
name: documentation-lookup
description: Use documentação atualizada de bibliotecas e frameworks via Context7 MCP em vez de dados de treinamento. Ativa para perguntas de configuração, referências de API, exemplos de código ou quando o usuário cita um framework (ex.: React, Next.js, Prisma).
metadata:
  origin: ECC
---

# Consulta de Documentação (Context7)

Quando o usuário perguntar sobre bibliotecas, frameworks ou APIs, busque a documentação atual via Context7 MCP (ferramentas `resolve-library-id` e `query-docs`) em vez de confiar nos dados de treinamento.

## Conceitos Centrais

- **Context7**: servidor MCP que expõe documentação ao vivo; use-o em vez dos dados de treinamento para bibliotecas e APIs.
- **resolve-library-id**: Retorna IDs de biblioteca compatíveis com o Context7 (ex.: `/vercel/next.js`) a partir de um nome de biblioteca e de uma consulta.
- **query-docs**: Busca documentação e trechos de código para um dado ID de biblioteca e pergunta. Sempre chame resolve-library-id primeiro para obter um ID de biblioteca válido.

## Quando usar

Ative quando o usuário:

- Faz perguntas de configuração ou setup (ex.: "Como configuro o middleware do Next.js?")
- Solicita código que depende de uma biblioteca ("Escreva uma query do Prisma para...")
- Precisa de informações de API ou de referência ("Quais são os métodos de auth do Supabase?")
- Menciona frameworks ou bibliotecas específicas (React, Vue, Svelte, Express, Tailwind, Prisma, Supabase, etc.)

Use esta skill sempre que a solicitação depender do comportamento preciso e atualizado de uma biblioteca, framework ou API. Aplica-se a harnesses que tenham o Context7 MCP configurado (ex.: Claude Code, Cursor, Codex).

## Como funciona

### Passo 1: Resolver o ID da Biblioteca

Chame a ferramenta MCP **resolve-library-id** com:

- **libraryName**: O nome da biblioteca ou produto extraído da pergunta do usuário (ex.: `Next.js`, `Prisma`, `Supabase`).
- **query**: A pergunta completa do usuário. Isso melhora o ranking de relevância dos resultados.

Você deve obter um ID de biblioteca compatível com o Context7 (formato `/org/project` ou `/org/project/version`) antes de consultar a documentação. Não chame query-docs sem um ID de biblioteca válido deste passo.

### Passo 2: Selecionar a Melhor Correspondência

A partir dos resultados da resolução, escolha um resultado usando:

- **Correspondência de nome**: Prefira a correspondência exata ou mais próxima do que o usuário pediu.
- **Pontuação de benchmark**: Pontuações mais altas indicam melhor qualidade da documentação (100 é a mais alta).
- **Reputação da fonte**: Prefira reputação Alta ou Média quando disponível.
- **Versão**: Se o usuário especificou uma versão (ex.: "React 19", "Next.js 15"), prefira um ID de biblioteca específico da versão, se listado (ex.: `/org/project/v1.2.0`).

### Passo 3: Buscar a Documentação

Chame a ferramenta MCP **query-docs** com:

- **libraryId**: O ID de biblioteca do Context7 selecionado no Passo 2 (ex.: `/vercel/next.js`).
- **query**: A pergunta ou tarefa específica do usuário. Seja específico para obter trechos relevantes.

Limite: não chame query-docs (nem resolve-library-id) mais de 3 vezes por pergunta. Se a resposta permanecer pouco clara após 3 chamadas, declare a incerteza e use a melhor informação que você tiver em vez de adivinhar.

### Passo 4: Usar a Documentação

- Responda à pergunta do usuário usando a informação atual e obtida.
- Inclua exemplos de código relevantes da documentação quando útil.
- Cite a biblioteca ou a versão quando isso importar (ex.: "No Next.js 15...").

## Exemplos

### Exemplo: middleware do Next.js

1. Chame **resolve-library-id** com `libraryName: "Next.js"`, `query: "How do I set up Next.js middleware?"`.
2. A partir dos resultados, escolha a melhor correspondência (ex.: `/vercel/next.js`) por nome e pontuação de benchmark.
3. Chame **query-docs** com `libraryId: "/vercel/next.js"`, `query: "How do I set up Next.js middleware?"`.
4. Use os trechos e o texto retornados para responder; inclua um exemplo mínimo de `middleware.ts` da documentação, se relevante.

### Exemplo: query do Prisma

1. Chame **resolve-library-id** com `libraryName: "Prisma"`, `query: "How do I query with relations?"`.
2. Selecione o ID de biblioteca oficial do Prisma (ex.: `/prisma/prisma`).
3. Chame **query-docs** com esse `libraryId` e a consulta.
4. Retorne o padrão do Prisma Client (ex.: `include` ou `select`) com um trecho de código curto da documentação.

### Exemplo: métodos de auth do Supabase

1. Chame **resolve-library-id** com `libraryName: "Supabase"`, `query: "What are the auth methods?"`.
2. Escolha o ID de biblioteca da documentação do Supabase.
3. Chame **query-docs**; resuma os métodos de auth e mostre exemplos mínimos a partir da documentação obtida.

## Melhores Práticas

- **Seja específico**: Use a pergunta completa do usuário como consulta sempre que possível para melhor relevância.
- **Consciência de versão**: Quando os usuários mencionarem versões, use IDs de biblioteca específicos da versão do passo de resolução quando disponíveis.
- **Prefira fontes oficiais**: Quando houver várias correspondências, prefira pacotes oficiais ou primários em vez de forks da comunidade.
- **Sem dados sensíveis**: Oculte chaves de API, senhas, tokens e outros segredos de qualquer consulta enviada ao Context7. Trate a pergunta do usuário como potencialmente contendo segredos antes de passá-la para resolve-library-id ou query-docs.
