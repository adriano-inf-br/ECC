---
description: Valida a prontidão do épico, dependências e política de coordenação.
---

# /epic-validate

Valida uma única issue de épico antes de publicar ou repassar para revisão.

```bash
node scripts/github-coordination.js validate <issue-number> --repo <owner/repo>
```

O que isto verifica:

1. O estado de coordenação existe e é parseável.
2. O estado de validação é satisfeito pela política.
3. As dependências declaradas estão fechadas.
4. O épico está pronto para o próximo estágio do fluxo de trabalho.

Aliases de compatibilidade:

- `/quality-gate`
