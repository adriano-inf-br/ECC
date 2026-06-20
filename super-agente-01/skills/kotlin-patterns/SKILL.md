---
name: kotlin-patterns
description: Padrões idiomáticos de Kotlin, boas práticas e convenções para construir aplicações Kotlin robustas, eficientes e de fácil manutenção com corrotinas, segurança de null e builders DSL.
metadata:
  origin: ECC
---

# Padrões de Desenvolvimento Kotlin

Padrões idiomáticos de Kotlin e boas práticas para construir aplicações robustas, eficientes e de fácil manutenção.

## Quando Usar

- Escrever novo código Kotlin
- Revisar código Kotlin
- Refatorar código Kotlin existente
- Projetar módulos ou bibliotecas Kotlin
- Configurar builds com Gradle Kotlin DSL

## Como Funciona

Esta skill aplica convenções idiomáticas de Kotlin em sete áreas principais: segurança de null usando o sistema de tipos e operadores de chamada segura, imutabilidade via `val` e `copy()` em data classes, sealed classes e interfaces para hierarquias de tipos exaustivas, concorrência estruturada com corrotinas e `Flow`, funções de extensão para adicionar comportamento sem herança, builders DSL type-safe usando `@DslMarker` e receivers lambda, e Gradle Kotlin DSL para configuração de build.

## Exemplos

**Segurança de null com operador Elvis:**
```kotlin
fun getUserEmail(userId: String): String {
    val user = userRepository.findById(userId)
    return user?.email ?: "unknown@example.com"
}
```

**Sealed class para resultados exaustivos:**
```kotlin
sealed class Result<out T> {
    data class Success<T>(val data: T) : Result<T>()
    data class Failure(val error: AppError) : Result<Nothing>()
    data object Loading : Result<Nothing>()
}
```

**Concorrência estruturada com async/await:**
```kotlin
suspend fun fetchUserWithPosts(userId: String): UserProfile =
    coroutineScope {
        val user = async { userService.getUser(userId) }
        val posts = async { postService.getUserPosts(userId) }
        UserProfile(user = user.await(), posts = posts.await())
    }
```

## Princípios Fundamentais

### 1. Segurança de Null

O sistema de tipos do Kotlin distingue tipos anuláveis e não anuláveis. Use-o ao máximo.

```kotlin
// Bom: use tipos não anuláveis por padrão
fun getUser(id: String): User {
    return userRepository.findById(id)
        ?: throw UserNotFoundException("User $id not found")
}

// Bom: chamadas seguras e operador Elvis
fun getUserEmail(userId: String): String {
    val user = userRepository.findById(userId)
    return user?.email ?: "unknown@example.com"
}

// Ruim: forçar desempacotamento de tipos anuláveis
fun getUserEmail(userId: String): String {
    val user = userRepository.findById(userId)
    return user!!.email // Lança NPE se nulo
}
```

### 2. Imutabilidade por Padrão

Prefira `val` em vez de `var`, coleções imutáveis em vez de mutáveis.

```kotlin
// Bom: dados imutáveis
data class User(
    val id: String,
    val name: String,
    val email: String,
)

// Bom: transforme com copy()
fun updateEmail(user: User, newEmail: String): User =
    user.copy(email = newEmail)

// Bom: coleções imutáveis
val users: List<User> = listOf(user1, user2)
val filtered = users.filter { it.email.isNotBlank() }

// Ruim: estado mutável
var currentUser: User? = null // Evite estado global mutável
val mutableUsers = mutableListOf<User>() // Evite a menos que realmente necessário
```

### 3. Corpos de Expressão e Funções de Expressão Única

Use corpos de expressão para funções concisas e legíveis.

```kotlin
// Bom: corpo de expressão
fun isAdult(age: Int): Boolean = age >= 18

fun formatFullName(first: String, last: String): String =
    "$first $last".trim()

fun User.displayName(): String =
    name.ifBlank { email.substringBefore('@') }

// Bom: when como expressão
fun statusMessage(code: Int): String = when (code) {
    200 -> "OK"
    404 -> "Not Found"
    500 -> "Internal Server Error"
    else -> "Unknown status: $code"
}

// Ruim: corpo de bloco desnecessário
fun isAdult(age: Int): Boolean {
    return age >= 18
}
```

### 4. Data Classes para Objetos de Valor

Use data classes para tipos que primariamente armazenam dados.

```kotlin
// Bom: data class com copy, equals, hashCode, toString
data class CreateUserRequest(
    val name: String,
    val email: String,
    val role: Role = Role.USER,
)

// Bom: value class para segurança de tipos (overhead zero em tempo de execução)
@JvmInline
value class UserId(val value: String) {
    init {
        require(value.isNotBlank()) { "UserId cannot be blank" }
    }
}

@JvmInline
value class Email(val value: String) {
    init {
        require('@' in value) { "Invalid email: $value" }
    }
}

fun getUser(id: UserId): User = userRepository.findById(id)
```

## Sealed Classes e Interfaces

### Modelando Hierarquias Restritas

```kotlin
// Bom: sealed class para when exaustivo
sealed class Result<out T> {
    data class Success<T>(val data: T) : Result<T>()
    data class Failure(val error: AppError) : Result<Nothing>()
    data object Loading : Result<Nothing>()
}

fun <T> Result<T>.getOrNull(): T? = when (this) {
    is Result.Success -> data
    is Result.Failure -> null
    is Result.Loading -> null
}

fun <T> Result<T>.getOrThrow(): T = when (this) {
    is Result.Success -> data
    is Result.Failure -> throw error.toException()
    is Result.Loading -> throw IllegalStateException("Still loading")
}
```

### Sealed Interfaces para Respostas de API

```kotlin
sealed interface ApiError {
    val message: String

    data class NotFound(override val message: String) : ApiError
    data class Unauthorized(override val message: String) : ApiError
    data class Validation(
        override val message: String,
        val field: String,
    ) : ApiError
    data class Internal(
        override val message: String,
        val cause: Throwable? = null,
    ) : ApiError
}

fun ApiError.toStatusCode(): Int = when (this) {
    is ApiError.NotFound -> 404
    is ApiError.Unauthorized -> 401
    is ApiError.Validation -> 422
    is ApiError.Internal -> 500
}
```

## Funções de Escopo

### Quando Usar Cada Uma

```kotlin
// let: transformar resultado anulável ou com escopo
val length: Int? = name?.let { it.trim().length }

// apply: configurar um objeto (retorna o objeto)
val user = User().apply {
    name = "Alice"
    email = "alice@example.com"
}

// also: efeitos colaterais (retorna o objeto)
val user = createUser(request).also { logger.info("Created user: ${it.id}") }

// run: executar um bloco com receiver (retorna resultado)
val result = connection.run {
    prepareStatement(sql)
    executeQuery()
}

// with: forma não-extensão de run
val csv = with(StringBuilder()) {
    appendLine("name,email")
    users.forEach { appendLine("${it.name},${it.email}") }
    toString()
}
```

### Anti-Padrões

```kotlin
// Ruim: aninhamento de funções de escopo
user?.let { u ->
    u.address?.let { addr ->
        addr.city?.let { city ->
            println(city) // Difícil de ler
        }
    }
}

// Bom: encadeie chamadas seguras em vez disso
val city = user?.address?.city
city?.let { println(it) }
```

## Funções de Extensão

### Adicionando Funcionalidade Sem Herança

```kotlin
// Bom: extensões específicas de domínio
fun String.toSlug(): String =
    lowercase()
        .replace(Regex("[^a-z0-9\\s-]"), "")
        .replace(Regex("\\s+"), "-")
        .trim('-')

fun Instant.toLocalDate(zone: ZoneId = ZoneId.systemDefault()): LocalDate =
    atZone(zone).toLocalDate()

// Bom: extensões de coleção
fun <T> List<T>.second(): T = this[1]

fun <T> List<T>.secondOrNull(): T? = getOrNull(1)

// Bom: extensões com escopo (sem poluir o namespace global)
class UserService {
    private fun User.isActive(): Boolean =
        status == Status.ACTIVE && lastLogin.isAfter(Instant.now().minus(30, ChronoUnit.DAYS))

    fun getActiveUsers(): List<User> = userRepository.findAll().filter { it.isActive() }
}
```

## Corrotinas

### Concorrência Estruturada

```kotlin
// Bom: concorrência estruturada com coroutineScope
suspend fun fetchUserWithPosts(userId: String): UserProfile =
    coroutineScope {
        val userDeferred = async { userService.getUser(userId) }
        val postsDeferred = async { postService.getUserPosts(userId) }

        UserProfile(
            user = userDeferred.await(),
            posts = postsDeferred.await(),
        )
    }

// Bom: supervisorScope quando filhos podem falhar independentemente
suspend fun fetchDashboard(userId: String): Dashboard =
    supervisorScope {
        val user = async { userService.getUser(userId) }
        val notifications = async { notificationService.getRecent(userId) }
        val recommendations = async { recommendationService.getFor(userId) }

        Dashboard(
            user = user.await(),
            notifications = try {
                notifications.await()
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                emptyList()
            },
            recommendations = try {
                recommendations.await()
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                emptyList()
            },
        )
    }
```

### Flow para Streams Reativos

```kotlin
// Bom: cold flow com tratamento correto de erros
fun observeUsers(): Flow<List<User>> = flow {
    while (currentCoroutineContext().isActive) {
        val users = userRepository.findAll()
        emit(users)
        delay(5.seconds)
    }
}.catch { e ->
    logger.error("Error observing users", e)
    emit(emptyList())
}

// Bom: operadores Flow
fun searchUsers(query: Flow<String>): Flow<List<User>> =
    query
        .debounce(300.milliseconds)
        .distinctUntilChanged()
        .filter { it.length >= 2 }
        .mapLatest { q -> userRepository.search(q) }
        .catch { emit(emptyList()) }
```

### Cancelamento e Limpeza

```kotlin
// Bom: respeite o cancelamento
suspend fun processItems(items: List<Item>) {
    items.forEach { item ->
        ensureActive() // Verifique o cancelamento antes de trabalho pesado
        processItem(item)
    }
}

// Bom: limpeza com try/finally
suspend fun acquireAndProcess() {
    val resource = acquireResource()
    try {
        resource.process()
    } finally {
        withContext(NonCancellable) {
            resource.release() // Sempre libere, mesmo em cancelamento
        }
    }
}
```

## Delegação

### Delegação de Propriedade

```kotlin
// Inicialização lazy
val expensiveData: List<User> by lazy {
    userRepository.findAll()
}

// Propriedade observável
var name: String by Delegates.observable("initial") { _, old, new ->
    logger.info("Name changed from '$old' to '$new'")
}

// Propriedades com backup em Map
class Config(private val map: Map<String, Any?>) {
    val host: String by map
    val port: Int by map
    val debug: Boolean by map
}

val config = Config(mapOf("host" to "localhost", "port" to 8080, "debug" to true))
```

### Delegação de Interface

```kotlin
// Bom: delegue implementação de interface
class LoggingUserRepository(
    private val delegate: UserRepository,
    private val logger: Logger,
) : UserRepository by delegate {
    // Sobrescreva apenas o que precisa de logging
    override suspend fun findById(id: String): User? {
        logger.info("Finding user by id: $id")
        return delegate.findById(id).also {
            logger.info("Found user: ${it?.name ?: "null"}")
        }
    }
}
```

## Builders DSL

### Builders Type-Safe

```kotlin
// Bom: DSL com @DslMarker
@DslMarker
annotation class HtmlDsl

@HtmlDsl
class HTML {
    private val children = mutableListOf<Element>()

    fun head(init: Head.() -> Unit) {
        children += Head().apply(init)
    }

    fun body(init: Body.() -> Unit) {
        children += Body().apply(init)
    }

    override fun toString(): String = children.joinToString("\n")
}

fun html(init: HTML.() -> Unit): HTML = HTML().apply(init)

// Uso
val page = html {
    head { title("My Page") }
    body {
        h1("Welcome")
        p("Hello, World!")
    }
}
```

### DSL de Configuração

```kotlin
data class ServerConfig(
    val host: String = "0.0.0.0",
    val port: Int = 8080,
    val ssl: SslConfig? = null,
    val database: DatabaseConfig? = null,
)

data class SslConfig(val certPath: String, val keyPath: String)
data class DatabaseConfig(val url: String, val maxPoolSize: Int = 10)

class ServerConfigBuilder {
    var host: String = "0.0.0.0"
    var port: Int = 8080
    private var ssl: SslConfig? = null
    private var database: DatabaseConfig? = null

    fun ssl(certPath: String, keyPath: String) {
        ssl = SslConfig(certPath, keyPath)
    }

    fun database(url: String, maxPoolSize: Int = 10) {
        database = DatabaseConfig(url, maxPoolSize)
    }

    fun build(): ServerConfig = ServerConfig(host, port, ssl, database)
}

fun serverConfig(init: ServerConfigBuilder.() -> Unit): ServerConfig =
    ServerConfigBuilder().apply(init).build()

// Uso
val config = serverConfig {
    host = "0.0.0.0"
    port = 443
    ssl("/certs/cert.pem", "/certs/key.pem")
    database("jdbc:postgresql://localhost:5432/mydb", maxPoolSize = 20)
}
```

## Sequences para Avaliação Lazy

```kotlin
// Bom: use sequences para coleções grandes com múltiplas operações
val result = users.asSequence()
    .filter { it.isActive }
    .map { it.email }
    .filter { it.endsWith("@company.com") }
    .take(10)
    .toList()

// Bom: gere sequences infinitas
val fibonacci: Sequence<Long> = sequence {
    var a = 0L
    var b = 1L
    while (true) {
        yield(a)
        val next = a + b
        a = b
        b = next
    }
}

val first20 = fibonacci.take(20).toList()
```

## Gradle Kotlin DSL

### Configuração do build.gradle.kts

```kotlin
// Verifique as versões mais recentes: https://kotlinlang.org/docs/releases.html
plugins {
    kotlin("jvm") version "2.3.10"
    kotlin("plugin.serialization") version "2.3.10"
    id("io.ktor.plugin") version "3.4.0"
    id("org.jetbrains.kotlinx.kover") version "0.9.7"
    id("io.gitlab.arturbosch.detekt") version "1.23.8"
}

group = "com.example"
version = "1.0.0"

kotlin {
    jvmToolchain(21)
}

dependencies {
    // Ktor
    implementation("io.ktor:ktor-server-core:3.4.0")
    implementation("io.ktor:ktor-server-netty:3.4.0")
    implementation("io.ktor:ktor-server-content-negotiation:3.4.0")
    implementation("io.ktor:ktor-serialization-kotlinx-json:3.4.0")

    // Exposed
    implementation("org.jetbrains.exposed:exposed-core:1.0.0")
    implementation("org.jetbrains.exposed:exposed-dao:1.0.0")
    implementation("org.jetbrains.exposed:exposed-jdbc:1.0.0")
    implementation("org.jetbrains.exposed:exposed-kotlin-datetime:1.0.0")

    // Koin
    implementation("io.insert-koin:koin-ktor:4.2.0")

    // Corrotinas
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.10.2")

    // Testes
    testImplementation("io.kotest:kotest-runner-junit5:6.1.4")
    testImplementation("io.kotest:kotest-assertions-core:6.1.4")
    testImplementation("io.kotest:kotest-property:6.1.4")
    testImplementation("io.mockk:mockk:1.14.9")
    testImplementation("io.ktor:ktor-server-test-host:3.4.0")
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.10.2")
}

tasks.withType<Test> {
    useJUnitPlatform()
}

detekt {
    config.setFrom(files("config/detekt/detekt.yml"))
    buildUponDefaultConfig = true
}
```

## Padrões de Tratamento de Erros

### Tipo Result para Operações de Domínio

```kotlin
// Bom: use o Result do Kotlin ou uma sealed class customizada
suspend fun createUser(request: CreateUserRequest): Result<User> = runCatching {
    require(request.name.isNotBlank()) { "Name cannot be blank" }
    require('@' in request.email) { "Invalid email format" }

    val user = User(
        id = UserId(UUID.randomUUID().toString()),
        name = request.name,
        email = Email(request.email),
    )
    userRepository.save(user)
    user
}

// Bom: encadeie resultados
val displayName = createUser(request)
    .map { it.name }
    .getOrElse { "Unknown" }
```

### require, check, error

```kotlin
// Bom: pré-condições com mensagens claras
fun withdraw(account: Account, amount: Money): Account {
    require(amount.value > 0) { "Amount must be positive: $amount" }
    check(account.balance >= amount) { "Insufficient balance: ${account.balance} < $amount" }

    return account.copy(balance = account.balance - amount)
}
```

## Operações em Coleções

### Processamento Idiomático de Coleções

```kotlin
// Bom: operações encadeadas
val activeAdminEmails: List<String> = users
    .filter { it.role == Role.ADMIN && it.isActive }
    .sortedBy { it.name }
    .map { it.email }

// Bom: agrupamento e agregação
val usersByRole: Map<Role, List<User>> = users.groupBy { it.role }

val oldestByRole: Map<Role, User?> = users.groupBy { it.role }
    .mapValues { (_, users) -> users.minByOrNull { it.createdAt } }

// Bom: associate para criação de maps
val usersById: Map<UserId, User> = users.associateBy { it.id }

// Bom: partition para divisão
val (active, inactive) = users.partition { it.isActive }
```

## Referência Rápida: Idiomas Kotlin

| Idioma | Descrição |
|-------|-------------|
| `val` em vez de `var` | Prefira variáveis imutáveis |
| `data class` | Para objetos de valor com equals/hashCode/copy |
| `sealed class/interface` | Para hierarquias de tipos restritas |
| `value class` | Para wrappers type-safe com overhead zero |
| `when` como expressão | Pattern matching exaustivo |
| Chamada segura `?.` | Acesso a membro null-safe |
| Elvis `?:` | Valor padrão para anuláveis |
| `let`/`apply`/`also`/`run`/`with` | Funções de escopo para código limpo |
| Funções de extensão | Adicione comportamento sem herança |
| `copy()` | Atualizações imutáveis em data classes |
| `require`/`check` | Asserções de pré-condição |
| Corrotina `async`/`await` | Execução concorrente estruturada |
| `Flow` | Streams reativos cold |
| `sequence` | Avaliação lazy |
| Delegação `by` | Reutilize implementação sem herança |

## Anti-Padrões a Evitar

```kotlin
// Ruim: forçar desempacotamento de tipos anuláveis
val name = user!!.name

// Ruim: vazamento de tipo de plataforma do Java
fun getLength(s: String) = s.length // Seguro
fun getLength(s: String?) = s?.length ?: 0 // Trate nulls do Java

// Ruim: data classes mutáveis
data class MutableUser(var name: String, var email: String)

// Ruim: usar exceções para controle de fluxo
try {
    val user = findUser(id)
} catch (e: NotFoundException) {
    // Não use exceções para casos esperados
}

// Bom: use retorno anulável ou Result
val user: User? = findUserOrNull(id)

// Ruim: ignorar o escopo de corrotina
GlobalScope.launch { /* Evite GlobalScope */ }

// Bom: use concorrência estruturada
coroutineScope {
    launch { /* Escopo correto */ }
}

// Ruim: funções de escopo profundamente aninhadas
user?.let { u ->
    u.address?.let { a ->
        a.city?.let { c -> process(c) }
    }
}

// Bom: encadeamento direto null-safe
user?.address?.city?.let { process(it) }
```

**Lembre-se**: O código Kotlin deve ser conciso mas legível. Aproveite o sistema de tipos para segurança, prefira imutabilidade e use corrotinas para concorrência. Em caso de dúvida, deixe o compilador ajudá-lo.
