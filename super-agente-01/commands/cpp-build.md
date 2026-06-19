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

## Erros Comuns Corrigidos

| Erro | Correção Típica |
|-------|-------------|
| `undeclared identifier` | Adicione `#include` ou corrija o erro de digitação |
| `no matching function` | Corrija os tipos dos argumentos ou adicione uma sobrecarga |
| `undefined reference` | Faça o link da biblioteca ou adicione a implementação |
| `multiple definition` | Use `inline` ou mova para .cpp |
| `incomplete type` | Substitua a declaração antecipada por `#include` |
| `no member named X` | Corrija o nome do membro ou o include |
| `cannot convert X to Y` | Adicione o cast apropriado |
| `CMake Error` | Corrija a configuração do CMakeLists.txt |

## Estratégia de Correção

1. **Erros de compilação primeiro** - O código deve compilar
2. **Erros de linker em segundo** - Resolva referências indefinidas
3. **Warnings em terceiro** - Corrija com `-Wall -Wextra`
4. **Uma correção por vez** - Verifique cada mudança
5. **Mudanças mínimas** - Não refatore, apenas corrija

## Condições de Parada

O agent vai parar e reportar se:
- O mesmo erro persistir após 3 tentativas
- A correção introduzir mais erros
- Exigir mudanças arquiteturais
- Faltarem dependências externas

## Comandos Relacionados

- `/cpp-test` - Executa os testes após o build ter sucesso
- `/cpp-review` - Revisa a qualidade do código
- skill `verification-loop` - Loop de verificação completo

## Relacionados

- Agent: `agents/cpp-build-resolver.md`
- Skill: `skills/cpp-coding-standards/`
