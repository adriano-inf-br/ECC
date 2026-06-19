---
description: Marca a revisão do épico como solicitada, aprovada ou com alterações solicitadas.
---

# /epic-review

Coordena o estado de revisão de uma issue de épico.

```bash
node scripts/github-coordination.js review <issue-number> --repo <owner/repo> --review approved
```

O que isto faz:

1. Atualiza o estado de revisão no bloco de coordenação.
2. Sincroniza os labels de revisão com o GitHub.
3. Registra o resultado da revisão em um comentário de auditoria.
4. Mantém o cache local alinhado com o corpo da issue.

Aliases de compatibilidade:

- `/review-pr`
- `/code-review`
