---
description: Revisão abrangente de código Kotlin para padrões idiomáticos, null safety, segurança de coroutines e segurança. Invoca o agent kotlin-reviewer.
---

# Revisão de Código Kotlin

Este comando invoca o agent **kotlin-reviewer** para uma revisão de código abrangente e específica de Kotlin.

## O Que Este Comando Faz

1. **Identificar Mudanças em Kotlin**: Encontra arquivos `.kt` e `.kts` modificados via `git diff`
2. **Executar Build e Análise Estática**: Executa `./gradlew build`, `detekt`, `ktlintCheck`
3. **Varredura de Segurança**: Verifica injeção de SQL, injeção de comandos, segredos embutidos no código
4. **Revisão de Null Safety**: Analisa o uso de `!!`, tratamento de platform types, casts inseguros
5. **Revisão de Coroutines**: Verifica concorrência estruturada, uso de dispatchers, cancelamento
6. **Gerar Relatório**: Categoriza os problemas por severidade

## Quando Usar

Use `/kotlin-review` quando:
- Depois de escrever ou modificar código Kotlin
- Antes de commitar mudanças em Kotlin
- Revisando pull requests com código Kotlin
- Iniciando em uma nova base de código Kotlin
- Aprendendo padrões idiomáticos de Kotlin

## Categorias de Revisão

### CRITICAL (Corrigir Obrigatoriamente)
- Vulnerabilidades de injeção de SQL/comandos
- Force-unwrap `!!` sem justificativa
- Violações de null safety de platform types
- Uso de GlobalScope (violação de concorrência estruturada)
- Credenciais embutidas no código
- Desserialização insegura

### HIGH (Deve Corrigir)
- Estado mutável onde o imutável seria suficiente
- Chamadas bloqueantes dentro do contexto de coroutine
- Verificações de cancelamento ausentes em loops longos
- `when` não exaustivo em sealed types
- Funções grandes (>50 linhas)
- Aninhamento profundo (>4 níveis)

### MEDIUM (Considerar)
- Kotlin não idiomático (padrões no estilo Java)
- Trailing commas ausentes
- Mau uso ou aninhamento de scope functions
- Falta de sequence em cadeias grandes de coleções
- Tipos explícitos redundantes

## Verificações Automatizadas Executadas

```bash
# Build check
./gradlew build

# Static analysis
./gradlew detekt

# Formatting check
./gradlew ktlintCheck

# Tests
./gradlew test
```

## Exemplo de Uso

````text
User: /kotlin-review

Agent:
# Kotlin Code Review Report

## Files Reviewed
- src/main/kotlin/com/example/service/UserService.kt (modified)
- src/main/kotlin/com/example/routes/UserRoutes.kt (modified)

## Static Analysis Results
✓ Build: Successful
✓ detekt: No issues
WARNING: ktlint: 2 formatting warnings

## Issues Found

[CRITICAL] Force-Unwrap Null Safety
File: src/main/kotlin/com/example/service/UserService.kt:28
Issue: Using !! on nullable repository result
```kotlin
val user = repository.findById(id)!!  // NPE risk
```
Fix: Use safe call with error handling
```kotlin
val user = repository.findById(id)
    ?: throw UserNotFoundException("User $id not found")
```

[HIGH] GlobalScope Usage
File: src/main/kotlin/com/example/routes/UserRoutes.kt:45
Issue: Using GlobalScope breaks structured concurrency
```kotlin
GlobalScope.launch {
    notificationService.sendWelcome(user)
}
```
Fix: Use the call's coroutine scope
```kotlin
launch {
    notificationService.sendWelcome(user)
}
```

## Summary
- CRITICAL: 1
- HIGH: 1
- MEDIUM: 0

Recommendation: FAIL: Block merge until CRITICAL issue is fixed
````

## Approval Criteria

| Status | Condition |
|--------|-----------|
| PASS: Approve | No CRITICAL or HIGH issues |
| WARNING: Warning | Only MEDIUM issues (merge with caution) |
| FAIL: Block | CRITICAL or HIGH issues found |

## Integration with Other Commands

- Use `/kotlin-test` first to ensure tests pass
- Use `/kotlin-build` if build errors occur
- Use `/kotlin-review` before committing
- Use `/code-review` for non-Kotlin-specific concerns

## Related

- Agent: `agents/kotlin-reviewer.md`
- Skills: `skills/kotlin-patterns/`, `skills/kotlin-testing/`
