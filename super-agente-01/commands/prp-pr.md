---
description: "Cria um PR no GitHub a partir do branch atual com commits não enviados — descobre templates, analisa mudanças, faz push"
argument-hint: "[base-branch] (default: main)"
---

# Criar Pull Request

> Adaptado de PRPs-agentic-eng por Wirasm. Parte da série de fluxo de trabalho PRP.

**Entrada**: `$ARGUMENTS` — opcional, pode conter o nome de um branch base e/ou flags (ex.: `--draft`).

**Parse de `$ARGUMENTS`**:
- Extraia quaisquer flags reconhecidas (`--draft`)
- Trate o texto restante (não-flag) como o nome do branch base
- Use `main` como branch base padrão se nenhum for especificado

---

## Fase 1 — VALIDATE

Verifique as precondições:

```bash
git branch --show-current
git status --short
git log origin/<base>..HEAD --oneline
```

| Verificação | Condição | Ação se Falhar |
|---|---|---|
| Não está no branch base | Branch atual ≠ base | Pare: "Switch to a feature branch first." |
| Diretório de trabalho limpo | Sem mudanças não commitadas | Avise: "You have uncommitted changes. Commit or stash first. Use `/prp-commit` to commit." |
| Tem commits à frente | `git log origin/<base>..HEAD` não vazio | Pare: "No commits ahead of `<base>`. Nothing to PR." |
| Sem PR existente | `gh pr list --head <branch> --json number` está vazio | Pare: "PR already exists: #<number>. Use `gh pr view <number> --web` to open it." |

Se todas as verificações passarem, prossiga.

---

## Fase 2 — DISCOVER

### Template de PR

Busque o template de PR nesta ordem:

1. diretório `.github/PULL_REQUEST_TEMPLATE/` — se existir, liste os arquivos e deixe o usuário escolher (ou use `default.md`)
2. `.github/PULL_REQUEST_TEMPLATE.md`
3. `.github/pull_request_template.md`
4. `docs/pull_request_template.md`

Se encontrado, leia-o e use sua estrutura para o corpo do PR.

### Análise de Commits

```bash
git log origin/<base>..HEAD --format="%h %s" --reverse
```

Analise os commits para determinar:
- **Título do PR**: Use o formato conventional commit com prefixo de tipo — `feat: ...`, `fix: ...`, etc.
  - Se houver múltiplos tipos, use o dominante
  - Se for um único commit, use sua mensagem como está
- **Resumo das mudanças**: Agrupe os commits por tipo/área

### Análise de Arquivos

```bash
git diff origin/<base>..HEAD --stat
git diff origin/<base>..HEAD --name-only
```

Categorize os arquivos alterados: source, tests, docs, config, migrations.

### Artefatos PRP

Verifique se há artefatos PRP relacionados:
- `.claude/PRPs/reports/` — Relatórios de implementação
- `.claude/PRPs/plans/` — Planos que foram executados
- `.claude/PRPs/prds/` — PRDs relacionados

Referencie-os no corpo do PR se existirem.

---

## Fase 3 — PUSH

```bash
git push -u origin HEAD
```

Se o push falhar por divergência:
```bash
git fetch origin
git rebase origin/<base>
git push -u origin HEAD
```

Se ocorrerem conflitos de rebase, pare e informe o usuário.

---

## Fase 4 — CREATE

### Com Template

Se um template de PR foi encontrado na Fase 2, preencha cada seção usando a análise de commits e arquivos. Preserve todas as seções do template — deixe as seções como "N/A" se não forem aplicáveis, em vez de removê-las.

### Sem Template

Use este formato padrão:

```markdown
## Summary

<1-2 sentence description of what this PR does and why>

## Changes

<bulleted list of changes grouped by area>

## Files Changed

<table or list of changed files with change type: Added/Modified/Deleted>

## Testing

<description of how changes were tested, or "Needs testing">

## Related Issues

<linked issues with Closes/Fixes/Relates to #N, or "None">
```

### Criar o PR

```bash
gh pr create \
  --title "<PR title>" \
  --base <base-branch> \
  --body "<PR body>"
  # Add --draft if the --draft flag was parsed from $ARGUMENTS
```

---

## Fase 5 — VERIFY

```bash
gh pr view --json number,url,title,state,baseRefName,headRefName,additions,deletions,changedFiles
gh pr checks --json name,status,conclusion 2>/dev/null || true
```

---

## Fase 6 — OUTPUT

Reporte ao usuário:

```
PR #<number>: <title>
URL: <url>
Branch: <head> → <base>
Changes: +<additions> -<deletions> across <changedFiles> files

CI Checks: <status summary or "pending" or "none configured">

Artifacts referenced:
  - <any PRP reports/plans linked in PR body>

Next steps:
  - gh pr view <number> --web   → open in browser
  - /code-review <number>       → review the PR
  - gh pr merge <number>        → merge when ready
```

---

## Casos Extremos

- **Sem CLI `gh`**: Pare com: "GitHub CLI (`gh`) is required. Install: <https://cli.github.com/>"
- **Não autenticado**: Pare com: "Run `gh auth login` first."
- **Force push necessário**: Se o remoto divergiu e o rebase foi feito, use `git push --force-with-lease` (nunca `--force`).
- **Múltiplos templates de PR**: Se `.github/PULL_REQUEST_TEMPLATE/` tiver múltiplos arquivos, liste-os e peça ao usuário para escolher.
- **PR grande (>20 arquivos)**: Avise sobre o tamanho do PR. Sugira dividir se as mudanças forem logicamente separáveis.
