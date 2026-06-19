---
name: git-workflow
description: Padrões de fluxo de trabalho Git incluindo estratégias de branching, convenções de Commit, merge vs rebase, resolução de conflitos e melhores práticas de desenvolvimento colaborativo para equipes de todos os tamanhos.
metadata:
  origin: ECC
---

# Padrões de Fluxo de Trabalho Git

Melhores práticas para controle de versão Git, estratégias de branching e desenvolvimento colaborativo.

## Quando Ativar

- Configurando fluxo de trabalho Git para um novo projeto
- Decidindo sobre estratégia de branching (GitFlow, trunk-based, GitHub flow)
- Escrevendo mensagens de Commit e descrições de PR
- Resolvendo conflitos de merge
- Gerenciando releases e tags de versão
- Integrando novos membros à equipe nas práticas Git

## Estratégias de Branching

### GitHub Flow (Simples, Recomendado para a Maioria)

Melhor para implantação contínua e equipes pequenas a médias.

```
main (protegida, sempre implantável)
  │
  ├── feature/user-auth      → PR → merge para main
  ├── feature/payment-flow   → PR → merge para main
  └── fix/login-bug          → PR → merge para main
```

**Regras:**
- `main` é sempre implantável
- Crie branches de feature a partir de `main`
- Abra um Pull Request quando estiver pronto para revisão
- Após aprovação e CI passar, faça merge para `main`
- Implante imediatamente após o merge

### Desenvolvimento Trunk-Based (Equipes de Alta Velocidade)

Melhor para equipes com CI/CD robusto e feature flags.

```
main (trunk)
  │
  ├── feature de curta duração (máx. 1-2 dias)
  ├── feature de curta duração
  └── feature de curta duração
```

**Regras:**
- Todos fazem Commit em `main` ou em branches de curtíssima duração
- Feature flags ocultam trabalho incompleto
- CI deve passar antes do merge
- Implantações múltiplas vezes por dia

### GitFlow (Complexo, Orientado a Ciclo de Release)

Melhor para releases agendadas e projetos corporativos.

```
main (releases de produção)
  │
  └── develop (branch de integração)
        │
        ├── feature/user-auth
        ├── feature/payment
        │
        ├── release/1.0.0    → merge para main e develop
        │
        └── hotfix/critical  → merge para main e develop
```

**Regras:**
- `main` contém somente código pronto para produção
- `develop` é o branch de integração
- Branches de feature a partir de `develop`, merge de volta para `develop`
- Branches de release a partir de `develop`, merge para `main` e `develop`
- Branches de hotfix a partir de `main`, merge para `main` e `develop`

### Quando Usar Qual

| Estratégia | Tamanho da Equipe | Cadência de Release | Melhor Para |
|------------|-------------------|---------------------|-------------|
| GitHub Flow | Qualquer | Contínua | SaaS, apps web, startups |
| Trunk-Based | 5+ experientes | Múltiplas/dia | Equipes de alta velocidade, feature flags |
| GitFlow | 10+ | Agendada | Corporativo, indústrias regulamentadas |

## Mensagens de Commit

### Formato de Conventional Commits

```
<tipo>(<escopo>): <assunto>

[corpo opcional]

[rodapé(s) opcional(is)]
```

### Tipos

| Tipo | Usar Para | Exemplo |
|------|-----------|---------|
| `feat` | Nova feature | `feat(auth): add OAuth2 login` |
| `fix` | Correção de bug | `fix(api): handle null response in user endpoint` |
| `docs` | Documentação | `docs(readme): update installation instructions` |
| `style` | Formatação, sem mudança de código | `style: fix indentation in login component` |
| `refactor` | Refatoração de código | `refactor(db): extract connection pool to module` |
| `test` | Adicionando/atualizando testes | `test(auth): add unit tests for token validation` |
| `chore` | Tarefas de manutenção | `chore(deps): update dependencies` |
| `perf` | Melhoria de desempenho | `perf(query): add index to users table` |
| `ci` | Mudanças de CI/CD | `ci: add PostgreSQL service to test workflow` |
| `revert` | Reverter Commit anterior | `revert: revert "feat(auth): add OAuth2 login"` |

### Exemplos Bons vs Ruins

```
# RUIM: Vago, sem contexto
git commit -m "fixed stuff"
git commit -m "updates"
git commit -m "WIP"

# BOM: Claro, específico, explica o porquê
git commit -m "fix(api): retry requests on 503 Service Unavailable

The external API occasionally returns 503 errors during peak hours.
Added exponential backoff retry logic with max 3 attempts.

Closes #123"
```

### Template de Mensagem de Commit

Crie `.gitmessage` na raiz do repositório:

```
# <tipo>(<escopo>): <assunto>
# # Tipos: feat, fix, docs, style, refactor, test, chore, perf, ci, revert
# Escopo: api, ui, db, auth, etc.
# Assunto: modo imperativo, sem ponto final, máx. 50 caracteres
#
# [corpo opcional] - explique o porquê, não o quê
# [rodapé opcional] - Breaking changes, closes #issue
```

Ative com: `git config commit.template .gitmessage`

## Merge vs Rebase

### Merge (Preserva o Histórico)

```bash
# Cria um Commit de merge
git checkout main
git merge feature/user-auth

# Resultado:
# *   Commit de merge
# |\
# | * Commits da feature
# |/
# * Commits do main
```

**Use quando:**
- Fazendo merge de branches de feature em `main`
- Quiser preservar o histórico exato
- Várias pessoas trabalharam no branch
- O branch foi enviado e outros podem ter baseado trabalho nele

### Rebase (Histórico Linear)

```bash
# Reescreve os Commits da feature sobre o branch de destino
git checkout feature/user-auth
git rebase main

# Resultado:
# * Commits da feature (reescritos)
# * Commits do main
```

**Use quando:**
- Atualizando seu branch de feature local com o `main` mais recente
- Quiser um histórico linear e limpo
- O branch é somente local (não enviado)
- Você é o único trabalhando no branch

### Fluxo de Trabalho com Rebase

```bash
# Atualizar branch de feature com o main mais recente (antes do PR)
git checkout feature/user-auth
git fetch origin
git rebase origin/main

# Corrija quaisquer conflitos
# Os testes ainda devem passar

# Force push (somente se você for o único contribuidor)
git push --force-with-lease origin feature/user-auth
```

### Quando NÃO Fazer Rebase

```
# NUNCA faça rebase em branches que:
- Foram enviados para um repositório compartilhado
- Outras pessoas basearam trabalho neles
- São branches protegidos (main, develop)
- Já foram mergeados

# Por quê: Rebase reescreve o histórico, quebrando o trabalho de outros
```

## Fluxo de Trabalho de Pull Request

### Formato do Título do PR

```
<tipo>(<escopo>): <descrição>

Exemplos:
feat(auth): add SSO support for enterprise users
fix(api): resolve race condition in order processing
docs(api): add OpenAPI specification for v2 endpoints
```

### Template de Descrição do PR

```markdown
## O quê

Breve descrição do que este PR faz.

## Por quê

Explique a motivação e o contexto.

## Como

Detalhes principais de implementação que valem destacar.

## Testes

- [ ] Testes unitários adicionados/atualizados
- [ ] Testes de integração adicionados/atualizados
- [ ] Testes manuais realizados

## Screenshots (se aplicável)

Screenshots antes/depois para mudanças de UI.

## Lista de Verificação

- [ ] Código segue as diretrizes de estilo do projeto
- [ ] Auto-revisão concluída
- [ ] Comentários adicionados para lógica complexa
- [ ] Documentação atualizada
- [ ] Nenhum novo aviso introduzido
- [ ] Testes passam localmente
- [ ] Issues relacionadas vinculadas

Closes #123
```

### Lista de Verificação de Code Review

**Para Revisores:**

- [ ] O código resolve o problema declarado?
- [ ] Há casos extremos não tratados?
- [ ] O código é legível e manutenível?
- [ ] Há testes suficientes?
- [ ] Há preocupações de segurança?
- [ ] O histórico de Commits está limpo (squash se necessário)?

**Para Autores:**

- [ ] Auto-revisão concluída antes de solicitar revisão
- [ ] CI passa (testes, Lint, typecheck)
- [ ] Tamanho do PR é razoável (<500 linhas ideal)
- [ ] Relacionado a uma única feature/correção
- [ ] Descrição explica claramente a mudança

## Resolução de Conflitos

### Identificar Conflitos

```bash
# Verificar conflitos antes do merge
git checkout main
git merge feature/user-auth --no-commit --no-ff

# Se houver conflitos, o Git mostrará:
# CONFLICT (content): Merge conflict in src/auth/login.ts
# Automatic merge failed; fix conflicts and then commit the result.
```

### Resolver Conflitos

```bash
# Ver arquivos com conflito
git status

# Ver marcadores de conflito no arquivo
# <<<<<<< HEAD
# conteúdo do main
# =======
# conteúdo do branch de feature
# >>>>>>> feature/user-auth

# Opção 1: Resolução manual
# Edite o arquivo, remova os marcadores, mantenha o conteúdo correto

# Opção 2: Usar ferramenta de merge
git mergetool

# Opção 3: Aceitar um lado
git checkout --ours src/auth/login.ts    # Manter versão do main
git checkout --theirs src/auth/login.ts  # Manter versão da feature

# Após resolver, faça stage e Commit
git add src/auth/login.ts
git commit
```

### Estratégias de Prevenção de Conflitos

```bash
# 1. Mantenha branches de feature pequenos e de curta duração
# 2. Faça rebase frequente sobre o main
git checkout feature/user-auth
git fetch origin
git rebase origin/main

# 3. Comunique-se com a equipe sobre tocar em arquivos compartilhados
# 4. Use feature flags em vez de branches de longa duração
# 5. Revise e faça merge de PRs prontamente
```

## Gerenciamento de Branches

### Convenções de Nomenclatura

```
# Branches de feature
feature/user-authentication
feature/JIRA-123-payment-integration

# Correções de bugs
fix/login-redirect-loop
fix/456-null-pointer-exception

# Hotfixes (problemas de produção)
hotfix/critical-security-patch
hotfix/database-connection-leak

# Releases
release/1.2.0
release/2024-01-hotfix

# Experimentos/POCs
experiment/new-caching-strategy
poc/graphql-migration
```

### Limpeza de Branches

```bash
# Excluir branches locais que foram mergeados
git branch --merged main | grep -v "^\*\|main" | xargs -n 1 git branch -d

# Excluir referências de rastreamento remoto para branches remotos excluídos
git fetch -p

# Excluir branch local
git branch -d feature/user-auth  # Exclusão segura (somente se mergeado)
git branch -D feature/user-auth  # Exclusão forçada

# Excluir branch remoto
git push origin --delete feature/user-auth
```

### Fluxo de Trabalho com Stash

```bash
# Salvar trabalho em andamento
git stash push -m "WIP: user authentication"

# Listar stashes
git stash list

# Aplicar stash mais recente
git stash pop

# Aplicar stash específico
git stash apply stash@{2}

# Descartar stash
git stash drop stash@{0}
```

## Gerenciamento de Release

### Versionamento Semântico

```
MAJOR.MINOR.PATCH

MAJOR: Breaking changes
MINOR: Novas features, compatível com versão anterior
PATCH: Correções de bugs, compatível com versão anterior

Exemplos:
1.0.0 → 1.0.1 (patch: correção de bug)
1.0.1 → 1.1.0 (minor: nova feature)
1.1.0 → 2.0.0 (major: breaking change)
```

### Criando Releases

```bash
# Criar tag anotada
git tag -a v1.2.0 -m "Release v1.2.0

Features:
- Add user authentication
- Implement password reset

Fixes:
- Resolve login redirect issue

Breaking Changes:
- None"

# Enviar tag para o remoto
git push origin v1.2.0

# Listar tags
git tag -l

# Excluir tag
git tag -d v1.2.0
git push origin --delete v1.2.0
```

### Geração de Changelog

```bash
# Gerar changelog a partir dos Commits
git log v1.1.0..v1.2.0 --oneline --no-merges

# Ou usar conventional-changelog
npx conventional-changelog -i CHANGELOG.md -s
```

## Configuração do Git

### Configurações Essenciais

```bash
# Identidade do usuário
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"

# Nome do branch padrão
git config --global init.defaultBranch main

# Comportamento de pull (rebase em vez de merge)
git config --global pull.rebase true

# Comportamento de push (enviar somente o branch atual)
git config --global push.default current

# Auto-corrigir erros de digitação
git config --global help.autocorrect 1

# Algoritmo de diff melhor
git config --global diff.algorithm histogram

# Saída colorida
git config --global color.ui auto
```

### Aliases Úteis

```bash
# Adicionar em ~/.gitconfig
[alias]
    co = checkout
    br = branch
    ci = commit
    st = status
    unstage = reset HEAD --
    last = log -1 HEAD
    visual = log --oneline --graph --all
    amend = commit --amend --no-edit
    wip = commit -m "WIP"
    undo = reset --soft HEAD~1
    contributors = shortlog -sn
```

### Padrões de Gitignore

```gitignore
# Dependências
node_modules/
vendor/

# Saídas de Build
dist/
build/
*.o
*.exe

# Arquivos de ambiente
.env
.env.local
.env.*.local

# IDE
.idea/
.vscode/
*.swp
*.swo

# Arquivos de SO
.DS_Store
Thumbs.db

# Logs
*.log
logs/

# Cobertura de testes
coverage/

# Cache
.cache/
*.tsbuildinfo
```

## Fluxos de Trabalho Comuns

### Iniciando uma Nova Feature

```bash
# 1. Atualizar o branch main
git checkout main
git pull origin main

# 2. Criar branch de feature
git checkout -b feature/user-auth

# 3. Fazer mudanças e Commit
git add .
git commit -m "feat(auth): implement OAuth2 login"

# 4. Enviar para o remoto
git push -u origin feature/user-auth

# 5. Criar Pull Request no GitHub/GitLab
```

### Atualizando um PR com Novas Mudanças

```bash
# 1. Fazer mudanças adicionais
git add .
git commit -m "feat(auth): add error handling"

# 2. Enviar atualizações
git push origin feature/user-auth
```

### Sincronizando Fork com Upstream

```bash
# 1. Adicionar remoto upstream (uma vez)
git remote add upstream https://github.com/original/repo.git

# 2. Buscar upstream
git fetch upstream

# 3. Fazer merge do upstream/main no seu main
git checkout main
git merge upstream/main

# 4. Enviar para o seu fork
git push origin main
```

### Desfazendo Erros

```bash
# Desfazer último Commit (manter mudanças)
git reset --soft HEAD~1

# Desfazer último Commit (descartar mudanças)
git reset --hard HEAD~1

# Desfazer último Commit enviado ao remoto
git revert HEAD
git push origin main

# Desfazer mudanças em arquivo específico
git checkout HEAD -- path/to/file

# Corrigir última mensagem de Commit
git commit --amend -m "Nova mensagem"

# Adicionar arquivo esquecido ao último Commit
git add forgotten-file
git commit --amend --no-edit
```

## Git Hooks

### Hook de Pre-Commit

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Executar Lint
npm run lint || exit 1

# Executar testes
npm test || exit 1

# Verificar segredos
if git diff --cached | grep -E '(password|api_key|secret)'; then
    echo "Possível segredo detectado. Commit abortado."
    exit 1
fi
```

### Hook de Pre-Push

```bash
#!/bin/bash
# .git/hooks/pre-push

# Executar suíte completa de testes
npm run test:all || exit 1

# Verificar declarações console.log
if git diff origin/main | grep -E 'console\.log'; then
    echo "Remova declarações console.log antes de enviar."
    exit 1
fi
```

## Anti-Padrões

```
# RUIM: Fazer Commit diretamente no main
git checkout main
git commit -m "fix bug"

# BOM: Use branches de feature e PRs

# RUIM: Fazer Commit de segredos
git add .env  # Contém chaves de API

# BOM: Adicione ao .gitignore, use variáveis de ambiente

# RUIM: PRs gigantes (1000+ linhas)
# BOM: Divida em PRs menores e focados

# RUIM: Mensagens de Commit "Update"
git commit -m "update"
git commit -m "fix"

# BOM: Mensagens descritivas
git commit -m "fix(auth): resolve redirect loop after login"

# RUIM: Reescrever histórico público
git push --force origin main

# BOM: Use revert para branches públicos
git revert HEAD

# RUIM: Branches de feature de longa duração (semanas/meses)
# BOM: Mantenha branches curtos (dias), faça rebase frequentemente

# RUIM: Fazer Commit de arquivos gerados
git add dist/
git add node_modules/

# BOM: Adicione ao .gitignore
```

## Referência Rápida

| Tarefa | Comando |
|--------|---------|
| Criar branch | `git checkout -b feature/nome` |
| Trocar branch | `git checkout nome-do-branch` |
| Excluir branch | `git branch -d nome-do-branch` |
| Merge de branch | `git merge nome-do-branch` |
| Rebase de branch | `git rebase main` |
| Ver histórico | `git log --oneline --graph` |
| Ver mudanças | `git diff` |
| Fazer stage de mudanças | `git add .` ou `git add -p` |
| Commit | `git commit -m "mensagem"` |
| Push | `git push origin nome-do-branch` |
| Pull | `git pull origin nome-do-branch` |
| Stash | `git stash push -m "mensagem"` |
| Desfazer último Commit | `git reset --soft HEAD~1` |
| Reverter Commit | `git revert HEAD` |
