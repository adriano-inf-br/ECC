---
description: Publish a validated epic update back to the issue and local cache.
---

# /epic-publish

Publica uma atualização de coordenação validada no GitHub.

```bash
node scripts/github-coordination.js publish <issue-number> --repo <owner/repo>
```

O que isto faz:

1. Revalida o épico antes de publicar.
2. Atualiza o bloco de coordenação no corpo da issue.
3. Anexa um comentário de publicação conciso.
4. Registra o snapshot local final.

Aliases de compatibilidade:

- `/pr`
- `/prp-pr`
