---
description: "Commit rápido com alvo de arquivos em linguagem natural — descreva o que commitar em português simples"
argument-hint: "[descrição do alvo] (vazio = todas as mudanças)"
---

# Smart Commit

> Adaptado de PRPs-agentic-eng por Wirasm. Parte da série de fluxo de trabalho PRP.

**Entrada**: $ARGUMENTS

---

## Fase 1 — ASSESS

```bash
git status --short
```

Se a saída estiver vazia → pare: "Nothing to commit."

Mostre ao usuário um resumo do que mudou (adicionado, modificado, excluído, untracked).

---

## Fase 2 — INTERPRET & STAGE

Interprete `$ARGUMENTS` para determinar o que colocar em stage:

| Entrada | Interpretação | Comando Git |
|---|---|---|
| *(em branco / vazio)* | Coloca tudo em stage | `git add -A` |
| `staged` | Usa o que já está em stage | *(sem git add)* |
| `*.ts` ou `*.py` etc. | Coloca em stage o glob correspondente | `git add '*.ts'` |
| `except tests` | Stage de tudo, depois remove os tests do stage | `git add -A && git reset -- '**/*.test.*' '**/*.spec.*' '**/test_*' 2>/dev/null \|\| true` |
| `only new files` | Coloca em stage apenas arquivos untracked | `git ls-files --others --exclude-standard \| grep . && git ls-files --others --exclude-standard \| xargs git add` |
| `the auth changes` | Interpreta a partir do status/diff — encontra arquivos relacionados a auth | `git add <matched files>` |
| Nomes de arquivo específicos | Coloca esses arquivos em stage | `git add <files>` |

Para entradas em linguagem natural (como "the auth changes"), cruze a saída de `git status` e o `git diff` para identificar os arquivos relevantes. Mostre ao usuário quais arquivos você está colocando em stage e por quê.

```bash
git add <determined files>
```

Após colocar em stage, verifique:
```bash
git diff --cached --stat
```

Se nada foi colocado em stage, pare: "No files matched your description."

---

## Fase 3 — COMMIT

Elabore uma mensagem de commit de linha única no modo imperativo:

```
{type}: {description}
```

Tipos:
- `feat` — Nova funcionalidade ou capacidade
- `fix` — Correção de bug
- `refactor` — Reestruturação de código sem mudança de comportamento
- `docs` — Mudanças de documentação
- `test` — Adição ou atualização de testes
- `chore` — Build, config, dependências
- `perf` — Melhoria de performance
- `ci` — Mudanças de CI/CD

Regras:
- Modo imperativo ("add feature" e não "added feature")
- Minúsculas após o prefixo de tipo
- Sem ponto no final
- Abaixo de 72 caracteres
- Descreva O QUE mudou, não COMO

```bash
git commit -m "{type}: {description}"
```

---

## Fase 4 — OUTPUT

Reporte ao usuário:

```
Committed: {hash_short}
Message:   {type}: {description}
Files:     {count} file(s) changed

Next steps:
  - git push           → push to remote
  - /prp-pr            → create a pull request
  - /code-review       → review before pushing
```

---

## Exemplos

| Você diz | O que acontece |
|---|---|
| `/prp-commit` | Coloca tudo em stage, gera a mensagem automaticamente |
| `/prp-commit staged` | Commita apenas o que já está em stage |
| `/prp-commit *.ts` | Coloca todos os arquivos TypeScript em stage e commita |
| `/prp-commit except tests` | Coloca tudo em stage exceto os arquivos de teste |
| `/prp-commit the database migration` | Encontra os arquivos de migração de DB pelo status, coloca-os em stage |
| `/prp-commit only new files` | Coloca em stage apenas arquivos untracked |
