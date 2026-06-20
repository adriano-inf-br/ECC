---
description: Executa um loop de build gerador/avaliador para tarefas de implementação com iterações limitadas e pontuação.
---

Extraia o seguinte de $ARGUMENTS:
1. `brief` — a descrição em uma linha do usuário sobre o que construir
2. `--max-iterations N` — (opcional, padrão 15) máximo de ciclos gerador-avaliador
3. `--pass-threshold N` — (opcional, padrão 7.0) pontuação ponderada para aprovar
4. `--skip-planner` — (opcional) pula o planner, assume que spec.md já existe
5. `--eval-mode MODE` — (opcional, padrão "playwright") um de: playwright, screenshot, code-only

## Build de Harness no Estilo GAN

Este comando orquestra um loop de build de três agents inspirado no artigo de design de harness da Anthropic de março de 2026.

### Fase 0: Setup
1. Criar o diretório `gan-harness/` na raiz do projeto
2. Criar subdiretórios: `gan-harness/feedback/`, `gan-harness/screenshots/`
3. Inicializar o git se ainda não estiver inicializado
4. Registrar o horário de início e a configuração

### Fase 1: Planejamento (Agent Planner)
A menos que `--skip-planner` esteja definido:
1. Lançar o agent `gan-planner` via Task tool com o brief do usuário
2. Aguardar até que ele produza `gan-harness/spec.md` e `gan-harness/eval-rubric.md`
3. Exibir o resumo da spec para o usuário
4. Prosseguir para a Fase 2

### Fase 2: Loop Gerador-Avaliador
```
iteration = 1
while iteration <= max_iterations:

    # GENERATE
    Launch gan-generator agent via Task tool:
    - Read spec.md
    - If iteration > 1: read feedback/feedback-{iteration-1}.md
    - Build/improve the application
    - Ensure dev server is running
    - Commit changes

    # Wait for generator to finish

    # EVALUATE
    Launch gan-evaluator agent via Task tool:
    - Read eval-rubric.md and spec.md
    - Test the live application (mode: playwright/screenshot/code-only)
    - Score against rubric
    - Write feedback to feedback/feedback-{iteration}.md

    # Wait for evaluator to finish

    # CHECK SCORE
    Read feedback/feedback-{iteration}.md
    Extract weighted total score

    if score >= pass_threshold:
        Log "PASSED at iteration {iteration} with score {score}"
        Break

    if iteration >= 3 and score has not improved in last 2 iterations:
        Log "PLATEAU detected — stopping early"
        Break

    iteration += 1
```

### Fase 3: Resumo
1. Ler todos os arquivos de feedback
2. Exibir as pontuações finais e o histórico de iterações
3. Mostrar a progressão de pontuação: `iteration 1: 4.2 → iteration 2: 5.8 → ... → iteration N: 7.5`
4. Listar quaisquer questões restantes da avaliação final
5. Reportar o tempo total e o custo estimado

### Saída

```markdown
## GAN Harness Build Report

**Brief:** [original prompt]
**Result:** PASS/FAIL
**Iterations:** N / max
**Final Score:** X.X / 10

### Score Progression
| Iter | Design | Originality | Craft | Functionality | Total |
|------|--------|-------------|-------|---------------|-------|
| 1 | ... | ... | ... | ... | X.X |
| 2 | ... | ... | ... | ... | X.X |
| N | ... | ... | ... | ... | X.X |

### Remaining Issues
- [Any issues from final evaluation]

### Files Created
- gan-harness/spec.md
- gan-harness/eval-rubric.md
- gan-harness/feedback/feedback-001.md through feedback-NNN.md
- gan-harness/generator-state.md
- gan-harness/build-report.md
```

Escreva o relatório completo em `gan-harness/build-report.md`.
