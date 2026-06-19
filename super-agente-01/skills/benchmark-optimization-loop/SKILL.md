---
name: benchmark-optimization-loop
description: Use quando o usuário pede para tornar algo mais rápido, testar muitas variantes, rodar otimização recursiva, medir latência/throughput/custo via benchmark ou escolher a melhor implementação por testes medidos repetidos.
metadata:
  origin: ECC
tools: Read, Write, Edit, Bash, Grep, Glob
---

# Benchmark Optimization Loop

Use esta Skill para converter "deixe 20x mais rápido" ou "tente 50 otimizações
recursivas" em um loop medido e delimitado que de fato consiga melhorar um sistema.

## Linha de Base Obrigatória

Não otimize até que estes existam:

- a operação sendo otimizada;
- o portão de correção que deve permanecer verde;
- a métrica: tempo de relógio, latência p95, linhas/s, custo/execução, memória, taxa de erro;
- a linha de base atual;
- o orçamento de busca: máximo de variantes, tempo máximo, gasto máximo, impacto máximo de dados.

Se o usuário pedir uma meta irrealista, mantenha a ambição, mas torne o loop
delimitado e mensurável.

## Loop

1. Meça a linha de base.
2. Identifique os gargalos a partir de evidências.
3. Gere variantes que testem uma hipótese cada.
4. Rode as variantes com o mesmo formato de entrada.
5. Rejeite variantes que falham na correção, segurança ou reprodutibilidade.
6. Promova a variante segura mais rápida.
7. Codifique o caminho vencedor em um script, comando, teste, config ou doc.
8. Rode novamente a linha de base e o vencedor para confirmar o delta.

## Tabela de Variantes

Acompanhe as variantes assim:

```text
Variant | Hypothesis | Command | Time | Correct? | Notes
baseline | current path | npm run job | 120s | yes | stable
batch-500 | fewer round trips | npm run job -- --batch 500 | 42s | yes | winner
parallel-8 | more workers | npm run job -- --workers 8 | 31s | no | rate limited
```

## Busca Recursiva

Para trabalho recursivo ou de hiperparâmetros:

- persista cada execução em um registro (ledger);
- compare contra o vencedor aceito anterior, não apenas a execução anterior;
- mantenha uma verificação de holdout ou replay;
- pare quando a melhoria estiver dentro do ruído, a correção falhar, o custo exceder o
  orçamento ou a busca começar a mudar mais variáveis do que consegue explicar.

Use expressões como "melhor variante segura medida" em vez de "ótimo global", a menos que
o espaço de busca tenha sido de fato exaustivo.

## Portão de Promoção

Uma variante não pode se tornar o novo padrão até que:

- os testes de correção passem;
- o delta de desempenho seja repetido ou explicado;
- o rollback seja óbvio;
- a mudança esteja codificada no controle de versão ou em um runbook durável;
- o resumo final inclua os comandos e medições exatos.
