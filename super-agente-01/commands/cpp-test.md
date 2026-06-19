---
description: Enforce TDD workflow for C++. Write GoogleTest tests first, then implement. Verify coverage with gcov/lcov.
---

# Comando TDD C++

Este comando impõe a metodologia de desenvolvimento orientado a testes (TDD) para código C++ usando GoogleTest/GoogleMock com CMake/CTest.

## O Que Este Comando Faz

1. **Define Interfaces**: Cria primeiro o esqueleto das assinaturas de classe/função
2. **Escreve Testes**: Cria casos de teste GoogleTest abrangentes (RED)
3. **Executa os Testes**: Verifica se os testes falham pelo motivo certo
4. **Implementa o Código**: Escreve o código mínimo para passar (GREEN)
5. **Refatora**: Melhora mantendo os testes verdes
6. **Verifica a Cobertura**: Garante 80%+ de cobertura

## Quando Usar

Use `/cpp-test` quando:
- Implementar novas funções ou classes C++
- Adicionar cobertura de teste a código existente
- Corrigir bugs (escreva primeiro o teste que falha)
- Construir lógica de negócio crítica
- Aprender o fluxo de trabalho TDD em C++

## Ciclo TDD

```
RED     → Write failing GoogleTest test
GREEN   → Implement minimal code to pass
REFACTOR → Improve code, tests stay green
REPEAT  → Next test case
```

## Exemplo de Sessão

````
User: /cpp-test I need a function to validate email addresses

Agent:
# TDD Session: Email Validator

## Step 1: Define Interface

```cpp
// validator/email.hpp
#pragma once
#include <string>
#include <expected>

enum class EmailError {
    Empty,
    InvalidFormat
};

std::expected<void, EmailError> validate_email(const std::string& email);
```

## Step 2: Write Tests (RED)

```cpp
// validator/email_test.cpp
#include <gtest/gtest.h>
#include "email.hpp"

TEST(ValidateEmail, AcceptsSimpleEmail) {
    auto result = validate_email("user@example.com");
    EXPECT_TRUE(result.has_value());
}

TEST(ValidateEmail, AcceptsSubdomain) {
    EXPECT_TRUE(validate_email("user@mail.example.com").has_value());
}

TEST(ValidateEmail, AcceptsPlus) {
    EXPECT_TRUE(validate_email("user+tag@example.com").has_value());
}

TEST(ValidateEmail, RejectsEmpty) {
    auto result = validate_email("");
    ASSERT_FALSE(result.has_value());
    EXPECT_EQ(result.error(), EmailError::Empty);
}

TEST(ValidateEmail, RejectsNoAtSign) {
    EXPECT_FALSE(validate_email("userexample.com").has_value());
}

TEST(ValidateEmail, RejectsNoDomain) {
    EXPECT_FALSE(validate_email("user@").has_value());
}

TEST(ValidateEmail, RejectsNoLocalPart) {
    EXPECT_FALSE(validate_email("@example.com").has_value());
}
```

## Step 3: Run Tests - Verify FAIL

```bash
$ cmake --build build && ctest --test-dir build --output-on-failure

1/1 Test #1: email_validator_test .....***Failed
    --- undefined reference to `validate_email`

FAIL
```

✓ Tests fail as expected (unimplemented).

## Step 4: Implement Minimal Code (GREEN)

```cpp
// validator/email.cpp
#include "email.hpp"
#include <regex>

std::expected<void, EmailError> validate_email(const std::string& email) {
    if (email.empty()) {
        return std::unexpected(EmailError::Empty);
    }
    static const std::regex pattern(R"([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})");
    if (!std::regex_match(email, pattern)) {
        return std::unexpected(EmailError::InvalidFormat);
    }
    return {};
}
```

## Step 5: Run Tests - Verify PASS

```bash
$ cmake --build build && ctest --test-dir build --output-on-failure

1/1 Test #1: email_validator_test .....   Passed    0.01 sec

100% tests passed.
```

✓ All tests passing!

## Step 6: Check Coverage

```bash
$ cmake -DCMAKE_CXX_FLAGS="--coverage" -B build && cmake --build build
$ ctest --test-dir build
$ lcov --capture --directory build --output-file coverage.info
$ lcov --list coverage.info

validator/email.cpp     | 100%
```

✓ Coverage: 100%

## TDD Complete!
````

## Padrões de Teste

### Testes Básicos
```cpp
TEST(SuiteName, TestName) {
    EXPECT_EQ(add(2, 3), 5);
    EXPECT_NE(result, nullptr);
    EXPECT_TRUE(is_valid);
    EXPECT_THROW(func(), std::invalid_argument);
}
```

### Fixtures (Fixtures)
```cpp
class DatabaseTest : public ::testing::Test {
protected:
    void SetUp() override { db_ = create_test_db(); }
    void TearDown() override { db_.reset(); }
    std::unique_ptr<Database> db_;
};

TEST_F(DatabaseTest, InsertsRecord) {
    db_->insert("key", "value");
    EXPECT_EQ(db_->get("key"), "value");
}
```

### Testes Parametrizados
```cpp
class PrimeTest : public ::testing::TestWithParam<std::pair<int, bool>> {};

TEST_P(PrimeTest, ChecksPrimality) {
    auto [input, expected] = GetParam();
    EXPECT_EQ(is_prime(input), expected);
}

INSTANTIATE_TEST_SUITE_P(Primes, PrimeTest, ::testing::Values(
    std::make_pair(2, true),
    std::make_pair(4, false),
    std::make_pair(7, true)
));
```

## Comandos de Cobertura

```bash
# Build with coverage
cmake -DCMAKE_CXX_FLAGS="--coverage" -DCMAKE_EXE_LINKER_FLAGS="--coverage" -B build

# Run tests
cmake --build build && ctest --test-dir build

# Generate coverage report
lcov --capture --directory build --output-file coverage.info
lcov --remove coverage.info '/usr/*' --output-file coverage.info
genhtml coverage.info --output-directory coverage_html
```

## Metas de Cobertura

| Tipo de Código | Meta |
|-----------|--------|
| Lógica de negócio crítica | 100% |
| APIs públicas | 90%+ |
| Código geral | 80%+ |
| Código gerado | Excluir |

## Boas Práticas de TDD

**FAÇA:**
- Escreva o teste PRIMEIRO, antes de qualquer implementação
- Execute os testes após cada mudança
- Use `EXPECT_*` (continua) em vez de `ASSERT_*` (para) quando apropriado
- Teste comportamento, não detalhes de implementação
- Inclua casos extremos (vazio, null, valores máximos, condições de fronteira)

**NÃO FAÇA:**
- Escrever a implementação antes dos testes
- Pular a fase RED
- Testar métodos privados diretamente (teste pela API pública)
- Usar `sleep` nos testes
- Ignorar testes instáveis (flaky)

## Comandos Relacionados

- `/cpp-build` - Corrige erros de build
- `/cpp-review` - Revisa o código após a implementação
- skill `verification-loop` - Executa o loop de verificação completo

## Relacionados

- Skill: `skills/cpp-testing/`
- Skill: `skills/tdd-workflow/`
