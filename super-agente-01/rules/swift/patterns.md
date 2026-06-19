---
paths:
  - "**/*.swift"
  - "**/Package.swift"
---
# Padrões Swift

> Este arquivo estende [common/patterns.md](../common/patterns.md) com conteúdo específico de Swift.

## Design Orientado a Protocolos

Defina protocolos pequenos e focados. Use extensões de protocolo para padrões compartilhados:

```swift
protocol Repository: Sendable {
    associatedtype Item: Identifiable & Sendable
    func find(by id: Item.ID) async throws -> Item?
    func save(_ item: Item) async throws
}
```

## Tipos de Valor

- Use structs para objetos de transferência de dados e modelos
- Use enums com valores associados para modelar estados distintos:

```swift
enum LoadState<T: Sendable>: Sendable {
    case idle
    case loading
    case loaded(T)
    case failed(Error)
}
```

## Padrão Actor

Use actors para estado mutável compartilhado em vez de locks ou dispatch queues:

```swift
actor Cache<Key: Hashable & Sendable, Value: Sendable> {
    private var storage: [Key: Value] = [:]

    func get(_ key: Key) -> Value? { storage[key] }
    func set(_ key: Key, value: Value) { storage[key] = value }
}
```

## Injeção de Dependência

Injete protocolos com parâmetros padrão — a produção usa os padrões, os testes injetam mocks:

```swift
struct UserService {
    private let repository: any UserRepository

    init(repository: any UserRepository = DefaultUserRepository()) {
        self.repository = repository
    }
}
```

## Referências

Veja a skill: `swift-actor-persistence` para padrões de persistência baseados em actor.
Veja a skill: `swift-protocol-di-testing` para DI baseado em protocolo e testes.
