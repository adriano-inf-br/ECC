---
description: Orquestra a inicialização de um MVP funcional a partir de um documento de design/spec — ingestão, fatiamento, scaffold, TDD, revisão, commit com portão (reusa o harness GAN). Wrapper para a skill orch-build-mvp.
---

# /orch-build-mvp

Inicia manualmente o orquestrador **orch-build-mvp**: transforma um documento
SDD/PRD/system-design em uma fatia vertical em execução.

## Uso

```
/orch-build-mvp <path to design/spec doc>
```

Exemplos:

```
/orch-build-mvp civicpulse/docs/SDD-v0.6.md
```

## O Que Faz

Invoca a skill `orch-build-mvp` com `$ARGUMENTS` como o caminho do documento. A skill
(via o engine compartilhado `orch-pipeline`, pipeline completo incl. Scaffold) irá:

1. Ler a spec; extrair escopo, decisões travadas e uma lista de features ordenada como
**fatias verticais finas** (um caminho ponta a ponta primeiro). → **PORTÃO 1** (aprovar o plano de fatias).
2. Fazer scaffold da primeira fatia ponta a ponta.
3. Reusar o harness GAN: traduzir o SDD em `gan-harness/spec.md` +
   `eval-rubric.md`, depois conduzir `/gan-build "<brief>" --skip-planner`
   (loop gerador → avaliador) até a pontuação passar ou estabilizar.
4. `code-reviewer` (+ `security-reviewer` em qualquer fatia com gatilho de segurança), depois
   fazer commit do scaffold e de cada fatia como commits `feat:` separados. → **PORTÃO 2**.

Se `$ARGUMENTS` estiver vazio, peça ao usuário o caminho do documento de design/spec.
