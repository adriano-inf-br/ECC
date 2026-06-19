---
paths:
  - "**/*.dart"
  - "**/pubspec.yaml"
  - "**/analysis_options.yaml"
---
# Hooks Dart/Flutter

> Este arquivo estende [common/hooks.md](../common/hooks.md) com conteúdo específico de Dart e Flutter.

## Hooks PostToolUse

Configure em `~/.claude/settings.json`:

- **dart format**: Formata automaticamente arquivos `.dart` após edição
- **dart analyze**: Executa análise estática após editar arquivos Dart e exibe avisos
- **flutter test**: Opcionalmente executa os testes afetados após mudanças significativas

## Configuração de Hook Recomendada

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": { "tool_name": "Edit", "file_paths": ["**/*.dart"] },
        "hooks": [
          { "type": "command", "command": "dart format $CLAUDE_FILE_PATHS" }
        ]
      }
    ]
  }
}
```

## Verificações de Pre-commit

Execute antes de commitar mudanças em Dart/Flutter:

```bash
dart format --set-exit-if-changed .
dart analyze --fatal-infos
flutter test
```

## One-liners Úteis

```bash
# Formata todos os arquivos Dart
dart format .

# Analisa e reporta problemas
dart analyze

# Executa todos os testes com cobertura
flutter test --coverage

# Regenera arquivos de geração de código
dart run build_runner build --delete-conflicting-outputs

# Verifica pacotes desatualizados
flutter pub outdated

# Atualiza pacotes dentro das restrições
flutter pub upgrade
```
