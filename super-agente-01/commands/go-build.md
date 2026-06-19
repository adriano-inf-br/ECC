---
description: Fix Go build errors, go vet warnings, and linter issues incrementally. Invokes the go-build-resolver agent for minimal, surgical fixes.
---

# Build e Correção de Go

Este comando invoca o agent **go-build-resolver** para corrigir incrementalmente erros de build de Go com mudanças mínimas.

## O Que Este Comando Faz

1. **Executar Diagnósticos**: Executa `go build`, `go vet`, `staticcheck`
2. **Fazer o Parse dos Erros**: Agrupa por arquivo e ordena por severidade
3. **Corrigir Incrementalmente**: Um erro de cada vez
4. **Verificar Cada Correção**: Reexecuta o build após cada mudança
5. **Reportar Resumo**: Mostra o que foi corrigido e o que resta

## Quando Usar

Use `/go-build` quando:
- `go build ./...` falha com erros
- `go vet ./...` reporta problemas
- `golangci-lint run` mostra avisos
- Dependências de módulo estão quebradas
- Após puxar mudanças que quebram o build

## Comandos de Diagnóstico Executados

```bash
# Primary build check
go build ./...

# Static analysis
go vet ./...

# Extended linting (if available)
staticcheck ./...
golangci-lint run

# Module issues
go mod verify
go mod tidy -v
```

## Exemplo de Sessão

```text
User: /go-build

Agent:
# Go Build Resolution

## Initial Diagnostics

```bash
$ go build ./...
internal/service/user.go:25:15: undefined: UserRepository
internal/handler/api.go:42:9: cannot use x (type string) as type int
internal/handler/api.go:58:2: missing return at end of function
```

Errors found: 3

## Fix 1: Undefined Identifier

File: internal/service/user.go:25
Error: undefined: UserRepository
Cause: Missing import

```go
// Added import
import "project/internal/repository"

// Changed
var repo UserRepository
// To
var repo repository.UserRepository
```

```bash
$ go build ./...
# 2 errors remaining
```

## Fix 2: Type Mismatch

File: internal/handler/api.go:42
Error: cannot use x (type string) as type int

```go
// Changed
count := params.Get("count")
// To
countStr := params.Get("count")
count, _ := strconv.Atoi(countStr)
```

```bash
$ go build ./...
# 1 error remaining
```

## Fix 3: Missing Return

File: internal/handler/api.go:58
Error: missing return at end of function

```go
func GetUser(id string) (*User, error) {
    if id == "" {
        return nil, ErrInvalidID
    }
    user := findUser(id)
    // Added missing return
    return user, nil
}
```

```bash
$ go build ./...
# Build successful!
```

## Final Verification

```bash
$ go vet ./...
# No issues

$ go test ./...
ok      project/internal/service   0.015s
ok      project/internal/handler   0.023s
```

## Summary

| Metric | Count |
|--------|-------|
| Build errors fixed | 3 |
| Vet warnings fixed | 0 |
| Files modified | 2 |
| Remaining issues | 0 |

Build Status: PASS: SUCCESS
```

## Erros Comuns Corrigidos

| Erro | Correção Típica |
|-------|-------------|
| `undefined: X` | Adicionar import ou corrigir erro de digitação |
| `cannot use X as Y` | Conversão de tipo ou corrigir atribuição |
| `missing return` | Adicionar instrução de return |
| `X does not implement Y` | Adicionar método ausente |
| `import cycle` | Reestruturar pacotes |
| `declared but not used` | Remover ou usar a variável |
| `cannot find package` | `go get` ou `go mod tidy` |

## Estratégia de Correção

1. **Erros de build primeiro** - O código precisa compilar
2. **Avisos de vet em segundo** - Corrigir construções suspeitas
3. **Avisos de lint em terceiro** - Estilo e boas práticas
4. **Uma correção de cada vez** - Verificar cada mudança
5. **Mudanças mínimas** - Não refatorar, apenas corrigir

## Condições de Parada

O agent vai parar e reportar se:
- O mesmo erro persistir após 3 tentativas
- A correção introduzir mais erros
- Exigir mudanças arquiteturais
- Faltarem dependências externas

## Comandos Relacionados

- `/go-test` - Executa testes após o build ter sucesso
- `/go-review` - Revisa a qualidade do código
- skill `verification-loop` - Loop completo de verificação

## Relacionados

- Agent: `agents/go-build-resolver.md`
- Skill: `skills/golang-patterns/`
