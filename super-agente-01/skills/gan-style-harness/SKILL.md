---
name: gan-style-harness
description: "Harness de agente Gerador-Avaliador inspirado em GAN para construir aplicações de alta qualidade de forma autônoma. Baseado no artigo de design de harness da Anthropic de março de 2026."
metadata:
  origin: ECC-community
tools: Read, Write, Edit, Bash, Grep, Glob, Task
---

# Skill de Harness Estilo GAN

> Inspirado em [Harness Design for Long-Running Application Development da Anthropic](https://www.anthropic.com/engineering/harness-design-long-running-apps) (24 de março de 2026)

Um harness multiagente que separa **geração** de **avaliação**, criando um ciclo de feedback adversarial que eleva a qualidade muito além do que um único agente consegue alcançar.

## Insight Central

> Quando solicitados a avaliar o próprio trabalho, os agents são otimistas patológicos — elogiam saídas medíocres e se convencem a ignorar problemas legítimos. Mas projetar um **avaliador separado** para ser implacavelmente rigoroso é muito mais viável do que ensinar um gerador a se autocriticar.

Essa é a mesma dinâmica das GANs (Redes Adversariais Generativas): o Gerador produz, o Avaliador critica, e esse feedback impulsiona a próxima iteração.

## Quando Usar

- Construir aplicações completas a partir de um prompt de uma linha
- Tarefas de design frontend que exigem alta qualidade visual
- Projetos full-stack que precisam de funcionalidades funcionando, não apenas código
- Qualquer tarefa em que a estética de "AI slop" seja inaceitável
- Projetos em que você queira investir US$ 50-200 para uma saída de qualidade de produção

## Quando NÃO Usar

- Correções rápidas de arquivo único (use o padrão `claude -p`)
- Tarefas com restrições orçamentárias apertadas (<US$ 10)
- Refatoração simples (use o padrão de-sloppify em vez disso)
- Tarefas já bem especificadas com testes (use o fluxo de trabalho TDD)

## Arquitetura

```
                    ┌─────────────┐
                    │   PLANNER   │
                    │  (Opus 4.6) │
                    └──────┬──────┘
                           │ Product Spec
                           │ (features, sprints, design direction)
                           ▼
              ┌────────────────────────┐
              │                        │
              │   GENERATOR-EVALUATOR  │
              │      FEEDBACK LOOP     │
              │                        │
              │  ┌──────────┐          │
              │  │GENERATOR │--build-->│──┐
              │  │(Opus 4.6)│          │  │
              │  └────▲─────┘          │  │
              │       │                │  │ live app
              │    feedback             │  │
              │       │                │  │
              │  ┌────┴─────┐          │  │
              │  │EVALUATOR │<-test----│──┘
              │  │(Opus 4.6)│          │
              │  │+Playwright│         │
              │  └──────────┘          │
              │                        │
              │   5-15 iterations      │
              └────────────────────────┘
```

## Os Três Agents

### 1. Agent Planner

**Papel:** Gerente de produto — expande um prompt breve em uma especificação completa de produto.

**Comportamentos-chave:**
- Recebe um prompt de uma linha e produz uma especificação de 16 features, com múltiplos sprints
- Define histórias de usuário, requisitos técnicos e direção de design visual
- É deliberadamente **ambicioso** — planejamento conservador leva a resultados decepcionantes
- Produz critérios de avaliação que o Avaliador usará posteriormente

**Modelo:** Opus 4.6 (precisa de raciocínio profundo para expansão da especificação)

### 2. Agent Generator

**Papel:** Desenvolvedor — implementa features de acordo com a especificação.

**Comportamentos-chave:**
- Trabalha em sprints estruturados (ou em modo contínuo com modelos mais novos)
- Negocia um "contrato de sprint" com o Avaliador antes de escrever código
- Usa ferramentas full-stack: React, FastAPI/Express, bancos de dados, CSS
- Gerencia o git para controle de versão entre iterações
- Lê o feedback do Avaliador e o incorpora na próxima iteração

**Modelo:** Opus 4.6 (precisa de forte capacidade de codificação)

### 3. Agent Evaluator

**Papel:** Engenheiro de QA — testa a aplicação rodando ao vivo, não apenas o código.

**Comportamentos-chave:**
- Usa **Playwright MCP** para interagir com a aplicação ao vivo
- Clica pelas features, preenche formulários, testa endpoints de API
- Pontua segundo quatro critérios (configuráveis):
  1. **Qualidade de Design** — Parece um todo coerente?
  2. **Originalidade** — Decisões personalizadas vs. padrões de template/IA?
  3. **Acabamento** — Tipografia, espaçamento, animações, microinterações?
  4. **Funcionalidade** — Todas as features realmente funcionam?
- Retorna feedback estruturado com pontuações e problemas específicos
- É projetado para ser **implacavelmente rigoroso** — nunca elogia trabalho medíocre

**Modelo:** Opus 4.6 (precisa de forte julgamento + uso de ferramentas)

## Critérios de Avaliação

Os quatro critérios padrão, cada um pontuado de 1 a 10:

```markdown
## Evaluation Rubric

### Design Quality (weight: 0.3)
- 1-3: Generic, template-like, "AI slop" aesthetics
- 4-6: Competent but unremarkable, follows conventions
- 7-8: Distinctive, cohesive visual identity
- 9-10: Could pass for a professional designer's work

### Originality (weight: 0.2)
- 1-3: Default colors, stock layouts, no personality
- 4-6: Some custom choices, mostly standard patterns
- 7-8: Clear creative vision, unique approach
- 9-10: Surprising, delightful, genuinely novel

### Craft (weight: 0.3)
- 1-3: Broken layouts, missing states, no animations
- 4-6: Works but feels rough, inconsistent spacing
- 7-8: Polished, smooth transitions, responsive
- 9-10: Pixel-perfect, delightful micro-interactions

### Functionality (weight: 0.2)
- 1-3: Core features broken or missing
- 4-6: Happy path works, edge cases fail
- 7-8: All features work, good error handling
- 9-10: Bulletproof, handles every edge case
```

### Pontuação

- **Pontuação ponderada** = soma de (pontuação_do_critério * peso)
- **Limiar de aprovação** = 7.0 (configurável)
- **Máximo de iterações** = 15 (configurável, normalmente 5-15 são suficientes)

## Uso

### Via Comando

```bash
# Full three-agent harness
/project:gan-build "Build a project management app with Kanban boards, team collaboration, and dark mode"

# With custom config
/project:gan-build "Build a recipe sharing platform" --max-iterations 10 --pass-threshold 7.5

# Frontend design mode (generator + evaluator only, no planner)
/project:gan-design "Create a landing page for a crypto portfolio tracker"
```

### Via Script de Shell

```bash
# Basic usage
./scripts/gan-harness.sh "Build a music streaming dashboard"

# With options
GAN_MAX_ITERATIONS=10 \
GAN_PASS_THRESHOLD=7.5 \
GAN_EVAL_CRITERIA="functionality,performance,security" \
./scripts/gan-harness.sh "Build a REST API for task management"
```

### Via Claude Code (Manual)

```bash
# Step 1: Plan
claude -p --model opus "You are a Product Planner. Read PLANNER_PROMPT.md. Expand this brief into a full product spec: 'Build a Kanban board app'. Write spec to spec.md"

# Step 2: Generate (iteration 1)
claude -p --model opus "You are a Generator. Read spec.md. Implement Sprint 1. Start the dev server on port 3000."

# Step 3: Evaluate (iteration 1)
claude -p --model opus --allowedTools "Read,Bash,mcp__playwright__*" "You are an Evaluator. Read EVALUATOR_PROMPT.md. Test the live app at http://localhost:3000. Score against the rubric. Write feedback to feedback-001.md"

# Step 4: Generate (iteration 2 — reads feedback)
claude -p --model opus "You are a Generator. Read spec.md and feedback-001.md. Address all issues. Improve the scores."

# Repeat steps 3-4 until pass threshold met
```

## Evolução Conforme as Capacidades do Modelo

O harness deve simplificar à medida que os modelos melhoram. Seguindo a evolução da Anthropic:

### Estágio 1 — Modelos Mais Fracos (classe Sonnet)
- Decomposição completa em sprints obrigatória
- Resets de contexto entre sprints (evitar ansiedade de contexto)
- Mínimo de 2 agents: Initializer + Coding Agent
- Andaime pesado compensa as limitações do modelo

### Estágio 2 — Modelos Capazes (classe Opus 4.5)
- Harness completo de 3 agents: Planner + Generator + Evaluator
- Contratos de sprint antes de cada fase de implementação
- Decomposição em 10 sprints para apps complexos
- Resets de contexto ainda úteis, mas menos críticos

### Estágio 3 — Modelos de Fronteira (classe Opus 4.6)
- Harness simplificado: passe único de planejamento, geração contínua
- Avaliação reduzida a um único passe final (o modelo é mais inteligente)
- Nenhuma estrutura de sprint necessária
- A compactação automática lida com o crescimento do contexto

> **Princípio-chave:** Todo componente do harness codifica uma suposição sobre o que o modelo não consegue fazer sozinho. Quando os modelos melhoram, reteste essas suposições. Remova o que não é mais necessário.

## Configuração

### Variáveis de Ambiente

| Variável | Padrão | Descrição |
|----------|---------|-------------|
| `GAN_MAX_ITERATIONS` | `15` | Máximo de ciclos gerador-avaliador |
| `GAN_PASS_THRESHOLD` | `7.0` | Pontuação ponderada para aprovar (1-10) |
| `GAN_PLANNER_MODEL` | `opus` | Modelo para o agent de planejamento |
| `GAN_GENERATOR_MODEL` | `opus` | Modelo para o agent gerador |
| `GAN_EVALUATOR_MODEL` | `opus` | Modelo para o agent avaliador |
| `GAN_EVAL_CRITERIA` | `design,originality,craft,functionality` | Critérios separados por vírgula |
| `GAN_DEV_SERVER_PORT` | `3000` | Porta para o app ao vivo |
| `GAN_DEV_SERVER_CMD` | `npm run dev` | Comando para iniciar o dev server |
| `GAN_PROJECT_DIR` | `.` | Diretório de trabalho do projeto |
| `GAN_SKIP_PLANNER` | `false` | Pular o planner, usar a especificação diretamente |
| `GAN_EVAL_MODE` | `playwright` | `playwright`, `screenshot` ou `code-only` |

### Modos de Avaliação

| Modo | Ferramentas | Melhor Para |
|------|-------|----------|
| `playwright` | Browser MCP + interação ao vivo | Apps full-stack com UI |
| `screenshot` | Screenshot + análise visual | Sites estáticos, apenas design |
| `code-only` | Testes + lint + build | APIs, bibliotecas, ferramentas CLI |

## Anti-Padrões

1. **Avaliador leniente demais** — Se o avaliador aprovar tudo na iteração 1, sua rubrica é generosa demais. Aperte os critérios de pontuação e adicione penalidades explícitas para padrões comuns de IA.

2. **Gerador ignorando feedback** — Garanta que o feedback seja passado como arquivo, não inline. O gerador deve ler `feedback-NNN.md` no início de cada iteração.

3. **Loops infinitos** — Sempre defina `GAN_MAX_ITERATIONS`. Se o gerador não conseguir melhorar além de um platô de pontuação após 3 iterações, pare e sinalize para revisão humana.

4. **Avaliador testando superficialmente** — O avaliador deve usar o Playwright para **interagir** com o app ao vivo, não apenas tirar screenshot. Clique em botões, preencha formulários, teste estados de erro.

5. **Avaliador elogiando as próprias correções** — Nunca deixe o avaliador sugerir correções e depois avaliar essas correções. O avaliador apenas critica; o gerador corrige.

6. **Esgotamento de contexto** — Para sessões longas, use a compactação automática do Claude Agent SDK ou reset o contexto entre fases principais.

## Resultados: O Que Esperar

Com base nos resultados publicados pela Anthropic:

| Métrica | Agente Solo | Harness GAN | Melhoria |
|--------|-----------|-------------|-------------|
| Tempo | 20 min | 4-6 horas | 12-18x mais longo |
| Custo | US$ 9 | US$ 125-200 | 14-22x mais |
| Qualidade | Mal funcional | Pronto para produção | Mudança de fase |
| Features centrais | Quebradas | Todas funcionando | N/A |
| Design | AI slop genérico | Distinto, polido | N/A |

**O trade-off é claro:** ~20x mais tempo e custo para um salto qualitativo na qualidade da saída. Isso vale para projetos em que a qualidade importa.

## Referências

- [Anthropic: Harness Design for Long-Running Apps](https://www.anthropic.com/engineering/harness-design-long-running-apps) — Artigo original de Prithvi Rajasekaran
- [Epsilla: The GAN-Style Agent Loop](https://www.epsilla.com/blogs/anthropic-harness-engineering-multi-agent-gan-architecture) — Desconstrução da arquitetura
- [Martin Fowler: Harness Engineering](https://martinfowler.com/articles/exploring-gen-ai/harness-engineering.html) — Contexto mais amplo da indústria
- [OpenAI: Harness Engineering](https://openai.com/index/harness-engineering/) — Trabalho paralelo da OpenAI
