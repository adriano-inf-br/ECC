---
description: Code review — local uncommitted changes or GitHub PR (pass PR number/URL for PR mode)
argument-hint: [pr-number | pr-url | blank for local review]
---

# Revisão de código

> Modo de revisão de PR adaptado de PRPs-agentic-eng por Wirasm. Parte da série de fluxos de trabalho PRP.

**Entrada**: $ARGUMENTS

---

## Seleção de Modo

Se `$ARGUMENTS` contiver um número de PR, URL de PR ou `--pr`:
→ Vá para o **Modo de Revisão de PR** abaixo.

Caso contrário:
→ Use o **Modo de Revisão Local**.

---

## Modo de Revisão Local

Revisão abrangente de segurança e qualidade das mudanças não commitadas.

### Fase 1 — GATHER

```bash
git diff --name-only HEAD
```

Se não houver arquivos alterados, pare: "Nothing to review."

### Fase 2 — REVIEW

Leia cada arquivo alterado por completo. Verifique:

**Problemas de Segurança (CRITICAL):**
- Credenciais, chaves de API, tokens hardcoded
- Vulnerabilidades de injeção de SQL
- Vulnerabilidades de XSS
- Validação de entrada ausente
- Dependências inseguras
- Riscos de path traversal

**Qualidade de Código (HIGH):**
- Funções > 50 linhas
- Arquivos > 800 linhas
- Profundidade de aninhamento > 4 níveis
- Tratamento de erros ausente
- Instruções console.log
- Comentários TODO/FIXME
- JSDoc ausente para APIs públicas

**Boas Práticas (MEDIUM):**
- Padrões de mutação (use imutável no lugar)
- Uso de emoji em código/comentários
- Testes ausentes para código novo
- Problemas de acessibilidade (a11y)

### Fase 3 — REPORT

Gere um relatório com:
- Severidade: CRITICAL, HIGH, MEDIUM, LOW
- Localização do arquivo e números de linha
- Descrição do problema
- Correção sugerida

Bloqueie o commit se forem encontrados problemas CRITICAL ou HIGH.
Nunca aprove código com vulnerabilidades de segurança.

---

## Modo de Revisão de PR

Revisão abrangente de PR no GitHub — busca o diff, lê os arquivos completos, executa a validação e publica a revisão.

### Fase 1 — FETCH

Analise a entrada para determinar o PR:

| Entrada | Ação |
|---|---|
| Número (ex.: `42`) | Use como número do PR |
| URL (`github.com/.../pull/42`) | Extraia o número do PR |
| Nome do branch | Encontre o PR via `gh pr list --head <branch>` |

```bash
gh pr view <NUMBER> --json number,title,body,author,baseRefName,headRefName,changedFiles,additions,deletions
gh pr diff <NUMBER>
```

Se o PR não for encontrado, pare com erro. Armazene os metadados do PR para as fases seguintes.

### Fase 2 — CONTEXT

Construa o contexto da revisão:

1. **Regras do projeto** — Leia `CLAUDE.md`, `.claude/docs/` e quaisquer diretrizes de contribuição
2. **Artefatos de planejamento** — Verifique `.claude/prds/`, `.claude/plans/`, `.claude/reviews/` e os legados `.claude/PRPs/{prds,plans,reports,reviews}/` em busca de contexto relacionado a este PR
3. **Intenção do PR** — Analise a descrição do PR em busca de objetivos, issues vinculadas, planos de teste
4. **Arquivos alterados** — Liste todos os arquivos modificados e categorize por tipo (fonte, teste, config, docs)

### Fase 3 — REVIEW

Leia cada arquivo alterado **por completo** (não apenas os hunks do diff — você precisa do contexto ao redor).

Para revisões de PR, busque o conteúdo completo dos arquivos na revisão head do PR:
```bash
gh pr diff <NUMBER> --name-only | while IFS= read -r file; do
  gh api "repos/{owner}/{repo}/contents/$file?ref=<head-branch>" --jq '.content' | base64 -d
done
```

Aplique o checklist de revisão em 7 categorias:

| Categoria | O Que Verificar |
|---|---|
| **Correctness** | Erros de lógica, off-by-one, tratamento de null, casos extremos, condições de corrida |
| **Type Safety** | Incompatibilidades de tipo, casts inseguros, uso de `any`, generics ausentes |
| **Pattern Compliance** | Aderência às convenções do projeto (nomenclatura, estrutura de arquivos, tratamento de erros, imports) |
| **Security** | Injeção, falhas de autenticação, exposição de segredos, SSRF, path traversal, XSS |
| **Performance** | Queries N+1, índices ausentes, loops ilimitados, vazamentos de memória, payloads grandes |
| **Completeness** | Testes ausentes, tratamento de erros ausente, migrações incompletas, docs ausentes |
| **Maintainability** | Código morto, números mágicos, aninhamento profundo, nomenclatura obscura, tipos ausentes |

Atribua severidade a cada achado:

| Severidade | Significado | Ação |
|---|---|---|
| **CRITICAL** | Vulnerabilidade de segurança ou risco de perda de dados | Deve ser corrigido antes do merge |
| **HIGH** | Bug ou erro de lógica provável de causar problemas | Deveria ser corrigido antes do merge |
| **MEDIUM** | Problema de qualidade de código ou boa prática ausente | Correção recomendada |
| **LOW** | Detalhe de estilo ou sugestão menor | Opcional |

### Fase 4 — VALIDATE

Execute os comandos de validação disponíveis:

Detecte o tipo de projeto a partir dos arquivos de config (`package.json`, `Cargo.toml`, `go.mod`, `pyproject.toml`, etc.), depois execute os comandos apropriados:

**Node.js / TypeScript** (tem `package.json`):
```bash
npm run typecheck 2>/dev/null || npx tsc --noEmit 2>/dev/null  # Type check
npm run lint                                                    # Lint
npm test                                                        # Tests
npm run build                                                   # Build
```

**Rust** (tem `Cargo.toml`):
```bash
cargo clippy -- -D warnings  # Lint
cargo test                   # Tests
cargo build                  # Build
```

**Go** (tem `go.mod`):
```bash
go vet ./...    # Lint
go test ./...   # Tests
go build ./...  # Build
```

**Python** (tem `pyproject.toml` / `setup.py`):
```bash
pytest  # Tests
```

Execute apenas os comandos que se aplicam ao tipo de projeto detectado. Registre passou/falhou para cada um.

### Fase 5 — DECIDE

Forme a recomendação com base nos achados:

| Condição | Decisão |
|---|---|
| Zero problemas CRITICAL/HIGH, validação passa | **APPROVE** |
| Apenas problemas MEDIUM/LOW, validação passa | **APPROVE** com comentários |
| Qualquer problema HIGH ou falhas de validação | **REQUEST CHANGES** |
| Qualquer problema CRITICAL | **BLOCK** — deve ser corrigido antes do merge |

Casos especiais:
- PR em rascunho (draft) → Sempre use **COMMENT** (não approve/block)
- Apenas mudanças de docs/config → Revisão mais leve, foco na correção
- Flag explícita `--approve` ou `--request-changes` → Sobrepõe a decisão (mas ainda reporte todos os achados)

### Fase 6 — REPORT

Crie o artefato de revisão em `.claude/reviews/pr-<NUMBER>-review.md`, a menos que o repositório já use o legado `.claude/PRPs/reviews/` para este fluxo de trabalho:

```markdown
# PR Review: #<NUMBER> — <TITLE>

**Reviewed**: <date>
**Author**: <author>
**Branch**: <head> → <base>
**Decision**: APPROVE | REQUEST CHANGES | BLOCK

## Summary
<1-2 sentence overall assessment>

## Findings

### CRITICAL
<findings or "None">

### HIGH
<findings or "None">

### MEDIUM
<findings or "None">

### LOW
<findings or "None">

## Validation Results

| Check | Result |
|---|---|
| Type check | Pass / Fail / Skipped |
| Lint | Pass / Fail / Skipped |
| Tests | Pass / Fail / Skipped |
| Build | Pass / Fail / Skipped |

## Files Reviewed
<list of files with change type: Added/Modified/Deleted>
```

### Fase 7 — PUBLISH

Publique a revisão no GitHub:

```bash
# If APPROVE
gh pr review <NUMBER> --approve --body "<summary of review>"

# If REQUEST CHANGES
gh pr review <NUMBER> --request-changes --body "<summary with required fixes>"

# If COMMENT only (draft PR or informational)
gh pr review <NUMBER> --comment --body "<summary>"
```

Para comentários inline em linhas específicas, use a API de comentários de revisão do GitHub:
```bash
gh api "repos/{owner}/{repo}/pulls/<NUMBER>/comments" \
  -f body="<comment>" \
  -f path="<file>" \
  -F line=<line-number> \
  -f side="RIGHT" \
  -f commit_id="$(gh pr view <NUMBER> --json headRefOid --jq .headRefOid)"
```

Como alternativa, publique uma única revisão com vários comentários inline de uma só vez:
```bash
gh api "repos/{owner}/{repo}/pulls/<NUMBER>/reviews" \
  -f event="COMMENT" \
  -f body="<overall summary>" \
  --input comments.json  # [{"path": "file", "line": N, "body": "comment"}, ...]
```

### Fase 8 — OUTPUT

Reporte ao usuário:

```
PR #<NUMBER>: <TITLE>
Decision: <APPROVE|REQUEST_CHANGES|BLOCK>

Issues: <critical_count> critical, <high_count> high, <medium_count> medium, <low_count> low
Validation: <pass_count>/<total_count> checks passed

Artifacts:
  Review: .claude/reviews/pr-<NUMBER>-review.md
  GitHub: <PR URL>

Next steps:
  - <contextual suggestions based on decision>
```

---

## Casos Especiais

- **Sem o CLI `gh`**: Recorra à revisão apenas local (leia o diff, pule a publicação no GitHub). Avise o usuário.
- **Branches divergentes**: Sugira `git fetch origin && git rebase origin/<base>` antes da revisão.
- **PRs grandes (>50 arquivos)**: Avise sobre o escopo da revisão. Foque primeiro nas mudanças de fonte, depois nos testes, depois em config/docs.
