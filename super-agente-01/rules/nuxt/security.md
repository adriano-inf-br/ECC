---
paths:
  - "**/nuxt.config.*"
  - "**/app.config.*"
  - "**/server/**/*.ts"
---

# Segurança do Nuxt

> Este arquivo estende [common/security.md](../common/security.md) com conteúdo específico de Nuxt.

## runtimeConfig público vs privado

- As chaves de `runtimeConfig` na raiz são exclusivas do servidor. `runtimeConfig.public` serializa para dentro do payload de TODA página (visível ao cliente).
- Segredos vão apenas na raiz. Nunca coloque segredos em `app.config.ts` ou em `runtimeConfig.public`; ambos são enviados para o bundle do cliente.
- Aviso oficial: "Tenha cuidado para não expor chaves de runtime config ao lado do cliente, seja renderizando-as ou passando-as para `useState`."

## Validação de entrada de rotas de servidor

- Use os leitores validadores do h3. NÃO confie em `readBody` / `getQuery` / `getRouterParam` brutos.
  - `readValidatedBody(event, schema)` valida o corpo.
  - `getValidatedQuery(event, schema)` valida a query.
  - `getValidatedRouterParams(event, schema)` valida os parâmetros de rota.
- Todos aceitam uma função de validação ou um schema Zod e lançam erro em caso de falha.

## Vazamento de payload de SSR

- Qualquer coisa em `useState`, resultados de `useFetch` / `useAsyncData` ou `runtimeConfig.public` é serializada no payload do cliente. Nunca escreva um segredo nesses lugares.
- Use `useServerSeoMeta` para meta exclusiva do servidor, sem custo no cliente.

## Repasse de cookie e autenticação no SSR

- O Nuxt NÃO anexa automaticamente os cookies do usuário recebido às chamadas `$fetch` de saída no lado do servidor.
- Encaminhe explicitamente com `useRequestFetch()` (mais limpo, já vinculado aos headers da requisição) ou `useRequestHeaders(['cookie'])`.
- Repasse um `Set-Cookie` do backend para o navegador via `$fetch.raw` + `appendResponseHeader(event, 'set-cookie', ...)`.
- O socket.io é exclusivo do cliente (plugin `.client.ts`), nunca SSR.

## SSRF no $fetch de servidor

- As rotas de servidor executam com saída de rede completa. Nunca passe entrada controlada pelo usuário diretamente para uma URL ou host de `$fetch` no lado do servidor.
- Valide o parâmetro primeiro (utilitários do h3 acima), faça allowlist do alvo, fixe em `runtimeConfig.public.apiBase`, rejeite URLs absolutas fornecidas pelo usuário.
- Acione `/security-review` automaticamente apenas para rotas que fazem requisições de rede externas (`$fetch` de servidor), lidam com tokens de autenticação ou credenciais, ou realizam mutações sensíveis ou verificações de autorização. Exemplos: endpoints de proxy propensos a SSRF, troca de token ou redefinição de senha, ações de administrador. Pule rotas benignas somente-leitura que apenas aceitam parâmetros de query validados.

## Referência

- Skills do ECC: `security-review`, `nuxt4-patterns`.
- [Runtime config do Nuxt](https://nuxt.com/docs/guide/going-further/runtime-config)
- [Utilitários de requisição do h3](https://v1.h3.dev/utils/request)
