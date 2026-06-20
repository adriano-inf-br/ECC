> Este arquivo estende [common/hooks.md](../common/hooks.md) com recomendações de hooks específicas de web.

# Hooks Web

## Hooks de PostToolUse Recomendados

Prefira tooling local ao projeto. Não conecte hooks à execução remota e pontual de pacotes.

### Format on Save

Use o entrypoint de formatação já existente no projeto após edições:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "command": "pnpm prettier --write \"$FILE_PATH\"",
        "description": "Format edited frontend files"
      }
    ]
  }
}
```

Comandos locais equivalentes via `yarn prettier` ou `npm exec prettier --` são aceitáveis quando usam dependências de propriedade do repositório.

### Verificação de Lint

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "command": "pnpm eslint --fix \"$FILE_PATH\"",
        "description": "Run ESLint on edited frontend files"
      }
    ]
  }
}
```

### Verificação de Tipos

Use `--incremental` para que as reexecuções reaproveitem o `.tsbuildinfo` anterior (1-3s em código inalterado, em vez de 30-60s toda vez). Envolva em `timeout` para que um tsc travado seja encerrado pelo SO em vez de acumular ao longo das edições — isso evita o acúmulo de múltiplos processos que acontece quando as edições disparam mais rápido do que o tsc termina.

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "command": "timeout 60 pnpm tsc --noEmit --pretty false --incremental --tsBuildInfoFile node_modules/.cache/tsc-hook.tsbuildinfo",
        "description": "Type-check after frontend edits (incremental + timeout-capped)"
      }
    ]
  }
}
```

**Por que ambas as flags importam:**
- Sem `--incremental`, toda edição reverifica o programa inteiro do zero. Em um projeto Next.js real isso se acumula rápido: edições em intervalos de 5-10s + execuções de tsc de 30-60s = N processos tsc concorrentes.
- Sem `timeout`, um tsc que trava (mudança em dependência transitiva, type-checker preso em um tipo recursivo) nunca encerra e fica órfão quando o shell pai encerra.
- `--tsBuildInfoFile` é obrigatório porque `--noEmit` normalmente suprime a escrita do buildinfo; especificar o caminho explicitamente mantém o incremental funcionando.

Se você estiver no Windows sem o GNU coreutils, troque `timeout 60` por um wrapper de PowerShell ou conte com um hook de Stop/SessionEnd para varrer processos tsc obsoletos.

### Lint de CSS

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "command": "pnpm stylelint --fix \"$FILE_PATH\"",
        "description": "Lint edited stylesheets"
      }
    ]
  }
}
```

## Hooks de PreToolUse

### Limitar o Tamanho do Arquivo

Bloqueie escritas excessivamente grandes a partir do conteúdo de entrada da tool, não de um arquivo que pode ainda não existir:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write",
        "command": "node -e \"let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const i=JSON.parse(d);const c=i.tool_input?.content||'';const lines=c.split('\\n').length;if(lines>800){console.error('[Hook] BLOCKED: File exceeds 800 lines ('+lines+' lines)');console.error('[Hook] Split into smaller modules');process.exit(2)}console.log(d)})\"",
        "description": "Block writes that exceed 800 lines"
      }
    ]
  }
}
```

## Hooks de Stop

### Verificação Final de Build

```json
{
  "hooks": {
    "Stop": [
      {
        "command": "pnpm build",
        "description": "Verify the production build at session end"
      }
    ]
  }
}
```

## Ordenação

Ordem recomendada:
1. format
2. lint
3. verificação de tipos
4. verificação de build
