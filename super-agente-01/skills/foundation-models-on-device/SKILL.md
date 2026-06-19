---
name: foundation-models-on-device
description: Framework Apple FoundationModels para LLM on-device — geração de texto, geração guiada com @Generable, chamada de ferramentas e streaming de snapshots no iOS 26+.
---

# FoundationModels: LLM On-Device (iOS 26)

Padrões para integrar o modelo de linguagem on-device da Apple em aplicativos usando o framework FoundationModels. Abrange geração de texto, saída estruturada com `@Generable`, chamada de ferramentas personalizadas e streaming de snapshots — tudo executado on-device para privacidade e suporte offline.

## Quando Ativar

- Construir recursos com IA usando o Apple Intelligence on-device
- Gerar ou resumir texto sem dependência da nuvem
- Extrair dados estruturados de entrada em linguagem natural
- Implementar chamada de ferramentas personalizadas para ações de IA específicas do domínio
- Fazer streaming de respostas estruturadas para atualizações de UI em tempo real
- Necessidade de IA com preservação de privacidade (nenhum dado sai do dispositivo)

## Padrão Central — Verificação de Disponibilidade

Sempre verifique a disponibilidade do modelo antes de criar uma sessão:

```swift
struct GenerativeView: View {
    private var model = SystemLanguageModel.default

    var body: some View {
        switch model.availability {
        case .available:
            ContentView()
        case .unavailable(.deviceNotEligible):
            Text("Dispositivo não elegível para o Apple Intelligence")
        case .unavailable(.appleIntelligenceNotEnabled):
            Text("Habilite o Apple Intelligence nos Ajustes")
        case .unavailable(.modelNotReady):
            Text("O modelo está baixando ou não está pronto")
        case .unavailable(let other):
            Text("Modelo indisponível: \(other)")
        }
    }
}
```

## Padrão Central — Sessão Básica

```swift
// Turno único: crie uma nova sessão a cada vez
let session = LanguageModelSession()
let response = try await session.respond(to: "What's a good month to visit Paris?")
print(response.content)

// Múltiplos turnos: reutilize a sessão para o contexto da conversa
let session = LanguageModelSession(instructions: """
    You are a cooking assistant.
    Provide recipe suggestions based on ingredients.
    Keep suggestions brief and practical.
    """)

let first = try await session.respond(to: "I have chicken and rice")
let followUp = try await session.respond(to: "What about a vegetarian option?")
```

Pontos-chave para as instructions:
- Defina o papel do modelo ("You are a mentor")
- Especifique o que fazer ("Help extract calendar events")
- Defina preferências de estilo ("Respond as briefly as possible")
- Adicione medidas de segurança ("Respond with 'I can't help with that' for dangerous requests")

## Padrão Central — Geração Guiada com @Generable

Gere tipos Swift estruturados em vez de strings brutas:

### 1. Definir um Tipo Generable

```swift
@Generable(description: "Basic profile information about a cat")
struct CatProfile {
    var name: String

    @Guide(description: "The age of the cat", .range(0...20))
    var age: Int

    @Guide(description: "A one sentence profile about the cat's personality")
    var profile: String
}
```

### 2. Solicitar Saída Estruturada

```swift
let response = try await session.respond(
    to: "Generate a cute rescue cat",
    generating: CatProfile.self
)

// Acesse os campos estruturados diretamente
print("Name: \(response.content.name)")
print("Age: \(response.content.age)")
print("Profile: \(response.content.profile)")
```

### Restrições @Guide Suportadas

- `.range(0...20)` — intervalo numérico
- `.count(3)` — contagem de elementos do array
- `description:` — orientação semântica para a geração

## Padrão Central — Chamada de Ferramentas

Permita que o modelo invoque código personalizado para tarefas específicas do domínio:

### 1. Definir uma Ferramenta

```swift
struct RecipeSearchTool: Tool {
    let name = "recipe_search"
    let description = "Search for recipes matching a given term and return a list of results."

    @Generable
    struct Arguments {
        var searchTerm: String
        var numberOfResults: Int
    }

    func call(arguments: Arguments) async throws -> ToolOutput {
        let recipes = await searchRecipes(
            term: arguments.searchTerm,
            limit: arguments.numberOfResults
        )
        return .string(recipes.map { "- \($0.name): \($0.description)" }.joined(separator: "\n"))
    }
}
```

### 2. Criar uma Sessão com Ferramentas

```swift
let session = LanguageModelSession(tools: [RecipeSearchTool()])
let response = try await session.respond(to: "Find me some pasta recipes")
```

### 3. Tratar Erros de Ferramenta

```swift
do {
    let answer = try await session.respond(to: "Find a recipe for tomato soup.")
} catch let error as LanguageModelSession.ToolCallError {
    print(error.tool.name)
    if case .databaseIsEmpty = error.underlyingError as? RecipeSearchToolError {
        // Trate o erro específico da ferramenta
    }
}
```

## Padrão Central — Streaming de Snapshots

Faça streaming de respostas estruturadas para UI em tempo real com tipos `PartiallyGenerated`:

```swift
@Generable
struct TripIdeas {
    @Guide(description: "Ideas for upcoming trips")
    var ideas: [String]
}

let stream = session.streamResponse(
    to: "What are some exciting trip ideas?",
    generating: TripIdeas.self
)

for try await partial in stream {
    // partial: TripIdeas.PartiallyGenerated (todas as propriedades Optional)
    print(partial)
}
```

### Integração com SwiftUI

```swift
@State private var partialResult: TripIdeas.PartiallyGenerated?
@State private var errorMessage: String?

var body: some View {
    List {
        ForEach(partialResult?.ideas ?? [], id: \.self) { idea in
            Text(idea)
        }
    }
    .overlay {
        if let errorMessage { Text(errorMessage).foregroundStyle(.red) }
    }
    .task {
        do {
            let stream = session.streamResponse(to: prompt, generating: TripIdeas.self)
            for try await partial in stream {
                partialResult = partial
            }
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
```

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| On-device execution | Privacy — no data leaves the device; works offline |
| 4,096 token limit | On-device model constraint; chunk large data across sessions |
| Snapshot streaming (not deltas) | Structured output friendly; each snapshot is a complete partial state |
| `@Generable` macro | Compile-time safety for structured generation; auto-generates `PartiallyGenerated` type |
| Single request per session | `isResponding` prevents concurrent requests; create multiple sessions if needed |
| `response.content` (not `.output`) | Correct API — always access results via `.content` property |

## Best Practices

- **Always check `model.availability`** before creating a session — handle all unavailability cases
- **Use `instructions`** to guide model behavior — they take priority over prompts
- **Check `isResponding`** before sending a new request — sessions handle one request at a time
- **Access `response.content`** for results — not `.output`
- **Break large inputs into chunks** — 4,096 token limit applies to instructions + prompt + output combined
- **Use `@Generable`** for structured output — stronger guarantees than parsing raw strings
- **Use `GenerationOptions(temperature:)`** to tune creativity (higher = more creative)
- **Monitor with Instruments** — use Xcode Instruments to profile request performance

## Anti-Patterns to Avoid

- Creating sessions without checking `model.availability` first
- Sending inputs exceeding the 4,096 token context window
- Attempting concurrent requests on a single session
- Using `.output` instead of `.content` to access response data
- Parsing raw string responses when `@Generable` structured output would work
- Building complex multi-step logic in a single prompt — break into multiple focused prompts
- Assuming the model is always available — device eligibility and settings vary

## When to Use

- On-device text generation for privacy-sensitive apps
- Structured data extraction from user input (forms, natural language commands)
- AI-assisted features that must work offline
- Streaming UI that progressively shows generated content
- Domain-specific AI actions via tool calling (search, compute, lookup)
