---
paths:
  - "**/*.go"
  - "**/go.mod"
  - "**/go.sum"
---
# Estilo de Código Go

> Este arquivo estende [common/coding-style.md](../common/coding-style.md) com conteúdo específico de Go.

## Formatação

- **gofmt** e **goimports** são obrigatórios — sem debates de estilo

## Princípios de Design

- Aceite interfaces, retorne structs
- Mantenha as interfaces pequenas (1-3 métodos)

## Tratamento de Erros

Sempre envolva (wrap) os erros com contexto:

```go
if err != nil {
    return fmt.Errorf("failed to create user: %w", err)
}
```

## Referência

Veja a skill: `golang-patterns` para idiomas e padrões abrangentes de Go.
