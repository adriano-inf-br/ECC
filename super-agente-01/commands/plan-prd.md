---
description: "Gera um PRD enxuto, focado no problema, e repassa para /plan para o planejamento de implementação."
argument-hint: "[ideia de produto/funcionalidade] (vazio = começar com perguntas)"
---

# Comando PRD

Produz um **Product Requirements Document** (Documento de Requisitos do Produto) — o artefato da fase de requisitos do SDLC. Captura *o que* precisa ser verdade para o sucesso e *por quê*, e para antes do *como*. A decomposição da implementação é delegada a `/plan`.

**Entrada**: `$ARGUMENTS`

## Escopo deste comando

| Este comando faz | Este comando NÃO faz |
|---|---|
| Enquadrar o problema e os usuários | Projetar a arquitetura |
| Capturar critérios de sucesso e escopo | Escolher arquivos ou escrever padrões |
| Listar questões em aberto e riscos | Enumerar tarefas de implementação |
| Escrever `.claude/prds/{name}.prd.md` | Produzir um plano de implementação — isso é o `/plan` |

Se você se pegar escrevendo detalhe de implementação, pare e corte. Isso pertence ao `/plan`.

**Regra anti-encheção**: Quando faltar informação, escreva `TBD — needs validation via {method}`. Nunca invente requisitos de aparência plausível.

## Fluxo de trabalho

Quatro fases. Cada fase é um único gate — faça as perguntas, espere o usuário, depois siga adiante. Sem loops aninhados, sem cerimônia de pesquisa paralela.

### Fase 1 — FRAME

Se `$ARGUMENTS` estiver vazio, pergunte:

> O que você quer construir? Uma ou duas frases.

Se fornecido, reformule em uma frase e pergunte:

> Eu entendi: *{restated}*. Correto, ou devo ajustar?

Depois faça as perguntas de enquadramento em um único conjunto:

> 1. **Quem** tem esse problema? (papel ou segmento específico)
> 2. **Qual** é a dor observável? (descreva o comportamento, não necessidades presumidas)
> 3. **Por que** não conseguem resolver com o que existe hoje?
> 4. **Por que agora?** — o que mudou que torna isso digno de ser feito?

Espere o usuário. Não prossiga sem respostas (ou um "pular" explícito).

### Fase 2 — GROUND

Peça evidências. Esta é a fase mais curta e a mais decisiva:

> Que evidência você tem de que esse problema é real e vale a pena resolver? (citações de usuários, tickets de suporte, métricas, comportamento observado, contornos que falharam — qualquer coisa concreta)

Se o usuário não tiver nenhuma, registre a seção de Evidência do PRD como `Assumption — needs validation via {user research | analytics | prototype}`. Isso mantém o PRD honesto.

### Fase 3 — DECIDE

Escopo e hipótese em um único conjunto:

> 1. **Hipótese** — Complete: *Acreditamos que **{capability}** vai **{solve problem}** para **{users}**. Saberemos que estamos certos quando **{measurable outcome}**.*
> 2. **MVP** — O mínimo necessário para testar a hipótese?
> 3. **Fora de escopo** — O que você explicitamente **não** vai construir (mesmo que os usuários peçam)?
> 4. **Questões em aberto** — Incertezas que poderiam mudar a abordagem?

Espere as respostas.

### Fase 4 — GENERATE & HAND OFF

Crie o diretório se necessário, escreva o PRD e reporte.

```bash
mkdir -p .claude/prds
```

**Caminho de saída**: `.claude/prds/{kebab-case-name}.prd.md`

#### Template de PRD

```markdown
# {Product / Feature Name}

## Problem
{2–3 sentences: who has what problem, and what's the cost of leaving it unsolved?}

## Evidence
- {User quote, data point, or observation}
- {OR: "Assumption — needs validation via {method}"}

## Users
- **Primary**: {role, context, what triggers the need}
- **Not for**: {who this explicitly excludes}

## Hypothesis
We believe **{capability}** will **{solve problem}** for **{users}**.
We'll know we're right when **{measurable outcome}**.

## Success Metrics
| Metric | Target | How measured |
|---|---|---|
| {primary} | {number} | {method} |

## Scope
**MVP** — {the minimum to test the hypothesis}

**Out of scope**
- {item} — {why deferred}

## Delivery Milestones
<!-- Business outcomes, not engineering tasks. /plan turns each into a plan. -->
<!-- Status: pending | in-progress | complete -->

| # | Milestone | Outcome | Status | Plan |
|---|---|---|---|---|
| 1 | {name} | {user-visible change} | pending | — |
| 2 | {name} | {user-visible change} | pending | — |

## Open Questions
- [ ] {question that could change scope or approach}

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|

---
*Status: DRAFT — requirements only. Implementation planning pending via /plan.*
```

#### Reporte ao usuário

```
PRD created: .claude/prds/{name}.prd.md

Problem:    {one line}
Hypothesis: {one line}
MVP:        {one line}

Validation status:
  Problem  {validated | assumption}
  Users    {concrete | generic — refine}
  Metrics  {defined | TBD}

Open questions: {count}

Next step: /plan .claude/prds/{name}.prd.md
  → /plan will pick the next pending milestone and produce an implementation plan.
```

## Integração

- `/plan <prd-path>` — consome o PRD e produz um plano de implementação para o próximo marco pendente.
- skill `tdd-workflow` — implementa o plano test-first.
- `/pr` — abre um PR que referencia o PRD e o plano.

## Critérios de sucesso

- **PROBLEM_CLEAR**: o problema é específico e evidenciado (ou sinalizado como suposição).
- **USER_CONCRETE**: o usuário primário é um papel específico, não "usuários".
- **HYPOTHESIS_TESTABLE**: resultado mensurável incluído.
- **SCOPE_BOUNDED**: MVP explícito e fora-de-escopo explícito.
- **NO_IMPLEMENTATION_DETAIL**: caminhos de arquivo, bibliotecas ou divisões de tarefa estão ausentes — se apareceram, mova-os para a etapa do `/plan`.
