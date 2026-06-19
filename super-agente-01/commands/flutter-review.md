---
description: Revisa código Flutter/Dart quanto a padrões idiomáticos, boas práticas de widgets, gerenciamento de estado, performance, acessibilidade e segurança. Invoca o agent flutter-reviewer.
---

# Flutter Code Review

Este comando invoca o agent **flutter-reviewer** para revisar mudanças de código Flutter/Dart.

## O Que Este Comando Faz

1. **Reunir Contexto**: Revisa `git diff --staged` e `git diff`
2. **Inspecionar o Projeto**: Verifica `pubspec.yaml`, `analysis_options.yaml`, solução de gerenciamento de estado
3. **Pré-varredura de Segurança**: Verifica segredos hardcoded e questões críticas de segurança
4. **Revisão Completa**: Aplica o checklist completo de revisão
5. **Reportar Achados**: Apresenta as questões agrupadas por severidade com orientação de correção

## Pré-requisitos

Antes de executar `/flutter-review`, garanta que:
1. **O build passa** — execute `/flutter-build` primeiro; uma revisão sobre código quebrado é incompleta
2. **Os testes passam** — execute `/flutter-test` para confirmar que não há regressões
3. **Sem conflitos de merge** — resolva todos os conflitos para que o diff reflita apenas mudanças intencionais
4. **`flutter analyze` está limpo** — corrija os warnings do analisador antes da revisão

## Quando Usar

Use `/flutter-review` quando:
- Antes de submeter um PR com mudanças Flutter/Dart (após o build e os testes passarem)
- Após implementar uma nova funcionalidade para detectar problemas cedo
- Ao revisar o código Flutter de outra pessoa
- Para auditar um widget, componente de gerenciamento de estado ou classe de serviço
- Antes de um release de produção

## Áreas de Revisão

| Área | Severidade |
|------|----------|
| Segredos hardcoded, HTTP em texto puro | CRITICAL |
| Violações de arquitetura, anti-padrões de gerenciamento de estado | CRITICAL |
| Problemas de rebuild de widgets, vazamentos de recursos | HIGH |
| `dispose()` ausente, `BuildContext` após await | HIGH |
| Null safety do Dart, estados de erro/carregamento ausentes | HIGH |
| Propagação de const, composição de widgets | HIGH |
| Performance: trabalho custoso em `build()` | HIGH |
| Acessibilidade, labels semânticos | MEDIUM |
| Testes ausentes para transições de estado | HIGH |
| Strings hardcoded (l10n) | MEDIUM |
| Higiene de dependências pub | LOW |

## Exemplo de Sessão

````text
User: /flutter-review

Agent:
# Flutter Code Review

## Context

Changed files:
- lib/features/auth/presentation/login_page.dart
- lib/features/auth/data/auth_repository_impl.dart

State management: Riverpod (detected from pubspec.yaml)
Architecture: feature-first

## Security Pre-scan

✓ No hardcoded secrets detected
✓ No cleartext HTTP calls

## Review Findings

[HIGH] BuildContext used after async gap without mounted check
File: lib/features/auth/presentation/login_page.dart:67
Issue: `context.go('/home')` called after `await auth.login(...)` with no `mounted` check.
Fix: Add `if (!context.mounted) return;` before any navigation after awaits (Flutter 3.7+).

[HIGH] AsyncValue error state not handled
File: lib/features/auth/presentation/login_page.dart:42
Issue: `ref.watch(authProvider)` switches on loading/data but has no `error` branch.
Fix: Add error case to the switch expression or `when()` call to show a user-facing error message.

[MEDIUM] Hardcoded string not localized
File: lib/features/auth/presentation/login_page.dart:89
Issue: `Text('Login')` — user-visible string not using localization system.
Fix: Use the project's l10n accessor: `Text(context.l10n.loginButton)`.

## Review Summary

| Severity | Count | Status |
|----------|-------|--------|
| CRITICAL | 0     | pass   |
| HIGH     | 2     | block  |
| MEDIUM   | 1     | info   |
| LOW      | 0     | note   |

Verdict: BLOCK — HIGH issues must be fixed before merge.
````

## Critérios de Aprovação

- **Aprovar**: Nenhuma questão CRITICAL ou HIGH
- **Bloquear**: Qualquer questão CRITICAL ou HIGH deve ser corrigida antes do merge

## Comandos Relacionados

- `/flutter-build` — Corrige erros de build primeiro
- `/flutter-test` — Executa testes antes de revisar
- `/code-review` — Revisão de código geral (agnóstica de linguagem)

## Relacionados

- Agent: `agents/flutter-reviewer.md`
- Skill: `skills/flutter-dart-code-review/`
- Rules: `rules/dart/`
