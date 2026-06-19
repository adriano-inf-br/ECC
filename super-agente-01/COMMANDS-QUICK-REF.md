# Referência Rápida de Comandos

> 59 comandos de barra instalados globalmente. Digite `/` em qualquer sessão do Claude Code para invocá-los.

---

## Fluxo de Trabalho Principal

| Comando | O que faz |
|---------|-------------|
| `/plan` | Reformula os requisitos, avalia riscos, escreve um plano de implementação passo a passo — **aguarda sua confirmação antes de tocar no código** |
| `/tdd` | Impõe o desenvolvimento orientado a testes: estruturar interface → escrever teste que falha → implementar → verificar 80%+ de cobertura |
| `/code-review` | Revisão completa de qualidade, segurança e manutenibilidade do código nos arquivos alterados |
| `/build-fix` | Detecta e corrige erros de build — delega ao agente build-resolver correto automaticamente |
| `/verify` | Executa o loop de verificação completo: build → lint → test → type-check |
| `/quality-gate` | Verificação de quality gate contra os padrões do projeto |

---

## Testes

| Comando | O que faz |
|---------|-------------|
| `/tdd` | Fluxo de trabalho universal de TDD (qualquer linguagem) |
| `/e2e` | Gera + executa testes end-to-end do Playwright, captura screenshots/vídeos/traces |
| `/test-coverage` | Reporta a cobertura de testes, identifica lacunas |
| `/go-test` | Fluxo de trabalho de TDD para Go (table-driven, 80%+ de cobertura com `go test -cover`) |
| `/kotlin-test` | TDD para Kotlin (Kotest + Kover) |
| `/rust-test` | TDD para Rust (cargo test, testes de integração) |
| `/cpp-test` | TDD para C++ (GoogleTest + gcov/lcov) |

---

## Revisão de Código

| Comando | O que faz |
|---------|-------------|
| `/code-review` | Revisão de código universal |
| `/python-review` | Python — PEP 8, type hints, segurança, padrões idiomáticos |
| `/go-review` | Go — padrões idiomáticos, segurança de concorrência, tratamento de erros |
| `/kotlin-review` | Kotlin — null safety, segurança de corrotinas, clean architecture |
| `/rust-review` | Rust — ownership, lifetimes, uso de unsafe |
| `/cpp-review` | C++ — segurança de memória, idiomas modernos, concorrência |

---

## Corretores de Build

| Comando | O que faz |
|---------|-------------|
| `/build-fix` | Detecta a linguagem automaticamente e corrige erros de build |
| `/go-build` | Corrige erros de build do Go e avisos do `go vet` |
| `/kotlin-build` | Corrige erros do compilador Kotlin/Gradle |
| `/rust-build` | Corrige problemas de build + borrow checker do Rust |
| `/cpp-build` | Corrige problemas de CMake e linker do C++ |
| `/gradle-build` | Corrige erros do Gradle para Android / KMP |

---

## Planejamento e Arquitetura

| Comando | O que faz |
|---------|-------------|
| `/plan` | Plano de implementação com avaliação de riscos |
| `/multi-plan` | Planejamento colaborativo multi-modelo |
| `/multi-workflow` | Desenvolvimento colaborativo multi-modelo |
| `/multi-backend` | Desenvolvimento multi-modelo focado em backend |
| `/multi-frontend` | Desenvolvimento multi-modelo focado em frontend |
| `/multi-execute` | Execução colaborativa multi-modelo |
| `/orchestrate` | Guia para orquestração multi-agente com tmux/worktree |
| `/devfleet` | Orquestra agentes do Claude Code em paralelo via DevFleet |

---

## Gerenciamento de Sessão

| Comando | O que faz |
|---------|-------------|
| `/save-session` | Salva o estado da sessão atual em `~/.claude/session-data/` |
| `/resume-session` | Carrega a sessão salva mais recente do armazenamento canônico de sessões e retoma de onde você parou |
| `/sessions` | Navega, busca e gerencia o histórico de sessões com aliases de `~/.claude/session-data/` (com leituras legadas de `~/.claude/sessions/`) |
| `/checkpoint` | Marca um checkpoint na sessão atual |
| `/aside` | Responde a uma pergunta rápida paralela sem perder o contexto da tarefa atual |
| `/context-budget` | Analisa o uso da janela de contexto — encontra sobrecarga de Tokens, otimiza |

---

## Aprendizado e Melhoria

| Comando | O que faz |
|---------|-------------|
| `/learn` | Extrai padrões reutilizáveis da sessão atual |
| `/learn-eval` | Extrai padrões + autoavalia a qualidade antes de salvar |
| `/evolve` | Analisa instintos aprendidos, sugere estruturas de Skill evoluídas |
| `/promote` | Promove instintos de escopo de projeto para o escopo global |
| `/instinct-status` | Mostra todos os instintos aprendidos (projeto + global) com pontuações de confiança |
| `/instinct-export` | Exporta instintos para um arquivo |
| `/instinct-import` | Importa instintos de um arquivo ou URL |
| `/skill-create` | Analisa o histórico local do git → gera uma Skill reutilizável |
| `/skill-health` | Painel de saúde do portfólio de Skills com analytics |
| `/rules-distill` | Varre Skills, extrai princípios transversais, destila em regras |

---

## Refatoração e Limpeza

| Comando | O que faz |
|---------|-------------|
| `/refactor-clean` | Remove código morto, consolida duplicatas, limpa a estrutura |
| `/prompt-optimize` | Analisa um rascunho de prompt e gera uma versão otimizada e enriquecida com ECC |

---

## Docs e Pesquisa

| Comando | O que faz |
|---------|-------------|
| `/docs` | Consulta a documentação atual de biblioteca/API via Context7 |
| `/update-docs` | Atualiza a documentação do projeto |
| `/update-codemaps` | Regenera os codemaps da base de código |

---

## Loops e Automação

| Comando | O que faz |
|---------|-------------|
| `/loop-start` | Inicia um loop recorrente de agente em um intervalo |
| `/loop-status` | Verifica o status dos loops em execução |
| `/claw` | Inicia o NanoClaw v2 — REPL persistente com roteamento de modelo, hot-load de Skill, branching e métricas |

---

## Projeto e Infraestrutura

| Comando | O que faz |
|---------|-------------|
| `/projects` | Lista os projetos conhecidos e suas estatísticas de instintos |
| `/harness-audit` | Audita a configuração do harness do agente quanto a confiabilidade e custo |
| `/eval` | Executa o harness de avaliação |
| `/model-route` | Roteia uma tarefa para o modelo certo (Haiku / Sonnet / Opus) |
| `/pm2` | Inicialização do gerenciador de processos PM2 |
| `/setup-pm` | Configura o gerenciador de pacotes (npm / pnpm / yarn / bun) |

---

## Guia Rápido de Decisão

```
Starting a new feature?         → /plan first, then /tdd
Code just written?              → /code-review
Build broken?                   → /build-fix
Need live docs?                 → /docs <library>
Session about to end?           → /save-session or /learn-eval
Resuming next day?              → /resume-session
Context getting heavy?          → /context-budget then /checkpoint
Want to extract what you learned? → /learn-eval then /evolve
Running repeated tasks?         → /loop-start
```
