---
description: Sincroniza corpos de issues de épicos, labels e snapshots locais de coordenação a partir do GitHub.
---

# /epic-sync

Executa uma sincronização determinística para issues de épicos.

```bash
node scripts/github-coordination.js sync --repo <owner/repo>
```

O que isto faz:

1. Lê os corpos das issues como o estado canônico do épico.
2. Reconcilia o bloco de coordenação com os labels.
3. Escreve um snapshot local atualizado para cada issue de épico.
4. Mantém o cache SQLite alinhado com o GitHub.

Aliases de compatibilidade:

- `/projects`
- `/work-items sync-github`
