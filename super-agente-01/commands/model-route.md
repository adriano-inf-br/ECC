---
description: Recomenda o melhor nível de modelo para a tarefa atual com base em complexidade, risco e orçamento.
---

# Comando Model Route

Recomenda o melhor nível de modelo para a tarefa atual por complexidade e orçamento.

## Uso

`/model-route [task-description] [--budget low|med|high]`

## Heurística de Roteamento

- `haiku`: mudanças mecânicas determinísticas e de baixo risco
- `sonnet`: padrão para implementação e refatorações
- `opus`: arquitetura, revisão profunda, requisitos ambíguos

## Saída Obrigatória

- modelo recomendado
- nível de confiança
- por que este modelo é adequado
- modelo de fallback caso a primeira tentativa falhe

## Argumentos

$ARGUMENTS:
- `[task-description]` texto livre opcional
- `--budget low|med|high` opcional
