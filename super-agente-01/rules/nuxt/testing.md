---
paths:
  - "**/nuxt.config.*"
  - "**/server/**/*.ts"
  - "**/pages/**"
  - "**/layouts/**"
  - "**/middleware/**"
---

# Testes do Nuxt

> Este arquivo estende [common/testing.md](../common/testing.md) com conteúdo específico de Nuxt.

Pacote: `@nuxt/test-utils`. Vitest-first para testes unitários e de componente, com suporte E2E de navegador via Playwright embutido. nuxt-vitest e vitest-environment-nuxt foram substituídos e incorporados a ele.

## Setup

- Instale as dependências de desenvolvimento: `@nuxt/test-utils vitest @vue/test-utils happy-dom playwright-core`.
- Config: `defineVitestConfig({ test: { environment: 'nuxt' } })` de `@nuxt/test-utils/config`. Use `defineVitestProject` para multi-projeto (ambientes separados de unit / nuxt / e2e).
- Adicione `@nuxt/test-utils/module` ao `nuxt.config`. Opt-in por arquivo via `// @vitest-environment nuxt`.

## Helpers de runtime

Importe de `@nuxt/test-utils/runtime`.

- `mountSuspended(component, opts)` monta no ambiente Nuxt com setup assíncrono + injeção de plugin (aceita as opções de mount do `@vue/test-utils` + `route`).
- `renderSuspended(component, opts)` é a variante da Testing Library (precisa de `@testing-library/vue`).
- `mockNuxtImport(name, factory)` faz mock de auto-imports (ex.: `useState`). Uma vez por import por arquivo, use `vi.hoisted()`.
- `mockComponent(name, factory)` faz mock por nome PascalCase ou caminho.
- `registerEndpoint(path, handler|opts)` faz mock de um endpoint Nitro para testar rotas de servidor ou criar stub do backend. Suporta método + `once`.

## Helpers de E2E

Importe de `@nuxt/test-utils/e2e`.

- `await setup({ rootDir, server, browser, ... })` dentro do bloco describe (gerencia beforeAll/afterAll).
- Então `$fetch(url)` (HTML renderizado), `fetch(url)` (objeto de resposta), `url(path)` (URL completa com porta), `createPage(url)` (Playwright).
- Integração com Playwright: importe `expect` / `test` de `@nuxt/test-utils/playwright`.

## O que testar e como

- Composables: faça mock dos auto-imports com `mockNuxtImport`, monte um componente host via `mountSuspended` para exercitar `useState` / `useFetch` no runtime do Nuxt.
- Rotas de servidor: `registerEndpoint` para criar stub, ou `$fetch` / `fetch` e2e contra o servidor Nitro real.

## Referência

- Skills do ECC: `nuxt4-patterns`, `e2e-testing`, `vite-patterns`.
- [Documentação de testes do Nuxt](https://nuxt.com/docs/getting-started/testing)
- [@nuxt/test-utils npm](https://www.npmjs.com/package/@nuxt/test-utils)
