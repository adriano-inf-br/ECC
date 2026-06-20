---
paths:
  - "**/*.php"
  - "**/composer.json"
  - "**/phpstan.neon"
  - "**/phpstan.neon.dist"
  - "**/psalm.xml"
---
# Hooks do PHP

> Este arquivo estende [common/hooks.md](../common/hooks.md) com conteúdo específico de PHP.

## Hooks de PostToolUse

Configure em `~/.claude/settings.json`:

- **Pint / PHP-CS-Fixer**: Formatar automaticamente arquivos `.php` editados.
- **PHPStan / Psalm**: Executar análise estática após edições de PHP em bases de código tipadas.
- **PHPUnit / Pest**: Executar testes direcionados para arquivos ou módulos tocados quando as edições afetam o comportamento.

## Avisos

- Avise sobre `var_dump`, `dd`, `dump` ou `die()` deixados em arquivos editados.
- Avise quando arquivos PHP editados adicionarem SQL bruto ou desabilitarem proteções de CSRF/sessão.
