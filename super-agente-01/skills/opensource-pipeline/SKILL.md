---
name: opensource-pipeline
description: "Open-source pipeline: fork, sanitize, and package private projects for safe public release. Chains 3 agents (forker, sanitizer, packager). Triggers: '/opensource', 'open source this', 'make this public', 'prepare for open source'."
metadata:
  origin: ECC
---

# Skill de Pipeline Open-Source

Torne qualquer projeto open-source com segurança por meio de um pipeline de 3 estágios: **Fork** (remover segredos) → **Sanitize** (verificar limpeza) → **Package** (CLAUDE.md + setup.sh + README).

## Quando Ativar

- O usuário diz "open source this project" ou "make this public"
- O usuário quer preparar um repositório privado para lançamento público
- O usuário precisa remover segredos antes de fazer push para o GitHub
- O usuário invoca `/opensource fork`, `/opensource verify` ou `/opensource package`

## Comandos

| Comando | Ação |
|---------|--------|
| `/opensource fork PROJECT` | Pipeline completo: fork + sanitize + package |
| `/opensource verify PROJECT` | Roda o sanitizer em um repositório existente |
| `/opensource package PROJECT` | Gera CLAUDE.md + setup.sh + README |
| `/opensource list` | Lista todos os projetos em staging |
| `/opensource status PROJECT` | Mostra os relatórios de um projeto em staging |

## Protocolo

### /opensource fork PROJECT

**Pipeline completo — o fluxo de trabalho principal.**

#### Step 1: Coletar Parâmetros

Resolva o caminho do projeto. Se PROJECT contiver `/`, trate como um caminho (absoluto ou relativo). Caso contrário, verifique: diretório de trabalho atual, `$HOME/PROJECT` e então pergunte ao usuário.

```
SOURCE_PATH="<resolved absolute path>"
STAGING_PATH="$HOME/opensource-staging/${PROJECT_NAME}"
```

Pergunte ao usuário:
1. "Qual projeto?" (se não for encontrado)
2. "Licença? (MIT / Apache-2.0 / GPL-3.0 / BSD-3-Clause)"
3. "Organização ou usuário do GitHub?" (padrão: detectar via `gh api user -q .login`)
4. "Nome do repositório no GitHub?" (padrão: nome do projeto)
5. "Descrição para o README?" (analise o projeto para sugerir)

#### Step 2: Criar Diretório de Staging

```bash
mkdir -p $HOME/opensource-staging/
```

#### Step 3: Rodar o Agent Forker

Inicie o agent `opensource-forker`:

```
Agent(
  description="Fork {PROJECT} for open-source",
  subagent_type="opensource-forker",
  prompt="""
Faça o fork do projeto para lançamento open-source.

Origem: {SOURCE_PATH}
Destino: {STAGING_PATH}
Licença: {chosen_license}

Siga o protocolo completo de forking:
1. Copie os arquivos (exclua .git, node_modules, __pycache__, .venv)
2. Remova todos os segredos e credenciais
3. Substitua referências internas por placeholders
4. Gere .env.example
5. Limpe o histórico do git
6. Gere FORK_REPORT.md em {STAGING_PATH}/FORK_REPORT.md
"""
)
```

Aguarde a conclusão. Leia `{STAGING_PATH}/FORK_REPORT.md`.

#### Step 4: Rodar o Agent Sanitizer

Inicie o agent `opensource-sanitizer`:

```
Agent(
  description="Verify {PROJECT} sanitization",
  subagent_type="opensource-sanitizer",
  prompt="""
Verifique a sanitização do fork open-source.

Projeto: {STAGING_PATH}
Origem (para referência): {SOURCE_PATH}

Rode TODAS as categorias de varredura:
1. Varredura de segredos (CRITICAL)
2. Varredura de PII (CRITICAL)
3. Varredura de referências internas (CRITICAL)
4. Verificação de arquivos perigosos (CRITICAL)
5. Completude da configuração (WARNING)
6. Auditoria do histórico do git

Gere SANITIZATION_REPORT.md dentro de {STAGING_PATH}/ com veredito PASS/FAIL.
"""
)
```

Aguarde a conclusão. Leia `{STAGING_PATH}/SANITIZATION_REPORT.md`.

**Se FAIL:** Mostre os achados ao usuário. Pergunte: "Corrigir estes e revarrer, ou abortar?"
- Se corrigir: Aplique as correções, rode o sanitizer novamente (no máximo 3 tentativas — após 3 FAILs, apresente todos os achados e peça ao usuário para corrigir manualmente)
- Se abortar: Limpe o diretório de staging

**Se PASS ou PASS WITH WARNINGS:** Continue para o Step 5.

#### Step 5: Rodar o Agent Packager

Inicie o agent `opensource-packager`:

```
Agent(
  description="Package {PROJECT} for open-source",
  subagent_type="opensource-packager",
  prompt="""
Generate open-source packaging for project.

Project: {STAGING_PATH}
License: {chosen_license}
Project name: {PROJECT_NAME}
Description: {description}
GitHub repo: {github_repo}

Generate:
1. CLAUDE.md (commands, architecture, key files)
2. setup.sh (one-command bootstrap, make executable)
3. README.md (or enhance existing)
4. LICENSE
5. CONTRIBUTING.md
6. .github/ISSUE_TEMPLATE/ (bug_report.md, feature_request.md)
"""
)
```

#### Step 6: Final Review

Present to user:
```
Open-Source Fork Ready: {PROJECT_NAME}

Location: {STAGING_PATH}
License: {license}
Files generated:
  - CLAUDE.md
  - setup.sh (executable)
  - README.md
  - LICENSE
  - CONTRIBUTING.md
  - .env.example ({N} variables)

Sanitization: {sanitization_verdict}

Next steps:
  1. Review: cd {STAGING_PATH}
  2. Create repo: gh repo create {github_org}/{github_repo} --public
  3. Push: git remote add origin ... && git push -u origin main

Proceed with GitHub creation? (yes/no/review first)
```

#### Step 7: GitHub Publish (on user approval)

```bash
cd "{STAGING_PATH}"
gh repo create "{github_org}/{github_repo}" --public --source=. --push --description "{description}"
```

---

### /opensource verify PROJECT

Run sanitizer independently. Resolve path: if PROJECT contains `/`, treat as a path. Otherwise check `$HOME/opensource-staging/PROJECT`, then `$HOME/PROJECT`, then current directory.

```
Agent(
  subagent_type="opensource-sanitizer",
  prompt="Verify sanitization of: {resolved_path}. Run all 6 scan categories and generate SANITIZATION_REPORT.md."
)
```

---

### /opensource package PROJECT

Run packager independently. Ask for "License?" and "Description?", then:

```
Agent(
  subagent_type="opensource-packager",
  prompt="Package: {resolved_path} ..."
)
```

---

### /opensource list

```bash
ls -d $HOME/opensource-staging/*/
```

Show each project with pipeline progress (FORK_REPORT.md, SANITIZATION_REPORT.md, CLAUDE.md presence).

---

### /opensource status PROJECT

```bash
cat $HOME/opensource-staging/${PROJECT}/SANITIZATION_REPORT.md
cat $HOME/opensource-staging/${PROJECT}/FORK_REPORT.md
```

## Staging Layout

```
$HOME/opensource-staging/
  my-project/
    FORK_REPORT.md           # From forker agent
    SANITIZATION_REPORT.md   # From sanitizer agent
    CLAUDE.md                # From packager agent
    setup.sh                 # From packager agent
    README.md                # From packager agent
    .env.example             # From forker agent
    ...                      # Sanitized project files
```

## Anti-Patterns

- **Never** push to GitHub without user approval
- **Never** skip the sanitizer — it is the safety gate
- **Never** proceed after a sanitizer FAIL without fixing all critical findings
- **Never** leave `.env`, `*.pem`, or `credentials.json` in the staging directory

## Best Practices

- Always run the full pipeline (fork → sanitize → package) for new releases
- The staging directory persists until explicitly cleaned up — use it for review
- Re-run the sanitizer after any manual fixes before publishing
- Parameterize secrets rather than deleting them — preserve project functionality

## Related Skills

See `security-review` for secret detection patterns used by the sanitizer.
