---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
---
# Hooks TypeScript/JavaScript

> Este arquivo estende [common/hooks.md](../common/hooks.md) com conteúdo específico de TypeScript/JavaScript.

## Hooks PostToolUse

Configure em `~/.claude/settings.json`:

- **Prettier**: Formata automaticamente arquivos JS/TS após a edição
- **TypeScript check**: Executa `tsc` após editar arquivos `.ts`/`.tsx`
- **console.log warning**: Avisa sobre `console.log` em arquivos editados

## Hooks Stop

- **console.log audit**: Verifica todos os arquivos modificados em busca de `console.log` antes do fim da sessão
