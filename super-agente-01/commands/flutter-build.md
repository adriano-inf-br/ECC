---
description: Corrige erros do analisador Dart e falhas de build do Flutter incrementalmente. Invoca o agent dart-build-resolver para correções mínimas e cirúrgicas.
---

# Flutter Build and Fix

Este comando invoca o agent **dart-build-resolver** para corrigir incrementalmente erros de build Dart/Flutter com mudanças mínimas.

## O Que Este Comando Faz

1. **Executar Diagnósticos**: Executa `flutter analyze`, `flutter pub get`
2. **Analisar Erros**: Agrupa por arquivo e ordena por severidade
3. **Corrigir Incrementalmente**: Um erro por vez
4. **Verificar Cada Correção**: Reexecuta a análise após cada mudança
5. **Reportar Resumo**: Mostra o que foi corrigido e o que resta

## Quando Usar

Use `/flutter-build` quando:
- `flutter analyze` reporta erros
- `flutter build` falha em qualquer plataforma
- `dart pub get` / `flutter pub get` falha com conflitos de versão
- `build_runner` falha ao gerar código
- Após puxar mudanças que quebram o build

## Comandos de Diagnóstico Executados

```bash
# Analysis
flutter analyze 2>&1

# Dependencies
flutter pub get 2>&1

# Code generation (if project uses build_runner)
dart run build_runner build --delete-conflicting-outputs 2>&1

# Platform builds
flutter build apk 2>&1
flutter build web 2>&1
```

## Exemplo de Sessão

````text
User: /flutter-build

Agent:
# Flutter Build Resolution

## Initial Diagnostics

```
$ flutter analyze
Analyzing project...

  error • lib/features/user/data/user_repository_impl.dart:34:16 •
    A value of type 'String?' can't be assigned to a variable of type 'String'. •
    invalid_assignment

  error • lib/features/cart/presentation/cart_page.dart:58:5 •
    The method 'add' isn't defined for the type 'List<Item>'.
    Try correcting the name to the name of an existing method, or defining a method named 'add'. •
    undefined_method

2 errors found.
```

## Fix 1: Null Safety

File: lib/features/user/data/user_repository_impl.dart:34
Error: A value of type 'String?' can't be assigned to type 'String'

Changed:
```dart
final id = response.id;
```
To:
```dart
final id = response.id ?? '';
```

```
$ flutter analyze
1 error found.
```

## Fix 2: Immutable List

File: lib/features/cart/presentation/cart_page.dart:58
Error: The method 'add' isn't defined for the type 'List<Item>'
Cause: State holds an unmodifiable list; mutation goes through Cubit

Changed:
```dart
state.items.add(item);
```
To:
```dart
context.read<CartCubit>().addItem(item);
// Note: Cubit exposes named methods (addItem, removeItem);
// .add(event) is the BLoC event API — don't mix them.
```

```
$ flutter analyze
No issues found!
```

## Final Verification

```
$ flutter test
All tests passed.
```

## Summary

| Metric | Count |
|--------|-------|
| Analysis errors fixed | 2 |
| Files modified | 2 |
| Remaining issues | 0 |

Build Status: PASS ✓
````

## Erros Comuns Corrigidos

| Erro | Correção Típica |
|-------|-------------|
| `A value of type 'X?' can't be assigned to 'X'` | Adicionar `?? default` ou null guard |
| `The name 'X' isn't defined` | Adicionar import ou corrigir erro de digitação |
| `Non-nullable instance field must be initialized` | Adicionar inicializador ou `late` |
| `Version solving failed` | Ajustar restrições de versão em pubspec.yaml |
| `Missing concrete implementation of 'X'` | Implementar método de interface ausente |
| `build_runner: Part of X expected` | Apagar `.g.dart` obsoleto e refazer o build |

## Estratégia de Correção

1. **Erros de análise primeiro** — o código deve estar livre de erros
2. **Triagem de warnings em segundo** — corrija warnings que possam causar bugs em runtime
3. **Conflitos de pub em terceiro** — corrija a resolução de dependências
4. **Uma correção por vez** — verifique cada mudança
5. **Mudanças mínimas** — não refatore, apenas corrija

## Condições de Parada

O agent vai parar e reportar se:
- O mesmo erro persistir após 3 tentativas
- A correção introduzir mais erros
- For necessária uma mudança arquitetural
- Conflitos de upgrade de pacote precisarem de decisão do usuário

## Comandos Relacionados

- `/flutter-test` — Executa testes após o build ter sucesso
- `/flutter-review` — Revisa a qualidade do código
- skill `verification-loop` — Loop de verificação completo

## Relacionados

- Agent: `agents/dart-build-resolver.md`
- Skill: `skills/flutter-dart-code-review/`
