---
description: Fix Gradle build errors for Android and KMP projects
---

# Correção de Build Gradle

Corrige incrementalmente erros de build e compilação do Gradle para projetos Android e Kotlin Multiplatform.

## Passo 1: Detectar a Configuração de Build

Identifique o tipo de projeto e execute o build apropriado:

| Indicador | Comando de Build |
|-----------|---------------|
| `build.gradle.kts` + `composeApp/` (KMP) | `./gradlew composeApp:compileKotlinMetadata 2>&1` |
| `build.gradle.kts` + `app/` (Android) | `./gradlew app:compileDebugKotlin 2>&1` |
| `settings.gradle.kts` com módulos | `./gradlew assemble 2>&1` |
| Detekt configurado | `./gradlew detekt 2>&1` |

Verifique também `gradle.properties` e `local.properties` para configuração.

## Passo 2: Fazer o Parse e Agrupar os Erros

1. Execute o comando de build e capture a saída
2. Separe os erros de compilação de Kotlin dos erros de configuração do Gradle
3. Agrupe por módulo e caminho de arquivo
4. Ordene: erros de configuração primeiro, depois erros de compilação por ordem de dependência

## Passo 3: Loop de Correção

Para cada erro:

1. **Ler o arquivo** — Contexto completo ao redor da linha do erro
2. **Diagnosticar** — Categorias comuns:
   - Import ausente ou referência não resolvida
   - Incompatibilidade de tipos ou tipos incompatíveis
   - Dependência ausente em `build.gradle.kts`
   - Incompatibilidade expect/actual (KMP)
   - Erro do compilador Compose
3. **Corrigir minimamente** — A menor mudança que resolve o erro
4. **Reexecutar o build** — Verificar a correção e checar novos erros
5. **Continuar** — Passar para o próximo erro

## Passo 4: Guardrails

Pare e pergunte ao usuário se:
- A correção introduzir mais erros do que resolve
- O mesmo erro persistir após 3 tentativas
- O erro exigir adicionar novas dependências ou mudar a estrutura de módulos
- O próprio sync do Gradle falhar (erro de fase de configuração)
- O erro estiver em código gerado (Room, SQLDelight, KSP)

## Passo 5: Resumo

Reporte:
- Erros corrigidos (módulo, arquivo, descrição)
- Erros restantes
- Novos erros introduzidos (deveria ser zero)
- Próximos passos sugeridos

## Correções Comuns de Gradle/KMP

| Erro | Correção |
|-------|-----|
| Referência não resolvida em `commonMain` | Verifique se a dependência está em `commonMain.dependencies {}` |
| Declaração expect sem actual | Adicione a implementação `actual` em cada source set de plataforma |
| Incompatibilidade de versão do compilador Compose | Alinhe as versões dos compiladores Kotlin e Compose em `libs.versions.toml` |
| Classe duplicada | Verifique dependências conflitantes com `./gradlew dependencies` |
| Erro de KSP | Execute `./gradlew kspCommonMainKotlinMetadata` para regenerar |
| Problema de cache de configuração | Verifique entradas de task não serializáveis |
