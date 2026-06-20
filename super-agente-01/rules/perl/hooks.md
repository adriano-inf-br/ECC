---
paths:
  - "**/*.pl"
  - "**/*.pm"
  - "**/*.t"
  - "**/*.psgi"
  - "**/*.cgi"
---
# Hooks do Perl

> Este arquivo estende [common/hooks.md](../common/hooks.md) com conteúdo específico de Perl.

## Hooks de PostToolUse

Configure em `~/.claude/settings.json`:

- **perltidy**: Formatar automaticamente arquivos `.pl` e `.pm` após edição
- **perlcritic**: Executar verificação de lint após editar arquivos `.pm`

## Avisos

- Avise sobre `print` em arquivos `.pm` que não sejam scripts — use `say` ou um módulo de logging (ex.: `Log::Any`)
