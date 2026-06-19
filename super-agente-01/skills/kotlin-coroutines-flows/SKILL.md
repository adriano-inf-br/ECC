---
name: kotlin-coroutines-flows
description: Padrões de Coroutines e Flow do Kotlin para Android e KMP — concorrência estruturada, operadores de Flow, StateFlow, tratamento de erros e testes.
metadata:
  origin: ECC
---

# Coroutines e Flows do Kotlin

Padrões para concorrência estruturada, streams reativos baseados em Flow e testes de coroutines em projetos Android e Kotlin Multiplatform.

## Quando Ativar

- Escrever código assíncrono com coroutines do Kotlin
- Usar Flow, StateFlow ou SharedFlow para dados reativos
- Lidar com operações concorrentes (carregamento paralelo, debounce, retry)
- Testar coroutines e Flows
- Gerenciar escopos de coroutines e cancelamento

## Concorrência Estruturada

### Hierarquia de Escopos

```
Application
  └── viewModelScope (ViewModel)
        └── coroutineScope { } (filho estruturado)
              ├── async { } (tarefa concorrente)
              └── async { } (tarefa concorrente)
```

Sempre use concorrência estruturada — nunca `GlobalScope`:

```kotlin
// RUIM
GlobalScope.launch { fetchData() }

// BOM — com escopo no ciclo de vida do ViewModel
viewModelScope.launch { fetchData() }

// BOM — com escopo no ciclo de vida do composable
LaunchedEffect(key) { fetchData() }
```

### Decomposição Paralela

Use `coroutineScope` + `async` para trabalho paralelo:

```kotlin
suspend fun loadDashboard(): Dashboard = coroutineScope {
    val items = async { itemRepository.getRecent() }
    val stats = async { statsRepository.getToday() }
    val profile = async { userRepository.getCurrent() }
    Dashboard(
        items = items.await(),
        stats = stats.await(),
        profile = profile.await()
    )
}
```

### SupervisorScope

Use `supervisorScope` quando falhas de filhos não devem cancelar os irmãos:

```kotlin
suspend fun syncAll() = supervisorScope {
    launch { syncItems() }       // uma falha aqui não cancela syncStats
    launch { syncStats() }
    launch { syncSettings() }
}
```

## Padrões de Flow

### Cold Flow — Conversão de One-Shot em Stream

```kotlin
fun observeItems(): Flow<List<Item>> = flow {
    // Reemite sempre que o banco de dados muda
    itemDao.observeAll()
        .map { entities -> entities.map { it.toDomain() } }
        .collect { emit(it) }
}
```

### StateFlow para Estado de UI

```kotlin
class DashboardViewModel(
    observeProgress: ObserveUserProgressUseCase
) : ViewModel() {
    val progress: StateFlow<UserProgress> = observeProgress()
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5_000),
            initialValue = UserProgress.EMPTY
        )
}
```

`WhileSubscribed(5_000)` mantém o upstream ativo por 5 segundos após o último assinante sair — sobrevive a mudanças de configuração sem reiniciar.

### Combinando Múltiplos Flows

```kotlin
val uiState: StateFlow<HomeState> = combine(
    itemRepository.observeItems(),
    settingsRepository.observeTheme(),
    userRepository.observeProfile()
) { items, theme, profile ->
    HomeState(items = items, theme = theme, profile = profile)
}.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), HomeState())
```

### Operadores de Flow

```kotlin
// Aplica debounce na entrada de busca
searchQuery
    .debounce(300)
    .distinctUntilChanged()
    .flatMapLatest { query -> repository.search(query) }
    .catch { emit(emptyList()) }
    .collect { results -> _state.update { it.copy(results = results) } }

// Retry com backoff exponencial
fun fetchWithRetry(): Flow<Data> = flow { emit(api.fetch()) }
    .retryWhen { cause, attempt ->
        if (cause is IOException && attempt < 3) {
            delay(1000L * (1 shl attempt.toInt()))
            true
        } else {
            false
        }
    }
```

### SharedFlow para Eventos Únicos

```kotlin
class ItemListViewModel : ViewModel() {
    private val _effects = MutableSharedFlow<Effect>()
    val effects: SharedFlow<Effect> = _effects.asSharedFlow()

    sealed interface Effect {
        data class ShowSnackbar(val message: String) : Effect
        data class NavigateTo(val route: String) : Effect
    }

    private fun deleteItem(id: String) {
        viewModelScope.launch {
            repository.delete(id)
            _effects.emit(Effect.ShowSnackbar("Item deleted"))
        }
    }
}

// Coleta no Composable
LaunchedEffect(Unit) {
    viewModel.effects.collect { effect ->
        when (effect) {
            is Effect.ShowSnackbar -> snackbarHostState.showSnackbar(effect.message)
            is Effect.NavigateTo -> navController.navigate(effect.route)
        }
    }
}
```

## Dispatchers

```kotlin
// Trabalho intensivo de CPU
withContext(Dispatchers.Default) { parseJson(largePayload) }

// Trabalho limitado por IO
withContext(Dispatchers.IO) { database.query() }

// Thread principal (UI) — padrão em viewModelScope
withContext(Dispatchers.Main) { updateUi() }
```

No KMP, use `Dispatchers.Default` e `Dispatchers.Main` (disponíveis em todas as plataformas). `Dispatchers.IO` é exclusivo de JVM/Android — use `Dispatchers.Default` em outras plataformas ou forneça via DI.

## Cancelamento

### Cancelamento Cooperativo

Loops de longa duração devem verificar o cancelamento:

```kotlin
suspend fun processItems(items: List<Item>) = coroutineScope {
    for (item in items) {
        ensureActive()  // lança CancellationException se cancelado
        process(item)
    }
}
```

### Limpeza com try/finally

```kotlin
viewModelScope.launch {
    try {
        _state.update { it.copy(isLoading = true) }
        val data = repository.fetch()
        _state.update { it.copy(data = data) }
    } finally {
        _state.update { it.copy(isLoading = false) }  // sempre executa, mesmo em cancelamento
    }
}
```

## Testes

### Testando StateFlow com Turbine

```kotlin
@Test
fun `search updates item list`() = runTest {
    val fakeRepository = FakeItemRepository().apply { emit(testItems) }
    val viewModel = ItemListViewModel(GetItemsUseCase(fakeRepository))

    viewModel.state.test {
        assertEquals(ItemListState(), awaitItem())  // inicial

        viewModel.onSearch("query")
        val loading = awaitItem()
        assertTrue(loading.isLoading)

        val loaded = awaitItem()
        assertFalse(loaded.isLoading)
        assertEquals(1, loaded.items.size)
    }
}
```

### Testing with TestDispatcher

```kotlin
@Test
fun `parallel load completes correctly`() = runTest {
    val viewModel = DashboardViewModel(
        itemRepo = FakeItemRepo(),
        statsRepo = FakeStatsRepo()
    )

    viewModel.load()
    advanceUntilIdle()

    val state = viewModel.state.value
    assertNotNull(state.items)
    assertNotNull(state.stats)
}
```

### Faking Flows

```kotlin
class FakeItemRepository : ItemRepository {
    private val _items = MutableStateFlow<List<Item>>(emptyList())

    override fun observeItems(): Flow<List<Item>> = _items

    fun emit(items: List<Item>) { _items.value = items }

    override suspend fun getItemsByCategory(category: String): Result<List<Item>> {
        return Result.success(_items.value.filter { it.category == category })
    }
}
```

## Anti-Patterns to Avoid

- Using `GlobalScope` — leaks coroutines, no structured cancellation
- Collecting Flows in `init {}` without a scope — use `viewModelScope.launch`
- Using `MutableStateFlow` with mutable collections — always use immutable copies: `_state.update { it.copy(list = it.list + newItem) }`
- Catching `CancellationException` — let it propagate for proper cancellation
- Using `flowOn(Dispatchers.Main)` to collect — collection dispatcher is the caller's dispatcher
- Creating `Flow` in `@Composable` without `remember` — recreates the flow every recomposition

## References

See skill: `compose-multiplatform-patterns` for UI consumption of Flows.
See skill: `android-clean-architecture` for where coroutines fit in layers.
