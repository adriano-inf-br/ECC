---
description: Revisão de código Go abrangente para padrões idiomáticos, segurança de concorrência, tratamento de erros e segurança. Invoca o agent go-reviewer.
---

# Revisão de Código Go

Este comando invoca o agent **go-reviewer** para uma revisão de código abrangente e específica de Go.

## O Que Este Comando Faz

1. **Identificar Mudanças em Go**: Encontra arquivos `.go` modificados via `git diff`
2. **Executar Análise Estática**: Executa `go vet`, `staticcheck` e `golangci-lint`
3. **Varredura de Segurança**: Verifica injeção de SQL, injeção de comando, condições de corrida
4. **Revisão de Concorrência**: Analisa segurança de goroutines, uso de channels, padrões de mutex
5. **Verificação de Go Idiomático**: Confirma que o código segue as convenções e boas práticas de Go
6. **Gerar Relatório**: Categoriza os problemas por severidade

## Quando Usar

Use `/go-review` quando:
- Após escrever ou modificar código Go
- Antes de fazer commit de mudanças em Go
- Revisar pull requests com código Go
- Fazer onboarding em uma nova base de código Go
- Aprender padrões idiomáticos de Go

## Categorias de Revisão

### CRITICAL (Deve Corrigir)
- Vulnerabilidades de injeção de SQL/Comando
- Condições de corrida sem sincronização
- Vazamentos de goroutines
- Credenciais hardcoded
- Uso inseguro de ponteiros
- Erros ignorados em caminhos críticos

### HIGH (Deveria Corrigir)
- Falta de encapsulamento de erro com contexto
- Panic em vez de retorno de erro
- Context não propagado
- Channels sem buffer causando deadlocks
- Erros de interface não satisfeita
- Falta de proteção com mutex

### MEDIUM (Considerar)
- Padrões de código não idiomáticos
- Falta de comentários godoc em exports
- Concatenação de strings ineficiente
- Slice não pré-alocado
- Testes orientados a tabela (table-driven) não utilizados

## Verificações Automatizadas Executadas

```bash
# Static analysis
go vet ./...

# Advanced checks (if installed)
staticcheck ./...
golangci-lint run

# Race detection
go build -race ./...

# Security vulnerabilities
govulncheck ./...
```

## Exemplo de Uso

```text
User: /go-review

Agent:
# Go Code Review Report

## Files Reviewed
- internal/handler/user.go (modified)
- internal/service/auth.go (modified)

## Static Analysis Results
✓ go vet: No issues
✓ staticcheck: No issues

## Issues Found

[CRITICAL] Race Condition
File: internal/service/auth.go:45
Issue: Shared map accessed without synchronization
```go
var cache = map[string]*Session{}  // Concurrent access!

func GetSession(id string) *Session {
    return cache[id]  // Race condition
}
```
Fix: Use sync.RWMutex or sync.Map
```go
var (
    cache   = map[string]*Session{}
    cacheMu sync.RWMutex
)

func GetSession(id string) *Session {
    cacheMu.RLock()
    defer cacheMu.RUnlock()
    return cache[id]
}
```

[HIGH] Missing Error Context
File: internal/handler/user.go:28
Issue: Error returned without context
```go
return err  // No context
```
Fix: Wrap with context
```go
return fmt.Errorf("get user %s: %w", userID, err)
```

## Summary
- CRITICAL: 1
- HIGH: 1
- MEDIUM: 0

Recommendation: FAIL: Block merge until CRITICAL issue is fixed
```

## Critérios de Aprovação

| Status | Condição |
|--------|-----------|
| PASS: Aprovar | Sem problemas CRITICAL ou HIGH |
| WARNING: Aviso | Apenas problemas MEDIUM (mesclar com cautela) |
| FAIL: Bloquear | Problemas CRITICAL ou HIGH encontrados |

## Integração com Outros Comandos

- Use `/go-test` primeiro para garantir que os testes passam
- Use `/go-build` se ocorrerem erros de build
- Use `/go-review` antes de fazer commit
- Use `/code-review` para preocupações não específicas de Go

## Relacionados

- Agent: `agents/go-reviewer.md`
- Skills: `skills/golang-patterns/`, `skills/golang-testing/`
