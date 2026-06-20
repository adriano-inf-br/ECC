---
description: Varre issues de épicos bloqueadas e reabre qualquer uma cujas dependências estejam fechadas.
---

# /epic-unblock

Varre épicos bloqueados cujas dependências declaradas estejam concluídas.

```bash
node scripts/github-coordination.js unblock --repo <owner/repo>
```

O que isto faz:

1. Escaneia as issues de épicos no repositório.
2. Verifica a lista de dependências de cada épico bloqueado.
3. Move épicos totalmente desbloqueados para o estado pronto.
4. Atualiza labels, comentários e snapshots locais.

Aliases de compatibilidade:

- `/loop-status`
