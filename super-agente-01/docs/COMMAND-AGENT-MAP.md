# Mapa de Comando → Agent / Skill

Este documento lista cada comando de barra e os agent(s) ou skills primários que ele invoca, além de agents de invocação direta notáveis. Use-o para descobrir quais comandos usam quais agents e para manter a refatoração consistente.

| Comando | Agent(s) primário(s) | Notas |
|---------|------------------|--------|
| `/plan` | planner | Planejamento de implementação antes do código |
| `/tdd` | tdd-guide | Desenvolvimento orientado a testes |
| `/code-review` | code-reviewer | Revisão de qualidade e segurança |
| `/build-fix` | build-error-resolver | Corrigir erros de build/tipo |
| `/e2e` | e2e-runner | Testes E2E com Playwright |
| `/refactor-clean` | refactor-cleaner | Remoção de código morto |
| `/update-docs` | doc-updater | Sincronização de documentação |
| `/update-codemaps` | doc-updater | Codemaps / documentação de arquitetura |
| `/go-review` | go-reviewer | Revisão de código Go |
| `/go-test` | tdd-guide | Fluxo de trabalho TDD em Go |
| `/go-build` | go-build-resolver | Corrigir erros de build em Go |
| `/python-review` | python-reviewer | Revisão de código Python |
| `/harness-audit` | — | Scorecard de harness (sem agent único) |
| `/loop-start` | loop-operator | Iniciar loop autônomo |
| `/loop-status` | loop-operator | Inspecionar status do loop |
| `/quality-gate` | — | Pipeline de qualidade (semelhante a hook) |
| `/model-route` | — | Recomendação de modelo (sem agent) |
| `/orchestrate` | planner, tdd-guide, code-reviewer, security-reviewer, architect | Handoff multi-agent |
| `/multi-plan` | architect (prompts Codex/Gemini) | Planejamento multi-modelo |
| `/multi-execute` | architect / prompts de frontend | Execução multi-modelo |
| `/multi-backend` | architect | Backend multi-serviço |
| `/multi-frontend` | architect | Frontend multi-serviço |
| `/multi-workflow` | architect | Workflow multi-serviço geral |
| `/learn` | — | skill de continuous-learning, instincts |
| `/learn-eval` | — | continuous-learning-v2, avaliar e salvar |
| `/instinct-status` | — | continuous-learning-v2 |
| `/instinct-import` | — | continuous-learning-v2 |
| `/instinct-export` | — | continuous-learning-v2 |
| `/evolve` | — | continuous-learning-v2, agrupar instincts |
| `/promote` | — | continuous-learning-v2 |
| `/projects` | — | continuous-learning-v2 |
| `/skill-create` | — | script skill-create-output, histórico git |
| `/checkpoint` | — | skill verification-loop |
| `/verify` | — | skill verification-loop |
| `/eval` | — | skill eval-harness |
| `/test-coverage` | — | Análise de cobertura |
| `/sessions` | — | Histórico de sessões |
| `/setup-pm` | — | Script de configuração de gerenciador de pacotes |
| `/claw` | — | CLI NanoClaw (scripts/claw.js) |
| `/pm2` | — | Ciclo de vida de serviço PM2 |
| `/security-scan` | security-reviewer (skill) | AgentShield via skill security-scan |

## Agents de Uso Direto

| Agent direto | Propósito | Escopo | Notas |
|--------------|---------|-------|-------|
| `typescript-reviewer` | Revisão de código TypeScript/JavaScript | Projetos TypeScript/JavaScript | Invoque o agent diretamente quando uma revisão precisar de descobertas específicas de TS/JS e ainda não houver um comando de barra dedicado. |

## Skills referenciadas por comandos

- **continuous-learning**, **continuous-learning-v2**: `/learn`, `/learn-eval`, `/instinct-*`, `/evolve`, `/promote`, `/projects`
- **verification-loop**: `/checkpoint`, `/verify`
- **eval-harness**: `/eval`
- **security-scan**: `/security-scan` (executa AgentShield)
- **strategic-compact**: sugerido em pontos de compactação (hooks)

## Como usar este mapa

- **Descoberta:** Encontre qual comando aciona qual agent (ex.: "use `/code-review` para code-reviewer").
- **Refatoração:** Ao renomear ou remover um agent, pesquise este documento e os arquivos de comandos por referências.
- **CI/docs:** O script de catálogo (`node scripts/ci/catalog.js`) gera contagens de agents/comandos/skills; este mapa complementa com os relacionamentos entre comandos e agents.
