---
description: List all configured hookify rules
---

Encontre e exiba todas as regras hookify em uma tabela formatada.

## Passos

1. Encontre todos os arquivos `.claude/hookify.*.local.md`
2. Leia o frontmatter de cada arquivo:
   - `name`
   - `enabled`
   - `event`
   - `action`
   - `pattern`
3. Exiba-os como uma tabela:

| Rule | Enabled | Event | Pattern | File |
|------|---------|-------|---------|------|

4. Mostre a contagem de regras e lembre o usuário de que `/hookify-configure` pode alterar o estado depois.
