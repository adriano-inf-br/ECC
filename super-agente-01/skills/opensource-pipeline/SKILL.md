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
Gere o empacotamento open-source para o projeto.

Projeto: {STAGING_PATH}
Licença: {chosen_license}
Nome do projeto: {PROJECT_NAME}
Descrição: {description}
Repositório no GitHub: {github_repo}

Gere:
1. CLAUDE.md (comandos, arquitetura, arquivos-chave)
2. setup.sh (bootstrap em um comando, torne-o executável)
3. README.md (ou aprimore o existente)
4. LICENSE
5. CONTRIBUTING.md
6. .github/ISSUE_TEMPLATE/ (bug_report.md, feature_request.md)
"""
)
```

#### Step 6: Revisão Final

Apresente ao usuário:
```
Fork Open-Source Pronto: {PROJECT_NAME}

Localização: {STAGING_PATH}
Licença: {license}
Arquivos gerados:
  - CLAUDE.md
  - setup.sh (executável)
  - README.md
  - LICENSE
  - CONTRIBUTING.md
  - .env.example ({N} variáveis)

Sanitização: {sanitization_verdict}

Próximos passos:
  1. Revise: cd {STAGING_PATH}
  2. Crie o repositório: gh repo create {github_org}/{github_repo} --public
  3. Push: git remote add origin ... && git push -u origin main

Prosseguir com a criação no GitHub? (sim/não/revisar primeiro)
```

#### Step 7: Publicar no GitHub (mediante aprovação do usuário)

```bash
cd "{STAGING_PATH}"
gh repo create "{github_org}/{github_repo}" --public --source=. --push --description "{description}"
```

---

### /opensource verify PROJECT

Roda o sanitizer de forma independente. Resolva o caminho: se PROJECT contiver `/`, trate como um caminho. Caso contrário, verifique `$HOME/opensource-staging/PROJECT`, depois `$HOME/PROJECT` e então o diretório atual.

```
Agent(
  subagent_type="opensource-sanitizer",
  prompt="Verifique a sanitização de: {resolved_path}. Rode todas as 6 categorias de varredura e gere SANITIZATION_REPORT.md."
)
```

---

### /opensource package PROJECT

Roda o packager de forma independente. Pergunte "Licença?" e "Descrição?", então:

```
Agent(
  subagent_type="opensource-packager",
  prompt="Empacote: {resolved_path} ..."
)
```

---

### /opensource list

```bash
ls -d $HOME/opensource-staging/*/
```

Mostre cada projeto com o progresso do pipeline (presença de FORK_REPORT.md, SANITIZATION_REPORT.md, CLAUDE.md).

---

### /opensource status PROJECT

```bash
cat $HOME/opensource-staging/${PROJECT}/SANITIZATION_REPORT.md
cat $HOME/opensource-staging/${PROJECT}/FORK_REPORT.md
```

## Layout de Staging

```
$HOME/opensource-staging/
  my-project/
    FORK_REPORT.md           # Do agent forker
    SANITIZATION_REPORT.md   # Do agent sanitizer
    CLAUDE.md                # Do agent packager
    setup.sh                 # Do agent packager
    README.md                # Do agent packager
    .env.example             # Do agent forker
    ...                      # Arquivos do projeto sanitizados
```

## Antipadrões

- **Nunca** faça push para o GitHub sem a aprovação do usuário
- **Nunca** pule o sanitizer — ele é o portão de segurança
- **Nunca** prossiga após um FAIL do sanitizer sem corrigir todos os achados críticos
- **Nunca** deixe `.env`, `*.pem` ou `credentials.json` no diretório de staging

## Boas Práticas

- Sempre rode o pipeline completo (fork → sanitize → package) para novos lançamentos
- O diretório de staging persiste até ser limpo explicitamente — use-o para revisão
- Rode o sanitizer novamente após quaisquer correções manuais antes de publicar
- Parametrize os segredos em vez de apagá-los — preserve a funcionalidade do projeto

## Skills Relacionadas

Veja `security-review` para os padrões de detecção de segredos usados pelo sanitizer.
