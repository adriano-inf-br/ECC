---
paths:
  - "**/*.swift"
  - "**/Package.swift"
---
# Hooks Swift

> Este arquivo estende [common/hooks.md](../common/hooks.md) com conteúdo específico de Swift.

## Hooks PostToolUse

Configure em `~/.claude/settings.json`:

- **SwiftFormat**: Formata automaticamente arquivos `.swift` após a edição
- **SwiftLint**: Executa verificações de lint após editar arquivos `.swift`
- **swift build**: Faz a checagem de tipos dos pacotes modificados após a edição

## Aviso

Sinalize instruções `print()` — use `os.Logger` ou logging estruturado em vez disso para código de produção.
