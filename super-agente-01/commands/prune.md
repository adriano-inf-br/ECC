---
name: prune
description: Exclui instintos pendentes com mais de 30 dias que nunca foram promovidos
command: true
---

# Prune Pending Instincts

Remove instintos pendentes expirados que foram gerados automaticamente, mas nunca revisados ou promovidos.

## Implementação

Rode o CLI de instintos usando o caminho da raiz do plugin:

```bash
python3 "${CLAUDE_PLUGIN_ROOT}/skills/continuous-learning-v2/scripts/instinct-cli.py" prune
```

Ou, se `CLAUDE_PLUGIN_ROOT` não estiver definido (instalação manual):

```bash
python3 ~/.claude/skills/continuous-learning-v2/scripts/instinct-cli.py prune
```

## Uso

```
/prune                    # Delete instincts older than 30 days
/prune --max-age 60      # Custom age threshold (days)
/prune --dry-run         # Preview without deleting
```
