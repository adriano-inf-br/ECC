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
# Segurança em C++

> Este arquivo estende [common/security.md](../common/security.md) com conteúdo específico de C++.

## Segurança de Memória

- Nunca use `new`/`delete` cru — use smart pointers
- Nunca use arrays no estilo C — use `std::array` ou `std::vector`
- Nunca use `malloc`/`free` — use alocação de C++
- Evite `reinterpret_cast` a menos que seja absolutamente necessário

## Estouros de Buffer (Buffer Overflows)

- Use `std::string` em vez de `char*`
- Use `.at()` para acesso com verificação de limites quando a segurança importar
- Nunca use `strcpy`, `strcat`, `sprintf` — use `std::string` ou `fmt::format`

## Comportamento Indefinido (Undefined Behavior)

- Sempre inicialize as variáveis
- Evite estouro de inteiro com sinal
- Nunca desreferencie ponteiros nulos ou pendentes (dangling)
- Use sanitizers no CI:
  ```bash
  cmake -DCMAKE_CXX_FLAGS="-fsanitize=address,undefined" ..
  ```

## Análise Estática

- Use **clang-tidy** para verificações automatizadas:
  ```bash
  clang-tidy --checks='*' src/*.cpp
  ```
- Use **cppcheck** para análise adicional:
  ```bash
  cppcheck --enable=all src/
  ```

## Referência

Veja a skill: `cpp-coding-standards` para diretrizes detalhadas de segurança.
