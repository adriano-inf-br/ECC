---
name: orch-add-feature
description: Orchestrate building a brand-new feature end to end — research, plan, TDD implementation, review, and gated commit — by delegating each phase to the matching ECC agent. Use when adding a capability that does not exist yet.
metadata:
  origin: ECC
---

# orch-add-feature

Ator · ação · alvo: **orch · add · feature**. Wrapper fino sobre o engine
compartilhado em [`orch-pipeline`](../orch-pipeline/SKILL.md).

## Quando Usar

- O usuário quer uma capacidade que **ainda não existe** ("add", "build",
  "implement", "support …").
- É comportamento totalmente novo — não uma correção (`orch-fix-defect`) e não uma
  alteração de comportamento existente (`orch-change-feature`).

## Configurações da operação

- **Piso de tamanho padrão:** standard — rode Research + Plan a menos que seja claramente pequeno.
- **Máscara de fases:** 0 → 1 → 2 → 4 → 5 → 6 (pule o 3 Scaffold; ele é exclusivo de MVP).
- **Primeiro movimento (fase 4):** escreva testes *novos* que falham para o novo comportamento e então
  implemente até passarem.

## Como Funciona

1. Rode o engine `orch-pipeline` com as configurações acima.
2. Classifique o tamanho primeiro; features pequenas / triviais se reduzem a 4 → 5 → 6.
3. Pare no **Gate 1** (aprovação do plano) e no **Gate 2** (pré-commit).
4. Adicione `security-reviewer` se a feature tocar um gatilho de segurança.

> Relacionado: `/feature-dev` é uma versão autônoma deste fluxo. `orch-add-feature`
> difere por compartilhar o engine `orch-pipeline` — o classificador de tamanho e os dois
> gates — com o resto da família, de modo que ajusta o tamanho de features triviais para 4 → 5 → 6.

## Exemplo

```
orch-add-feature: add OAuth2 login to nws-poller
→ pesquisar libs de auth existentes → planejar task_list  [GATE 1: aprovar]
→ TDD em cada tarefa → code-review (+ security-reviewer: caminho de auth)
→ commit  [GATE 2: confirmar]
```
