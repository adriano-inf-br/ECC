---
paths:
  - "**/*.kt"
  - "**/*.kts"
---
# Estilo de Código Kotlin

> Este arquivo estende [common/coding-style.md](../common/coding-style.md) com conteúdo específico de Kotlin.

## Formatação

- **ktlint** ou **Detekt** para imposição de estilo
- Estilo de código oficial do Kotlin (`kotlin.code.style=official` em `gradle.properties`)

## Imutabilidade

- Prefira `val` a `var` — use `val` por padrão e só use `var` quando a mutação for necessária
- Use `data class` para tipos de valor; use coleções imutáveis (`List`, `Map`, `Set`) em APIs públicas
- Copy-on-write para atualizações de estado: `state.copy(field = newValue)`

## Nomenclatura

Siga as convenções do Kotlin:
- `camelCase` para funções e propriedades
- `PascalCase` para classes, interfaces, objects e type aliases
- `SCREAMING_SNAKE_CASE` para constantes (`const val` ou `@JvmStatic`)
- Prefixe interfaces com o comportamento, não com `I`: `Clickable`, não `IClickable`

## Segurança Contra Nulos (Null Safety)

- Nunca use `!!` — prefira `?.`, `?:`, `requireNotNull()` ou `checkNotNull()`
- Use `?.let {}` para operações seguras contra nulos em escopo
- Retorne tipos nulos de funções que podem legitimamente não ter resultado

```kotlin
// RUIM
val name = user!!.name

// BOM
val name = user?.name ?: "Unknown"
val name = requireNotNull(user) { "User must be set before accessing name" }.name
```

## Tipos Sealed

Use sealed classes/interfaces para modelar hierarquias de estado fechadas:

```kotlin
sealed interface UiState<out T> {
    data object Loading : UiState<Nothing>
    data class Success<T>(val data: T) : UiState<T>
    data class Error(val message: String) : UiState<Nothing>
}
```

Sempre use `when` exaustivo com tipos sealed — sem ramo `else`.

## Funções de Extensão

Use funções de extensão para operações utilitárias, mas mantenha-as fáceis de descobrir:
- Coloque em um arquivo nomeado a partir do tipo receptor (`StringExt.kt`, `FlowExt.kt`)
- Mantenha o escopo limitado — não adicione extensões a `Any` ou a tipos genéricos demais

## Funções de Escopo (Scope Functions)

Use a função de escopo certa:
- `let` — verificação de nulo + transformação: `user?.let { greet(it) }`
- `run` — computa um resultado usando o receptor: `service.run { fetch(config) }`
- `apply` — configura um objeto: `builder.apply { timeout = 30 }`
- `also` — efeitos colaterais: `result.also { log(it) }`
- Evite aninhamento profundo de funções de escopo (máximo de 2 níveis)

## Tratamento de Erros

- Use `Result<T>` ou tipos sealed personalizados
- Use `runCatching {}` para encapsular código que pode lançar exceções
- Nunca capture `CancellationException` — sempre relance-a
- Evite `try-catch` para controle de fluxo

```kotlin
// RUIM — usando exceções para controle de fluxo
val user = try { repository.getUser(id) } catch (e: NotFoundException) { null }

// BOM — retorno nulo
val user: User? = repository.findUser(id)
```
