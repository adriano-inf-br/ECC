---
paths:
  - "**/*.component.ts"
  - "**/*.component.html"
  - "**/*.service.ts"
  - "**/*.directive.ts"
  - "**/*.pipe.ts"
  - "**/*.spec.ts"
---
# Hooks do Angular

> This file extends [common/hooks.md](../common/hooks.md) with Angular specific content.

## Hooks PostToolUse

Configure em `~/.claude/settings.json`:

- **Prettier**: Auto-formatar arquivos `.ts` e `.html` após edição
- **ESLint / ng lint**: Executar `ng lint` após editar arquivos-fonte Angular para capturar uso incorreto de decorators, erros de template e violações de estilo
- **Verificação de TypeScript**: Executar `tsc --noEmit` após editar arquivos `.ts`
- **Verificação de build**: Executar `ng build` após gerar ou alterar significativamente código Angular para capturar erros de template e de tipo cedo

## Hooks Stop

- **Auditoria de lint**: Executar `ng lint` nos arquivos modificados antes do fim da sessão para capturar quaisquer violações pendentes
