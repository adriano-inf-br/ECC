---
paths:
  - "**/*.go"
  - "**/go.mod"
  - "**/go.sum"
---
# Segurança em Go

> Este arquivo estende [common/security.md](../common/security.md) com conteúdo específico de Go.

## Gerenciamento de Segredos

```go
apiKey := os.Getenv("OPENAI_API_KEY")
if apiKey == "" {
    log.Fatal("OPENAI_API_KEY não configurada")
}
```

## Varredura de Segurança

- Use **gosec** para análise estática de segurança:
  ```bash
  gosec ./...
  ```

## Context e Timeouts

Sempre use `context.Context` para controle de timeout:

```go
ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
defer cancel()
```
