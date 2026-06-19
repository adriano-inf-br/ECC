---
paths:
  - "**/*.go"
  - "**/go.mod"
  - "**/go.sum"
---
# Testes em Go

> Este arquivo estende [common/testing.md](../common/testing.md) com conteúdo específico de Go.

## Framework

Use o `go test` padrão com **testes orientados a tabela** (table-driven tests).

## Detecção de Corrida (Race Detection)

Sempre execute com a flag `-race`:

```bash
go test -race ./...
```

## Cobertura

```bash
go test -cover ./...
```

## Referência

Veja a skill: `golang-testing` para padrões e helpers detalhados de testes em Go.
