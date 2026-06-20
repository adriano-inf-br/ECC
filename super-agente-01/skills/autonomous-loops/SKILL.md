---
name: autonomous-loops
description: "Padrões e arquiteturas para loops autônomos do Claude Code — de pipelines sequenciais simples a sistemas DAG multi-agent orientados por RFC."
metadata:
  origin: ECC
---

# Skill de Loops Autônomos

> Nota de compatibilidade (v1.8.0): `autonomous-loops` é mantida por um release.
> O nome canônico da Skill agora é `continuous-agent-loop`. Novas orientações de loop
> devem ser escritas lá, enquanto esta Skill permanece disponível para evitar
> quebrar workflows existentes.

Padrões, arquiteturas e implementações de referência para rodar o Claude Code autonomamente em loops. Cobre tudo, de pipelines simples de `claude -p` à orquestração completa de DAG multi-agent orientada por RFC.

## Quando Usar

- Configurar workflows de desenvolvimento autônomos que rodam sem intervenção humana
- Escolher a arquitetura de loop certa para o seu problema (simples vs complexo)
- Construir pipelines de desenvolvimento contínuo no estilo CI/CD
- Rodar agents em paralelo com coordenação de merge
- Implementar persistência de contexto entre iterações de loop
- Adicionar portões de qualidade e passagens de limpeza a workflows autônomos

## Espectro de Padrões de Loop

Do mais simples ao mais sofisticado:

| Padrão | Complexidade | Melhor Para |
|---------|-----------|----------|
| [Pipeline Sequencial](#1-sequential-pipeline-claude--p) | Baixa | Passos diários de dev, workflows roteirizados |
| [REPL NanoClaw](#2-nanoclaw-repl) | Baixa | Sessões persistentes interativas |
| [Loop Agêntico Infinito](#3-infinite-agentic-loop) | Média | Geração de conteúdo em paralelo, trabalho orientado por spec |
| [Loop Contínuo de PR do Claude](#4-continuous-claude-pr-loop) | Média | Projetos iterativos de vários dias com portões de CI |
| [Padrão De-Sloppify](#5-the-de-sloppify-pattern) | Complemento | Limpeza de qualidade após qualquer passo de Implementer |
| [Ralphinho / DAG orientado por RFC](#6-ralphinho--rfc-driven-dag-orchestration) | Alta | Features grandes, trabalho paralelo de várias unidades com merge queue |

---

## 1. Pipeline Sequencial (`claude -p`)

**O loop mais simples.** Quebre o desenvolvimento diário em uma sequência de chamadas não interativas de `claude -p`. Cada chamada é um passo focado com um prompt claro.

### Insight Central

> Se você não consegue imaginar um loop como este, significa que você nem consegue conduzir o LLM a consertar o seu código em modo interativo.

A flag `claude -p` roda o Claude Code de forma não interativa com um prompt e sai quando termina. Encadeie chamadas para construir um pipeline:

```bash
#!/bin/bash
# daily-dev.sh — Pipeline sequencial para uma branch de feature

set -e

# Passo 1: Implementar a feature
claude -p "Read the spec in docs/auth-spec.md. Implement OAuth2 login in src/auth/. Write tests first (TDD). Do NOT create any new documentation files."

# Passo 2: De-sloppify (passagem de limpeza)
claude -p "Review all files changed by the previous commit. Remove any unnecessary type tests, overly defensive checks, or testing of language features (e.g., testing that TypeScript generics work). Keep real business logic tests. Run the test suite after cleanup."

# Passo 3: Verificar
claude -p "Run the full build, lint, type check, and test suite. Fix any failures. Do not add new features."

# Passo 4: Commit
claude -p "Create a conventional commit for all staged changes. Use 'feat: add OAuth2 login flow' as the message."
```

### Princípios-Chave de Design

1. **Cada passo é isolado** — uma janela de contexto nova por chamada de `claude -p` significa que não há vazamento de contexto entre passos.
2. **A ordem importa** — os passos executam sequencialmente. Cada um se baseia no estado do sistema de arquivos deixado pelo anterior.
3. **Instruções negativas são perigosas** — não diga "não teste sistemas de tipos". Em vez disso, adicione um passo de limpeza separado (veja [Padrão De-Sloppify](#5-the-de-sloppify-pattern)).
4. **Os exit codes se propagam** — `set -e` para o pipeline em caso de falha.

### Variações

**Com roteamento de modelo:**
```bash
# Pesquisar com Opus (raciocínio profundo)
claude -p --model opus "Analyze the codebase architecture and write a plan for adding caching..."

# Implementar com Sonnet (rápido, capaz)
claude -p "Implement the caching layer according to the plan in docs/caching-plan.md..."

# Revisar com Opus (minucioso)
claude -p --model opus "Review all changes for security issues, race conditions, and edge cases..."
```

**Com contexto de ambiente:**
```bash
# Passe contexto via arquivos, não pelo tamanho do prompt
echo "Focus areas: auth module, API rate limiting" > .claude-context.md
claude -p "Read .claude-context.md for priorities. Work through them in order."
rm .claude-context.md
```

**Com restrições `--allowedTools`:**
```bash
# Passagem de análise somente leitura
claude -p --allowedTools "Read,Grep,Glob" "Audit this codebase for security vulnerabilities..."

# Passagem de implementação somente escrita
claude -p --allowedTools "Read,Write,Edit,Bash" "Implement the fixes from security-audit.md..."
```

---

## 2. REPL NanoClaw

**O loop persistente embutido do ECC.** Um REPL com consciência de sessão que chama `claude -p` de forma síncrona com o histórico completo da conversa.

```bash
# Inicia a sessão padrão
node scripts/claw.js

# Sessão nomeada com contexto de Skill
CLAW_SESSION=my-project CLAW_SKILLS=tdd-workflow,security-review node scripts/claw.js
```

### Como Funciona

1. Carrega o histórico da conversa de `~/.claude/claw/{session}.md`
2. Cada mensagem do usuário é enviada para `claude -p` com o histórico completo como contexto
3. As respostas são anexadas ao arquivo de sessão (Markdown como banco de dados)
4. As sessões persistem entre reinícios

### Quando NanoClaw vs Pipeline Sequencial

| Caso de Uso | NanoClaw | Pipeline Sequencial |
|----------|----------|-------------------|
| Exploração interativa | Sim | Não |
| Automação roteirizada | Não | Sim |
| Persistência de sessão | Embutida | Manual |
| Acúmulo de contexto | Cresce a cada turno | Novo a cada passo |
| Integração com CI/CD | Ruim | Excelente |

Veja a documentação do comando `/claw` para detalhes completos.

---

## 3. Loop Agêntico Infinito

**Um sistema de dois prompts** que orquestra sub-agents paralelos para geração orientada por especificação. Desenvolvido por disler (crédito: @disler).

### Arquitetura: Sistema de Dois Prompts

```
PROMPT 1 (Orchestrator)              PROMPT 2 (Sub-Agents)
┌─────────────────────┐             ┌──────────────────────┐
│ Parse spec file      │             │ Receive full context  │
│ Scan output dir      │  deploys   │ Read assigned number  │
│ Plan iteration       │────────────│ Follow spec exactly   │
│ Assign creative dirs │  N agents  │ Generate unique output │
│ Manage waves         │             │ Save to output dir    │
└─────────────────────┘             └──────────────────────┘
```

### O Padrão

1. **Análise de Spec** — o orchestrator lê um arquivo de especificação (Markdown) que define o que gerar
2. **Reconhecimento de Diretório** — varre a saída existente para encontrar o maior número de iteração
3. **Implantação Paralela** — lança N sub-agents, cada um com:
   - A spec completa
   - Uma direção criativa única
   - Um número de iteração específico (sem conflitos)
   - Um snapshot das iterações existentes (para garantir unicidade)
4. **Gerenciamento de Ondas** — no modo infinito, implanta ondas de 3-5 agents até esgotar o contexto

### Implementação via Comandos do Claude Code

Crie `.claude/commands/infinite.md`:

```markdown
Parse the following arguments from $ARGUMENTS:
1. spec_file — path to the specification markdown
2. output_dir — where iterations are saved
3. count — integer 1-N or "infinite"

PHASE 1: Read and deeply understand the specification.
PHASE 2: List output_dir, find highest iteration number. Start at N+1.
PHASE 3: Plan creative directions — each agent gets a DIFFERENT theme/approach.
PHASE 4: Deploy sub-agents in parallel (Task tool). Each receives:
  - Full spec text
  - Current directory snapshot
  - Their assigned iteration number
  - Their unique creative direction
PHASE 5 (infinite mode): Loop in waves of 3-5 until context is low.
```

**Invocar:**
```bash
/project:infinite specs/component-spec.md src/ 5
/project:infinite specs/component-spec.md src/ infinite
```

### Estratégia de Lotes (Batching)

| Quantidade | Estratégia |
|-------|----------|
| 1-5 | Todos os agents simultaneamente |
| 6-20 | Lotes de 5 |
| infinite | Ondas de 3-5, sofisticação progressiva |

### Insight-Chave: Unicidade via Atribuição

Não confie nos agents para se autodiferenciarem. O orchestrator **atribui** a cada agent uma direção criativa e um número de iteração específicos. Isso evita conceitos duplicados entre os agents paralelos.

---

## 4. Loop Contínuo de PR do Claude

**Um script de shell de nível de produção** que roda o Claude Code em um loop contínuo, criando PRs, esperando pelo CI e fazendo merge automaticamente. Criado por AnandChowdhary (crédito: @AnandChowdhary).

### Loop Central

```
┌─────────────────────────────────────────────────────┐
│  CONTINUOUS CLAUDE ITERATION                        │
│                                                     │
│  1. Create branch (continuous-claude/iteration-N)   │
│  2. Run claude -p with enhanced prompt              │
│  3. (Optional) Reviewer pass — separate claude -p   │
│  4. Commit changes (claude generates message)       │
│  5. Push + create PR (gh pr create)                 │
│  6. Wait for CI checks (poll gh pr checks)          │
│  7. CI failure? → Auto-fix pass (claude -p)         │
│  8. Merge PR (squash/merge/rebase)                  │
│  9. Return to main → repeat                         │
│                                                     │
│  Limit by: --max-runs N | --max-cost $X             │
│            --max-duration 2h | completion signal     │
└─────────────────────────────────────────────────────┘
```

### Instalação

> **Aviso:** Instale o continuous-claude a partir do seu repositório após revisar o código. Não faça pipe de scripts externos diretamente para o bash.

### Uso

```bash
# Básico: 10 iterações
continuous-claude --prompt "Add unit tests for all untested functions" --max-runs 10

# Limitado por custo
continuous-claude --prompt "Fix all linter errors" --max-cost 5.00

# Limitado por tempo
continuous-claude --prompt "Improve test coverage" --max-duration 8h

# Com passagem de revisão de código
continuous-claude \
  --prompt "Add authentication feature" \
  --max-runs 10 \
  --review-prompt "Run npm test && npm run lint, fix any failures"

# Paralelo via worktrees
continuous-claude --prompt "Add tests" --max-runs 5 --worktree tests-worker &
continuous-claude --prompt "Refactor code" --max-runs 5 --worktree refactor-worker &
wait
```

### Contexto Entre Iterações: SHARED_TASK_NOTES.md

A inovação crítica: um arquivo `SHARED_TASK_NOTES.md` persiste entre iterações:

```markdown
## Progress
- [x] Added tests for auth module (iteration 1)
- [x] Fixed edge case in token refresh (iteration 2)
- [ ] Still need: rate limiting tests, error boundary tests

## Next Steps
- Focus on rate limiting module next
- The mock setup in tests/helpers.ts can be reused
```

O Claude lê este arquivo no início da iteração e o atualiza no fim da iteração. Isso preenche a lacuna de contexto entre invocações independentes de `claude -p`.

### Recuperação de Falha de CI

Quando as verificações de PR falham, o Continuous Claude automaticamente:
1. Busca o ID da execução que falhou via `gh run list`
2. Gera um novo `claude -p` com contexto de correção de CI
3. O Claude inspeciona os logs via `gh run view`, corrige o código, faz commit, faz push
4. Espera novamente pelas verificações (até `--ci-retry-max` tentativas)

### Sinal de Conclusão

O Claude pode sinalizar "terminei" emitindo uma frase mágica:

```bash
continuous-claude \
  --prompt "Fix all bugs in the issue tracker" \
  --completion-signal "CONTINUOUS_CLAUDE_PROJECT_COMPLETE" \
  --completion-threshold 3  # Stops after 3 consecutive signals
```

Três iterações consecutivas sinalizando conclusão param o loop, evitando execuções desperdiçadas em trabalho já finalizado.

### Configuração Principal

| Flag | Propósito |
|------|---------|
| `--max-runs N` | Para após N iterações bem-sucedidas |
| `--max-cost $X` | Para após gastar $X |
| `--max-duration 2h` | Para após o tempo decorrido |
| `--merge-strategy squash` | squash, merge ou rebase |
| `--worktree <name>` | Execução paralela via git worktrees |
| `--disable-commits` | Modo dry-run (sem operações git) |
| `--review-prompt "..."` | Adiciona passagem de revisão por iteração |
| `--ci-retry-max N` | Corrige falhas de CI automaticamente (padrão: 1) |

---

## 5. O Padrão De-Sloppify

**Um padrão complementar para qualquer loop.** Adicione um passo dedicado de limpeza/refatoração após cada passo de Implementer.

### O Problema

Quando você pede a um LLM para implementar com TDD, ele leva "escrever testes" ao pé da letra:
- Testes que verificam se o sistema de tipos do TypeScript funciona (testando `typeof x === 'string'`)
- Verificações de runtime excessivamente defensivas para coisas que o sistema de tipos já garante
- Testes para comportamento do framework em vez de lógica de negócio
- Tratamento de erros excessivo que obscurece o código real

### Por Que Não Instruções Negativas?

Adicionar "não teste sistemas de tipos" ou "não adicione verificações desnecessárias" ao prompt do Implementer tem efeitos colaterais:
- O modelo fica hesitante quanto a TODA forma de teste
- Ele pula testes legítimos de casos extremos
- A qualidade degrada de forma imprevisível

### A Solução: Passagem Separada

Em vez de restringir o Implementer, deixe-o ser minucioso. Depois adicione um agent de limpeza focado:

```bash
# Passo 1: Implementar (deixe-o ser minucioso)
claude -p "Implement the feature with full TDD. Be thorough with tests."

# Passo 2: De-sloppify (contexto separado, limpeza focada)
claude -p "Review all changes in the working tree. Remove:
- Tests that verify language/framework behavior rather than business logic
- Redundant type checks that the type system already enforces
- Over-defensive error handling for impossible states
- Console.log statements
- Commented-out code

Keep all business logic tests. Run the test suite after cleanup to ensure nothing breaks."
```

### Em Contexto de Loop

```bash
for feature in "${features[@]}"; do
  # Implementar
  claude -p "Implement $feature with TDD."

  # De-sloppify
  claude -p "Cleanup pass: review changes, remove test/code slop, run tests."

  # Verificar
  claude -p "Run build + lint + tests. Fix any failures."

  # Commit
  claude -p "Commit with message: feat: add $feature"
done
```

### Insight-Chave

> Em vez de adicionar instruções negativas, que têm efeitos colaterais de qualidade, adicione uma passagem separada de de-sloppify. Dois agents focados superam um único agent restringido.

---

## 6. Ralphinho / Orquestração de DAG Orientada por RFC

**O padrão mais sofisticado.** Um pipeline multi-agent orientado por RFC que decompõe uma spec em um DAG de dependências, roda cada unidade através de um pipeline de qualidade em camadas e as integra via uma merge queue orientada por agent. Criado por enitrat (crédito: @enitrat).

### Visão Geral da Arquitetura

```
RFC/PRD Document
       │
       ▼
  DECOMPOSITION (AI)
  Break RFC into work units with dependency DAG
       │
       ▼
┌──────────────────────────────────────────────────────┐
│  RALPH LOOP (up to 3 passes)                         │
│                                                      │
│  For each DAG layer (sequential, by dependency):     │
│                                                      │
│  ┌── Quality Pipelines (parallel per unit) ───────┐  │
│  │  Each unit in its own worktree:                │  │
│  │  Research → Plan → Implement → Test → Review   │  │
│  │  (depth varies by complexity tier)             │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  ┌── Merge Queue ─────────────────────────────────┐  │
│  │  Rebase onto main → Run tests → Land or evict │  │
│  │  Evicted units re-enter with conflict context  │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Decomposição de RFC

A IA lê o RFC e produz unidades de trabalho:

```typescript
interface WorkUnit {
  id: string;              // kebab-case identifier
  name: string;            // Human-readable name
  rfcSections: string[];   // Which RFC sections this addresses
  description: string;     // Detailed description
  deps: string[];          // Dependencies (other unit IDs)
  acceptance: string[];    // Concrete acceptance criteria
  tier: "trivial" | "small" | "medium" | "large";
}
```

**Regras de Decomposição:**
- Prefira menos unidades, coesas (minimize o risco de merge)
- Minimize a sobreposição de arquivos entre unidades (evite conflitos)
- Mantenha os testes JUNTO da implementação (nunca separe "implementar X" + "testar X")
- Dependências apenas onde existe uma dependência real de código

O DAG de dependências determina a ordem de execução:
```
Layer 0: [unit-a, unit-b]     ← no deps, run in parallel
Layer 1: [unit-c]             ← depends on unit-a
Layer 2: [unit-d, unit-e]     ← depend on unit-c
```

### Camadas de Complexidade (Tiers)

Diferentes camadas recebem diferentes profundidades de pipeline:

| Tier | Estágios do Pipeline |
|------|----------------|
| **trivial** | implement → test |
| **small** | implement → test → code-review |
| **medium** | research → plan → implement → test → PRD-review + code-review → review-fix |
| **large** | research → plan → implement → test → PRD-review + code-review → review-fix → final-review |

Isso evita operações caras em mudanças simples e ao mesmo tempo garante que mudanças de arquitetura recebam escrutínio minucioso.

### Janelas de Contexto Separadas (Eliminação do Viés de Autor)

Cada estágio roda em seu próprio processo de agent com sua própria janela de contexto:

| Estágio | Modelo | Propósito |
|-------|-------|---------|
| Research | Sonnet | Ler o codebase + RFC, produzir documento de contexto |
| Plan | Opus | Projetar os passos de implementação |
| Implement | Codex | Escrever código seguindo o plano |
| Test | Sonnet | Rodar build + suíte de testes |
| PRD Review | Sonnet | Verificação de conformidade com a spec |
| Code Review | Opus | Verificação de qualidade + segurança |
| Review Fix | Codex | Endereçar as questões da revisão |
| Final Review | Opus | Portão de qualidade (apenas tier large) |

**Design crítico:** o revisor nunca escreveu o código que revisa. Isso elimina o viés de autor — a fonte mais comum de problemas não detectados na auto-revisão.

### Merge Queue com Despejo (Eviction)

Depois que os pipelines de qualidade terminam, as unidades entram na merge queue:

```
Unit branch
    │
    ├─ Rebase onto main
    │   └─ Conflict? → EVICT (capture conflict context)
    │
    ├─ Run build + tests
    │   └─ Fail? → EVICT (capture test output)
    │
    └─ Pass → Fast-forward main, push, delete branch
```

**Inteligência de Sobreposição de Arquivos:**
- Unidades sem sobreposição são integradas especulativamente em paralelo
- Unidades com sobreposição são integradas uma a uma, fazendo rebase a cada vez

**Recuperação de Despejo:**
Quando despejada, o contexto completo é capturado (arquivos em conflito, diffs, saída de testes) e realimentado ao implementer na próxima passagem do Ralph:

```markdown
## MERGE CONFLICT — RESOLVE BEFORE NEXT LANDING

Your previous implementation conflicted with another unit that landed first.
Restructure your changes to avoid the conflicting files/lines below.

{full eviction context with diffs}
```

### Fluxo de Dados Entre Estágios

```
research.contextFilePath ──────────────────→ plan
plan.implementationSteps ──────────────────→ implement
implement.{filesCreated, whatWasDone} ─────→ test, reviews
test.failingSummary ───────────────────────→ reviews, implement (next pass)
reviews.{feedback, issues} ────────────────→ review-fix → implement (next pass)
final-review.reasoning ────────────────────→ implement (next pass)
evictionContext ───────────────────────────→ implement (after merge conflict)
```

### Isolamento por Worktree

Cada unidade roda em um worktree isolado (usa jj/Jujutsu, não git):
```
/tmp/workflow-wt-{unit-id}/
```

Os estágios do pipeline da mesma unidade **compartilham** um worktree, preservando o estado (arquivos de contexto, arquivos de plano, mudanças de código) ao longo de research → plan → implement → test → review.

### Princípios-Chave de Design

1. **Execução determinística** — a decomposição inicial fixa o paralelismo e a ordenação
2. **Revisão humana em pontos de alavancagem** — o plano de trabalho é o único ponto de intervenção de maior alavancagem
3. **Separar responsabilidades** — cada estágio em uma janela de contexto separada com um agent separado
4. **Recuperação de conflito com contexto** — o contexto completo de despejo permite re-execuções inteligentes, não retentativas cegas
5. **Profundidade orientada por tier** — mudanças triviais pulam research/review; mudanças grandes recebem escrutínio máximo
6. **Workflows retomáveis** — estado completo persistido em SQLite; retome de qualquer ponto

### Quando Usar o Ralphinho vs Padrões Mais Simples

| Sinal | Use Ralphinho | Use Padrão Mais Simples |
|--------|--------------|-------------------|
| Múltiplas unidades de trabalho interdependentes | Sim | Não |
| Necessidade de implementação paralela | Sim | Não |
| Conflitos de merge prováveis | Sim | Não (sequencial é suficiente) |
| Mudança em arquivo único | Não | Sim (pipeline sequencial) |
| Projeto de vários dias | Sim | Talvez (continuous-claude) |
| Spec/RFC já escrita | Sim | Talvez |
| Iteração rápida em uma única coisa | Não | Sim (NanoClaw ou pipeline) |

---

## Escolhendo o Padrão Certo

### Matriz de Decisão

```
Is the task a single focused change?
├─ Yes → Sequential Pipeline or NanoClaw
└─ No → Is there a written spec/RFC?
         ├─ Yes → Do you need parallel implementation?
         │        ├─ Yes → Ralphinho (DAG orchestration)
         │        └─ No → Continuous Claude (iterative PR loop)
         └─ No → Do you need many variations of the same thing?
                  ├─ Yes → Infinite Agentic Loop (spec-driven generation)
                  └─ No → Sequential Pipeline with de-sloppify
```

### Combinando Padrões

Esses padrões compõem bem:

1. **Pipeline Sequencial + De-Sloppify** — a combinação mais comum. Todo passo de implementação recebe uma passagem de limpeza.

2. **Continuous Claude + De-Sloppify** — adicione `--review-prompt` com uma diretiva de de-sloppify a cada iteração.

3. **Qualquer loop + Verificação** — use o comando `/verify` do ECC ou a Skill `verification-loop` como um portão antes dos commits.

4. **Abordagem em camadas do Ralphinho em loops mais simples** — mesmo em um pipeline sequencial, você pode rotear tarefas simples para o Haiku e tarefas complexas para o Opus:
   ```bash
   # Correção simples de formatação
   claude -p --model haiku "Fix the import ordering in src/utils.ts"

   # Mudança de arquitetura complexa
   claude -p --model opus "Refactor the auth module to use the strategy pattern"
   ```

---

## Anti-Padrões

### Erros Comuns

1. **Loops infinitos sem condições de saída** — sempre tenha um max-runs, max-cost, max-duration ou sinal de conclusão.

2. **Sem ponte de contexto entre iterações** — cada chamada de `claude -p` começa do zero. Use `SHARED_TASK_NOTES.md` ou o estado do sistema de arquivos para preencher o contexto.

3. **Repetir a mesma falha** — se uma iteração falha, não apenas tente de novo. Capture o contexto do erro e alimente-o na próxima tentativa.

4. **Instruções negativas em vez de passagens de limpeza** — não diga "não faça X". Adicione uma passagem separada que remova X.

5. **Todos os agents em uma janela de contexto** — para workflows complexos, separe responsabilidades em diferentes processos de agent. O revisor nunca deve ser o autor.

6. **Ignorar a sobreposição de arquivos em trabalho paralelo** — se dois agents paralelos podem editar o mesmo arquivo, você precisa de uma estratégia de merge (integração sequencial, rebase ou resolução de conflitos).

---

## Referências

| Projeto | Autor | Link |
|---------|--------|------|
| Ralphinho | enitrat | crédito: @enitrat |
| Infinite Agentic Loop | disler | crédito: @disler |
| Continuous Claude | AnandChowdhary | crédito: @AnandChowdhary |
| NanoClaw | ECC | comando `/claw` neste repositório |
| Verification Loop | ECC | `skills/verification-loop/` neste repositório |
