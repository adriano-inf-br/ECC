---
paths:
  - "**/*.ets"
  - "**/*.ts"
  - "**/module.json5"
  - "**/oh-package.json5"
---
# Hooks do HarmonyOS / ArkTS

> This file extends [common/hooks.md](../common/hooks.md) with HarmonyOS-specific build and validation hooks.

## Comandos de Build

### Build de Pacote HAP

```bash
# Compilar pacote HAP (ambiente hvigor global)
hvigorw assembleHap -p product=default

# Compilar com módulo específico
hvigorw assembleHap -p module=entry -p product=default

# Build limpo
hvigorw clean
```

### CLI do DevEco Studio

```bash
# Verificar a estrutura do projeto
hvigorw --version

# Instalar dependências
ohpm install

# Atualizar dependências
ohpm update
```

## Hooks PostToolUse Recomendados

### Após Editar Arquivos .ets/.ts

Execute o build do hvigor para verificar erros de compilação do ArkTS:

```json
{
  "type": "PostToolUse",
  "matcher": {
    "tool": ["Edit", "Write"],
    "filePath": ["**/*.ets", "**/*.ts"]
  },
  "hooks": [
    {
      "command": "hvigorw assembleHap -p product=default 2>&1 | tail -20",
      "async": true,
      "timeout": 60000
    }
  ]
}
```

### Após Editar module.json5

Valide as declarações de permissão e de ability:

```json
{
  "type": "PostToolUse",
  "matcher": {
    "tool": "Edit",
    "filePath": "**/module.json5"
  },
  "hooks": [
    {
      "command": "echo '[HarmonyOS] module.json5 modified - verify permissions and abilities'",
      "async": false
    }
  ]
}
```

### Após Editar oh-package.json5

Reinstale as dependências:

```json
{
  "type": "PostToolUse",
  "matcher": {
    "tool": "Edit",
    "filePath": "**/oh-package.json5"
  },
  "hooks": [
    {
      "command": "ohpm install 2>&1 | tail -10",
      "async": true,
      "timeout": 30000
    }
  ]
}
```

## Hooks PreToolUse

### Guard de Decorators V1

Avise quando o código contiver decorators de gerenciamento de estado V1:

```json
{
  "type": "PreToolUse",
  "matcher": {
    "tool": ["Write", "Edit"],
    "filePath": "**/*.ets"
  },
  "hooks": [
    {
      "command": "echo '[HarmonyOS] Reminder: Use @ComponentV2 / @Local / @Param - V1 decorators (@State, @Prop, @Link) are prohibited'"
    }
  ]
}
```

## Checklist de Validação

Após cada ciclo de implementação, verifique:

- [ ] `hvigorw assembleHap` conclui sem erros
- [ ] Sem decorators V1 em arquivos `.ets` novos ou modificados
- [ ] Sem imports `@ohos.router` em arquivos novos ou modificados
- [ ] Todas as permissões de API declaradas em `module.json5`
- [ ] Todas as dependências listadas em `oh-package.json5`
- [ ] Strings de recurso adicionadas a todos os diretórios de i18n
- [ ] Cores de tema escuro fornecidas para novos recursos de cor
