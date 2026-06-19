---
name: prompt-optimizer
description: >-
  Analisa Prompts brutos, identifica intenção e lacunas, combina componentes ECC
  (skills/commands/agents/hooks) e gera um Prompt otimizado pronto para colar.
  Papel apenas consultivo — nunca executa a tarefa em si.
  GATILHO quando: o usuário diz "otimizar prompt", "melhorar meu prompt",
  "como escrever um prompt para", "me ajude com o prompt", "reescrever este prompt",
  ou pede explicitamente para melhorar a qualidade do Prompt. Também aciona em
  equivalentes em chinês: "优化prompt", "改进prompt", "怎么写prompt", "帮我优化这个指令".
  NÃO ACIONAR quando: o usuário quer a tarefa executada diretamente, ou diz
  "apenas faça" / "直接做". NÃO ACIONAR quando o usuário diz "优化代码",
  "优化性能", "optimize performance", "optimize this code" — essas são
  tarefas de refatoração/performance, não otimização de Prompt.
metadata:
  origin: community
  author: YannJY02
  version: "1.0.0"
---

# Prompt Optimizer

Analise um Prompt rascunho, critique-o, combine-o com componentes do ecossistema ECC
e gere um Prompt completo otimizado que o usuário pode colar e executar.

## Quando Usar

- Usuário diz "otimizar este prompt", "melhorar meu prompt", "reescrever este prompt"
- Usuário diz "me ajude a escrever um prompt melhor para..."
- Usuário diz "qual é a melhor forma de pedir ao Claude Code para..."
- Usuário diz "优化prompt", "改进prompt", "怎么写prompt", "帮我优化这个指令"
- Usuário cola um Prompt rascunho e pede feedback ou melhoria
- Usuário diz "não sei como criar um Prompt para isso"
- Usuário diz "como devo usar o ECC para..."
- Usuário invoca explicitamente `/prompt-optimize`

### Não Usar Quando

- Usuário quer a tarefa feita diretamente (apenas execute-a)
- Usuário diz "优化代码", "优化性能", "optimize this code", "optimize performance" — essas são tarefas de refatoração, não otimização de Prompt
- Usuário pergunta sobre configuração do ECC (use `configure-ecc` em vez disso)
- Usuário quer um inventário de skills (use `skill-stocktake` em vez disso)
- Usuário diz "apenas faça" ou "直接做"

## Como Funciona

**Apenas consultivo — não execute a tarefa do usuário.**

NÃO escreva código, crie arquivos, execute comandos ou tome qualquer ação de implementação.
Sua ÚNICA saída é uma análise mais um Prompt otimizado.

Se o usuário disser "apenas faça", "直接做", ou "não otimize, apenas execute",
não mude para o modo de implementação dentro desta skill. Diga ao usuário que
esta skill só produz Prompts otimizados e instrua-os a fazer uma solicitação de
tarefa normal se quiserem execução em vez disso.

Execute este pipeline de 6 fases sequencialmente. Apresente os resultados usando o Formato de Saída abaixo.

### Pipeline de Análise

### Fase 0: Detecção de Projeto

Antes de analisar o Prompt, detecte o contexto atual do projeto:

1. Verifique se existe um `CLAUDE.md` no diretório de trabalho — leia-o para as convenções do projeto
2. Detecte o stack tecnológico a partir dos arquivos do projeto:
   - `package.json` → Node.js / TypeScript / React / Next.js
   - `go.mod` → Go
   - `pyproject.toml` / `requirements.txt` → Python
   - `Cargo.toml` → Rust
   - `build.gradle` / `pom.xml` → Java / Kotlin (depois verifique `quarkus` no arquivo de build → Quarkus, ou `spring-boot` → Spring Boot)
   - `Package.swift` → Swift
   - `Gemfile` → Ruby
   - `composer.json` → PHP
   - `*.csproj` / `*.sln` → .NET
   - `Makefile` / `CMakeLists.txt` → C / C++
   - `cpanfile` / `Makefile.PL` → Perl
3. Anote o stack tecnológico detectado para uso nas Fases 3 e 4

Se nenhum arquivo de projeto for encontrado (ex.: o Prompt é abstrato ou para um novo projeto),
pule a detecção e sinalize "stack tecnológico desconhecido" na Fase 4.

### Fase 1: Detecção de Intenção

Classifique a tarefa do usuário em uma ou mais categorias:

| Categoria | Palavras de Sinal | Exemplo |
|----------|-------------|---------|
| Nova Feature | build, create, add, implement, 创建, 实现, 添加 | "Criar uma página de login" |
| Correção de Bug | fix, broken, not working, error, 修复, 报错 | "Corrigir o fluxo de auth" |
| Refatoração | refactor, clean up, restructure, 重构, 整理 | "Refatorar a camada de API" |
| Pesquisa | how to, what is, explore, investigate, 怎么, 如何 | "Como adicionar SSO" |
| Testes | test, coverage, verify, 测试, 覆盖率 | "Adicionar testes para o carrinho" |
| Revisão | review, audit, check, 审查, 检查 | "Revisar meu PR" |
| Documentação | document, update docs, 文档 | "Atualizar a documentação da API" |
| Infraestrutura | deploy, CI, docker, database, 部署, 数据库 | "Configurar pipeline CI/CD" |
| Design | design, architecture, plan, 设计, 架构 | "Projetar o modelo de dados" |

### Fase 2: Avaliação de Escopo

Se a Fase 0 detectou um projeto, use o tamanho da base de código como sinal. Caso contrário, estime
a partir da descrição do Prompt sozinha e marque a estimativa como incerta.

| Escopo | Heurística | Orquestração |
|-------|-----------|---------------|
| TRIVIAL | Arquivo único, < 50 linhas | Execução direta |
| BAIXO | Componente ou módulo único | Command ou skill único |
| MÉDIO | Múltiplos componentes, mesmo domínio | Cadeia de commands + /verify |
| ALTO | Multi-domínio, 5+ arquivos | /plan primeiro, depois execução em fases |
| ÉPICO | Multi-sessão, multi-PR, mudança arquitetural | Use a skill blueprint para plano multi-sessão |

### Fase 3: Correspondência de Componentes ECC

Mapeie intenção + escopo + stack tecnológico (da Fase 0) para componentes ECC específicos.

#### Por Tipo de Intenção

| Intenção | Commands | Skills | Agents |
|--------|----------|--------|--------|
| Nova Feature | /plan, /tdd, /code-review, /verify | tdd-workflow, verification-loop | planner, tdd-guide, code-reviewer |
| Correção de Bug | /tdd, /build-fix, /verify | tdd-workflow | tdd-guide, build-error-resolver |
| Refatoração | /refactor-clean, /code-review, /verify | verification-loop | refactor-cleaner, code-reviewer |
| Pesquisa | /plan | search-first, iterative-retrieval | — |
| Testes | /tdd, /e2e, /test-coverage | tdd-workflow, e2e-testing | tdd-guide, e2e-runner |
| Revisão | /code-review | security-review | code-reviewer, security-reviewer |
| Documentação | /update-docs, /update-codemaps | — | doc-updater |
| Infraestrutura | /plan, /verify | docker-patterns, deployment-patterns, database-migrations | architect |
| Design (MÉDIO-ALTO) | /plan | — | planner, architect |
| Design (ÉPICO) | — | blueprint (invocar como skill) | planner, architect |

#### Por Stack Tecnológico

| Stack Tecnológico | Skills a Adicionar | Agent |
|------------|--------------|-------|
| Python / Django | django-patterns, django-tdd, django-security, django-verification, python-patterns, python-testing | python-reviewer |
| Go | golang-patterns, golang-testing | go-reviewer, go-build-resolver |
| Spring Boot / Java | springboot-patterns, springboot-tdd, springboot-security, springboot-verification, java-coding-standards, jpa-patterns | java-reviewer |
| Quarkus / Java | quarkus-patterns, quarkus-tdd, quarkus-security, quarkus-verification, java-coding-standards, jpa-patterns | java-reviewer |
| Kotlin / Android | kotlin-coroutines-flows, compose-multiplatform-patterns, android-clean-architecture | kotlin-reviewer |
| TypeScript / React | frontend-patterns, backend-patterns, coding-standards | code-reviewer |
| Swift / iOS | swiftui-patterns, swift-concurrency-6-2, swift-actor-persistence, swift-protocol-di-testing | code-reviewer |
| PostgreSQL | postgres-patterns, database-migrations | database-reviewer |
| Perl | perl-patterns, perl-testing, perl-security | code-reviewer |
| C++ | cpp-coding-standards, cpp-testing | code-reviewer |
| Outro / Não listado | coding-standards (universal) | code-reviewer |

### Fase 4: Detecção de Contexto Faltando

Verifique o Prompt quanto a informações críticas faltando. Verifique cada item e marque
se a Fase 0 o detectou automaticamente ou se o usuário deve fornecê-lo:

- [ ] **Stack tecnológico** — Detectado na Fase 0, ou o usuário deve especificar?
- [ ] **Escopo alvo** — Arquivos, diretórios ou módulos mencionados?
- [ ] **Critérios de aceitação** — Como saber que a tarefa está concluída?
- [ ] **Tratamento de erros** — Casos extremos e modos de falha abordados?
- [ ] **Requisitos de segurança** — Auth, validação de entrada, segredos?
- [ ] **Expectativas de testes** — Unitário, integração, E2E?
- [ ] **Restrições de performance** — Carga, latência, limites de recursos?
- [ ] **Requisitos de UI/UX** — Especificações de design, responsividade, a11y? (se Frontend)
- [ ] **Alterações de banco de dados** — Schema, migrações, índices? (se camada de dados)
- [ ] **Padrões existentes** — Arquivos de referência ou convenções a seguir?
- [ ] **Limites de escopo** — O que NÃO fazer?

**Se 3+ itens críticos estiverem faltando**, faça ao usuário até 3 perguntas de esclarecimento
antes de gerar o Prompt otimizado. Em seguida, incorpore as respostas no Prompt otimizado.

### Fase 5: Recomendação de Fluxo de Trabalho e Modelo

Determine onde este Prompt se encaixa no ciclo de vida de desenvolvimento:

```
Pesquisa → Planejar → Implementar (TDD) → Revisar → Verificar → Commit
```

Para tarefas MÉDIO+, sempre comece com /plan. Para tarefas ÉPICO, use a skill blueprint.

**Recomendação de modelo** (incluir na saída):

| Escopo | Modelo Recomendado | Justificativa |
|-------|------------------|-----------|
| TRIVIAL-BAIXO | Sonnet 4.6 | Rápido, custo-eficiente para tarefas simples |
| MÉDIO | Sonnet 4.6 | Melhor modelo de codificação para trabalho padrão |
| ALTO | Sonnet 4.6 (principal) + Opus 4.6 (planejamento) | Opus para arquitetura, Sonnet para implementação |
| ÉPICO | Opus 4.6 (blueprint) + Sonnet 4.6 (execução) | Raciocínio profundo para planejamento multi-sessão |

**Divisão em múltiplos Prompts** (para escopo ALTO/ÉPICO):

Para tarefas que excedem uma única sessão, divida em Prompts sequenciais:
- Prompt 1: Pesquisa + Planejar (use a skill search-first, depois /plan)
- Prompts 2-N: Implemente uma fase por Prompt (cada um termina com /verify)
- Prompt Final: Teste de integração + /code-review em todas as fases
- Use /save-session e /resume-session para preservar o contexto entre sessões

---

## Formato de Saída

Apresente sua análise nesta estrutura exata. Responda no mesmo idioma
da entrada do usuário.

### Seção 1: Diagnóstico do Prompt

**Pontos Fortes:** Liste o que o Prompt original faz bem.

**Problemas:**

| Problema | Impacto | Correção Sugerida |
|-------|--------|---------------|
| (problema) | (consequência) | (como corrigir) |

**Precisa de Esclarecimento:** Lista numerada de perguntas que o usuário deve responder.
Se a Fase 0 detectou automaticamente a resposta, declare-a em vez de perguntar.

### Seção 2: Componentes ECC Recomendados

| Tipo | Componente | Finalidade |
|------|-----------|---------|
| Command | /plan | Planejar arquitetura antes de codificar |
| Skill | tdd-workflow | Orientação de metodologia TDD |
| Agent | code-reviewer | Revisão pós-implementação |
| Modelo | Sonnet 4.6 | Recomendado para este escopo |

### Seção 3: Prompt Otimizado — Versão Completa

Apresente o Prompt otimizado completo dentro de um único bloco de código delimitado.
O Prompt deve ser autossuficiente e pronto para copiar e colar. Inclua:
- Descrição clara da tarefa com contexto
- Stack tecnológico (detectado ou especificado)
- Invocações de /command nos estágios certos do fluxo de trabalho
- Critérios de aceitação
- Etapas de verificação
- Limites de escopo (o que NÃO fazer)

Para itens que referenciam blueprint, escreva: "Use a skill blueprint para..."
(não `/blueprint`, pois blueprint é uma skill, não um command).

### Seção 4: Prompt Otimizado — Versão Rápida

Uma versão compacta para usuários experientes do ECC. Varie por tipo de intenção:

| Intenção | Padrão Rápido |
|--------|--------------|
| Nova Feature | `/plan [feature]. /tdd para implementar. /code-review. /verify.` |
| Correção de Bug | `/tdd — escreva teste falhando para [bug]. Corrija para verde. /verify.` |
| Refatoração | `/refactor-clean [escopo]. /code-review. /verify.` |
| Pesquisa | `Use a skill search-first para [tópico]. /plan baseado nas descobertas.` |
| Testes | `/tdd [módulo]. /e2e para fluxos críticos. /test-coverage.` |
| Revisão | `/code-review. Depois use o agent security-reviewer.` |
| Docs | `/update-docs. /update-codemaps.` |
| ÉPICO | `Use a skill blueprint para "[objetivo]". Execute fases com portões /verify.` |

### Seção 5: Justificativa das Melhorias

| Melhoria | Motivo |
|-------------|--------|
| (o que foi adicionado) | (por que importa) |

### Rodapé

> Não é o que você precisa? Me diga o que ajustar, ou faça uma solicitação de tarefa normal
> se quiser execução em vez de otimização de Prompt.

---

## Exemplos

### Exemplos de Gatilho

- "Otimize este Prompt para o ECC"
- "Reescreva este Prompt para que o Claude Code use os commands certos"
- "帮我优化这个指令"
- "Como devo criar o Prompt no ECC para esta tarefa?"

### Exemplo 1: Prompt Vago em Chinês (Projeto Detectado)

**Entrada do usuário:**
```
帮我写一个用户登录页面
```

**A Fase 0 detecta:** `package.json` com Next.js 15, TypeScript, Tailwind CSS

**Prompt Otimizado (Completo):**
```
使用项目现有技术栈（Next.js 15 + TypeScript + Tailwind CSS）实现用户登录页面。

技术要求：
- 沿用项目现有的组件结构和路由约定
- 表单验证使用项目中已有的验证方案（检查是否已用 Zod/Yup/其他）
- 认证方式：沿用项目现有认证方案（如无，默认 JWT）
- 包含：邮箱/密码登录表单、表单验证、错误提示、加载状态、响应式布局

工作流：
1. /plan 先规划组件结构和认证流程，参考现有页面的模式
2. /tdd 测试先行：编写登录表单的单元测试和认证流程的集成测试
3. 实现登录页面和认证逻辑
4. /code-review 审查实现
5. /verify 验证所有测试通过且页面正常渲染

安全要求：
- 密码不明文传输
- 防止暴力破解（rate limiting）
- XSS 防护
- CSRF token

验收标准：
- 所有测试通过，覆盖率 80%+
- 页面在移动端和桌面端正常渲染
- 登录成功跳转到 dashboard，失败显示错误信息

不要做：
- 不要实现注册页面
- 不要实现忘记密码功能
- 不要修改现有的路由结构
```

### Exemplo 2: Prompt Moderado em Inglês

**Entrada do usuário:**
```
Add a REST API endpoint for user profile updates with validation
```

**A Fase 0 detecta:** `go.mod` com Go 1.22, roteador Chi

**Prompt Otimizado (Completo):**
```
Add a REST API endpoint for user profile updates (PATCH /api/users/:id).

Tech stack: Go 1.22 + Chi router (detected from project)

Requirements:
- PATCH /api/users/:id — partial update of user profile
- Input validation for fields: name, email, avatar_url, bio
- Auth: require valid token, users can only update own profile
- Return 200 with updated user on success
- Return 400 with validation errors on invalid input
- Return 401/403 for auth failures
- Follow existing API patterns in the codebase

Workflow:
1. /plan the endpoint structure, middleware chain, and validation logic
2. /tdd — write table-driven tests for success, validation failure, auth failure, not-found
3. Implement following existing handler patterns
4. /go-review
5. /verify — run full test suite, confirm no regressions

Do not:
- Modify existing endpoints
- Change the database schema (use existing user table)
- Add new dependencies without checking existing ones first (use search-first skill)
```

### Exemplo 3: Projeto ÉPICO

**Entrada do usuário:**
```
Migrate our monolith to microservices
```

**Prompt Otimizado (Completo):**
```
Use the blueprint skill to plan: "Migrate monolith to microservices architecture"

Before executing, answer these questions in the blueprint:
1. Which domain boundaries exist in the current monolith?
2. Which service should be extracted first (lowest coupling)?
3. Communication pattern: REST APIs, gRPC, or event-driven (Kafka/RabbitMQ)?
4. Database strategy: shared DB initially or database-per-service from start?
5. Deployment target: Kubernetes, Docker Compose, or serverless?

The blueprint should produce phases like:
- Phase 1: Identify service boundaries and create domain map
- Phase 2: Set up infrastructure (API gateway, service mesh, CI/CD per service)
- Phase 3: Extract first service (strangler fig pattern)
- Phase 4: Verify with integration tests, then extract next service
- Phase N: Decommission monolith

Each phase = 1 PR, with /verify gates between phases.
Use /save-session between phases. Use /resume-session to continue.
Use git worktrees for parallel service extraction when dependencies allow.

Recommended: Opus 4.6 for blueprint planning, Sonnet 4.6 for phase execution.
```

---

## Componentes Relacionados

| Componente | Quando Referenciar |
|-----------|------------------|
| `configure-ecc` | Usuário ainda não configurou o ECC |
| `skill-stocktake` | Auditar quais componentes estão instalados (use em vez de catálogo fixo) |
| `search-first` | Fase de pesquisa em Prompts otimizados |
| `blueprint` | Prompts otimizados de escopo ÉPICO (invocar como skill, não command) |
| `strategic-compact` | Gerenciamento de contexto de sessão longa |
| `cost-aware-llm-pipeline` | Recomendações de otimização de Token |
