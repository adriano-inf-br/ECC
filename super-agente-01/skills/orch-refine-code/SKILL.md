---
name: orch-refine-code
description: Orquestre um refactor que preserve o comportamento — confirme que os testes estão verdes, reestruture sem alterar o comportamento, mantenha os testes verdes, revise e faça commit com gate. Use quando a estrutura deve melhorar mas o comportamento não deve mudar.
metadata:
  origin: ECC
---

# orch-refine-code

Ator · ação · alvo: **orch · refine · code**. Wrapper fino sobre o motor compartilhado em [`orch-pipeline`](../orch-pipeline/SKILL.md).

## Quando Usar

- Mesmo comportamento, **estrutura melhor**: extrair módulos, remover duplicação, eliminar
  código morto, reduzir aninhamento, renomear para maior clareza.
- Distinga das skills irmãs: se o comportamento deve mudar de alguma forma, esta é a
  skill errada (`orch-change-feature` / `orch-fix-defect`).

## Configurações de operação

- **Piso de tamanho padrão:** standard — reestruturações tocam múltiplos arquivos.
- **Máscara de fases:** 0 → 2 (planejar a reestruturação) → 4 (manter verde) → 5 → 6. Nenhum
  novo teste de comportamento é escrito — a suite existente é a rede de segurança.
- **Primeiro movimento (fase 4):** confirme que os testes relevantes existem e estão **verdes
  antes** de tocar o código; se a cobertura estiver baixa, adicione testes de caracterização primeiro.
  Depois reestruture em pequenos passos, reexecutando os testes após cada um.

## Como Funciona

1. Execute o motor `orch-pipeline` com as configurações acima.
2. Para varreduras de código morto / duplicação, delegar ao agent `refactor-cleaner`
   (ele executa knip / depcheck / ts-prune e remove com segurança).
3. Pare no **Gate 1** (plano de reestruturação) e no **Gate 2** (pré-commit).
4. Faça commit como `refactor:` — o diff deve ser neutro em comportamento.

## Exemplo

```
orch-refine-code: extrair o cliente HTTP NWS de poller.py
→ confirmar testes verdes → planejar extração  [GATE 1: aprovar]
→ mover em pequenos passos, testes verdes durante todo o processo → code-review
→ commit refactor:  [GATE 2: confirmar]
```
