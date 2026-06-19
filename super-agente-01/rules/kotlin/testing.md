---
paths:
  - "**/*.kt"
  - "**/*.kts"
---
# Testes em Kotlin

> Este arquivo estende [common/testing.md](../common/testing.md) com conteúdo específico de Kotlin e Android/KMP.

## Framework de Testes

- **kotlin.test** para multiplataforma (KMP) — `@Test`, `assertEquals`, `assertTrue`
- **JUnit 4/5** para testes específicos de Android
- **Turbine** para testar Flows e StateFlow
- **kotlinx-coroutines-test** para testes de coroutines (`runTest`, `TestDispatcher`)

## Testando ViewModel com Turbine

```kotlin
@Test
fun `loading state emitted then data`() = runTest {
    val repo = FakeItemRepository()
    repo.addItem(testItem)
    val viewModel = ItemListViewModel(GetItemsUseCase(repo))

    viewModel.state.test {
        assertEquals(ItemListState(), awaitItem())     // estado inicial
        viewModel.onEvent(ItemListEvent.Load)
        assertTrue(awaitItem().isLoading)               // carregando
        assertEquals(listOf(testItem), awaitItem().items) // carregado
    }
}
```

## Fakes em Vez de Mocks

Prefira fakes escritos à mão a frameworks de mock:

```kotlin
class FakeItemRepository : ItemRepository {
    private val items = mutableListOf<Item>()
    var fetchError: Throwable? = null

    override suspend fun getAll(): Result<List<Item>> {
        fetchError?.let { return Result.failure(it) }
        return Result.success(items.toList())
    }

    override fun observeAll(): Flow<List<Item>> = flowOf(items.toList())

    fun addItem(item: Item) { items.add(item) }
}
```

## Testes de Coroutines

```kotlin
@Test
fun `parallel operations complete`() = runTest {
    val repo = FakeRepository()
    val result = loadDashboard(repo)
    advanceUntilIdle()
    assertNotNull(result.items)
    assertNotNull(result.stats)
}
```

Use `runTest` — ele avança automaticamente o tempo virtual e fornece `TestScope`.

## Ktor MockEngine

```kotlin
val mockEngine = MockEngine { request ->
    when (request.url.encodedPath) {
        "/api/items" -> respond(
            content = Json.encodeToString(testItems),
            headers = headersOf(HttpHeaders.ContentType, ContentType.Application.Json.toString())
        )
        else -> respondError(HttpStatusCode.NotFound)
    }
}

val client = HttpClient(mockEngine) {
    install(ContentNegotiation) { json() }
}
```

## Testando Room/SQLDelight

- Room: Use `Room.inMemoryDatabaseBuilder()` para testes em memória
- SQLDelight: Use `JdbcSqliteDriver(JdbcSqliteDriver.IN_MEMORY)` para testes na JVM

```kotlin
@Test
fun `insert and query items`() = runTest {
    val driver = JdbcSqliteDriver(JdbcSqliteDriver.IN_MEMORY)
    Database.Schema.create(driver)
    val db = Database(driver)

    db.itemQueries.insert("1", "Sample Item", "description")
    val items = db.itemQueries.getAll().executeAsList()
    assertEquals(1, items.size)
}
```

## Nomenclatura de Testes

Use nomes descritivos entre crases (backticks):

```kotlin
@Test
fun `search with empty query returns all items`() = runTest { }

@Test
fun `delete item emits updated list without deleted item`() = runTest { }
```

## Organização dos Testes

```
src/
├── commonTest/kotlin/     # Testes compartilhados (ViewModel, UseCase, Repository)
├── androidUnitTest/kotlin/ # Testes unitários de Android (JUnit)
├── androidInstrumentedTest/kotlin/  # Testes instrumentados (Room, UI)
└── iosTest/kotlin/        # Testes específicos de iOS
```

Cobertura mínima de testes: ViewModel + UseCase para cada funcionalidade.
