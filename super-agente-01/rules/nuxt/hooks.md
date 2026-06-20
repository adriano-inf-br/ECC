---
paths:
  - "**/nuxt.config.*"
  - "**/app.config.*"
  - "**/server/**/*.ts"
  - "**/*.vue"
---

# Hooks do Nuxt

> Este arquivo estende [common/hooks.md](../common/hooks.md) com conteúdo específico de Nuxt.

Estes são hooks do harness do Claude Code para trabalho com Nuxt. Eles executam via harness, não pelo Claude.

## Typecheck

- `nuxi typecheck` encapsula o `vue-tsc`. Requer as dependências de desenvolvimento `vue-tsc` + `typescript`.
- Execute na edição de `.vue` / `.ts` ou em pré-commit. A verificação de tipos abrange o projeto inteiro, portanto faça debounce dela e a envolva em um timeout (espelhe `web/hooks.md`, por exemplo `timeout 60 nuxi typecheck`) para que uma verificação de tipos travada seja encerrada em vez de se acumular entre edições rápidas.

## Lint

- Use o módulo `@nuxt/eslint` (flat-config, ciente do projeto, gera `.nuxt/eslint.config.mjs`).
- Execute `eslint .` ou `eslint --fix`. Esta é a integração oficial de ESLint do Nuxt; prefira-a a configurações feitas manualmente.

## Format

- `prettier --write`, ou habilite as regras estilísticas no `@nuxt/eslint` para evitar um conflito entre Prettier/ESLint.
- Escolha uma única autoridade de formatação. Não execute Prettier e o estilístico do ESLint ao mesmo tempo.

## Cadeia de PostToolUse sugerida

- Na edição (Edit) de `app/**` e `server/**`: execute `eslint --fix` e depois `timeout 60 nuxi typecheck`.
- A ordem importa: o lint-fix primeiro (modifica o arquivo), o typecheck com timeout em segundo (verifica o resultado). O debounce ainda se aplica.

## Referência

- Skills do ECC: `nuxt4-patterns`, `vite-patterns`.
- [módulo @nuxt/eslint](https://eslint.nuxt.com/)
- [nuxi typecheck](https://nuxt.com/docs/api/commands/typecheck)
