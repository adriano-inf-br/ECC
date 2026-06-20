---
name: cpp-testing
description: Use somente ao escrever/atualizar/corrigir testes C++, configurar GoogleTest/CTest, diagnosticar testes que falham ou são flaky, ou adicionar cobertura/sanitizers.
metadata:
  origin: ECC
---

# C++ Testing (Agent Skill)

Fluxo de trabalho de testes focado em agent para C++ moderno (C++17/20) usando GoogleTest/GoogleMock com CMake/CTest.

## Quando Usar

- Escrever novos testes C++ ou corrigir testes existentes
- Projetar cobertura de testes unitários/de integração para componentes C++
- Adicionar cobertura de testes, portões de CI ou proteção contra regressão
- Configurar fluxos de trabalho CMake/CTest para execução consistente
- Investigar falhas de teste ou comportamento flaky
- Habilitar sanitizers para diagnósticos de memória/race

### Quando NÃO Usar

- Implementar novos recursos de produto sem alterações de teste
- Refatorações de grande escala não relacionadas a cobertura ou falhas de testes
- Ajuste de desempenho sem regressões de teste para validar
- Projetos que não são C++ ou tarefas que não envolvem testes

## Conceitos Centrais

- **Loop de TDD**: red → green → refactor (testes primeiro, correção mínima, depois limpezas).
- **Isolamento**: prefira injeção de dependência e fakes a estado global.
- **Layout de testes**: `tests/unit`, `tests/integration`, `tests/testdata`.
- **Mocks vs fakes**: mock para interações, fake para comportamento com estado.
- **Descoberta no CTest**: use `gtest_discover_tests()` para descoberta de testes estável.
- **Sinal de CI**: rode um subconjunto primeiro, depois a suíte completa com `--output-on-failure`.

## Fluxo de Trabalho de TDD

Siga o loop RED → GREEN → REFACTOR:

1. **RED**: escreva um teste que falha capturando o novo comportamento
2. **GREEN**: implemente a menor mudança para passar
3. **REFACTOR**: faça a limpeza mantendo os testes verdes

```cpp
// tests/add_test.cpp
#include <gtest/gtest.h>

int Add(int a, int b); // Fornecido pelo código de produção.

TEST(AddTest, AddsTwoNumbers) { // RED
  EXPECT_EQ(Add(2, 3), 5);
}

// src/add.cpp
int Add(int a, int b) { // GREEN
  return a + b;
}

// REFACTOR: simplifique/renomeie quando os testes passarem
```

## Exemplos de Código

### Teste Unitário Básico (gtest)

```cpp
// tests/calculator_test.cpp
#include <gtest/gtest.h>

int Add(int a, int b); // Fornecido pelo código de produção.

TEST(CalculatorTest, AddsTwoNumbers) {
    EXPECT_EQ(Add(2, 3), 5);
}
```

### Fixture (gtest)

```cpp
// tests/user_store_test.cpp
// Stub em pseudocódigo: substitua UserStore/User pelos tipos do projeto.
#include <gtest/gtest.h>
#include <memory>
#include <optional>
#include <string>

struct User { std::string name; };
class UserStore {
public:
    explicit UserStore(std::string /*path*/) {}
    void Seed(std::initializer_list<User> /*users*/) {}
    std::optional<User> Find(const std::string &/*name*/) { return User{"alice"}; }
};

class UserStoreTest : public ::testing::Test {
protected:
    void SetUp() override {
        store = std::make_unique<UserStore>(":memory:");
        store->Seed({{"alice"}, {"bob"}});
    }

    std::unique_ptr<UserStore> store;
};

TEST_F(UserStoreTest, FindsExistingUser) {
    auto user = store->Find("alice");
    ASSERT_TRUE(user.has_value());
    EXPECT_EQ(user->name, "alice");
}
```

### Mock (gmock)

```cpp
// tests/notifier_test.cpp
#include <gmock/gmock.h>
#include <gtest/gtest.h>
#include <string>

class Notifier {
public:
    virtual ~Notifier() = default;
    virtual void Send(const std::string &message) = 0;
};

class MockNotifier : public Notifier {
public:
    MOCK_METHOD(void, Send, (const std::string &message), (override));
};

class Service {
public:
    explicit Service(Notifier &notifier) : notifier_(notifier) {}
    void Publish(const std::string &message) { notifier_.Send(message); }

private:
    Notifier &notifier_;
};

TEST(ServiceTest, SendsNotifications) {
    MockNotifier notifier;
    Service service(notifier);

    EXPECT_CALL(notifier, Send("hello")).Times(1);
    service.Publish("hello");
}
```

### Início Rápido com CMake/CTest

```cmake
# CMakeLists.txt (trecho)
cmake_minimum_required(VERSION 3.20)
project(example LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include(FetchContent)
# Prefira versões travadas pelo projeto. Se usar uma tag, use uma versão fixada conforme a política do projeto.
set(GTEST_VERSION v1.17.0) # Ajuste conforme a política do projeto.
FetchContent_Declare(
  googletest
  # Framework Google Test (repositório oficial)
  URL https://github.com/google/googletest/archive/refs/tags/${GTEST_VERSION}.zip
)
FetchContent_MakeAvailable(googletest)

add_executable(example_tests
  tests/calculator_test.cpp
  src/calculator.cpp
)
target_link_libraries(example_tests GTest::gtest GTest::gmock GTest::gtest_main)

enable_testing()
include(GoogleTest)
gtest_discover_tests(example_tests)
```

```bash
cmake -S . -B build -DCMAKE_BUILD_TYPE=Debug
cmake --build build -j
ctest --test-dir build --output-on-failure
```

## Executando os Testes

```bash
ctest --test-dir build --output-on-failure
ctest --test-dir build -R ClampTest
ctest --test-dir build -R "UserStoreTest.*" --output-on-failure
```

```bash
./build/example_tests --gtest_filter=ClampTest.*
./build/example_tests --gtest_filter=UserStoreTest.FindsExistingUser
```

## Depurando Falhas

1. Reexecute o único teste que falha com o filtro do gtest.
2. Adicione logging com escopo ao redor da assertion que falha.
3. Reexecute com sanitizers habilitados.
4. Expanda para a suíte completa quando a causa raiz estiver corrigida.

## Cobertura

Prefira configurações em nível de target em vez de flags globais.

```cmake
option(ENABLE_COVERAGE "Enable coverage flags" OFF)

if(ENABLE_COVERAGE)
  if(CMAKE_CXX_COMPILER_ID MATCHES "GNU")
    target_compile_options(example_tests PRIVATE --coverage)
    target_link_options(example_tests PRIVATE --coverage)
  elseif(CMAKE_CXX_COMPILER_ID MATCHES "Clang")
    target_compile_options(example_tests PRIVATE -fprofile-instr-generate -fcoverage-mapping)
    target_link_options(example_tests PRIVATE -fprofile-instr-generate)
  endif()
endif()
```

GCC + gcov + lcov:

```bash
cmake -S . -B build-cov -DENABLE_COVERAGE=ON
cmake --build build-cov -j
ctest --test-dir build-cov
lcov --capture --directory build-cov --output-file coverage.info
lcov --remove coverage.info '/usr/*' --output-file coverage.info
genhtml coverage.info --output-directory coverage
```

Clang + llvm-cov:

```bash
cmake -S . -B build-llvm -DENABLE_COVERAGE=ON -DCMAKE_CXX_COMPILER=clang++
cmake --build build-llvm -j
LLVM_PROFILE_FILE="build-llvm/default.profraw" ctest --test-dir build-llvm
llvm-profdata merge -sparse build-llvm/default.profraw -o build-llvm/default.profdata
llvm-cov report build-llvm/example_tests -instr-profile=build-llvm/default.profdata
```

## Sanitizers

```cmake
option(ENABLE_ASAN "Enable AddressSanitizer" OFF)
option(ENABLE_UBSAN "Enable UndefinedBehaviorSanitizer" OFF)
option(ENABLE_TSAN "Enable ThreadSanitizer" OFF)

if(ENABLE_ASAN)
  add_compile_options(-fsanitize=address -fno-omit-frame-pointer)
  add_link_options(-fsanitize=address)
endif()
if(ENABLE_UBSAN)
  add_compile_options(-fsanitize=undefined -fno-omit-frame-pointer)
  add_link_options(-fsanitize=undefined)
endif()
if(ENABLE_TSAN)
  add_compile_options(-fsanitize=thread)
  add_link_options(-fsanitize=thread)
endif()
```

## Proteções contra Testes Flaky

- Nunca use `sleep` para sincronização; use condition variables ou latches.
- Torne os diretórios temporários únicos por teste e sempre os limpe.
- Evite dependências de tempo real, rede ou sistema de arquivos em testes unitários.
- Use seeds determinísticas para entradas randomizadas.

## Boas Práticas

### FAÇA

- Mantenha os testes determinísticos e isolados
- Prefira injeção de dependência a globais
- Use `ASSERT_*` para precondições, `EXPECT_*` para múltiplas verificações
- Separe testes unitários vs de integração em labels ou diretórios do CTest
- Rode sanitizers no CI para detecção de memória e race

### NÃO FAÇA

- Não dependa de tempo real ou rede em testes unitários
- Não use sleeps como sincronização quando uma condition variable pode ser usada
- Não faça mock excessivo de objetos de valor simples
- Não use correspondência de string frágil para logs não críticos

### Armadilhas Comuns

- **Usar caminhos temporários fixos** → Gere diretórios temporários únicos por teste e os limpe.
- **Depender do tempo de relógio de parede** → Injete um relógio ou use fontes de tempo fake.
- **Testes de concorrência flaky** → Use condition variables/latches e esperas limitadas.
- **Estado global oculto** → Resete o estado global em fixtures ou remova os globais.
- **Mock excessivo** → Prefira fakes para comportamento com estado e só faça mock de interações.
- **Ausência de execuções com sanitizer** → Adicione builds com ASan/UBSan/TSan no CI.
- **Cobertura em builds somente de debug** → Garanta que os targets de cobertura usem flags consistentes.

## Apêndice Opcional: Fuzzing / Property Testing

Use apenas se o projeto já suportar LLVM/libFuzzer ou uma biblioteca de property-testing.

- **libFuzzer**: melhor para funções puras com I/O mínimo.
- **RapidCheck**: testes baseados em propriedades para validar invariantes.

Harness mínimo de libFuzzer (pseudocódigo: substitua ParseConfig):

```cpp
#include <cstddef>
#include <cstdint>
#include <string>

extern "C" int LLVMFuzzerTestOneInput(const uint8_t *data, size_t size) {
    std::string input(reinterpret_cast<const char *>(data), size);
    // ParseConfig(input); // função do projeto
    return 0;
}
```

## Alternativas ao GoogleTest

- **Catch2**: header-only, matchers expressivos
- **doctest**: leve, overhead mínimo de compilação
