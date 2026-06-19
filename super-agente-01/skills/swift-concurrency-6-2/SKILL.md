---
name: swift-concurrency-6-2
description: Concorrência Acessível do Swift 6.2 — single-threaded por padrão, @concurrent para offloading explícito em background, conformances isoladas para tipos MainActor.
---

# Concorrência Acessível do Swift 6.2

Padrões para adotar o modelo de concorrência do Swift 6.2, onde o código é executado em single-thread por padrão e a concorrência é introduzida explicitamente. Elimina erros comuns de corrida de dados sem sacrificar desempenho.

## Quando Ativar

- Migrando projetos Swift 5.x ou 6.0/6.1 para Swift 6.2
- Resolvendo erros de compilação de segurança contra corrida de dados
- Projetando arquitetura de app baseada em MainActor
- Fazendo offload de trabalho intensivo em CPU para threads em background
- Implementando conformances de protocolo em tipos isolados pelo MainActor
- Ativando as configurações de build de Concorrência Acessível no Xcode 26

## Problema Central: Offloading Implícito para Background

No Swift 6.1 e anteriores, funções async podiam ser implicitamente transferidas para threads em background, causando erros de corrida de dados mesmo em código aparentemente seguro:

```swift
// Swift 6.1: ERRO
@MainActor
final class StickerModel {
    let photoProcessor = PhotoProcessor()

    func extractSticker(_ item: PhotosPickerItem) async throws -> Sticker? {
        guard let data = try await item.loadTransferable(type: Data.self) else { return nil }

        // Erro: Enviar 'self.photoProcessor' arrisca causar corridas de dados
        return await photoProcessor.extractSticker(data: data, with: item.itemIdentifier)
    }
}
```

O Swift 6.2 corrige isso: funções async permanecem no actor chamador por padrão.

```swift
// Swift 6.2: OK — async permanece no MainActor, sem corrida de dados
@MainActor
final class StickerModel {
    let photoProcessor = PhotoProcessor()

    func extractSticker(_ item: PhotosPickerItem) async throws -> Sticker? {
        guard let data = try await item.loadTransferable(type: Data.self) else { return nil }
        return await photoProcessor.extractSticker(data: data, with: item.itemIdentifier)
    }
}
```

## Padrão Central — Conformances Isoladas

Tipos MainActor agora podem se conformar a protocolos não isolados com segurança:

```swift
protocol Exportable {
    func export()
}

// Swift 6.1: ERRO — cruza para código isolado pelo main actor
// Swift 6.2: OK com conformance isolada
extension StickerModel: @MainActor Exportable {
    func export() {
        photoProcessor.exportAsPNG()
    }
}
```

O compilador garante que a conformance só é usada no main actor:

```swift
// OK — ImageExporter também é @MainActor
@MainActor
struct ImageExporter {
    var items: [any Exportable]

    mutating func add(_ item: StickerModel) {
        items.append(item)  // Seguro: mesmo isolamento de actor
    }
}

// ERRO — contexto nonisolated não pode usar conformance MainActor
nonisolated struct ImageExporter {
    var items: [any Exportable]

    mutating func add(_ item: StickerModel) {
        items.append(item)  // Erro: Conformance isolada pelo Main actor não pode ser usada aqui
    }
}
```

## Padrão Central — Variáveis Globais e Estáticas

Proteja estado global/estático com MainActor:

```swift
// Swift 6.1: ERRO — tipo não-Sendable pode ter estado mutável compartilhado
final class StickerLibrary {
    static let shared: StickerLibrary = .init()  // Erro
}

// Correção: Anote com @MainActor
@MainActor
final class StickerLibrary {
    static let shared: StickerLibrary = .init()  // OK
}
```

### Modo de Inferência Padrão do MainActor

O Swift 6.2 introduz um modo onde MainActor é inferido por padrão — sem necessidade de anotações manuais:

```swift
// Com inferência padrão MainActor ativada:
final class StickerLibrary {
    static let shared: StickerLibrary = .init()  // Implicitamente @MainActor
}

final class StickerModel {
    let photoProcessor: PhotoProcessor
    var selection: [PhotosPickerItem]  // Implicitamente @MainActor
}

extension StickerModel: Exportable {  // Conformance implicitamente @MainActor
    func export() {
        photoProcessor.exportAsPNG()
    }
}
```

Esse modo é opt-in e recomendado para apps, scripts e outros alvos executáveis.

## Padrão Central — @concurrent para Trabalho em Background

Quando você precisa de paralelismo real, faça offload explicitamente com `@concurrent`:

> **Importante:** Este exemplo requer as configurações de build de Concorrência Acessível — SE-0466 (isolamento padrão MainActor) e SE-0461 (NonisolatedNonsendingByDefault). Com essas configurações ativadas, `extractSticker` permanece no actor chamador, tornando o acesso a estado mutável seguro. **Sem essas configurações, este código tem uma corrida de dados** — o compilador sinalizará isso.

```swift
nonisolated final class PhotoProcessor {
    private var cachedStickers: [String: Sticker] = [:]

    func extractSticker(data: Data, with id: String) async -> Sticker {
        if let sticker = cachedStickers[id] {
            return sticker
        }

        let sticker = await Self.extractSubject(from: data)
        cachedStickers[id] = sticker
        return sticker
    }

    // Faz offload de trabalho caro para o thread pool concorrente
    @concurrent
    static func extractSubject(from data: Data) async -> Sticker { /* ... */ }
}

// Chamadores devem usar await
let processor = PhotoProcessor()
processedPhotos[item.id] = await processor.extractSticker(data: data, with: item.id)
```

Para usar `@concurrent`:
1. Marque o tipo contêiner como `nonisolated`
2. Adicione `@concurrent` à função
3. Adicione `async` se ainda não for assíncrona
4. Adicione `await` nos pontos de chamada

## Decisões Chave de Design

| Decisão | Justificativa |
|----------|-----------|
| Single-threaded por padrão | O código mais natural é livre de corridas de dados; concorrência é opt-in |
| Async permanece no actor chamador | Elimina offloading implícito que causava erros de corrida de dados |
| Conformances isoladas | Tipos MainActor podem se conformar a protocolos sem workarounds inseguros |
| Opt-in explícito com `@concurrent` | Execução em background é uma escolha deliberada de desempenho, não acidental |
| Inferência padrão de MainActor | Reduz anotações `@MainActor` repetitivas para alvos de app |
| Adoção opt-in | Caminho de migração sem quebras — ative recursos incrementalmente |

## Passos de Migração

1. **Ativar no Xcode**: Seção Swift Compiler > Concurrency nas Build Settings
2. **Ativar no SPM**: Use a API `SwiftSettings` no manifesto do pacote
3. **Use ferramentas de migração**: Mudanças automáticas de código via swift.org/migration
4. **Comece com padrões de MainActor**: Ative o modo de inferência para alvos de app
5. **Adicione `@concurrent` onde necessário**: Faça profiling primeiro, depois faça offload dos caminhos quentes
6. **Teste minuciosamente**: Problemas de corrida de dados tornam-se erros em tempo de compilação

## Boas Práticas

- **Comece no MainActor** — escreva código single-threaded primeiro, otimize depois
- **Use `@concurrent` apenas para trabalho intensivo em CPU** — processamento de imagens, compressão, computação complexa
- **Ative o modo de inferência de MainActor** para alvos de app que são majoritariamente single-threaded
- **Faça profiling antes de fazer offload** — use Instruments para encontrar gargalos reais
- **Proteja globais com MainActor** — estado mutável global/estático precisa de isolamento de actor
- **Use conformances isoladas** em vez de workarounds com `nonisolated` ou wrappers `@Sendable`
- **Migre incrementalmente** — ative recursos um de cada vez nas build settings

## Anti-Padrões a Evitar

- Aplicar `@concurrent` a todas as funções async (a maioria não precisa de execução em background)
- Usar `nonisolated` para suprimir erros do compilador sem entender o isolamento
- Manter padrões legados de `DispatchQueue` quando actors fornecem a mesma segurança
- Pular verificações de `model.availability` em código de Foundation Models relacionado à concorrência
- Lutar contra o compilador — se ele reporta uma corrida de dados, o código tem um problema real de concorrência
- Assumir que todo código async roda em background (padrão do Swift 6.2: permanece no actor chamador)

## Quando Usar

- Todos os novos projetos Swift 6.2+ (Concorrência Acessível é o padrão recomendado)
- Migrando apps existentes de concorrência Swift 5.x ou 6.0/6.1
- Resolvendo erros de compilação de segurança contra corrida de dados durante adoção do Xcode 26
- Construindo arquiteturas de app centradas em MainActor (a maioria dos apps de UI)
- Otimização de desempenho — fazendo offload de computações pesadas específicas para background
