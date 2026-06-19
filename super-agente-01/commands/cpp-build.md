---
description: Fix C++ build errors, CMake issues, and linker problems incrementally. Invokes the cpp-build-resolver agent for minimal, surgical fixes.
---

# C++ Build and Fix

Este comando invoca o agent **cpp-build-resolver** para corrigir incrementalmente erros de build C++ com mudanças mínimas.

## O Que Este Comando Faz

1. **Executa Diagnósticos**: Executa `cmake --build`, `clang-tidy`, `cppcheck`
2. **Analisa Erros**: Agrupa por arquivo e ordena por severidade
3. **Corrige Incrementalmente**: Um erro por vez
4. **Verifica Cada Correção**: Reexecuta o build após cada mudança
5. **Reporta o Resumo**: Mostra o que foi corrigido e o que resta

## Quando Usar

Use `/cpp-build` quando:
- `cmake --build build` falha com erros
- Erros de linker (referências indefinidas, definições múltiplas)
- Falhas de instanciação de template
- Problemas de include/dependência
- Após puxar mudanças que quebram o build

## Comandos de Diagnóstico Executados

```bash
# CMake configure
cmake -B build -S .

# Build
cmake --build build 2>&1 | head -100

# Static analysis (if available)
clang-tidy src/*.cpp -- -std=c++17
cppcheck --enable=all src/
```

## Exemplo de Sessão

```text
User: /cpp-build

Agent:
# C++ Build Resolution

## Initial Diagnostics

```bash
$ cmake --build build
src/service/user.cpp:25:15: error: use of undeclared identifier 'UserRepository'
src/handler/api.cpp:42:9: error: no matching function for call to 'process'
src/handler/api.cpp:58:1: error: non-void function does not return a value
```

Errors found: 3

## Fix 1: Undeclared Identifier

File: src/service/user.cpp:25
Error: use of undeclared identifier 'UserRepository'
Cause: Missing include

```cpp
// Added include
#include "repository/user_repository.hpp"
```

```bash
$ cmake --build build
# 2 errors remaining
```

## Fix 2: No Matching Function

File: src/handler/api.cpp:42
Error: no matching function for call to 'process'

```cpp
// Changed
process(params.get("count"));
// To
process(std::stoi(params.get("count")));
```

```bash
$ cmake --build build
# 1 error remaining
```

## Fix 3: Missing Return

File: src/handler/api.cpp:58
Error: non-void function does not return a value

```cpp
std::optional<User> getUser(const std::string& id) {
    if (id.empty()) {
        return std::nullopt;
    }
    auto user = findUser(id);
    // Added missing return
    return user;
}
```

```bash
$ cmake --build build
# Build successful!
```

## Final Verification

```bash
$ ctest --test-dir build --output-on-failure
Test project build
    1/5 Test #1: unit_tests ........   Passed    0.02 sec
    2/5 Test #2: integration_tests    Passed    0.15 sec
All tests passed.
```

## Summary

| Metric | Count |
|--------|-------|
| Build errors fixed | 3 |
| Linker errors fixed | 0 |
| Files modified | 2 |
| Remaining issues | 0 |

Build Status: PASS: SUCCESS
```

## Common Errors Fixed

| Error | Typical Fix |
|-------|-------------|
| `undeclared identifier` | Add `#include` or fix typo |
| `no matching function` | Fix argument types or add overload |
| `undefined reference` | Link library or add implementation |
| `multiple definition` | Use `inline` or move to .cpp |
| `incomplete type` | Replace forward decl with `#include` |
| `no member named X` | Fix member name or include |
| `cannot convert X to Y` | Add appropriate cast |
| `CMake Error` | Fix CMakeLists.txt configuration |

## Fix Strategy

1. **Compilation errors first** - Code must compile
2. **Linker errors second** - Resolve undefined references
3. **Warnings third** - Fix with `-Wall -Wextra`
4. **One fix at a time** - Verify each change
5. **Minimal changes** - Don't refactor, just fix

## Stop Conditions

The agent will stop and report if:
- Same error persists after 3 attempts
- Fix introduces more errors
- Requires architectural changes
- Missing external dependencies

## Related Commands

- `/cpp-test` - Run tests after build succeeds
- `/cpp-review` - Review code quality
- `verification-loop` skill - Full verification loop

## Related

- Agent: `agents/cpp-build-resolver.md`
- Skill: `skills/cpp-coding-standards/`
