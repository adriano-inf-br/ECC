---
name: orch-change-feature
description: Orchestrate altering an existing, working feature to new desired behavior — update its tests to the new spec, change the implementation to match, review, and gated commit. Use when behavior is not broken but should be different.
metadata:
  origin: ECC
---

# orch-change-feature

Ator · ação · alvo: **orch · change · feature**. Wrapper fino sobre o
engine compartilhado em [`orch-pipeline`](../orch-pipeline/SKILL.md).

## Quando Usar

- Uma feature existente **funciona**, mas o comportamento desejado é diferente ("change",
  "adjust", "make it also …", "instead of X do Y").
- Distinga das irmãs:
  - **não** está quebrada → não é `orch-fix-defect` (não há bug a reproduzir).
  - **não** é nova → não é `orch-add-feature` (a capacidade já existe).

## Configurações da operação

- **Piso de tamanho padrão:** small — a maioria dos ajustes é uma função ou duas.
- **Máscara de fases:** 0 → (1 somente se o novo comportamento exigir pesquisa) → 2 leve →
  4 → 5 → 6.
- **Primeiro movimento (fase 4):** atualize os testes *existentes* para expressar o novo
  comportamento desejado e então altere a implementação até passarem. Alterar os
  testes primeiro é o que separa um ajuste de uma correção.

## Como Funciona

1. Rode o engine `orch-pipeline` com as configurações acima.
2. Mantenha o plano leve — apenas tamanho `standard`+ justifica a passagem completa do `planner`.
3. Pare no **Gate 1** (aprovação do plano / teste alterado) e no **Gate 2** (pré-commit).
4. Adicione `security-reviewer` se a mudança tocar um gatilho de segurança.

## Exemplo

```
orch-change-feature: make nws-poller alert at 2 warnings instead of 3
→ atualizar os testes de limiar para a nova spec → alterar a impl até passar
→ code-review → commit  [GATE 2: confirmar]
```
