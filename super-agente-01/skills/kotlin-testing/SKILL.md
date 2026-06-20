---
name: kotlin-testing
description: Padrões de testes em Kotlin com Kotest, MockK, testes de corrotinas, testes baseados em propriedades e cobertura com Kover. Segue a metodologia TDD com práticas idiomáticas de Kotlin.
metadata:
  origin: ECC
---

# Padrões de Testes Kotlin

Padrões abrangentes de testes em Kotlin para escrever testes confiáveis e de fácil manutenção seguindo a metodologia TDD com Kotest e MockK.

## Quando Usar

- Escrever novas funções ou classes Kotlin
- Adicionar cobertura de testes a código Kotlin existente
- Implementar testes baseados em propriedades
- Seguir o fluxo de trabalho TDD em projetos Kotlin
- Configurar o Kover para cobertura de código

## Como Funciona

1. **Identifique o código alvo** — Encontre a função, classe ou módulo a testar
2. **Escreva uma spec Kotest** — Escolha um estilo de spec (StringSpec, FunSpec, BehaviorSpec) adequado ao escopo do teste
3. **Mock as dependências** — Use MockK para isolar a unidade sob teste
4. **Execute os testes (RED)** — Verifique que o teste falha com o erro esperado
5. **Implemente o código (GREEN)** — Escreva o mínimo de código para passar no teste
6. **Refatore** — Melhore a implementação mantendo os testes verdes
7. **Verifique a cobertura** — Execute `./gradlew koverHtmlReport` e verifique cobertura acima de 80%

## Exemplos

As seções a seguir contêm exemplos detalhados e executáveis para cada padrão de teste:

### Referência Rápida

- **Specs Kotest** — Exemplos de StringSpec, FunSpec, BehaviorSpec, DescribeSpec em [Estilos de Spec Kotest](#estilos-de-spec-kotest)
- **Mocking** — Configuração do MockK, mock de corrotinas, captura de argumentos em [MockK](#mockk)
- **Walkthrough TDD** — Ciclo completo RED/GREEN/REFACTOR com EmailValidator em [Fluxo de Trabalho TDD para Kotlin](#fluxo-de-trabalho-tdd-para-kotlin)
- **Cobertura** — Configuração do Kover e comandos em [Cobertura com Kover](#cobertura-com-kover)
- **Testes Ktor** — Configuração de testApplication em [Testes com Ktor testApplication](#testes-com-ktor-testapplication)

### Fluxo de Trabalho TDD para Kotlin

#### O Ciclo RED-GREEN-REFACTOR

```
RED     -> Escreva um teste que falha primeiro
GREEN   -> Escreva o mínimo de código para passar no teste
REFACTOR -> Melhore o código mantendo os testes verdes
REPEAT  -> Continue com o próximo requisito
```

#### TDD Passo a Passo em Kotlin

```kotlin
// Passo 1: Defina a interface/assinatura
// EmailValidator.kt
package com.example.validator

fun validateEmail(email: String): Result<String> {
    TODO("not implemented")
}

// Passo 2: Escreva o teste que falha (RED)
// EmailValidatorTest.kt
package com.example.validator

import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.result.shouldBeFailure
import io.kotest.matchers.result.shouldBeSuccess

class EmailValidatorTest : StringSpec({
    "valid email returns success" {
        validateEmail("user@example.com").shouldBeSuccess("user@example.com")
    }

    "empty email returns failure" {
        validateEmail("").shouldBeFailure()
    }

    "email without @ returns failure" {
        validateEmail("userexample.com").shouldBeFailure()
    }
})

// Passo 3: Execute os testes - verifique a FALHA
// $ ./gradlew test
// EmailValidatorTest > valid email returns success FAILED
//   kotlin.NotImplementedError: An operation is not implemented

// Passo 4: Implemente o mínimo de código (GREEN)
fun validateEmail(email: String): Result<String> {
    if (email.isBlank()) return Result.failure(IllegalArgumentException("Email cannot be blank"))
    if ('@' !in email) return Result.failure(IllegalArgumentException("Email must contain @"))
    val regex = Regex("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")
    if (!regex.matches(email)) return Result.failure(IllegalArgumentException("Invalid email format"))
    return Result.success(email)
}

// Passo 5: Execute os testes - verifique o SUCESSO
// $ ./gradlew test
// EmailValidatorTest > valid email returns success PASSED
// EmailValidatorTest > empty email returns failure PASSED
// EmailValidatorTest > email without @ returns failure PASSED

// Passo 6: Refatore se necessário, verifique que os testes ainda passam
```

### Estilos de Spec Kotest

#### StringSpec (O Mais Simples)

```kotlin
class CalculatorTest : StringSpec({
    "add two positive numbers" {
        Calculator.add(2, 3) shouldBe 5
    }

    "add negative numbers" {
        Calculator.add(-1, -2) shouldBe -3
    }

    "add zero" {
        Calculator.add(0, 5) shouldBe 5
    }
})
```

#### FunSpec (Estilo JUnit)

```kotlin
class UserServiceTest : FunSpec({
    val repository = mockk<UserRepository>()
    val service = UserService(repository)

    test("getUser returns user when found") {
        val expected = User(id = "1", name = "Alice")
        coEvery { repository.findById("1") } returns expected

        val result = service.getUser("1")

        result shouldBe expected
    }

    test("getUser throws when not found") {
        coEvery { repository.findById("999") } returns null

        shouldThrow<UserNotFoundException> {
            service.getUser("999")
        }
    }
})
```

#### BehaviorSpec (Estilo BDD)

```kotlin
class OrderServiceTest : BehaviorSpec({
    val repository = mockk<OrderRepository>()
    val paymentService = mockk<PaymentService>()
    val service = OrderService(repository, paymentService)

    Given("a valid order request") {
        val request = CreateOrderRequest(
            userId = "user-1",
            items = listOf(OrderItem("product-1", quantity = 2)),
        )

        When("the order is placed") {
            coEvery { paymentService.charge(any()) } returns PaymentResult.Success
            coEvery { repository.save(any()) } answers { firstArg() }

            val result = service.placeOrder(request)

            Then("it should return a confirmed order") {
                result.status shouldBe OrderStatus.CONFIRMED
            }

            Then("it should charge payment") {
                coVerify(exactly = 1) { paymentService.charge(any()) }
            }
        }

        When("payment fails") {
            coEvery { paymentService.charge(any()) } returns PaymentResult.Declined

            Then("it should throw PaymentException") {
                shouldThrow<PaymentException> {
                    service.placeOrder(request)
                }
            }
        }
    }
})
```

#### DescribeSpec (Estilo RSpec)

```kotlin
class UserValidatorTest : DescribeSpec({
    describe("validateUser") {
        val validator = UserValidator()

        context("with valid input") {
            it("accepts a normal user") {
                val user = CreateUserRequest("Alice", "alice@example.com")
                validator.validate(user).shouldBeValid()
            }
        }

        context("with invalid name") {
            it("rejects blank name") {
                val user = CreateUserRequest("", "alice@example.com")
                validator.validate(user).shouldBeInvalid()
            }

            it("rejects name exceeding max length") {
                val user = CreateUserRequest("A".repeat(256), "alice@example.com")
                validator.validate(user).shouldBeInvalid()
            }
        }
    }
})
```

### Matchers Kotest

#### Matchers Principais

```kotlin
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.kotest.matchers.string.*
import io.kotest.matchers.collections.*
import io.kotest.matchers.nulls.*

// Igualdade
result shouldBe expected
result shouldNotBe unexpected

// Strings
name shouldStartWith "Al"
name shouldEndWith "ice"
name shouldContain "lic"
name shouldMatch Regex("[A-Z][a-z]+")
name.shouldBeBlank()

// Coleções
list shouldContain "item"
list shouldHaveSize 3
list.shouldBeSorted()
list.shouldContainAll("a", "b", "c")
list.shouldBeEmpty()

// Nulls
result.shouldNotBeNull()
result.shouldBeNull()

// Tipos
result.shouldBeInstanceOf<User>()

// Números
count shouldBeGreaterThan 0
price shouldBeInRange 1.0..100.0

// Exceções
shouldThrow<IllegalArgumentException> {
    validateAge(-1)
}.message shouldBe "Age must be positive"

shouldNotThrow<Exception> {
    validateAge(25)
}
```

#### Matchers Customizados

```kotlin
fun beActiveUser() = object : Matcher<User> {
    override fun test(value: User) = MatcherResult(
        value.isActive && value.lastLogin != null,
        { "User ${value.id} should be active with a last login" },
        { "User ${value.id} should not be active" },
    )
}

// Uso
user should beActiveUser()
```

### MockK

#### Mock Básico

```kotlin
class UserServiceTest : FunSpec({
    val repository = mockk<UserRepository>()
    val logger = mockk<Logger>(relaxed = true) // Relaxed: retorna valores padrão
    val service = UserService(repository, logger)

    beforeTest {
        clearMocks(repository, logger)
    }

    test("findUser delegates to repository") {
        val expected = User(id = "1", name = "Alice")
        every { repository.findById("1") } returns expected

        val result = service.findUser("1")

        result shouldBe expected
        verify(exactly = 1) { repository.findById("1") }
    }

    test("findUser returns null for unknown id") {
        every { repository.findById(any()) } returns null

        val result = service.findUser("unknown")

        result.shouldBeNull()
    }
})
```

#### Mock de Corrotinas

```kotlin
class AsyncUserServiceTest : FunSpec({
    val repository = mockk<UserRepository>()
    val service = UserService(repository)

    test("getUser suspending function") {
        coEvery { repository.findById("1") } returns User(id = "1", name = "Alice")

        val result = service.getUser("1")

        result.name shouldBe "Alice"
        coVerify { repository.findById("1") }
    }

    test("getUser with delay") {
        coEvery { repository.findById("1") } coAnswers {
            delay(100) // Simula trabalho assíncrono
            User(id = "1", name = "Alice")
        }

        val result = service.getUser("1")
        result.name shouldBe "Alice"
    }
})
```

#### Captura de Argumento

```kotlin
test("save captures the user argument") {
    val slot = slot<User>()
    coEvery { repository.save(capture(slot)) } returns Unit

    service.createUser(CreateUserRequest("Alice", "alice@example.com"))

    slot.captured.name shouldBe "Alice"
    slot.captured.email shouldBe "alice@example.com"
    slot.captured.id.shouldNotBeNull()
}
```

#### Spy e Mock Parcial

```kotlin
test("spy on real object") {
    val realService = UserService(repository)
    val spy = spyk(realService)

    every { spy.generateId() } returns "fixed-id"

    spy.createUser(request)

    verify { spy.generateId() } // Sobrescrito
    // Outros métodos usam a implementação real
}
```

### Testes de Corrotinas

#### runTest para Funções Suspend

```kotlin
import kotlinx.coroutines.test.runTest

class CoroutineServiceTest : FunSpec({
    test("concurrent fetches complete together") {
        runTest {
            val service = DataService(testScope = this)

            val result = service.fetchAllData()

            result.users.shouldNotBeEmpty()
            result.products.shouldNotBeEmpty()
        }
    }

    test("timeout after delay") {
        runTest {
            val service = SlowService()

            shouldThrow<TimeoutCancellationException> {
                withTimeout(100) {
                    service.slowOperation() // Demora mais de 100ms
                }
            }
        }
    }
})
```

#### Testando Flows

```kotlin
import io.kotest.matchers.collections.shouldContainInOrder
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.toList
import kotlinx.coroutines.launch
import kotlinx.coroutines.test.advanceTimeBy
import kotlinx.coroutines.test.runTest

class FlowServiceTest : FunSpec({
    test("observeUsers emits updates") {
        runTest {
            val service = UserFlowService()

            val emissions = service.observeUsers()
                .take(3)
                .toList()

            emissions shouldHaveSize 3
            emissions.last().shouldNotBeEmpty()
        }
    }

    test("searchUsers debounces input") {
        runTest {
            val service = SearchService()
            val queries = MutableSharedFlow<String>()

            val results = mutableListOf<List<User>>()
            val job = launch {
                service.searchUsers(queries).collect { results.add(it) }
            }

            queries.emit("a")
            queries.emit("ab")
            queries.emit("abc") // Apenas este deve disparar a busca
            advanceTimeBy(500)

            results shouldHaveSize 1
            job.cancel()
        }
    }
})
```

#### TestDispatcher

```kotlin
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.advanceUntilIdle

class DispatcherTest : FunSpec({
    test("uses test dispatcher for controlled execution") {
        val dispatcher = StandardTestDispatcher()

        runTest(dispatcher) {
            var completed = false

            launch {
                delay(1000)
                completed = true
            }

            completed shouldBe false
            advanceTimeBy(1000)
            completed shouldBe true
        }
    }
})
```

### Testes Baseados em Propriedades

#### Testes de Propriedade com Kotest

```kotlin
import io.kotest.core.spec.style.FunSpec
import io.kotest.property.Arb
import io.kotest.property.arbitrary.*
import io.kotest.property.forAll
import io.kotest.property.checkAll
import kotlinx.serialization.json.Json
import kotlinx.serialization.encodeToString
import kotlinx.serialization.decodeFromString

// Nota: o teste de roundtrip de serialização abaixo requer que a data class User
// seja anotada com @Serializable (de kotlinx.serialization).

class PropertyTest : FunSpec({
    test("string reverse is involutory") {
        forAll<String> { s ->
            s.reversed().reversed() == s
        }
    }

    test("list sort is idempotent") {
        forAll(Arb.list(Arb.int())) { list ->
            list.sorted() == list.sorted().sorted()
        }
    }

    test("serialization roundtrip preserves data") {
        checkAll(Arb.bind(Arb.string(1..50), Arb.string(5..100)) { name, email ->
            User(name = name, email = "$email@test.com")
        }) { user ->
            val json = Json.encodeToString(user)
            val decoded = Json.decodeFromString<User>(json)
            decoded shouldBe user
        }
    }
})
```

#### Geradores Customizados

```kotlin
val userArb: Arb<User> = Arb.bind(
    Arb.string(minSize = 1, maxSize = 50),
    Arb.email(),
    Arb.enum<Role>(),
) { name, email, role ->
    User(
        id = UserId(UUID.randomUUID().toString()),
        name = name,
        email = Email(email),
        role = role,
    )
}

val moneyArb: Arb<Money> = Arb.bind(
    Arb.long(1L..1_000_000L),
    Arb.enum<Currency>(),
) { amount, currency ->
    Money(amount, currency)
}
```

### Testes Orientados a Dados

#### withData no Kotest

```kotlin
class ParserTest : FunSpec({
    context("parsing valid dates") {
        withData(
            "2026-01-15" to LocalDate(2026, 1, 15),
            "2026-12-31" to LocalDate(2026, 12, 31),
            "2000-01-01" to LocalDate(2000, 1, 1),
        ) { (input, expected) ->
            parseDate(input) shouldBe expected
        }
    }

    context("rejecting invalid dates") {
        withData(
            nameFn = { "rejects '$it'" },
            "not-a-date",
            "2026-13-01",
            "2026-00-15",
            "",
        ) { input ->
            shouldThrow<DateParseException> {
                parseDate(input)
            }
        }
    }
})
```

### Ciclo de Vida dos Testes e Fixtures

#### BeforeTest / AfterTest

```kotlin
class DatabaseTest : FunSpec({
    lateinit var db: Database

    beforeSpec {
        db = Database.connect("jdbc:h2:mem:test;DB_CLOSE_DELAY=-1")
        transaction(db) {
            SchemaUtils.create(UsersTable)
        }
    }

    afterSpec {
        transaction(db) {
            SchemaUtils.drop(UsersTable)
        }
    }

    beforeTest {
        transaction(db) {
            UsersTable.deleteAll()
        }
    }

    test("insert and retrieve user") {
        transaction(db) {
            UsersTable.insert {
                it[name] = "Alice"
                it[email] = "alice@example.com"
            }
        }

        val users = transaction(db) {
            UsersTable.selectAll().map { it[UsersTable.name] }
        }

        users shouldContain "Alice"
    }
})
```

#### Extensões Kotest

```kotlin
// Extensão de teste reutilizável
class DatabaseExtension : BeforeSpecListener, AfterSpecListener {
    lateinit var db: Database

    override suspend fun beforeSpec(spec: Spec) {
        db = Database.connect("jdbc:h2:mem:test;DB_CLOSE_DELAY=-1")
    }

    override suspend fun afterSpec(spec: Spec) {
        // limpeza
    }
}

class UserRepositoryTest : FunSpec({
    val dbExt = DatabaseExtension()
    register(dbExt)

    test("save and find user") {
        val repo = UserRepository(dbExt.db)
        // ...
    }
})
```

### Cobertura com Kover

#### Configuração Gradle

```kotlin
// build.gradle.kts
plugins {
    id("org.jetbrains.kotlinx.kover") version "0.9.7"
}

kover {
    reports {
        total {
            html { onCheck = true }
            xml { onCheck = true }
        }
        filters {
            excludes {
                classes("*.generated.*", "*.config.*")
            }
        }
        verify {
            rule {
                minBound(80) // Falha no build se cobertura abaixo de 80%
            }
        }
    }
}
```

#### Comandos de Cobertura

```bash
# Execute os testes com cobertura
./gradlew koverHtmlReport

# Verifique os limiares de cobertura
./gradlew koverVerify

# Relatório XML para CI
./gradlew koverXmlReport

# Visualize o relatório HTML (use o comando para o seu SO)
# macOS:   open build/reports/kover/html/index.html
# Linux:   xdg-open build/reports/kover/html/index.html
# Windows: start build/reports/kover/html/index.html
```

#### Metas de Cobertura

| Tipo de Código | Meta |
|-----------|--------|
| Lógica de negócio crítica | 100% |
| APIs públicas | 90%+ |
| Código geral | 80%+ |
| Código gerado / config | Excluir |

### Testes com Ktor testApplication

```kotlin
class ApiRoutesTest : FunSpec({
    test("GET /users returns list") {
        testApplication {
            application {
                configureRouting()
                configureSerialization()
            }

            val response = client.get("/users")

            response.status shouldBe HttpStatusCode.OK
            val users = response.body<List<UserResponse>>()
            users.shouldNotBeEmpty()
        }
    }

    test("POST /users creates user") {
        testApplication {
            application {
                configureRouting()
                configureSerialization()
            }

            val response = client.post("/users") {
                contentType(ContentType.Application.Json)
                setBody(CreateUserRequest("Alice", "alice@example.com"))
            }

            response.status shouldBe HttpStatusCode.Created
        }
    }
})
```

### Comandos de Teste

```bash
# Execute todos os testes
./gradlew test

# Execute uma classe de teste específica
./gradlew test --tests "com.example.UserServiceTest"

# Execute um teste específico
./gradlew test --tests "com.example.UserServiceTest.getUser returns user when found"

# Execute com saída verbosa
./gradlew test --info

# Execute com cobertura
./gradlew koverHtmlReport

# Execute detekt (análise estática)
./gradlew detekt

# Execute ktlint (verificação de formatação)
./gradlew ktlintCheck

# Execução contínua de testes
./gradlew test --continuous
```

### Boas Práticas

**FAÇA:**
- Escreva os testes PRIMEIRO (TDD)
- Use os estilos de spec do Kotest de forma consistente no projeto
- Use `coEvery`/`coVerify` do MockK para funções suspend
- Use `runTest` para testes de corrotinas
- Teste o comportamento, não a implementação
- Use testes baseados em propriedades para funções puras
- Use Fixtures com `data class` para clareza

**NÃO FAÇA:**
- Misture frameworks de teste (escolha Kotest e siga com ele)
- Faça Mock de data classes (use instâncias reais)
- Use `Thread.sleep()` em testes de corrotinas (use `advanceTimeBy`)
- Pule a fase RED no TDD
- Teste funções privadas diretamente
- Ignore testes instáveis (flaky tests)

### Integração com CI/CD

```yaml
# Exemplo GitHub Actions
test:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-java@v4
      with:
        distribution: 'temurin'
        java-version: '21'

    - name: Run tests with coverage
      run: ./gradlew test koverXmlReport

    - name: Verify coverage
      run: ./gradlew koverVerify

    - name: Upload coverage
      uses: codecov/codecov-action@v5
      with:
        files: build/reports/kover/report.xml
        token: ${{ secrets.CODECOV_TOKEN }}
```

**Lembre-se**: Testes são documentação. Eles mostram como o seu código Kotlin deve ser usado. Use os matchers expressivos do Kotest para tornar os testes legíveis e MockK para um mocking limpo das dependências.
