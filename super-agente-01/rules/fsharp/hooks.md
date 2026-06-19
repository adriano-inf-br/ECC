---
paths:
  - "**/*.fs"
  - "**/*.fsx"
  - "**/*.fsproj"
  - "**/*.sln"
  - "**/*.slnx"
  - "**/Directory.Build.props"
  - "**/Directory.Build.targets"
---
# Hooks F#

> Este arquivo estende [common/hooks.md](../common/hooks.md) com conteúdo específico de F#.

## Hooks PostToolUse

Configure em `~/.claude/settings.json`:

- **fantomas**: Formata automaticamente os arquivos F# editados
- **dotnet build**: Verifica se a solução ou projeto ainda compila após as edições
- **dotnet test --no-build**: Reexecuta o projeto de teste relevante mais próximo após mudanças de comportamento

## Hooks Stop

- Execute um `dotnet build` final antes de encerrar uma sessão com mudanças amplas em F#
- Avise sobre arquivos `appsettings*.json` modificados para que segredos não sejam commitados
