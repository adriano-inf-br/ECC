---
paths:
  - "**/*.go"
  - "**/go.mod"
  - "**/go.sum"
---
# Hooks de Go

> Este arquivo estende [common/hooks.md](../common/hooks.md) com conteúdo específico de Go.

## Hooks PostToolUse

Configure em `~/.claude/settings.json`:

- **gofmt/goimports**: Formata automaticamente arquivos `.go` após edição
- **go vet**: Executa análise estática após editar arquivos `.go`
- **staticcheck**: Executa verificações estáticas estendidas nos pacotes modificados
