---
name: agentic-engineering
description: Opere como um engenheiro agentic usando execução eval-first, decomposição e roteamento de modelos ciente de custo.
metadata:
  origin: ECC
---

# Engenharia Agentic

Use esta skill para fluxos de trabalho de engenharia onde agents de IA realizam a maior parte do trabalho de implementação e humanos impõem controles de qualidade e risco.

## Princípios de Operação

1. Defina critérios de conclusão antes da execução.
2. Decomponha o trabalho em unidades do tamanho de um agent.
3. Roteie os tiers de modelo pela complexidade da tarefa.
4. Meça com evals e verificações de regressão.

## Loop Eval-First

1. Defina o eval de capacidade e o eval de regressão.
2. Rode o baseline e capture as assinaturas de falha.
3. Execute a implementação.
4. Re-rode os evals e compare os deltas.

## Decomposição de Tarefas

Aplique a regra da unidade de 15 minutos:
- cada unidade deve ser verificável de forma independente
- cada unidade deve ter um único risco dominante
- cada unidade deve expor uma condição de conclusão clara

## Roteamento de Modelos

- Haiku: classificação, transformações de boilerplate, edições estreitas
- Sonnet: implementação e refatorações
- Opus: arquitetura, análise de causa raiz, invariantes multi-arquivo

## Estratégia de Sessão

- Continue a sessão para unidades fortemente acopladas.
- Inicie uma sessão nova após transições de fase importantes.
- Compacte após a conclusão de um marco, não durante depuração ativa.

## Foco de Revisão para Código Gerado por IA

Priorize:
- invariantes e edge cases
- fronteiras de erro
- suposições de segurança e auth
- acoplamento oculto e risco de rollout

Não desperdice ciclos de revisão em divergências apenas de estilo quando format/lint automatizados já impõem o estilo.

## Disciplina de Custo

Acompanhe por tarefa:
- modelo
- estimativa de tokens
- retries
- tempo de relógio
- sucesso/falha

Escale o tier de modelo apenas quando o tier inferior falhar com uma lacuna clara de raciocínio.
