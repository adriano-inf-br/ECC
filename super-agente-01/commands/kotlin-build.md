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

## Resumo

| Métrica | Contagem |
|--------|-------|
| Erros de build corrigidos | 3 |
| Problemas do detekt corrigidos | 0 |
| Arquivos modificados | 2 |
| Problemas restantes | 0 |

Status do Build: PASS: SUCCESS
````

## Erros Comuns Corrigidos

| Erro | Correção Típica |
|-------|-------------|
| `Unresolved reference: X` | Adicionar import ou dependência |
| `Type mismatch` | Corrigir conversão ou atribuição de tipo |
| `'when' must be exhaustive` | Adicionar branches ausentes da sealed class |
| `Suspend function can only be called from coroutine` | Adicionar o modificador `suspend` |
| `Smart cast impossible` | Usar `val` local ou `let` |
| `None of the following candidates is applicable` | Corrigir os tipos dos argumentos |
| `Could not resolve dependency` | Corrigir a versão ou adicionar o repositório |

## Estratégia de Correção

1. **Erros de build primeiro** - O código precisa compilar
2. **Violações do detekt em segundo** - Corrigir problemas de qualidade de código
3. **Avisos do ktlint em terceiro** - Corrigir formatação
4. **Uma correção por vez** - Verificar cada mudança
5. **Mudanças mínimas** - Não refatorar, apenas corrigir

## Condições de Parada

O agent vai parar e relatar se:
- O mesmo erro persistir após 3 tentativas
- A correção introduzir mais erros
- For necessária uma mudança arquitetural
- Faltarem dependências externas

## Comandos Relacionados

- `/kotlin-test` - Executar testes após o build ser bem-sucedido
- `/kotlin-review` - Revisar a qualidade do código
- skill `verification-loop` - Loop completo de verificação

## Relacionados

- Agent: `agents/kotlin-build-resolver.md`
- Skill: `skills/kotlin-patterns/`
