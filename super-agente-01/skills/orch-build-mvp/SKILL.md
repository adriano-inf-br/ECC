---
name: orch-build-mvp
description: Orchestrate bootstrapping a working MVP from a design or spec document — ingest the doc, plan thin vertical slices, scaffold the first end-to-end slice, then TDD-implement, review, and gated commit. Use to turn an SDD/PRD into a running starting point.
metadata:
  origin: ECC
---

# orch-build-mvp

Ator · ação · alvo: **orch · build · mvp**. Wrapper fino sobre o engine
compartilhado em [`orch-pipeline`](../orch-pipeline/SKILL.md).

## Quando Usar

- O usuário tem um **documento de design / spec** (SDD, PRD, system_design) e quer uma
  fatia vertical funcional iniciada a partir dele.
- Recebe um caminho de documento como argumento, ex.: `civicpulse/docs/SDD-v0.6.md`.

## Configurações da operação

- **Piso de tamanho padrão:** large — este é o pipeline completo, incluindo o Scaffold.
- **Máscara de fases:** 0 (ler a spec) → 1 → 2 (pesada) → 3 (scaffold) → 4 → 5 → 6.
- **Primeiro movimento (fase 0 → 2):** leia o documento; extraia escopo, decisões travadas
  e a lista de features; ordene-a em **fatias verticais finas** (um caminho end-to-end
  primeiro, não todos-os-modelos-depois-todas-as-views). A fase 3 levanta essa primeira fatia.

## Como Funciona

1. Rode o engine `orch-pipeline` com as configurações acima.
2. **Reutilize o harness GAN existente** em vez de montar um loop de iteração à mão:
   - Traduza o SDD para `gan-harness/spec.md` + `gan-harness/eval-rubric.md`
     (isso faz o papel do que o `gan-planner` geraria — você já tem a spec).
   - Conduza o build com `/gan-build "<brief de uma linha>" --skip-planner`
     (padrões: `--max-iterations 15`, `--pass-threshold 7.0`,
     `--eval-mode playwright`; use `--eval-mode code-only` para fatias sem UI).
   - Esse comando roda o loop `gan-generator` → `gan-evaluator` e escreve
     `gan-harness/feedback/feedback-NNN.md` até a pontuação passar ou estabilizar.
3. Pare no **Gate 1** (plano de fatias) e no **Gate 2** (pré-commit). Faça commit do
   scaffold e de cada fatia como commits `feat:` separados.
4. Adicione `security-reviewer` para qualquer fatia que toque um gatilho de segurança.

## Exemplo

```
orch-build-mvp: civicpulse/docs/SDD-v0.6.md
→ ler SDD → lista de fatias (vertical) → scaffold da fatia 1  [GATE 1: aprovar]
→ /gan-build --skip-planner (loop generator → evaluator) pontua vs spec → review
→ commit feat:  [GATE 2: confirmar] → próxima fatia
```
