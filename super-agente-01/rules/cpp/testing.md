---
paths:
  - "**/*.cpp"
  - "**/*.hpp"
  - "**/*.cc"
  - "**/*.hh"
  - "**/*.cxx"
  - "**/*.h"
  - "**/CMakeLists.txt"
---
# Testes em C++

> Este arquivo estende [common/testing.md](../common/testing.md) com conteúdo específico de C++.

## Framework

Use **GoogleTest** (gtest/gmock) com **CMake/CTest**.

## Executando Testes

```bash
cmake --build build && ctest --test-dir build --output-on-failure
```

## Cobertura

```bash
cmake -DCMAKE_CXX_FLAGS="--coverage" -DCMAKE_EXE_LINKER_FLAGS="--coverage" ..
cmake --build .
ctest --output-on-failure
lcov --capture --directory . --output-file coverage.info
```

## Sanitizers

Sempre execute os testes com sanitizers no CI:

```bash
cmake -DCMAKE_CXX_FLAGS="-fsanitize=address,undefined" ..
```

## Referência

Veja a skill: `cpp-testing` para padrões detalhados de teste em C++, fluxo de trabalho de TDD e uso de GoogleTest/GMock.
