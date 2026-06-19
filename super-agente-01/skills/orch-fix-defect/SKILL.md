---
name: orch-fix-defect
description: Orchestrate fixing a bug — reproduce it as a failing regression test, fix to green, review, and gated commit — by delegating each phase to the matching ECC agent. Use when existing behavior is broken or wrong.
metadata:
  origin: ECC
---

# orch-fix-defect

Ator · ação · alvo: **orch · fix · defect**. Wrapper fino sobre o engine
compartilhado em [`orch-pipeline`](../orch-pipeline/SKILL.md).

## Quando Usar

- Algo está **quebrado**: saída errada, um erro, um crash, uma regressão.
- Distinga das irmãs:
  - o comportamento está correto mas você o quer diferente → `orch-change-feature`.
  - a capacidade ainda não existe → `orch-add-feature`.

## Configurações da operação

- **Piso de tamanho padrão:** small (frequentemente trivial).
- **Máscara de fases:** 0 → (2 leve somente se a causa-raiz não for óbvia ou for standard+) →
  4 → 5 → 6. A Research (1) costuma ser pulada.
- **Primeiro movimento (fase 4):** reproduza o bug como um **novo teste que falha**
  (teste de regressão) e então corrija até passar. Provar primeiro que o bug existe
  é o que separa uma correção de um ajuste.

## Como Funciona

1. Rode o engine `orch-pipeline` com as configurações acima.
2. Se a causa-raiz não estiver clara, delimite-a com `code-explorer` antes do teste
   vermelho; escale quebras de build para `build-error-resolver` / `/build-fix`.
3. Pare no **Gate 1** (somente se um plano foi produzido) e no **Gate 2** (pré-commit).
4. Adicione `security-reviewer` se o defeito estiver em um caminho sensível à segurança.

## Exemplo

```
orch-fix-defect: poller crashes on empty NWS response
→ escrever teste que falha reproduzindo o crash → corrigir até passar
→ code-review → commit  [GATE 2: confirmar]   (commit: fix:)
```
