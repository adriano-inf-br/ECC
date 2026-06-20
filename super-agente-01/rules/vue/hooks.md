---
paths:
  - "**/*.vue"
  - "**/*.ts"
  - "**/*.tsx"
---

# Hooks Vue

> Este arquivo estende [common/hooks.md](../common/hooks.md) com conteúdo específico de Vue.

## Alvos de PostToolUse

Execute em `*.vue`, `*.ts` e `*.tsx` após edições. Restrinja aos arquivos alterados sempre que possível.

## Typecheck

- Use `vue-tsc --noEmit` para checagem de SFC mais TypeScript. O `tsc` puro não consegue ler componentes single-file `.vue`, então ele não deve ser o hook de typecheck para este projeto.
- O typecheck abrange todo o projeto. Faça debounce ou restrinja o escopo para que um loop de salvar-a-cada-tecla não trave o editor.

## Lint e Format

- `eslint --fix` com `eslint-plugin-vue` (flat-config `vue/vue3-recommended`) cobre o lint tanto de template quanto de script.
- `prettier --write` para formatação. Prefira Prettier-via-ESLint a uma passagem separada do Prettier, para evitar formatação dupla e loops de conflito.

## Limites de Arquitetura

- Opcional: imponha os limites de fatia do Feature-Sliced Design com `@feature-sliced/steiger` ou `eslint-plugin-boundaries` para bloquear imports profundos entre fatias.

## Sequenciamento

```bash
# changed files only
eslint --fix "$FILE"
prettier --write "$FILE"
# project-wide, debounced
vue-tsc --noEmit
```

- Execute lint e format por arquivo primeiro, depois o typecheck de todo o projeto por último, para que os erros de tipo reflitam o código-fonte formatado.

## Referência

- Skills ECC: `frontend-patterns`, `vite-patterns`.
- Docs: <https://github.com/vuejs/language-tools> (vue-tsc) · <https://eslint.vuejs.org/> · <https://github.com/feature-sliced/steiger>
