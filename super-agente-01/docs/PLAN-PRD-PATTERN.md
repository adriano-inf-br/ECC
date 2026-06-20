# Padrão Plan-PRD: Fluxo de Planejamento Baseado em Staging com Markdown

Um fluxo de trabalho de planejamento leve e alinhado ao SDLC onde cada fase do ciclo de vida produz um **arquivo de staging** em markdown commitável que o próximo comando consome.

> Versão curta: `/plan-prd` escreve um PRD, `/plan` escreve um plano, a skill `tdd-workflow` implementa, e `/pr` entrega. Cada seta é um arquivo em disco, não uma conversa na memória.

## Funcionalidade: Arquivos de Staging em Markdown

Cada artefato de planejamento é um arquivo `.md` simples em `.claude/`:

```
.claude/
  prds/      # Product Requirements Documents from /plan-prd
  plans/     # Implementation plans from /plan
  reviews/   # Code review artifacts from /code-review
```

Esses arquivos são:

- **Markdown simples** — legíveis por humanos, comparáveis em PRs, pesquisáveis via CLI.
- **Commitáveis** — faça check-in junto com o código para que a intenção viaje com a implementação.
- **Combináveis** — cada comando aceita o arquivo da etapa anterior como seu `$ARGUMENTS`, então o conjunto de ferramentas se combina por caminhos em vez de estado em contexto.
- **Retomáveis** — feche a sessão, abra uma nova amanhã, passe o caminho do arquivo de volta.

## Fluxo

```
┌───────────────────────────┐
│ /plan-prd "<idea>"        │  Requirements phase
│  → .claude/prds/X.prd.md  │   Problem · Users · Hypothesis · Scope
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│ /plan <prd-path>          │  Design phase
│  → .claude/plans/X.plan.md│   Patterns · Files · Tasks · Validation
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│ tdd-workflow skill         │  Implementation phase
│  → code + tests           │   Test-first, minimal diff
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│ /pr                        │  Delivery phase
│  → GitHub PR               │   Links back to PRD + plan
└───────────────────────────┘
```

Cada caixa é um **portão**. Você pode:

- Parar entre portões — o artefato persiste.
- Reiniciar a partir de qualquer portão usando o caminho do artefato.
- Pular portões para trabalhos pequenos — passe texto livre para `/plan` e ignore `/plan-prd`.
- Executar um portão isoladamente — `/plan "refatorar X"` produz um plano conversacional sem artefato.

## Por que `/plan-prd` é Adicional ao `/plan`

Eles respondem a perguntas diferentes. Misturá-los causa expansão de escopo.

| Comando | Responde | Fase do SDLC | Artefato |
|---|---|---|---|
| `/plan-prd` | *Qual problema? Para quem? Como sabemos que terminamos?* | Requisitos | `.claude/prds/{name}.prd.md` |
| `/plan` | *Quais arquivos, padrões e tarefas satisfazem o requisito?* | Estratégia de design + implementação | `.claude/plans/{name}.plan.md` (modo PRD) ou inline (modo texto) |

### Por que não combiná-los?

- **Separação de responsabilidades.** PRDs perguntam *por quê*; planos perguntam *como*. Agrupá-los cria um comando superdimensionado que faz os dois mal, como o antigo par `/prp-prd` → `/prp-plan` demonstrou (interrogação em 8 fases com tabelas da fase de implementação misturadas nos requisitos).
- **Públicos diferentes.** Um stakeholder revisando um PRD não se importa com caminhos de arquivo ou comandos de verificação de tipo. Um engenheiro lendo um plano não precisa da fase de pesquisa de mercado.
- **Durações de vida diferentes.** Um PRD pode permanecer estável enquanto seu plano é reescrito várias vezes conforme as premissas de implementação mudam.
- **Etapa opcional.** Muitas mudanças (correções de bugs, pequenas refatorações, adições de um único arquivo) não precisam de um PRD. `/plan` sozinho é suficiente. Forçar um PRD em cada mudança é burocracia.

### Quando usar cada um

Use `/plan-prd` quando:

- O escopo é incerto ou contestado.
- Vários stakeholders precisam alinhar sobre o problema antes de buscar soluções.
- A mudança é grande o suficiente para que escrever a hipótese seja mais barato do que rediscutir o escopo no meio da implementação.

Use `/plan` diretamente quando:

- Os requisitos já estão claros (um relatório de bug, uma refatoração com escopo definido, uma migração conhecida).
- O trabalho é pequeno o suficiente para que um plano conversacional com portão de confirmação seja suficiente.
- Você já tem um PRD — passe-o para `/plan` e pule `/plan-prd`.

## Uso

### Fluxo completo (funcionalidade com escopo incerto)

```bash
# 1. Draft the PRD
/plan-prd "Per-user rate limits on the public API"

# → .claude/prds/per-user-rate-limits.prd.md created
# Answer the framing questions, provide evidence, define hypothesis and scope.

# 2. Pick the next pending milestone and produce a plan
/plan .claude/prds/per-user-rate-limits.prd.md

# → .claude/plans/per-user-rate-limits.plan.md created
# The plan includes patterns to mirror, files to change, and validation commands.
# PRD's Delivery Milestones table updates the selected row to `in-progress`.

# 3. Implement test-first
Use the tdd-workflow skill

# 4. Open the PR
/pr
# → PR body auto-references .claude/prds/... and .claude/plans/...
```

### Fluxo rápido (escopo já definido)

```bash
/plan "Add retry with exponential backoff to the notifier"
# Conversational planning, no artifact.
# Confirm, then use the tdd-workflow skill.
```

### Referenciar um PRD existente de outro lugar

```bash
# PRD was written by someone else, lives in your repo
/plan docs/rfcs/0042-rate-limiting.prd.md
```

`/plan` detecta qualquer caminho `.prd.md` e muda para o modo de artefato, analisando a tabela de Marcos de Entrega.

## Por que arquivos de staging superam o estado em contexto

- **Transferíveis**: coloque o caminho do PRD em uma sessão nova e você está atualizado — sem reproduzir uma longa conversa.
- **Auditáveis**: o revisor do PR vê *o que você pretendia* ao lado de *o que você construiu*.
- **Versionados**: o arquivo de staging evolui no histórico do git, igual ao código.
- **Parseáveis por máquina**: `/plan` seleciona programaticamente o próximo marco pendente; `/pr` vincula artefatos programaticamente no corpo do PR. Sem engenharia de Prompt necessária.

## Comandos relacionados

- `/plan-prd` — requisitos (ponto de entrada deste padrão).
- `/plan` — planejamento (consome PRDs ou texto livre).
- skill `tdd-workflow` — implementação test-first.
- `/pr` — abrir um PR que referencia PRDs e planos.
- `/code-review` — revisa diffs locais ou PRs; detecta automaticamente `.claude/prds/` e `.claude/plans/` como contexto.

## Compatibilidade

Este padrão adiciona comandos de arquivo de staging nativos do ECC ao lado do conjunto de comandos `prp-*` existente. Os comandos PRP legados continuam disponíveis para fluxos de trabalho PRP mais profundos e para usuários que já têm artefatos `.claude/PRPs/`.

- `/plan-prd` é o ponto de entrada de requisitos simples para `.claude/prds/`.
- `/plan` pode consumir arquivos `.prd.md` e produzir artefatos `.claude/plans/` sem exigir o layout de diretório PRP legado.
- `/pr` é o comando de criação de PR nativo do ECC e pode referenciar `.claude/prds/` e `.claude/plans/`.
- `/prp-prd`, `/prp-plan`, `/prp-implement`, `/prp-commit` e `/prp-pr` continuam sendo comandos válidos de fluxo de trabalho legado/profundo.
