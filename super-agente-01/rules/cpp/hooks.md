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
# Hooks de C++

> Este arquivo estende [common/hooks.md](../common/hooks.md) com conteúdo específico de C++.

## Hooks de Build

Execute estas verificações antes de fazer commit de alterações em C++:

```bash
# Verificação de formatação
clang-format --dry-run --Werror src/*.cpp src/*.hpp

# Análise estática
clang-tidy src/*.cpp -- -std=c++17

# Build
cmake --build build

# Testes
ctest --test-dir build --output-on-failure
```

## Pipeline de CI Recomendado

1. **clang-format** — verificação de formatação
2. **clang-tidy** — análise estática
3. **cppcheck** — análise adicional
4. **cmake build** — compilação
5. **ctest** — execução de testes com sanitizers
