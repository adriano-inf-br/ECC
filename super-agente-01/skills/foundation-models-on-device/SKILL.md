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

## Decisões-Chave de Design

| Decisão | Justificativa |
|----------|-----------|
| Execução on-device | Privacidade — nenhum dado sai do dispositivo; funciona offline |
| Limite de 4.096 tokens | Restrição do modelo on-device; fragmente dados grandes entre sessões |
| Streaming de snapshots (não deltas) | Amigável a saída estruturada; cada snapshot é um estado parcial completo |
| Macro `@Generable` | Segurança em tempo de compilação para geração estruturada; auto-gera o tipo `PartiallyGenerated` |
| Requisição única por sessão | `isResponding` previne requisições concorrentes; crie múltiplas sessões se necessário |
| `response.content` (não `.output`) | API correta — sempre acesse os resultados via propriedade `.content` |

## Boas Práticas

- **Sempre verifique `model.availability`** antes de criar uma sessão — trate todos os casos de indisponibilidade
- **Use `instructions`** para guiar o comportamento do modelo — elas têm prioridade sobre os prompts
- **Verifique `isResponding`** antes de enviar uma nova requisição — sessões tratam uma requisição por vez
- **Acesse `response.content`** para resultados — não `.output`
- **Divida entradas grandes em chunks** — o limite de 4.096 tokens se aplica a instructions + prompt + output combinados
- **Use `@Generable`** para saída estruturada — garantias mais fortes do que parsear strings brutas
- **Use `GenerationOptions(temperature:)`** para ajustar criatividade (maior = mais criativo)
- **Monitore com Instruments** — use o Xcode Instruments para perfilar o desempenho das requisições

## Anti-Patterns a Evitar

- Criar sessões sem verificar `model.availability` primeiro
- Enviar entradas que excedem a janela de contexto de 4.096 tokens
- Tentar requisições concorrentes em uma única sessão
- Usar `.output` em vez de `.content` para acessar os dados da resposta
- Parsear respostas brutas em string quando a saída estruturada `@Generable` funcionaria
- Construir lógica complexa de múltiplos passos em um único prompt — divida em múltiplos prompts focados
- Assumir que o modelo está sempre disponível — elegibilidade do dispositivo e configurações variam

## Quando Usar

- Geração de texto on-device para apps sensíveis à privacidade
- Extração de dados estruturados de entrada do usuário (formulários, comandos em linguagem natural)
- Recursos assistidos por IA que devem funcionar offline
- UI de streaming que mostra progressivamente o conteúdo gerado
- Ações de IA específicas do domínio via chamada de ferramentas (busca, cálculo, lookup)
