---
description: Executa testes Flutter/Dart, reporta falhas e corrige problemas de teste incrementalmente. Cobre testes unitários, de widget, golden e de integração.
---

# Flutter Test

Este comando executa a suíte de testes Flutter e reporta os resultados. Quando ocorrem falhas, diagnostica e corrige os problemas incrementalmente.

## O Que Este Comando Faz

1. **Executar Testes**: Executa `flutter test` (ou restringe aos arquivos alterados)
2. **Analisar Falhas**: Identifica os testes que falham por tipo e causa
3. **Corrigir Incrementalmente**: Uma falha por vez quando possível
4. **Verificar**: Reexecuta após cada correção
5. **Reportar**: Mostra o resumo de cobertura e as falhas restantes

## Quando Usar

Use `/flutter-test` quando:
- Após implementar uma funcionalidade para verificar que nada quebrou
- Após executar `/flutter-build` para garantir que os testes passam
- Para verificar a cobertura de testes em código novo
- Quando um arquivo de teste específico está falhando
- Antes de submeter um PR

## Comandos Executados

```bash
# Run all tests
flutter test 2>&1

# Run with coverage
flutter test --coverage 2>&1

# Run specific test file
flutter test test/unit/domain/usecases/get_user_test.dart 2>&1

# Run tests matching a name pattern
flutter test --name "CartBloc" 2>&1

# Run integration tests (requires device/emulator)
flutter test integration_test/ 2>&1

# Update golden files when intentional visual changes are made
flutter test --update-goldens 2>&1
```

## Exemplo de Sessão

````text
User: /flutter-test

Agent:
# Flutter Test Run

## Test Execution

```
$ flutter test
00:05 +42 -2: Some tests failed.

FAILED: test/unit/data/user_repository_test.dart
  UserRepository getById
    returns null when user not found
    Expected: null
    Actual: User(id: 'test-id', name: 'Test User')

FAILED: test/widget/cart_page_test.dart
  CartPage
    shows empty state when cart is empty
    Expected: exactly one widget with text 'Your cart is empty'
    Found: no widget with text 'Your cart is empty'
```

## Fix 1: Repository Test

File: test/unit/data/user_repository_test.dart
Failure: `getById` returns a user when it should return null for missing ID

Root cause: Test setup adds a user with ID 'test-id' but queries with 'missing-id'.
Fix: Updated test to query with 'missing-id' — setup was correct, query was wrong.

```
$ flutter test test/unit/data/user_repository_test.dart
1 test passed.
```

## Fix 2: Widget Test

File: test/widget/cart_page_test.dart
Failure: Empty state text widget not found

Root cause: Empty state message was renamed from 'Your cart is empty' to 'Cart is empty' in the widget.
Fix: Updated test string to match current widget copy.

```
$ flutter test test/widget/cart_page_test.dart
1 test passed.
```

## Final Run

```
$ flutter test --coverage
All 44 tests passed.
Coverage: 84.2% (target: 80%)
```

## Summary

| Metric | Value |
|--------|-------|
| Total tests | 44 |
| Passed | 44 |
| Failed | 0 |
| Coverage | 84.2% |

Test Status: PASS ✓
````

## Falhas de Teste Comuns

| Falha | Correção Típica |
|---------|-------------|
| `Expected: <X> Actual: <Y>` | Atualizar a assertion ou corrigir a implementação |
| `Widget not found` | Corrigir o seletor do finder ou atualizar o teste após renomear o widget |
| `Golden file not found` | Executar `flutter test --update-goldens` para gerar |
| `Golden mismatch` | Inspecionar o diff; executar `--update-goldens` se a mudança foi intencional |
| `MissingPluginException` | Fazer mock do platform channel no setup do teste |
| `LateInitializationError` | Inicializar campos `late` em `setUp()` |
| `pumpAndSettle timed out` | Substituir por chamadas explícitas de `pump(Duration)` |

## Comandos Relacionados

- `/flutter-build` — Corrige erros de build antes de executar os testes
- `/flutter-review` — Revisa o código após os testes passarem
- skill `tdd-workflow` — Fluxo de trabalho de desenvolvimento orientado a testes

## Relacionados

- Agent: `agents/flutter-reviewer.md`
- Agent: `agents/dart-build-resolver.md`
- Skill: `skills/flutter-dart-code-review/`
- Rules: `rules/dart/testing.md`
