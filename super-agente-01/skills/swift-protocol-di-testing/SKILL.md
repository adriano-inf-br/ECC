---
name: swift-protocol-di-testing
description: Injeção de dependência baseada em protocolo para código Swift testável — Mock de sistema de arquivos, rede e APIs externas usando protocolos focados e Swift Testing.
metadata:
  origin: ECC
---

# Injeção de Dependência Baseada em Protocolo Swift para Testes

Padrões para tornar o código Swift testável abstraindo dependências externas (sistema de arquivos, rede, iCloud) por trás de protocolos pequenos e focados. Permite testes determinísticos sem I/O.

## Quando Ativar

- Escrevendo código Swift que acessa sistema de arquivos, rede ou APIs externas
- Precisa testar caminhos de tratamento de erro sem acionar falhas reais
- Construindo módulos que funcionam em diferentes ambientes (app, teste, preview SwiftUI)
- Projetando arquitetura testável com concorrência Swift (actors, Sendable)

## Padrão Central

### 1. Defina Protocolos Pequenos e Focados

Cada protocolo lida exatamente com uma preocupação externa.

```swift
// Acesso ao sistema de arquivos
public protocol FileSystemProviding: Sendable {
    func containerURL(for purpose: Purpose) -> URL?
}

// Operações de leitura/escrita de arquivo
public protocol FileAccessorProviding: Sendable {
    func read(from url: URL) throws -> Data
    func write(_ data: Data, to url: URL) throws
    func fileExists(at url: URL) -> Bool
}

// Armazenamento de bookmarks (ex.: para apps em sandbox)
public protocol BookmarkStorageProviding: Sendable {
    func saveBookmark(_ data: Data, for key: String) throws
    func loadBookmark(for key: String) throws -> Data?
}
```

### 2. Crie Implementações Padrão (Produção)

```swift
public struct DefaultFileSystemProvider: FileSystemProviding {
    public init() {}

    public func containerURL(for purpose: Purpose) -> URL? {
        FileManager.default.url(forUbiquityContainerIdentifier: nil)
    }
}

public struct DefaultFileAccessor: FileAccessorProviding {
    public init() {}

    public func read(from url: URL) throws -> Data {
        try Data(contentsOf: url)
    }

    public func write(_ data: Data, to url: URL) throws {
        try data.write(to: url, options: .atomic)
    }

    public func fileExists(at url: URL) -> Bool {
        FileManager.default.fileExists(atPath: url.path)
    }
}
```

### 3. Crie Implementações Mock para Testes

```swift
public final class MockFileAccessor: FileAccessorProviding, @unchecked Sendable {
    public var files: [URL: Data] = [:]
    public var readError: Error?
    public var writeError: Error?

    public init() {}

    public func read(from url: URL) throws -> Data {
        if let error = readError { throw error }
        guard let data = files[url] else {
            throw CocoaError(.fileReadNoSuchFile)
        }
        return data
    }

    public func write(_ data: Data, to url: URL) throws {
        if let error = writeError { throw error }
        files[url] = data
    }

    public func fileExists(at url: URL) -> Bool {
        files[url] != nil
    }
}
```

### 4. Injete Dependências com Parâmetros Padrão

O código de produção usa padrões; os testes injetam Mocks.

```swift
public actor SyncManager {
    private let fileSystem: FileSystemProviding
    private let fileAccessor: FileAccessorProviding

    public init(
        fileSystem: FileSystemProviding = DefaultFileSystemProvider(),
        fileAccessor: FileAccessorProviding = DefaultFileAccessor()
    ) {
        self.fileSystem = fileSystem
        self.fileAccessor = fileAccessor
    }

    public func sync() async throws {
        guard let containerURL = fileSystem.containerURL(for: .sync) else {
            throw SyncError.containerNotAvailable
        }
        let data = try fileAccessor.read(
            from: containerURL.appendingPathComponent("data.json")
        )
        // Processa dados...
    }
}
```

### 5. Escreva Testes com Swift Testing

```swift
import Testing

@Test("Sync manager lida com container ausente")
func testMissingContainer() async {
    let mockFileSystem = MockFileSystemProvider(containerURL: nil)
    let manager = SyncManager(fileSystem: mockFileSystem)

    await #expect(throws: SyncError.containerNotAvailable) {
        try await manager.sync()
    }
}

@Test("Sync manager lê dados corretamente")
func testReadData() async throws {
    let mockFileAccessor = MockFileAccessor()
    mockFileAccessor.files[testURL] = testData

    let manager = SyncManager(fileAccessor: mockFileAccessor)
    let result = try await manager.loadData()

    #expect(result == expectedData)
}

@Test("Sync manager lida com erros de leitura graciosamente")
func testReadError() async {
    let mockFileAccessor = MockFileAccessor()
    mockFileAccessor.readError = CocoaError(.fileReadCorruptFile)

    let manager = SyncManager(fileAccessor: mockFileAccessor)

    await #expect(throws: SyncError.self) {
        try await manager.sync()
    }
}
```

## Boas Práticas

- **Responsabilidade Única**: Cada protocolo deve lidar com uma preocupação — não crie "protocolos deus" com muitos métodos
- **Conformance Sendable**: Necessária quando protocolos são usados entre limites de actor
- **Parâmetros padrão**: Deixe o código de produção usar implementações reais por padrão; apenas os testes precisam especificar Mocks
- **Simulação de erros**: Projete Mocks com propriedades de erro configuráveis para testar caminhos de falha
- **Mock apenas limites**: Mock dependências externas (sistema de arquivos, rede, APIs), não tipos internos

## Anti-Padrões a Evitar

- Criar um único protocolo grande que cobre todo acesso externo
- Fazer Mock de tipos internos que não têm dependências externas
- Usar condicionais `#if DEBUG` em vez de injeção de dependência adequada
- Esquecer conformance `Sendable` quando usado com actors
- Engenharia excessiva: se um tipo não tem dependências externas, ele não precisa de um protocolo

## Quando Usar

- Qualquer código Swift que toca sistema de arquivos, rede ou APIs externas
- Testando caminhos de tratamento de erro que são difíceis de acionar em ambientes reais
- Construindo módulos que precisam funcionar em contextos de app, teste e preview SwiftUI
- Apps usando concorrência Swift (actors, concorrência estruturada) que precisam de arquitetura testável
