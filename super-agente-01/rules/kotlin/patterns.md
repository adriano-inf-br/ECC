---
paths:
  - "**/*.kt"
  - "**/*.kts"
---
# Padrões de Kotlin

> Este arquivo estende [common/patterns.md](../common/patterns.md) com conteúdo específico de Kotlin e Android/KMP.

## Injeção de Dependência

Prefira injeção via construtor. Use Koin (KMP) ou Hilt (somente Android):

```kotlin
// Koin — declarar módulos
val dataModule = module {
    single<ItemRepository> { ItemRepositoryImpl(get(), get()) }
    factory { GetItemsUseCase(get()) }
    viewModelOf(::ItemListViewModel)
}

// Hilt — anotações
@HiltViewModel
class ItemListViewModel @Inject constructor(
    private val getItems: GetItemsUseCase
) : ViewModel()
```

## Padrão ViewModel

Objeto de estado único, sink de eventos, fluxo de dados unidirecional:

```kotlin
data class ScreenState(
    val items: List<Item> = emptyList(),
    val isLoading: Boolean = false
)

class ScreenViewModel(private val useCase: GetItemsUseCase) : ViewModel() {
    private val _state = MutableStateFlow(ScreenState())
    val state = _state.asStateFlow()

    fun onEvent(event: ScreenEvent) {
        when (event) {
            is ScreenEvent.Load -> load()
            is ScreenEvent.Delete -> delete(event.id)
        }
    }
}
```

## Padrão Repository

- Funções `suspend` retornam `Result<T>` ou um tipo de erro personalizado
- `Flow` para streams reativos
- Coordene fontes de dados local + remota

```kotlin
interface ItemRepository {
    suspend fun getById(id: String): Result<Item>
    suspend fun getAll(): Result<List<Item>>
    fun observeAll(): Flow<List<Item>>
}
```

## Padrão UseCase

Responsabilidade única, `operator fun invoke`:

```kotlin
class GetItemUseCase(private val repository: ItemRepository) {
    suspend operator fun invoke(id: String): Result<Item> {
        return repository.getById(id)
    }
}

class GetItemsUseCase(private val repository: ItemRepository) {
    suspend operator fun invoke(): Result<List<Item>> {
        return repository.getAll()
    }
}
```

## expect/actual (KMP)

Use para implementações específicas de plataforma:

```kotlin
// commonMain
expect fun platformName(): String
expect class SecureStorage {
    fun save(key: String, value: String)
    fun get(key: String): String?
}

// androidMain
actual fun platformName(): String = "Android"
actual class SecureStorage {
    actual fun save(key: String, value: String) { /* EncryptedSharedPreferences */ }
    actual fun get(key: String): String? = null /* ... */
}

// iosMain
actual fun platformName(): String = "iOS"
actual class SecureStorage {
    actual fun save(key: String, value: String) { /* Keychain */ }
    actual fun get(key: String): String? = null /* ... */
}
```

## Padrões de Coroutines

- Use `viewModelScope` em ViewModels, `coroutineScope` para trabalho filho estruturado
- Use `stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), initialValue)` para StateFlow a partir de Flows frios
- Use `supervisorScope` quando falhas dos filhos devem ser independentes

## Padrão Builder com DSL

```kotlin
class HttpClientConfig {
    var baseUrl: String = ""
    var timeout: Long = 30_000
    private val interceptors = mutableListOf<Interceptor>()

    fun interceptor(block: () -> Interceptor) {
        interceptors.add(block())
    }
}

fun httpClient(block: HttpClientConfig.() -> Unit): HttpClient {
    val config = HttpClientConfig().apply(block)
    return HttpClient(config)
}

// Uso
val client = httpClient {
    baseUrl = "https://api.example.com"
    timeout = 15_000
    interceptor { AuthInterceptor(tokenProvider) }
}
```

## Referências

Veja a skill: `kotlin-coroutines-flows` para padrões detalhados de coroutines.
Veja a skill: `android-clean-architecture` para padrões de módulos e camadas.
