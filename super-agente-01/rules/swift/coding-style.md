---
paths:
  - "**/*.swift"
  - "**/Package.swift"
---
# Estilo de Código Swift

> Este arquivo estende [common/coding-style.md](../common/coding-style.md) com conteúdo específico de Swift.

## Formatação

- **SwiftFormat** para formatação automática, **SwiftLint** para aplicação de estilo
- `swift-format` vem incluído no Xcode 16+ como alternativa

## Imutabilidade

- Prefira `let` em vez de `var` — defina tudo como `let` e só mude para `var` se o compilador exigir
- Use `struct` com semântica de valor por padrão; use `class` apenas quando identidade ou semântica de referência forem necessárias

## Nomenclatura

Siga as [Apple API Design Guidelines](https://www.swift.org/documentation/api-design-guidelines/):

- Clareza no ponto de uso — omita palavras desnecessárias
- Nomeie métodos e propriedades por seus papéis, não por seus tipos
- Use `static let` para constantes em vez de constantes globais

## Tratamento de Erros

Use typed throws (Swift 6+) e pattern matching:

```swift
func load(id: String) throws(LoadError) -> Item {
    guard let data = try? read(from: path) else {
        throw .fileNotFound(id)
    }
    return try decode(data)
}
```

## Concorrência

Habilite a verificação estrita de concorrência do Swift 6. Prefira:

- Tipos de valor `Sendable` para dados que cruzam limites de isolamento
- Actors para estado mutável compartilhado
- Concorrência estruturada (`async let`, `TaskGroup`) em vez de `Task {}` não estruturado
