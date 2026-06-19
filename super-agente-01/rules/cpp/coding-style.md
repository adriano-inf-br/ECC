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
# Estilo de Código C++

> Este arquivo estende [common/coding-style.md](../common/coding-style.md) com conteúdo específico de C++.

## C++ Moderno (C++17/20/23)

- Prefira **recursos modernos de C++** em vez de construções no estilo C
- Use `auto` quando o tipo for óbvio pelo contexto
- Use `constexpr` para constantes de tempo de compilação
- Use structured bindings: `auto [key, value] = map_entry;`

## Gerenciamento de Recursos

- **RAII em todo lugar** — sem `new`/`delete` manual
- Use `std::unique_ptr` para posse exclusiva
- Use `std::shared_ptr` somente quando a posse compartilhada for realmente necessária
- Use `std::make_unique` / `std::make_shared` em vez de `new` cru

## Convenções de Nomeação

- Tipos/Classes: `PascalCase`
- Funções/Métodos: `snake_case` ou `camelCase` (siga a convenção do projeto)
- Constantes: `kPascalCase` ou `UPPER_SNAKE_CASE`
- Namespaces: `lowercase`
- Variáveis de membro: `snake_case_` (underscore ao final) ou prefixo `m_`

## Formatação

- Use **clang-format** — sem debates de estilo
- Execute `clang-format -i <file>` antes de fazer commit

## Referência

Veja a skill: `cpp-coding-standards` para padrões e diretrizes abrangentes de código C++.
