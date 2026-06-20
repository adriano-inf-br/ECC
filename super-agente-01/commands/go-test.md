---
description: Aplica o fluxo de trabalho de TDD para Go. Escreva primeiro testes orientados a tabela (table-driven), depois implemente. Verifique 80%+ de cobertura com go test -cover.
---

# Comando de TDD para Go

Este comando impõe a metodologia de desenvolvimento orientado a testes (TDD) para código Go usando padrões idiomáticos de testes em Go.

## O Que Este Comando Faz

1. **Definir Tipos/Interfaces**: Faz o scaffold das assinaturas de função primeiro
2. **Escrever Testes Orientados a Tabela**: Cria casos de teste abrangentes (RED)
3. **Executar Testes**: Verifica que os testes falham pela razão certa
4. **Implementar Código**: Escreve o código mínimo para passar (GREEN)
5. **Refatorar**: Melhora mantendo os testes verdes
6. **Verificar Cobertura**: Garante 80%+ de cobertura

## Quando Usar

Use `/go-test` quando:
- Implementar novas funções Go
- Adicionar cobertura de testes a código existente
- Corrigir bugs (escreva primeiro um teste que falha)
- Construir lógica de negócio crítica
- Aprender o fluxo de trabalho de TDD em Go

## Ciclo de TDD

```
RED     → Write failing table-driven test
GREEN   → Implement minimal code to pass
REFACTOR → Improve code, tests stay green
REPEAT  → Next test case
```

## Exemplo de Sessão

````
User: /go-test I need a function to validate email addresses

Agent:
# TDD Session: Email Validator

## Step 1: Define Interface

```go
// validator/email.go
package validator

// ValidateEmail checks if the given string is a valid email address.
// Returns nil if valid, error describing the issue otherwise.
func ValidateEmail(email string) error {
    panic("not implemented")
}
```

## Step 2: Write Table-Driven Tests (RED)

```go
// validator/email_test.go
package validator

import (
    "testing"
)

func TestValidateEmail(t *testing.T) {
    tests := []struct {
        name    string
        email   string
        wantErr bool
    }{
        // Valid emails
        {"simple email", "user@example.com", false},
        {"with subdomain", "user@mail.example.com", false},
        {"with plus", "user+tag@example.com", false},
        {"with dots", "first.last@example.com", false},

        // Invalid emails
        {"empty string", "", true},
        {"no at sign", "userexample.com", true},
        {"no domain", "user@", true},
        {"no local part", "@example.com", true},
        {"double at", "user@@example.com", true},
        {"spaces", "user @example.com", true},
        {"no tld", "user@example", true},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            err := ValidateEmail(tt.email)
            if tt.wantErr && err == nil {
                t.Errorf("ValidateEmail(%q) = nil; want error", tt.email)
            }
            if !tt.wantErr && err != nil {
                t.Errorf("ValidateEmail(%q) = %v; want nil", tt.email, err)
            }
        })
    }
}
```

## Step 3: Run Tests - Verify FAIL

```bash
$ go test ./validator/...

--- FAIL: TestValidateEmail (0.00s)
    --- FAIL: TestValidateEmail/simple_email (0.00s)
        panic: not implemented

FAIL
```

✓ Tests fail as expected (panic).

## Step 4: Implement Minimal Code (GREEN)

```go
// validator/email.go
package validator

import (
    "errors"
    "regexp"
)

var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)

var (
    ErrEmailEmpty   = errors.New("email cannot be empty")
    ErrEmailInvalid = errors.New("email format is invalid")
)

func ValidateEmail(email string) error {
    if email == "" {
        return ErrEmailEmpty
    }
    if !emailRegex.MatchString(email) {
        return ErrEmailInvalid
    }
    return nil
}
```

## Step 5: Run Tests - Verify PASS

```bash
$ go test ./validator/...

PASS
ok      project/validator    0.003s
```

✓ All tests passing!

## Step 6: Check Coverage

```bash
$ go test -cover ./validator/...

PASS
coverage: 100.0% of statements
ok      project/validator    0.003s
```

✓ Coverage: 100%

## TDD Complete!
````

## Padrões de Teste

### Testes Orientados a Tabela
```go
tests := []struct {
    name     string
    input    InputType
    want     OutputType
    wantErr  bool
}{
    {"case 1", input1, want1, false},
    {"case 2", input2, want2, true},
}

for _, tt := range tests {
    t.Run(tt.name, func(t *testing.T) {
        got, err := Function(tt.input)
        // assertions
    })
}
```

### Testes Paralelos
```go
for _, tt := range tests {
    tt := tt // Capture
    t.Run(tt.name, func(t *testing.T) {
        t.Parallel()
        // test body
    })
}
```

### Helpers de Teste
```go
func setupTestDB(t *testing.T) *sql.DB {
    t.Helper()
    db := createDB()
    t.Cleanup(func() { db.Close() })
    return db
}
```

## Comandos de Cobertura

```bash
# Basic coverage
go test -cover ./...

# Coverage profile
go test -coverprofile=coverage.out ./...

# View in browser
go tool cover -html=coverage.out

# Coverage by function
go tool cover -func=coverage.out

# With race detection
go test -race -cover ./...
```

## Metas de Cobertura

| Tipo de Código | Meta |
|-----------|--------|
| Lógica de negócio crítica | 100% |
| APIs públicas | 90%+ |
| Código geral | 80%+ |
| Código gerado | Excluir |

## Boas Práticas de TDD

**FAÇA:**
- Escreva o teste PRIMEIRO, antes de qualquer implementação
- Execute os testes após cada mudança
- Use testes orientados a tabela para cobertura abrangente
- Teste o comportamento, não os detalhes de implementação
- Inclua casos extremos (vazio, nil, valores máximos)

**NÃO FAÇA:**
- Escrever a implementação antes dos testes
- Pular a fase RED
- Testar funções privadas diretamente
- Usar `time.Sleep` nos testes
- Ignorar testes instáveis (flaky)

## Comandos Relacionados

- `/go-build` - Corrige erros de build
- `/go-review` - Revisa o código após a implementação
- skill `verification-loop` - Executa o loop completo de verificação

## Relacionados

- Skill: `skills/golang-testing/`
- Skill: `skills/tdd-workflow/`
