---
description: Executa um plano de implementação com loops de validação rigorosos
argument-hint: <path/to/plan.md>
---

> Adaptado de PRPs-agentic-eng por Wirasm. Parte da série de fluxo de trabalho PRP.

# PRP Implement

Executa um arquivo de plano passo a passo com validação contínua. Toda mudança é verificada imediatamente — nunca acumule estado quebrado.

**Filosofia central**: Loops de validação pegam erros cedo. Rode verificações após cada mudança. Corrija problemas imediatamente.

**Regra de ouro**: Se uma validação falhar, corrija-a antes de seguir adiante. Nunca acumule estado quebrado.

---

## Fase 0 — DETECT

### Detecção de Gerenciador de Pacotes

| Arquivo Existe | Gerenciador de Pacotes | Runner |
|---|---|---|
| `bun.lockb` | bun | `bun run` |
| `pnpm-lock.yaml` | pnpm | `pnpm run` |
| `yarn.lock` | yarn | `yarn` |
| `package-lock.json` | npm | `npm run` |
| `pyproject.toml` ou `requirements.txt` | uv / pip | `uv run` ou `python -m` |
| `Cargo.toml` | cargo | `cargo` |
| `go.mod` | go | `go` |

### Scripts de Validação

Verifique o `package.json` (ou equivalente) em busca de scripts disponíveis:

```bash
# For Node.js projects
cat package.json | grep -A 20 '"scripts"'
```

Anote os comandos disponíveis para: type-check, lint, test, build.

---

## Fase 1 — LOAD

Leia o arquivo de plano:

```bash
cat "$ARGUMENTS"
```

Extraia estas seções do plano:
- **Summary** — O que está sendo construído
- **Patterns to Mirror** — Convenções de código a seguir
- **Files to Change** — O que criar ou modificar
- **Step-by-Step Tasks** — Sequência de implementação
- **Validation Commands** — Como verificar a correção
- **Acceptance Criteria** — Definição de pronto

Se o arquivo não existir ou não for um plano válido:
```
Error: Plan file not found or invalid.
Run /prp-plan <feature-description> to create a plan first.
```

**CHECKPOINT**: Plano carregado. Todas as seções identificadas. Tarefas extraídas.

---

## Fase 2 — PREPARE

### Estado do Git

```bash
git branch --show-current
git status --porcelain
```

### Decisão de Branch

| Estado Atual | Ação |
|---|---|
| Em branch de feature | Usa o branch atual |
| Na main, working tree limpa | Cria branch de feature: `git checkout -b feat/{plan-name}` |
| Na main, working tree suja | **PARE** — Peça ao usuário para dar stash ou commitar primeiro |
| Em um git worktree desta feature | Usa o worktree |

### Sincronizar com o Remoto

```bash
git pull --rebase origin $(git branch --show-current) 2>/dev/null || true
```

**CHECKPOINT**: No branch correto. Working tree pronta. Remoto sincronizado.

---

## Fase 3 — EXECUTE

Processe cada tarefa do plano sequencialmente.

### Loop por Tarefa

Para cada tarefa em **Step-by-Step Tasks**:

1. **Leia a referência MIRROR** — Abra o arquivo de padrão referenciado no campo MIRROR da tarefa. Entenda a convenção antes de escrever código.

2. **Implemente** — Escreva o código seguindo o padrão exatamente. Aplique os avisos GOTCHA. Use os IMPORTS especificados.

3. **Valide imediatamente** — Após CADA mudança de arquivo:
   ```bash
   # Run type-check (adjust command per project)
   [type-check command from Phase 0]
   ```
   Se o type-check falhar → corrija o erro antes de passar para o próximo arquivo.

4. **Acompanhe o progresso** — Registre: `[done] Task N: [task name] — complete`

### Lidando com Desvios

Se a implementação precisar se desviar do plano:
- Anote **O QUE** mudou
- Anote **POR QUE** mudou
- Continue com a abordagem corrigida
- Esses desvios serão capturados no relatório

**CHECKPOINT**: Todas as tarefas executadas. Desvios registrados.

---

## Fase 4 — VALIDATE

Rode todos os níveis de validação do plano. Corrija os problemas em cada nível antes de prosseguir.

### Nível 1: Análise Estática

```bash
# Type checking — zero errors required
[project type-check command]

# Linting — fix automatically where possible
[project lint command]
[project lint-fix command]
```

Se restarem erros de lint após o auto-fix, corrija manualmente.

### Nível 2: Testes Unitários

Escreva testes para cada nova função (conforme especificado na Testing Strategy do plano).

```bash
[project test command for affected area]
```

- Cada função precisa de pelo menos um teste
- Cubra os edge cases listados no plano
- Se um teste falhar → corrija a implementação (não o teste, a menos que o teste esteja errado)

### Nível 3: Verificação de Build

```bash
[project build command]
```

O build deve ter sucesso com zero erros.

### Nível 4: Teste de Integração (se aplicável)

```bash
# Start server, run tests, stop server
[project dev server command] &
SERVER_PID=$!

# Wait for server to be ready (adjust port as needed)
SERVER_READY=0
for i in $(seq 1 30); do
  if curl -sf http://localhost:PORT/health >/dev/null 2>&1; then
    SERVER_READY=1
    break
  fi
  sleep 1
done

if [ "$SERVER_READY" -ne 1 ]; then
  kill "$SERVER_PID" 2>/dev/null || true
  echo "ERROR: Server failed to start within 30s" >&2
  exit 1
fi

[integration test command]
TEST_EXIT=$?

kill "$SERVER_PID" 2>/dev/null || true
wait "$SERVER_PID" 2>/dev/null || true

exit "$TEST_EXIT"
```

### Nível 5: Teste de Edge Cases

Percorra os edge cases do checklist da Testing Strategy do plano.

**CHECKPOINT**: Todos os 5 níveis de validação passam. Zero erros.

---

## Fase 5 — REPORT

### Criar Relatório de Implementação

```bash
mkdir -p .claude/PRPs/reports
```

Escreva o relatório em `.claude/PRPs/reports/{plan-name}-report.md`:

```markdown
# Implementation Report: [Feature Name]

## Summary
[What was implemented]

## Assessment vs Reality

| Metric | Predicted (Plan) | Actual |
|---|---|---|
| Complexity | [from plan] | [actual] |
| Confidence | [from plan] | [actual] |
| Files Changed | [from plan] | [actual count] |

## Tasks Completed

| # | Task | Status | Notes |
|---|---|---|---|
| 1 | [task name] | [done] Complete | |
| 2 | [task name] | [done] Complete | Deviated — [reason] |

## Validation Results

| Level | Status | Notes |
|---|---|---|
| Static Analysis | [done] Pass | |
| Unit Tests | [done] Pass | N tests written |
| Build | [done] Pass | |
| Integration | [done] Pass | or N/A |
| Edge Cases | [done] Pass | |

## Files Changed

| File | Action | Lines |
|---|---|---|
| `path/to/file` | CREATED | +N |
| `path/to/file` | UPDATED | +N / -M |

## Deviations from Plan
[List any deviations with WHAT and WHY, or "None"]

## Issues Encountered
[List any problems and how they were resolved, or "None"]

## Tests Written

| Test File | Tests | Coverage |
|---|---|---|
| `path/to/test` | N tests | [area covered] |

## Next Steps
- [ ] Code review via `/code-review`
- [ ] Create PR via `/prp-pr`
```

### Atualizar o PRD (se aplicável)

Se esta implementação foi para uma fase de PRD:
1. Atualize o status da fase de `in-progress` para `complete`
2. Adicione o caminho do relatório como referência

### Arquivar o Plano

```bash
mkdir -p .claude/PRPs/plans/completed
mv "$ARGUMENTS" .claude/PRPs/plans/completed/
```

**CHECKPOINT**: Relatório criado. PRD atualizado. Plano arquivado.

---

## Fase 6 — OUTPUT

Reporte ao usuário:

```
## Implementation Complete

- **Plan**: [plan file path] → archived to completed/
- **Branch**: [current branch name]
- **Status**: [done] All tasks complete

### Validation Summary

| Check | Status |
|---|---|
| Type Check | [done] |
| Lint | [done] |
| Tests | [done] (N written) |
| Build | [done] |
| Integration | [done] or N/A |

### Files Changed
- [N] files created, [M] files updated

### Deviations
[Summary or "None — implemented exactly as planned"]

### Artifacts
- Report: `.claude/PRPs/reports/{name}-report.md`
- Archived Plan: `.claude/PRPs/plans/completed/{name}.plan.md`

### PRD Progress (if applicable)
| Phase | Status |
|---|---|
| Phase 1 | [done] Complete |
| Phase 2 | [next] |
| ... | ... |

> Next step: Run `/prp-pr` to create a pull request, or `/code-review` to review changes first.
```

---

## Lidando com Falhas

### Type Check Falha
1. Leia a mensagem de erro com atenção
2. Corrija o erro de tipo no arquivo-fonte
3. Rode o type-check novamente
4. Continue apenas quando estiver limpo

### Testes Falham
1. Identifique se o bug está na implementação ou no teste
2. Corrija a causa raiz (geralmente a implementação)
3. Rode os testes novamente
4. Continue apenas quando estiverem verdes

### Lint Falha
1. Rode o auto-fix primeiro
2. Se restarem erros, corrija manualmente
3. Rode o lint novamente
4. Continue apenas quando estiver limpo

### Build Falha
1. Geralmente é um problema de tipo ou import — verifique a mensagem de erro
2. Corrija o arquivo problemático
3. Rode o build novamente
4. Continue apenas quando tiver sucesso

### Teste de Integração Falha
1. Verifique se o servidor iniciou corretamente
2. Verifique se o endpoint/rota existe
3. Verifique se o formato da requisição corresponde ao esperado
4. Corrija e rode novamente

---

## Critérios de Sucesso

- **TASKS_COMPLETE**: Todas as tarefas do plano executadas
- **TYPES_PASS**: Zero erros de tipo
- **LINT_PASS**: Zero erros de lint
- **TESTS_PASS**: Todos os testes verdes, novos testes escritos
- **BUILD_PASS**: O build tem sucesso
- **REPORT_CREATED**: Relatório de implementação salvo
- **PLAN_ARCHIVED**: Plano movido para `completed/`

---

## Próximos Passos

- Rode `/code-review` para revisar as mudanças antes de commitar
- Rode `/prp-commit` para commitar com uma mensagem descritiva
- Rode `/prp-pr` para criar um pull request
- Rode `/prp-plan <next-phase>` se o PRD tiver mais fases
