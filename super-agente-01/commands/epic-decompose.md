---
description: Decompõe um épico em tarefas-filhas sem criar branches de tarefa.
---

# /epic-decompose

Reconcilia a divisão de tarefas de uma issue de épico.

```bash
node scripts/github-coordination.js decompose <issue-number> --repo <owner/repo>
```

O que isto faz:

1. Lê o corpo da issue do épico em busca de checklists de tarefas e referências de dependência.
2. Armazena a decomposição no bloco de coordenação.
3. Deixa os branches de tarefa de fora do fluxo de trabalho.
4. Anexa um comentário de auditoria conciso.

Aliases de compatibilidade:

- `/plan`
- `/prp-plan`
