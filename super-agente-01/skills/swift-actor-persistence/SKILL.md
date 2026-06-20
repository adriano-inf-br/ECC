---
name: swift-actor-persistence
description: Persistência de dados thread-safe em Swift usando actors — cache em memória com armazenamento em arquivo, eliminando corridas de dados por design.
metadata:
  origin: ECC
---

# Swift Actors para Persistência Thread-Safe

Padrões para construir camadas de persistência de dados thread-safe usando actors Swift. Combina cache em memória com armazenamento em arquivo, aproveitando o modelo de actor para eliminar corridas de dados em tempo de compilação.

## Quando Ativar

- Construindo uma camada de persistência de dados em Swift 5.5+
- Precisa de acesso thread-safe a estado mutável compartilhado
- Quer eliminar sincronização manual (locks, DispatchQueues)
- Construindo apps offline-first com armazenamento local

## Padrão Central

### Repositório Baseado em Actor

O modelo de actor garante acesso serializado — sem corridas de dados, aplicado pelo compilador.

```swift
public actor LocalRepository<T: Codable & Identifiable> where T.ID == String {
    private var cache: [String: T] = [:]
    private let fileURL: URL

    public init(directory: URL = .documentsDirectory, filename: String = "data.json") {
        self.fileURL = directory.appendingPathComponent(filename)
        // Carregamento síncrono durante init (isolamento do actor ainda não ativo)
        self.cache = Self.loadSynchronously(from: fileURL)
    }

    // MARK: - API Pública

    public func save(_ item: T) throws {
        cache[item.id] = item
        try persistToFile()
    }

    public func delete(_ id: String) throws {
        cache[id] = nil
        try persistToFile()
    }

    public func find(by id: String) -> T? {
        cache[id]
    }

    public func loadAll() -> [T] {
        Array(cache.values)
    }

    // MARK: - Privado

    private func persistToFile() throws {
        let data = try JSONEncoder().encode(Array(cache.values))
        try data.write(to: fileURL, options: .atomic)
    }

    private static func loadSynchronously(from url: URL) -> [String: T] {
        guard let data = try? Data(contentsOf: url),
              let items = try? JSONDecoder().decode([T].self, from: data) else {
            return [:]
        }
        return Dictionary(uniqueKeysWithValues: items.map { ($0.id, $0) })
    }
}
```

### Uso

Todas as chamadas são automaticamente assíncronas devido ao isolamento do actor:

```swift
let repository = LocalRepository<Question>()

// Leitura — busca rápida O(1) do cache em memória
let question = await repository.find(by: "q-001")
let allQuestions = await repository.loadAll()

// Escrita — atualiza o cache e persiste no arquivo atomicamente
try await repository.save(newQuestion)
try await repository.delete("q-001")
```

### Combinando com @Observable ViewModel

```swift
@Observable
final class QuestionListViewModel {
    private(set) var questions: [Question] = []
    private let repository: LocalRepository<Question>

    init(repository: LocalRepository<Question> = LocalRepository()) {
        self.repository = repository
    }

    func load() async {
        questions = await repository.loadAll()
    }

    func add(_ question: Question) async throws {
        try await repository.save(question)
        questions = await repository.loadAll()
    }
}
```

## Decisões Chave de Design

| Decisão | Justificativa |
|----------|-----------|
| Actor (em vez de classe + lock) | Thread safety aplicada pelo compilador, sem sincronização manual |
| Cache em memória + persistência em arquivo | Leituras rápidas do cache, gravações duráveis no disco |
| Carregamento síncrono no init | Evita complexidade de inicialização assíncrona |
| Dicionário indexado por ID | Buscas O(1) por identificador |
| Genérico sobre `Codable & Identifiable` | Reutilizável em qualquer tipo de modelo |
| Gravações atômicas de arquivo (`.atomic`) | Previne gravações parciais em caso de crash |

## Boas Práticas

- **Use tipos `Sendable`** para todos os dados que cruzam limites de actor
- **Mantenha a API pública do actor mínima** — exponha apenas operações de domínio, não detalhes de persistência
- **Use gravações `.atomic`** para prevenir corrupção de dados se o app crashar durante uma gravação
- **Carregue sincronamente em `init`** — inicializadores assíncronos adicionam complexidade com benefício mínimo para arquivos locais
- **Combine com `@Observable`** ViewModels para atualizações reativas da UI

## Anti-Padrões a Evitar

- Usar `DispatchQueue` ou `NSLock` em vez de actors para novo código com concorrência Swift
- Expor o dicionário interno de cache para chamadores externos
- Tornar a URL do arquivo configurável sem validação
- Esquecer que todas as chamadas de método de actor são `await` — os chamadores devem lidar com contexto assíncrono
- Usar `nonisolated` para contornar o isolamento do actor (derrota o propósito)

## Quando Usar

- Armazenamento de dados local em apps iOS/macOS (dados do usuário, configurações, conteúdo em cache)
- Arquiteturas offline-first que sincronizam com um servidor posteriormente
- Qualquer estado mutável compartilhado que múltiplas partes do app acessam concorrentemente
- Substituindo thread safety baseada em `DispatchQueue` legado por concorrência Swift moderna
