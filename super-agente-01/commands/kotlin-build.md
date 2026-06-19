---
description: Corrige erros de build do Kotlin/Gradle, avisos do compilador e problemas de dependência de forma incremental. Invoca o agent kotlin-build-resolver para correções mínimas e cirúrgicas.
---

# Build e Correção do Kotlin

Este comando invoca o agent **kotlin-build-resolver** para corrigir incrementalmente erros de build do Kotlin com mudanças mínimas.

## O Que Este Comando Faz

1. **Executar Diagnósticos**: Executa `./gradlew build`, `detekt`, `ktlintCheck`
2. **Fazer Parsing dos Erros**: Agrupa por arquivo e ordena por severidade
3. **Corrigir Incrementalmente**: Um erro por vez
4. **Verificar Cada Correção**: Reexecuta o build após cada mudança
5. **Relatar Resumo**: Mostra o que foi corrigido e o que resta

## Quando Usar

Use `/kotlin-build` quando:
- `./gradlew build` falha com erros
- O compilador do Kotlin reporta erros
- `./gradlew detekt` reporta violações
- A resolução de dependências do Gradle falha
- Depois de fazer pull de mudanças que quebram o build

## Comandos de Diagnóstico Executados

```bash
# Primary build check
./gradlew build 2>&1

# Static analysis
./gradlew detekt 2>&1 || echo "detekt not configured"
./gradlew ktlintCheck 2>&1 || echo "ktlint not configured"

# Dependency issues
./gradlew dependencies --configuration runtimeClasspath 2>&1 | head -100

# Optional deep refresh when caches or dependency metadata are suspect
./gradlew build --refresh-dependencies
```

## Sessão de Exemplo

````text
User: /kotlin-build

Agent:
# Resolução de Build do Kotlin

## Diagnósticos Iniciais

```bash
$ ./gradlew build
e: src/main/kotlin/com/example/service/UserService.kt:25:15 Unresolved reference: UserRepository
e: src/main/kotlin/com/example/routes/UserRoutes.kt:42:9 Type mismatch: inferred type is String but Int was expected
e: src/main/kotlin/com/example/routes/UserRoutes.kt:58:5 'when' expression must be exhaustive
```

Erros encontrados: 3

## Correção 1: Referência Não Resolvida

Arquivo: src/main/kotlin/com/example/service/UserService.kt:25
Erro: Unresolved reference: UserRepository
Causa: Import ausente

```kotlin
// Added import
import com.example.repository.UserRepository
```

```bash
$ ./gradlew build
# 2 errors remaining
```

## Correção 2: Incompatibilidade de Tipo

Arquivo: src/main/kotlin/com/example/routes/UserRoutes.kt:42
Erro: Type mismatch: inferred type is String but Int was expected

```kotlin
// Changed
val count = call.parameters["count"]
// To
val count = call.parameters["count"]?.toIntOrNull()
    ?: return@get call.respond(HttpStatusCode.BadRequest, "Invalid count")
```

```bash
$ ./gradlew build
# 1 error remaining
```

## Correção 3: When Não Exaustivo

Arquivo: src/main/kotlin/com/example/routes/UserRoutes.kt:58
Erro: 'when' expression must be exhaustive

```kotlin
// Added missing branch
when (user.role) {
    Role.ADMIN -> handleAdmin(user)
    Role.USER -> handleUser(user)
    Role.MODERATOR -> handleModerator(user) // Added
}
```

```bash
$ ./gradlew build
# Build successful!
```

## Verificação Final

```bash
$ ./gradlew detekt
# No issues

$ ./gradlew test
# All tests passed
```

## Summary

| Metric | Count |
|--------|-------|
| Build errors fixed | 3 |
| Detekt issues fixed | 0 |
| Files modified | 2 |
| Remaining issues | 0 |

Build Status: PASS: SUCCESS
````

## Common Errors Fixed

| Error | Typical Fix |
|-------|-------------|
| `Unresolved reference: X` | Add import or dependency |
| `Type mismatch` | Fix type conversion or assignment |
| `'when' must be exhaustive` | Add missing sealed class branches |
| `Suspend function can only be called from coroutine` | Add `suspend` modifier |
| `Smart cast impossible` | Use local `val` or `let` |
| `None of the following candidates is applicable` | Fix argument types |
| `Could not resolve dependency` | Fix version or add repository |

## Fix Strategy

1. **Build errors first** - Code must compile
2. **Detekt violations second** - Fix code quality issues
3. **ktlint warnings third** - Fix formatting
4. **One fix at a time** - Verify each change
5. **Minimal changes** - Don't refactor, just fix

## Stop Conditions

The agent will stop and report if:
- Same error persists after 3 attempts
- Fix introduces more errors
- Requires architectural changes
- Missing external dependencies

## Related Commands

- `/kotlin-test` - Run tests after build succeeds
- `/kotlin-review` - Review code quality
- `verification-loop` skill - Full verification loop

## Related

- Agent: `agents/kotlin-build-resolver.md`
- Skill: `skills/kotlin-patterns/`
