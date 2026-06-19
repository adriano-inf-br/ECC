---
description: Executa o quality gate do formatador da ECC para um único arquivo e reporta os passos de remediação.
---

# Comando Quality Gate

Ponto de entrada do operador para o quality gate do formatador que normalmente roda como o
hook PostToolUse `post:quality-gate` (`scripts/hooks/quality-gate.js`).

## Como funciona na prática

O gate é uma verificação de formatador de arquivo único, conduzida pela entrada do hook, não por flags de CLI:

- O script lê o alvo a partir do JSON de stdin do hook
  (`tool_input.file_path`); ele não recebe um argumento de caminho.
- As alternâncias de comportamento são variáveis de ambiente:
  - `ECC_QUALITY_GATE_FIX=true` - aplica correções de formatação em vez de apenas verificar
  - `ECC_QUALITY_GATE_STRICT=true` - registra falhas do formatador como falhas do gate
- Cobertura por tipo de arquivo:
  - `.ts/.tsx/.js/.jsx/.json/.md` - Biome `check` ou Prettier `--check`,
    o que o projeto fornecer (JS/TS sob o Biome é pulado aqui porque
    `post-edit-format` já executa `biome check --write`)
  - `.go` - `gofmt`
  - `.py` - `ruff format`
- Verificações de Lint e de tipos não fazem parte deste gate. Use a skill `verification-loop`
  ou as skills de verificação de linguagem para os pipelines de lint/tipos/testes.

## Uso

Para executar o gate manualmente contra um arquivo, encaminhe via pipe um JSON no estilo de hook para o
script (defina primeiro as alternâncias de ambiente se quiser comportamento de correção ou estrito):

```bash
echo '{"tool_input":{"file_path":"src/example.ts"}}' \
  | ECC_QUALITY_GATE_FIX=true node scripts/hooks/quality-gate.js
```

Em seguida, reporte as descobertas do formatador e os passos concretos de remediação.

## Notas

A ligação do hook fica em `hooks/hooks.json` (`post:quality-gate`, perfis
`standard`/`strict` via `run-with-flags.js`).

## Argumentos

$ARGUMENTS:

- `[path]` arquivo opcional a verificar. O próprio script não recebe argumentos
  de CLI - quando um caminho é fornecido, substitua-o como `tool_input.file_path`
  no JSON de stdin mostrado acima antes de executar o comando
