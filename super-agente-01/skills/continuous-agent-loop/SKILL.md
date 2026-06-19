---
name: continuous-agent-loop
description: Padrões para loops de agent autônomos contínuos com portões de qualidade, evals e controles de recuperação.
metadata:
  origin: ECC
---

# Continuous Agent Loop

Este é o nome canônico da skill de loop na v1.8+. Ele substitui `autonomous-loops` mantendo compatibilidade por uma release.

## Fluxo de Seleção de Loop

```text
Start
  |
  +-- Precisa de controle estrito de CI/PR? -- sim --> continuous-pr
  |
  +-- Precisa de decomposição de RFC? -- sim --> rfc-dag
  |
  +-- Precisa de geração paralela exploratória? -- sim --> infinite
  |
  +-- padrão --> sequential
```

## Padrão Combinado

Pilha de produção recomendada:
1. decomposição de RFC (`ralphinho-rfc-pipeline`)
2. portões de qualidade (`plankton-code-quality` + `/quality-gate`)
3. loop de eval (`eval-harness`)
4. persistência de sessão (`nanoclaw-repl`)

## Modos de Falha

- agitação do loop sem progresso mensurável
- retentativas repetidas com a mesma causa raiz
- travamentos na fila de merge
- desvio de custo por escalonamento sem limites

## Recuperação

- congele o loop
- execute `/harness-audit`
- reduza o escopo à unidade que está falhando
- reproduza com critérios de aceitação explícitos
