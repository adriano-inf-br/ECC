---
name: instinct-import
description: Importa instintos de um arquivo ou URL para o escopo de projeto/global
command: true
---

# Comando Instinct Import

## Implementação

Execute a CLI de instintos usando o caminho raiz do plugin:

```bash
python3 "${CLAUDE_PLUGIN_ROOT}/skills/continuous-learning-v2/scripts/instinct-cli.py" import <file-or-url> [--dry-run] [--force] [--min-confidence 0.7] [--scope project|global]
```

Ou, se `CLAUDE_PLUGIN_ROOT` não estiver definido (instalação manual):

```bash
python3 ~/.claude/skills/continuous-learning-v2/scripts/instinct-cli.py import <file-or-url>
```

Importe instintos de caminhos de arquivo locais ou URLs HTTP(S).

## Uso

```
/instinct-import team-instincts.yaml
/instinct-import https://github.com/org/repo/instincts.yaml
/instinct-import team-instincts.yaml --dry-run
/instinct-import team-instincts.yaml --scope global --force
```

## O Que Fazer

1. Buscar o arquivo de instintos (caminho local ou URL)
2. Fazer o parsing e validar o formato
3. Verificar duplicatas com os instintos existentes
4. Mesclar ou adicionar novos instintos
5. Salvar no diretório de instintos herdados:
   - Escopo de projeto: `~/.claude/homunculus/projects/<project-id>/instincts/inherited/`
   - Escopo global: `~/.claude/homunculus/instincts/inherited/`

## Processo de Importação

```
 Importando instintos de: team-instincts.yaml
================================================

Encontrados 12 instintos para importar.

Analisando conflitos...

## Novos Instintos (8)
Estes serão adicionados:
  ✓ use-zod-validation (confiança: 0.7)
  ✓ prefer-named-exports (confiança: 0.65)
  ✓ test-async-functions (confiança: 0.8)
  ...

## Instintos Duplicados (3)
Já existem instintos similares:
  WARNING: prefer-functional-style
     Local: confiança 0.8, 12 observações
     Importação: confiança 0.7
     → Manter o local (confiança maior)

  WARNING: test-first-workflow
     Local: confiança 0.75
     Importação: confiança 0.9
     → Atualizar para o importado (confiança maior)

Importar 8 novos, atualizar 1?
```

## Comportamento de Mesclagem

Ao importar um instinto com um ID existente:
- A importação com confiança maior se torna candidata a atualização
- A importação com confiança igual/menor é ignorada
- O usuário confirma, a menos que `--force` seja usado

## Rastreamento de Origem

Instintos importados são marcados com:
```yaml
source: inherited
scope: project
imported_from: "team-instincts.yaml"
project_id: "a1b2c3d4e5f6"
project_name: "my-project"
```

## Flags

- `--dry-run`: Pré-visualiza sem importar
- `--force`: Pula o prompt de confirmação
- `--min-confidence <n>`: Importa apenas instintos acima do limiar
- `--scope <project|global>`: Seleciona o escopo de destino (padrão: `project`)

## Saída

Após a importação:
```
PASS: Importação concluída!

Adicionados: 8 instintos
Atualizados: 1 instinto
Ignorados: 3 instintos (já existe confiança igual/maior)

Novos instintos salvos em: ~/.claude/homunculus/instincts/inherited/

Execute /instinct-status para ver todos os instintos.
```
