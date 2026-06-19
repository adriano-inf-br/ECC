---
description: Claim an epic issue, stamp coordination state, and sync local ownership.
---

# /epic-claim

Reivindica uma issue de épico como a fonte de verdade para uma unidade de trabalho.

Use o script de coordenação:

```bash
node scripts/github-coordination.js claim <issue-number> --repo <owner/repo> --actor <login>
```

O que isto faz:

1. Carrega o corpo da issue e o bloco de coordenação.
2. Marca o épico como reivindicado no estado da issue do GitHub.
3. Atualiza as labels e o cache local de SQLite.
4. Anexa um comentário de auditoria para a reivindicação.

Aliases de compatibilidade:

- `/orch-add-feature`
- `/orch-change-feature`
- `/prp-implement`
