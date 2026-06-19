---
paths:
  - "**/*.cs"
  - "**/*.csx"
  - "**/*.csproj"
  - "**/*.sln"
  - "**/Directory.Build.props"
  - "**/Directory.Build.targets"
---
# Hooks de C#

> Este arquivo estende [common/hooks.md](../common/hooks.md) com conteúdo específico de C#.

## Hooks de PostToolUse

Configure em `~/.claude/settings.json`:

- **dotnet format**: Auto-formata os arquivos C# editados e aplica as correções de analyzer
- **dotnet build**: Verifica se a solution ou o projeto ainda compila após as edições
- **dotnet test --no-build**: Reexecuta o projeto de testes relevante mais próximo após mudanças de comportamento

## Hooks de Stop

- Execute um `dotnet build` final antes de encerrar uma sessão com alterações amplas em C#
- Avise sobre arquivos `appsettings*.json` modificados para que segredos não sejam commitados
