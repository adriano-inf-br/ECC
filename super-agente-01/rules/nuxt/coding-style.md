---
paths:
  - "**/nuxt.config.*"
  - "**/app.config.*"
  - "**/app.vue"
  - "**/pages/**"
  - "**/layouts/**"
  - "**/middleware/**"
---

# Estilo de Código Nuxt

> Este arquivo estende [common/coding-style.md](../common/coding-style.md) com conteúdo específico de Nuxt.

## Layout de diretórios

- O `srcDir` padrão é `app/`. Os arquivos do framework ficam em `app/pages/`, `app/layouts/`, `app/middleware/`, `app/plugins/`, `app/app.config.ts`. `nuxt.config.ts` e `server/` permanecem na raiz do projeto.
- Alguns projetos sobrescrevem o `srcDir` para `src/` para um layout de Feature-Sliced Design, remapeando `dir.pages` (por exemplo para `src/app/routes`), `dir.layouts` e os aliases `@`/`~`. Sempre verifique o `nuxt.config.ts` antes de presumir um caminho.

## Disciplina de auto-imports

- Composables em `app/composables/` e `server/utils/` são auto-importados. NÃO importe manualmente composables do Nuxt (`useFetch`, `useState`, `navigateTo`) nem `defineStore` / `storeToRefs`.
- NÃO adicione uma dependência avulsa de `vue-router` (o Nuxt já inclui a v5) nem monte manualmente `createApp` / `createPinia` / `createRouter`. O framework conecta tudo isso.

## Macros do compilador

- `definePageMeta` é uma macro de tempo de compilação. Apenas valores estáticos, sem dados reativos e sem chamadas com efeitos colaterais dentro dela.
- Estenda o `PageMeta` tipado via `declare module '#app'` em vez de fazer cast.

## Separação de arquivos de configuração

Três arquivos distintos, não os confunda.

- `nuxt.config.ts` = somente tempo de build (`routeRules`, `modules`, `nitro`, flag `ssr`). Não reativo.
- `runtimeConfig` (dentro de nuxt.config) = valores de runtime por ambiente, sobrescritíveis por env via `NUXT_*`. As chaves raiz são exclusivas do servidor; as chaves `public` são visíveis no cliente.
- `app/app.config.ts` = configurações reativas públicas fixadas no build (tokens de tema, feature flags). Sem sobrescrita por env. NUNCA segredos.

## Head e meta

- `app.head` em `nuxt.config.ts` recebe apenas valores estáticos.
- Meta reativa passa por `useHead` / `useSeoMeta` no setup do componente, nunca via `app.head`.

## Referência

- Skills do ECC: `nuxt4-patterns`, `vite-patterns`, `frontend-patterns`.
- [Estrutura de diretórios do Nuxt](https://nuxt.com/docs/guide/directory-structure/app)
- [Configuração do Nuxt](https://nuxt.com/docs/api/nuxt-config)
