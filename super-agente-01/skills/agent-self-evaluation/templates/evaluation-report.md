# Template de Relatório de Autoavaliação de Agent

Copie este template e preencha após concluir uma tarefa. O formato corresponde à saída de `scripts/evaluate.py`.

```
============================================================
AGENT SELF-EVALUATION REPORT
============================================================
Summary: Overall score X.X/5 across 5 quality axes.

  Accuracy         █████ 5/5    or    ███░░ 3/5
    + [Evidence: passing tests, verified claims]
    - [Gaps: unverified claims, hedging language]
    → [Improvement if score < 5]

  Completeness      █████ 5/5
    + [What's covered: all requirements + edge cases]
    - [What's missing: explicitly acknowledge gaps]
    → [Improvement if score < 5]

  Clarity           █████ 5/5
    + [Structure: headings, code blocks, bullet points]
    - [Issues: undefined terms, wall of text, no summary]
    → [Improvement if score < 5]

  Actionability     █████ 5/5
    + [User can: merge PR, run command, review file]
    - [Blockers: missing steps, vague suggestions]
    → [Improvement if score < 5]

  Conciseness       █████ 5/5
    + [Tight: no repetition, high information density]
    - [Bloat: filler, meta-commentary, repeated points]
    → [Improvement if score < 5]

  OVERALL           X.X/5

CRITICAL ISSUES (axes ≤ 2):
  [Axis] Score N/5 — specific fix needed
  (or "None" if no axis ≤ 2)

Self-check: Would the user agree with this assessment? [Yes/No + brief justification]

TOP IMPROVEMENTS:
  1. [Highest impact fix]
  2. [Second highest]
  (Only list axes scoring < 4, ranked by user impact)

VERDICT: [Deliver as-is / Fix N issues then deliver / Redo from scratch]
```

## Referência Rápida: Gatilhos de Pontuação

| Se você vir isto... | Precisão | Completude | Clareza | Acionabilidade | Concisão |
|---|---|---|---|---|---|
| "should work" / "probably fine" | ≤4 | — | — | — | — |
| "I think" / "I believe" | ≤4 | — | — | — | — |
| Nenhuma saída de teste citada | ≤4 | — | — | — | — |
| "TODO" / "FIXME" deixados para trás | ≤3 | ≤3 | — | ≤3 | — |
| Tratamento de erro ausente | — | ≤3 | — | — | — |
| Apenas o happy path coberto | — | ≤3 | — | — | — |
| Parágrafo em parede de texto (>200 palavras) | — | — | ≤3 | — | — |
| Sem títulos ou estrutura | — | — | ≤3 | — | — |
| "You should..." sem especificidade | — | — | — | ≤3 | — |
| Nenhum PR ou arquivo criado | — | — | — | ≤3 | — |
| O usuário precisa descobrir o próximo passo | — | — | — | ≤2 | — |
| Pontos repetidos (3+ vezes) | — | — | — | — | ≤3 |
| "Let me explain..." / "To summarize..." x3+ | — | — | — | — | ≤3 |
| Saída >15x mais longa que a tarefa | — | — | — | — | ≤3 |

## Quando Pular

Pule a avaliação se:
- A tarefa foi uma única chamada de tool (ex.: "leia este arquivo" — nada a avaliar)
- O usuário diz explicitamente "não avalie" ou "apenas faça"
- A tarefa é puramente conversacional (saudação, conversa fiada)
- Você está no meio de um fluxo de trabalho e o usuário vai julgar a saída final, não os passos intermediários

## Ações Pós-Avaliação

| Pontuação Geral | O que fazer |
|---|---|
| ≥4.5 | Entregue como está. Nenhuma mudança necessária. |
| 3.5–4.4 | Sinalize a melhoria principal mas entregue. Corrija se levar <30 segundos. |
| 2.5–3.4 | Declare o que você mudaria. Pergunte ao usuário: "Devo refazer [eixo] ou entregar como está?" |
| <2.5 | Não entregue. Diga: "Isto pontuou [pontuação] porque [evidência]. Deixe-me refazer isto com [correção específica]." Então refaça. |
