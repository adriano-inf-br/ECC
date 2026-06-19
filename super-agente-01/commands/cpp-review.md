---
description: Comprehensive C++ code review for memory safety, modern C++ idioms, concurrency, and security. Invokes the cpp-reviewer agent.
---

# Revisão de código C++

Este comando invoca o agent **cpp-reviewer** para uma revisão de código abrangente e específica de C++.

## O Que Este Comando Faz

1. **Identifica Mudanças em C++**: Encontra arquivos `.cpp`, `.hpp`, `.cc`, `.h` modificados via `git diff`
2. **Executa Análise Estática**: Executa `clang-tidy` e `cppcheck`
3. **Varredura de Segurança de Memória**: Verifica new/delete crus, buffer overflows, use-after-free
4. **Revisão de Concorrência**: Analisa thread safety, uso de mutex, data races
5. **Checagem de C++ Moderno**: Verifica se o código segue as convenções e boas práticas de C++17/20
6. **Gera o Relatório**: Categoriza os problemas por severidade

## Quando Usar

Use `/cpp-review` quando:
- Após escrever ou modificar código C++
- Antes de commitar mudanças em C++
- Ao revisar pull requests com código C++
- Ao começar em uma nova base de código C++
- Ao verificar problemas de segurança de memória

## Categorias de Revisão

### CRITICAL (Deve Corrigir)
- `new`/`delete` crus sem RAII
- Buffer overflows e use-after-free
- Data races sem sincronização
- Injeção de comando via `system()`
- Leituras de variável não inicializada
- Desreferenciamento de ponteiro nulo

### HIGH (Deveria Corrigir)
- Violações da Regra dos Cinco (Rule of Five)
- `std::lock_guard` / `std::scoped_lock` ausentes
- Threads desanexadas (detached) sem gerenciamento adequado de tempo de vida
- Casts no estilo C em vez de `static_cast`/`dynamic_cast`
- Falta de correção de `const`

### MEDIUM (Considerar)
- Cópias desnecessárias (passagem por valor em vez de `const&`)
- `reserve()` ausente em containers de tamanho conhecido
- `using namespace std;` em headers
- `[[nodiscard]]` ausente em valores de retorno importantes
- Metaprogramação de template excessivamente complexa

## Checagens Automatizadas Executadas

```bash
# Static analysis
clang-tidy --checks='*,-llvmlibc-*' src/*.cpp -- -std=c++17

# Additional analysis
cppcheck --enable=all --suppress=missingIncludeSystem src/

# Build with warnings
cmake --build build -- -Wall -Wextra -Wpedantic
```

## Example Usage

```text
User: /cpp-review

Agent:
# C++ Code Review Report

## Files Reviewed
- src/handler/user.cpp (modified)
- src/service/auth.cpp (modified)

## Static Analysis Results
✓ clang-tidy: 2 warnings
✓ cppcheck: No issues

## Issues Found

[CRITICAL] Memory Leak
File: src/service/auth.cpp:45
Issue: Raw `new` without matching `delete`
```cpp
auto* session = new Session(userId);  // Memory leak!
cache[userId] = session;
```
Fix: Use `std::unique_ptr`
```cpp
auto session = std::make_unique<Session>(userId);
cache[userId] = std::move(session);
```

[HIGH] Missing const Reference
File: src/handler/user.cpp:28
Issue: Large object passed by value
```cpp
void processUser(User user) {  // Unnecessary copy
```
Fix: Pass by const reference
```cpp
void processUser(const User& user) {
```

## Summary
- CRITICAL: 1
- HIGH: 1
- MEDIUM: 0

Recommendation: FAIL: Block merge until CRITICAL issue is fixed
```

## Approval Criteria

| Status | Condition |
|--------|-----------|
| PASS: Approve | No CRITICAL or HIGH issues |
| WARNING: Warning | Only MEDIUM issues (merge with caution) |
| FAIL: Block | CRITICAL or HIGH issues found |

## Integration with Other Commands

- Use `/cpp-test` first to ensure tests pass
- Use `/cpp-build` if build errors occur
- Use `/cpp-review` before committing
- Use `/code-review` for non-C++ specific concerns

## Related

- Agent: `agents/cpp-reviewer.md`
- Skills: `skills/cpp-coding-standards/`, `skills/cpp-testing/`
