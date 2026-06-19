---
description: Aplica o fluxo de trabalho de TDD para Kotlin. Escreva os testes Kotest primeiro, depois implemente. Verifique 80%+ de cobertura com Kover.
---

# Comando Kotlin TDD

Este comando aplica a metodologia de desenvolvimento orientado a testes para código Kotlin usando Kotest, MockK e Kover.

## O Que Este Comando Faz

1. **Definir Tipos/Interfaces**: Esboça as assinaturas das funções primeiro
2. **Escrever Testes Kotest**: Cria specs de teste abrangentes (RED)
3. **Executar Testes**: Verifica se os testes falham pelo motivo certo
4. **Implementar o Código**: Escreve o código mínimo para passar (GREEN)
5. **Refatorar**: Melhora mantendo os testes verdes
6. **Verificar Cobertura**: Garante 80%+ de cobertura com Kover

## Quando Usar

Use `/kotlin-test` quando:
- Implementando novas funções ou classes Kotlin
- Adicionando cobertura de testes a código Kotlin existente
- Corrigindo bugs (escreva o teste que falha primeiro)
- Construindo lógica de negócio crítica
- Aprendendo o fluxo de trabalho de TDD em Kotlin

## Ciclo de TDD

```
RED     -> Write failing Kotest test
GREEN   -> Implement minimal code to pass
REFACTOR -> Improve code, tests stay green
REPEAT  -> Next test case
```

## Sessão de Exemplo

````text
User: /kotlin-test I need a function to validate user registration requests

Agent:
# Sessão de TDD: Validador de Registro

## Passo 1: Definir a Interface

```kotlin
// validator/RegistrationValidator.kt
package com.example.validator

data class RegistrationRequest(
    val name: String,
    val email: String,
    val password: String,
)

sealed class ValidationResult {
    data object Valid : ValidationResult()
    data class Invalid(val errors: List<String>) : ValidationResult()
}

fun validateRegistration(request: RegistrationRequest): ValidationResult {
    TODO("not implemented")
}
```

## Passo 2: Escrever Testes Kotest (RED)

```kotlin
// validator/RegistrationValidatorTest.kt
package com.example.validator

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.types.shouldBeInstanceOf

class RegistrationValidatorTest : FunSpec({
    test("valid registration returns Valid") {
        val request = RegistrationRequest(
            name = "Alice",
            email = "alice@example.com",
            password = "SecureP@ss1",
        )

        val result = validateRegistration(request)

        result.shouldBeInstanceOf<ValidationResult.Valid>()
    }

    test("blank name returns Invalid") {
        val request = RegistrationRequest(
            name = "",
            email = "alice@example.com",
            password = "SecureP@ss1",
        )

        val result = validateRegistration(request)

        val invalid = result.shouldBeInstanceOf<ValidationResult.Invalid>()
        invalid.errors shouldBe listOf("Name is required")
    }

    test("invalid email returns Invalid") {
        val request = RegistrationRequest(
            name = "Alice",
            email = "not-an-email",
            password = "SecureP@ss1",
        )

        val result = validateRegistration(request)

        val invalid = result.shouldBeInstanceOf<ValidationResult.Invalid>()
        invalid.errors shouldBe listOf("Invalid email format")
    }

    test("short password returns Invalid") {
        val request = RegistrationRequest(
            name = "Alice",
            email = "alice@example.com",
            password = "short",
        )

        val result = validateRegistration(request)

        val invalid = result.shouldBeInstanceOf<ValidationResult.Invalid>()
        invalid.errors shouldBe listOf("Password must be at least 8 characters")
    }

    test("multiple errors returns all errors") {
        val request = RegistrationRequest(
            name = "",
            email = "bad",
            password = "short",
        )

        val result = validateRegistration(request)

        val invalid = result.shouldBeInstanceOf<ValidationResult.Invalid>()
        invalid.errors.size shouldBe 3
    }
})
```

## Passo 3: Executar Testes - Verificar FALHA

```bash
$ ./gradlew test

RegistrationValidatorTest > valid registration returns Valid FAILED
  kotlin.NotImplementedError: An operation is not implemented

FAILED (5 tests, 0 passed, 5 failed)
```

✓ Os testes falham como esperado (NotImplementedError).

## Passo 4: Implementar o Código Mínimo (GREEN)

```kotlin
// validator/RegistrationValidator.kt
package com.example.validator

private val EMAIL_REGEX = Regex("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")
private const val MIN_PASSWORD_LENGTH = 8

fun validateRegistration(request: RegistrationRequest): ValidationResult {
    val errors = buildList {
        if (request.name.isBlank()) add("Name is required")
        if (!EMAIL_REGEX.matches(request.email)) add("Invalid email format")
        if (request.password.length < MIN_PASSWORD_LENGTH) add("Password must be at least $MIN_PASSWORD_LENGTH characters")
    }

    return if (errors.isEmpty()) ValidationResult.Valid
    else ValidationResult.Invalid(errors)
}
```

## Passo 5: Executar Testes - Verificar APROVAÇÃO

```bash
$ ./gradlew test

RegistrationValidatorTest > valid registration returns Valid PASSED
RegistrationValidatorTest > blank name returns Invalid PASSED
RegistrationValidatorTest > invalid email returns Invalid PASSED
RegistrationValidatorTest > short password returns Invalid PASSED
RegistrationValidatorTest > multiple errors returns all errors PASSED

PASSED (5 tests, 5 passed, 0 failed)
```

✓ Todos os testes passando!

## Passo 6: Verificar a Cobertura

```bash
$ ./gradlew koverHtmlReport

Coverage: 100.0% of statements
```

✓ Cobertura: 100%

## TDD Concluído!
````

## Padrões de Teste

### StringSpec (Mais Simples)

```kotlin
class CalculatorTest : StringSpec({
    "add two positive numbers" {
        Calculator.add(2, 3) shouldBe 5
    }
})
```

### BehaviorSpec (BDD)

```kotlin
class OrderServiceTest : BehaviorSpec({
    Given("a valid order") {
        When("placed") {
            Then("should be confirmed") { /* ... */ }
        }
    }
})
```

### Testes Orientados a Dados

```kotlin
class ParserTest : FunSpec({
    context("valid inputs") {
        withData("2026-01-15", "2026-12-31", "2000-01-01") { input ->
            parseDate(input).shouldNotBeNull()
        }
    }
})
```

### Teste de Coroutines

```kotlin
class AsyncServiceTest : FunSpec({
    test("concurrent fetch completes") {
        runTest {
            val result = service.fetchAll()
            result.shouldNotBeEmpty()
        }
    }
})
```

## Coverage Commands

```bash
# Run tests with coverage
./gradlew koverHtmlReport

# Verify coverage thresholds
./gradlew koverVerify

# XML report for CI
./gradlew koverXmlReport

# Open HTML report
open build/reports/kover/html/index.html

# Run specific test class
./gradlew test --tests "com.example.UserServiceTest"

# Run with verbose output
./gradlew test --info
```

## Coverage Targets

| Code Type | Target |
|-----------|--------|
| Critical business logic | 100% |
| Public APIs | 90%+ |
| General code | 80%+ |
| Generated code | Exclude |

## TDD Best Practices

**DO:**
- Write test FIRST, before any implementation
- Run tests after each change
- Use Kotest matchers for expressive assertions
- Use MockK's `coEvery`/`coVerify` for suspend functions
- Test behavior, not implementation details
- Include edge cases (empty, null, max values)

**DON'T:**
- Write implementation before tests
- Skip the RED phase
- Test private functions directly
- Use `Thread.sleep()` in coroutine tests
- Ignore flaky tests

## Related Commands

- `/kotlin-build` - Fix build errors
- `/kotlin-review` - Review code after implementation
- `verification-loop` skill - Run full verification loop

## Related

- Skill: `skills/kotlin-testing/`
- Skill: `skills/tdd-workflow/`
