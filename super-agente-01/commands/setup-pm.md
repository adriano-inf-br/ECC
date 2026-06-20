---
description: Configura seu gerenciador de pacotes preferido (npm/pnpm/yarn/bun)
disable-model-invocation: true
---

# Package Manager Setup

Configure seu gerenciador de pacotes preferido para este projeto ou globalmente.

## Uso

```bash
# Detect current package manager
node scripts/setup-package-manager.js --detect

# Set global preference
node scripts/setup-package-manager.js --global pnpm

# Set project preference
node scripts/setup-package-manager.js --project bun

# List available package managers
node scripts/setup-package-manager.js --list
```

## Prioridade de detecção

Ao determinar qual gerenciador de pacotes usar, a seguinte ordem é verificada:

1. **Variável de ambiente**: `CLAUDE_PACKAGE_MANAGER`
2. **Configuração do projeto**: `.claude/package-manager.json`
3. **package.json**: campo `packageManager`
4. **Lock file**: presença de package-lock.json, yarn.lock, pnpm-lock.yaml ou bun.lockb
5. **Configuração global**: `~/.claude/package-manager.json`
6. **Fallback**: primeiro gerenciador de pacotes disponível (pnpm > bun > yarn > npm)

## Arquivos de configuração

### Configuração global
```json
// ~/.claude/package-manager.json
{
  "packageManager": "pnpm"
}
```

### Configuração do projeto
```json
// .claude/package-manager.json
{
  "packageManager": "bun"
}
```

### package.json
```json
{
  "packageManager": "pnpm@8.6.0"
}
```

## Variável de ambiente

Defina `CLAUDE_PACKAGE_MANAGER` para sobrepor todos os outros métodos de detecção:

```bash
# Windows (PowerShell)
$env:CLAUDE_PACKAGE_MANAGER = "pnpm"

# macOS/Linux
export CLAUDE_PACKAGE_MANAGER=pnpm
```

## Executar a detecção

Para ver os resultados atuais da detecção do gerenciador de pacotes, execute:

```bash
node scripts/setup-package-manager.js --detect
```
