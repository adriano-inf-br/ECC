---
paths:
  - "**/*.kt"
  - "**/*.kts"
  - "**/build.gradle.kts"
---
# Hooks de Kotlin

> Este arquivo estende [common/hooks.md](../common/hooks.md) com conteúdo específico de Kotlin.

## Hooks PostToolUse

Configure em `~/.claude/settings.json`:

- **ktfmt/ktlint**: Formata automaticamente arquivos `.kt` e `.kts` após edição
- **detekt**: Executa análise estática após editar arquivos Kotlin
- **./gradlew build**: Verifica a compilação após alterações
