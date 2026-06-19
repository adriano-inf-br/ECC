---
paths:
  - "**/*.go"
  - "**/go.mod"
  - "**/go.sum"
---
# Padrões de Go

> Este arquivo estende [common/patterns.md](../common/patterns.md) com conteúdo específico de Go.

## Functional Options

```go
type Option func(*Server)

func WithPort(port int) Option {
    return func(s *Server) { s.port = port }
}

func NewServer(opts ...Option) *Server {
    s := &Server{port: 8080}
    for _, opt := range opts {
        opt(s)
    }
    return s
}
```

## Interfaces Pequenas

Defina interfaces onde são usadas, não onde são implementadas.

## Injeção de Dependência

Use funções construtoras para injetar dependências:

```go
func NewUserService(repo UserRepository, logger Logger) *UserService {
    return &UserService{repo: repo, logger: logger}
}
```

## Referência

Veja a skill: `golang-patterns` para padrões abrangentes de Go incluindo concorrência, tratamento de erros e organização de pacotes.
