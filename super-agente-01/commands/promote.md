---
name: promote
description: Promove instintos de escopo de projeto para escopo global
command: true
---

# Comando Promote

Promove instintos de escopo de projeto para escopo global no continuous-learning-v2.

## Implementação

Rode o CLI de instintos usando o caminho da raiz do plugin:

```bash
python3 "${CLAUDE_PLUGIN_ROOT}/skills/continuous-learning-v2/scripts/instinct-cli.py" promote [instinct-id] [--force] [--dry-run]
```

Ou, se `CLAUDE_PLUGIN_ROOT` não estiver definido (instalação manual):

```bash
python3 ~/.claude/skills/continuous-learning-v2/scripts/instinct-cli.py promote [instinct-id] [--force] [--dry-run]
```

## Uso

```bash
/promote                      # Auto-detect promotion candidates
/promote --dry-run            # Preview auto-promotion candidates
/promote --force              # Promote all qualified candidates without prompt
/promote grep-before-edit     # Promote one specific instinct from current project
```

## O Que Fazer

1. Detecte o projeto atual
2. Se `instinct-id` for fornecido, promova apenas esse instinto (se presente no projeto atual)
3. Caso contrário, encontre candidatos entre projetos que:
   - Apareçam em pelo menos 2 projetos
   - Atinjam o limiar de confiança
4. Escreva os instintos promovidos em `~/.claude/homunculus/instincts/personal/` com `scope: global`
