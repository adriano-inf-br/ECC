---
paths:
  - "**/*.swift"
  - "**/Package.swift"
---
# Testes em Swift

> Este arquivo estende [common/testing.md](../common/testing.md) com conteúdo específico de Swift.

## Framework

Use **Swift Testing** (`import Testing`) para novos testes. Use `@Test` e `#expect`:

```swift
@Test("User creation validates email")
func userCreationValidatesEmail() throws {
    #expect(throws: ValidationError.invalidEmail) {
        try User(email: "not-an-email")
    }
}
```

## Isolamento de Testes

Cada teste recebe uma instância nova — configure em `init`, finalize em `deinit`. Sem estado mutável compartilhado entre testes.

## Testes Parametrizados

```swift
@Test("Validates formats", arguments: ["json", "xml", "csv"])
func validatesFormat(format: String) throws {
    let parser = try Parser(format: format)
    #expect(parser.isValid)
}
```

## Cobertura

```bash
swift test --enable-code-coverage
```

## Referência

Veja a skill: `swift-protocol-di-testing` para injeção de dependência baseada em protocolo e padrões de mock com Swift Testing.
