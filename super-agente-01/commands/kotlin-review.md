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
# Relatório de Revisão de Código Kotlin

## Arquivos Revisados
- src/main/kotlin/com/example/service/UserService.kt (modificado)
- src/main/kotlin/com/example/routes/UserRoutes.kt (modificado)

## Resultados da Análise Estática
✓ Build: Bem-sucedido
✓ detekt: Nenhum problema
WARNING: ktlint: 2 avisos de formatação

## Problemas Encontrados

[CRITICAL] Null Safety com Force-Unwrap
Arquivo: src/main/kotlin/com/example/service/UserService.kt:28
Problema: Uso de !! no resultado anulável do repository
```kotlin
val user = repository.findById(id)!!  // NPE risk
```
Correção: Usar chamada segura com tratamento de erro
```kotlin
val user = repository.findById(id)
    ?: throw UserNotFoundException("User $id not found")
```

[HIGH] Uso de GlobalScope
Arquivo: src/main/kotlin/com/example/routes/UserRoutes.kt:45
Problema: Usar GlobalScope quebra a concorrência estruturada
```kotlin
GlobalScope.launch {
    notificationService.sendWelcome(user)
}
```
Correção: Usar o coroutine scope da chamada
```kotlin
launch {
    notificationService.sendWelcome(user)
}
```

## Resumo
- CRITICAL: 1
- HIGH: 1
- MEDIUM: 0

Recomendação: FAIL: Bloquear o merge até o problema CRITICAL ser corrigido
````

## Critérios de Aprovação

| Status | Condição |
|--------|-----------|
| PASS: Aprovar | Nenhum problema CRITICAL ou HIGH |
| WARNING: Aviso | Apenas problemas MEDIUM (merge com cautela) |
| FAIL: Bloquear | Problemas CRITICAL ou HIGH encontrados |

## Integração com Outros Comandos

- Use `/kotlin-test` primeiro para garantir que os testes passem
- Use `/kotlin-build` se ocorrerem erros de build
- Use `/kotlin-review` antes de commitar
- Use `/code-review` para questões não específicas de Kotlin

## Relacionados

- Agent: `agents/kotlin-reviewer.md`
- Skills: `skills/kotlin-patterns/`, `skills/kotlin-testing/`
