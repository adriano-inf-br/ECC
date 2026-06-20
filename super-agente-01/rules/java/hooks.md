---
paths:
  - "**/*.java"
  - "**/pom.xml"
  - "**/build.gradle"
  - "**/build.gradle.kts"
---
# Hooks de Java

> Este arquivo estende [common/hooks.md](../common/hooks.md) com conteúdo específico de Java.

## Hooks PostToolUse

Configure em `~/.claude/settings.json`:

- **google-java-format**: Formata automaticamente arquivos `.java` após edição
- **checkstyle**: Executa verificações de estilo após editar arquivos Java
- **./mvnw compile** ou **./gradlew compileJava**: Verifica a compilação após alterações
