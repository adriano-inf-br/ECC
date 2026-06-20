---
paths:
  - "**/nuxt.config.*"
  - "**/app.config.*"
  - "**/app.vue"
  - "**/server/**/*.ts"
  - "**/pages/**"
  - "**/middleware/**"
---

# Padrões do Nuxt

> Este arquivo estende [common/patterns.md](../common/patterns.md) com conteúdo específico de Nuxt.

## Seleção de busca de dados

Crítico. Escolha pelo momento de renderização, não por hábito.

- `useFetch(url)` = seguro para SSR, dados iniciais/de primeira pintura baseados em URL. O padrão. Encaminha o resultado do servidor pelo payload, de modo que não há busca dupla na hidratação.
- `useAsyncData(key, fn)` = seguro para SSR, lógica assíncrona customizada (SDK / GraphQL / chamadas combinadas). A key explícita compartilha o resultado entre componentes.
- `$fetch` = apenas interações do cliente (envio de formulário, clique de botão, POST/PUT/DELETE). NÃO é seguro para SSR; faz busca dupla se usado para a primeira pintura.
- Regra: `useFetch` / `useAsyncData` para qualquer coisa renderizada na primeira pintura, `$fetch` apenas para mutações orientadas a eventos.

## Estado compartilhado

- `useState('key', () => init)` para estado compartilhado seguro para SSR. Os valores devem ser serializáveis em JSON.
- NUNCA `export const x = ref()` no escopo do módulo. Uma única instância compartilhada vaza entre requisições SSR concorrentes e causa um vazamento de memória.
- Com `@pinia/nuxt`: Pinia para estado de domínio, `useState` para pequenos primitivos compartilhados entre componentes.
- A inicialização assíncrona no lado do servidor vai em `callOnce(async () => {...})`, não como um efeito colateral dentro de `useAsyncData`.

## Rotas de servidor Nitro

- `server/api/*.{get,post}.ts` se auto-registram por caminho + método. O handler é `defineEventHandler((event) => ...)`.
- Erros via `throw createError({ status, statusText })`. Prefira `status` / `statusText` da Web-API em vez de `statusCode` / `statusMessage`, que estão obsoletos.
- `server/middleware/` NÃO deve retornar uma resposta. Apenas mute `event.context` ou defina headers.

## Middleware de rota

- `app/middleware/*.ts` com `defineNuxtRouteMiddleware((to, from) => ...)`.
- Use os argumentos `to` / `from`. NÃO chame `useRoute()` dentro do middleware.
- O sufixo `.global` executa em toda rota. Retorne `navigateTo()` para redirecionar, `abortNavigation()` para interromper.

## Renderização segura para hidratação

- Direcione com base em `status` (`idle | pending | success | error`) para buscas lazy.
- O payload de `useAsyncData` usa `devalue` (Date/Map/Set/refs sobrevivem). Uma resposta de `server/api` é apenas `JSON.stringify`, então defina `toJSON()` para tipos não-JSON.
- Reduza o payload com `pick` / `transform`. Isso reduz o tamanho serializado, não pula a busca.

## Referência

- Skills do ECC: `nuxt4-patterns`, `vite-patterns`, `frontend-patterns`.
- [Busca de dados do Nuxt](https://nuxt.com/docs/getting-started/data-fetching)
- [Gerenciamento de estado do Nuxt](https://nuxt.com/docs/getting-started/state-management)
- [Motor de servidor do Nuxt (Nitro)](https://nuxt.com/docs/guide/directory-structure/server)
