# Arquitetura de Referência ECC 2.0

Espelho de execução atual:
[`ECC-2.0-GA-ROADMAP.md`](ECC-2.0-GA-ROADMAP.md).

Este documento transforma a varredura de referência de maio de 2026 em formato concreto de backlog do ECC. Não é um segundo memorando de estratégia: cada pressão de referência abaixo deve resultar em um adaptador, verificação, sinal observável, política de segurança, superfície de revisão de PR ou gate de prontidão de release.

## Linha de Base de Referência

Data do snapshot: 2026-05-12.

| Referência | Pressão primária no ECC 2.0 | Delta concreto do ECC |
| --- | --- | --- |
| [`stablyai/orca`](https://github.com/stablyai/orca) | IDE multi-agent nativa de worktree com terminais, controle de fonte, integração com GitHub, SSH, notificações, modo de design/navegador, troca de conta e contexto por worktree. | Tratar ciclo de vida de worktree, estado de revisão, estado de notificação e identidade de conta/provedor como sinais de adaptador de primeira classe. |
| [`superset-sh/superset`](https://github.com/superset-sh/superset) | Workspace de agente de IA desktop com execução paralela, isolamento de worktree, revisão de diff, presets de workspace e ampla compatibilidade com agentes CLI. | Adicionar taxonomia de presets de workspace e tornar o estado de sessão/worktree do ECC2 exportável o suficiente para que editores externos possam consumir. |
| [`standardagents/dmux`](https://github.com/standardagents/dmux) | Orquestração de Tmux/worktree, hooks de ciclo de vida, controle multi-seleção de agentes, mesclagem inteligente, navegador de arquivos, notificações e limpeza. | Adicionar cobertura de hook de ciclo de vida à matriz de harness e definir eventos de fila de mesclagem/conflito. |
| [`aidenybai/ghast`](https://github.com/aidenybai/ghast) | Multiplexador de terminal nativo para macOS com workspaces agrupados por cwd, painéis, abas, arrastar e soltar, busca e notificações. | Preservar a ergonomia nativa de terminal enquanto adiciona agrupamento de cwd/sessão e registros de handoff/sessão pesquisáveis. |
| [`jarrodwatts/claude-hud`](https://github.com/jarrodwatts/claude-hud) | Statusline sempre visível do Claude Code para contexto, ferramentas, agents, todos e atividade com suporte a transcrição. | Formalizar o payload HUD/status do ECC para contexto, custo, chamadas de ferramenta, agents ativos, todos, estado da fila, verificações e risco. |
| [`stanford-iris-lab/meta-harness`](https://github.com/stanford-iris-lab/meta-harness) | Busca automatizada sobre design de harness específico de tarefa: o que armazenar, recuperar e mostrar. | Dividir os loops de melhoria do ECC em spec de cenário, trace do propositor, resultado do verificador e playbook promovido. |
| [`greyhaven-ai/autocontext`](https://github.com/greyhaven-ai/autocontext) | Melhoria recursiva de harness usando traces, relatórios, artefatos, datasets, playbooks e avaliadores com papéis separados. | Armazenar traces e playbooks reutilizáveis antes de mutar ativos do harness instalado. |
| [`NousResearch/hermes-agent`](https://github.com/NousResearch/hermes-agent) | Shell de operador auto-aperfeiçoável com memórias, skills, agendador, gateways, subagents, backends de terminal e ferramentas de migração. | Manter o ECC portável entre backends de terminal local, SSH, container e hospedado sem ocultar os comandos subjacentes. |
| [`anthropics/claude-code`](https://github.com/anthropics/claude-code), [`sst/opencode`](https://github.com/sst/opencode), Zed, Codex, Cursor, Gemini | Diferentes harnesses de agent expõem diferentes hooks, superfícies de plugin, armazenamentos de sessão, arquivos de configuração e loops de revisão. | Manter uma matriz pública de conformidade de adaptadores em vez de tratar um harness como a UX canônica. |
| Revisão do código-fonte local do Claude Code | Superfícies de sessão, ferramenta, permissão, hook, remoto, análise, tarefa e sugestão de contexto são mais estruturadas do que a UX pública da CLI sugere. | Modelar eventos de status e risco em torno de mensagens de sessão, solicitações de permissão, progresso de ferramentas, pressão de contexto e estado de resumo. |

## Formato da Arquitetura

O ECC 2.0 deve ser um sistema operacional de harness, não apenas um catálogo de comandos, agents e skills.

```text
┌──────────────────────────────────────────────────────────────┐
│ Superfície do Operador                                       │
│ CLI, plugin, TUI, HUD/statusline, gates de release, PR checks│
├──────────────────────────────────────────────────────────────┤
│ Camada de Adaptador de Harness                               │
│ Claude Code, Codex, OpenCode, Cursor, Gemini, Zed, dmux,     │
│ Orca, Superset, Ghast, somente terminal                      │
├──────────────────────────────────────────────────────────────┤
│ Runtime de Worktree, Sessão e Fila                           │
│ worktrees, painéis, sessões, todos, verificações, filas de   │
│ mesclagem/conflito, estado de notificação, propriedade,      │
│ exportações de handoff                                       │
├──────────────────────────────────────────────────────────────┤
│ Loop de Observabilidade e Avaliação                          │
│ traces JSONL, snapshots de status, ledger de risco, auditoria│
│ de harness, specs de cenário, verificadores, playbooks       │
│ promovidos, conjuntos RAG                                    │
├──────────────────────────────────────────────────────────────┤
│ Plataforma de Segurança e Comercial                          │
│ políticas/SARIF do AgentShield, verificações do ECC Tools,   │
│ faturamento, sincronização Linear/GitHub, relatórios         │
│ empresariais                                                 │
└──────────────────────────────────────────────────────────────┘
```

## Mapa de Referência para Backlog

### Orquestração de Worktree e Sessão

Adotar de Orca, Superset, dmux e Ghast:

- Eventos de ciclo de vida de worktree: criar, retomar, pausar, parar, diff, revisar, PR, pronto para mesclagem, conflito, obsoleto, fechar, recuperar.
- Agrupamento de sessão por repositório, branch, cwd, tarefa, proprietário e harness.
- Presets de workspace para faixa de release, faixa de triagem de PR, faixa de documentação, faixa de segurança e faixa de escritor de testes.
- Notificações para CI bloqueado, worktrees sujos, conflitos de mesclagem, revisão obsoleta e execuções autônomas concluídas.
- Loops de revisão que podem anotar diffs e PRs sem retirar a propriedade dos mantenedores.

Trabalho no repositório:

- `everything-claude-code`: estender a matriz de conformidade de adaptadores e o onramp de scorecard público.
- `ecc2`: expor o estado de sessão/worktree por meio de um payload local estável antes de adicionar telemetria hospedada.
- `ECC-Tools`: consumir os mesmos eventos de ciclo de vida para verificações de PR, roteamento de issues e sincronização com o Linear.

Verificação:

- `npm run harness:audit -- --format json`
- `npm run observability:ready`
- testes de matriz de adaptadores direcionados assim que a matriz se mover de documentação para dados

### HUD, Status e Observabilidade

Adotar do Claude HUD e da revisão do código-fonte do Claude Code:

- Pressão de contexto: uso, risco de compactação, avisos de resultado grande e estado de resumo.
- Atividade de ferramenta: ferramenta ativa, ferramentas recentes, duração, operações arriscadas e solicitações de permissão.
- Atividade de agent: subagents ativos, tarefa delegada, branch/worktree e estado de espera.
- Atividade de fila: PRs/issues abertos, estado de CI, lotes obsoletos/em conflito, estado de revisão e backlog de recuperação de PRs obsoletos fechados.
- Custo/risco: estimativa de custo de Token, risco de operação destrutiva, risco de hook/MCP e estado de verificação de segurança.

Trabalho no repositório:

- Manter `docs/architecture/observability-readiness.md` como o gate de prontidão voltado ao operador.
- Definir um contrato JSON HUD/status versionado que tanto o ECC2 quanto o ECC Tools possam consumir.
- Adicionar exportações de amostra de `loop-status`, `session-inspect`, auditoria de harness e ledger de risco em um diretório de fixtures antes de construir a UI visual.

Verificação:

- `npm run observability:ready`
- validação de fixture para cada payload de status
- teste de fumaça multiplataforma para comandos que leem histórico de sessão

### Loop de Harness Auto-Aperfeiçoável

Adotar do Meta-Harness, Autocontext e Hermes Agent:

- Separar o loop em observação, proposta, verificação, promoção e reversão.
- Armazenar cada melhoria proposta como trace mais artefato, não apenas como um arquivo final alterado.
- Promover playbooks somente após um verificador provar que eles melhoram um cenário sem ampliar o raio de explosão.
- Usar conjuntos RAG/referência para padrões ECC aprovados, histórico de equipe, falhas de CI, resultados de revisão, qualidade de configuração de harness e decisões de segurança.

Trabalho no repositório:

- `everything-claude-code`: documentar specs de cenário, contratos de verificador e regras de promoção de playbook.
- `ECC-Tools`: mapear descobertas do analisador para comentários de PR, execuções de verificação e tarefas do Linear sem sobrecarregar o workspace.
- `agentshield`: alimentar descobertas de injeção de prompt e risco de configuração em suítes de regressão.

Protótipo atual:

- `docs/architecture/evaluator-rag-prototype.md` define o contrato de artefato avaliador/RAG somente leitura.
- `examples/evaluator-rag-prototype/` registra a primeira spec de cenário, trace, relatório, playbook candidato e resultado do verificador para recuperação de PR obsoleto.

Verificação:

- protótipo somente leitura que emite um trace, relatório, playbook candidato e resultado do verificador
- fixture de regressão provando que uma proposta ruim é rejeitada

### Plataforma de Segurança Empresarial AgentShield

O AgentShield deve evoluir de um scanner útil para uma plataforma de segurança empresarial.

Forma do backlog:

- Schema de política para linha de base da organização, severidade de regra, proprietário, exceção, expiração, evidência e trilha de auditoria.
- Saída SARIF para varredura de código GitHub.
- Pacotes de política para OSS, equipe, empresa, regulado, hooks/MCP de alto risco e aplicação de CI.
- Inteligência de cadeia de fornecimento para pacotes MCP, proveniência npm/pip, CVEs, typosquats e reputação de dependência.
- Corpus de injeção de prompt e benchmark de regressão.
- Saída de relatório JSON mais HTML/PDF executivo.

Verificação:

- testes unitários de schema
- testes de fixture SARIF
- testes golden de pacote de política
- testes de regressão de falso positivo do histórico público de issues

### Plataforma Comercial e de Revisão ECC Tools

O ECC Tools deve se tornar a camada nativa do GitHub para faturamento, análise profunda, verificações de PR e rastreamento de progresso no Linear.

Forma do backlog:

- Auditoria de faturamento nativa do GitHub Marketplace antes de qualquer anúncio de pagamentos: planos, assentos, mapeamento de org/conta, estado de assinatura, comportamento de excesso, comportamento de rebaixamento/cancelamento e modos de falha.
- Analisador profundo comparável em escopo às partes úteis do GitGuardian, Dependabot, CodeRabbit e Greptile: evidência de segurança, risco de dependência, recomendações de CI/CD, comportamento de revisão de PR, qualidade de configuração, risco de Token/custo e desvio de harness.
- Conjunto RAG/referência sobre padrões ECC aprovados, resultados históricos de PR, avisos de dependência, falhas de CI, decisões de revisão e convenções específicas de equipe.
- Sincronização com Linear que mapeia descobertas para status de projeto, evidência de milestone e issues prontos para proprietário sem esgotar os limites de issues.

Verificação:

- testes de fixture de execução de verificação
- testes de replay de webhook de faturamento
- fixtures golden de PR do analisador
- fixture de execução a seco de sincronização com Linear

### Faixa de Recuperação de PRs Obsoletos Fechados

Fechar PRs obsoletos mantém a fila pública utilizável, mas trabalhos úteis não devem ser perdidos porque um colaborador não tem mais tempo para fazer rebase.

Regra de execução:

1. Fechar PRs obsoletos, em conflito ou obsoletos com um comentário educado.
2. Registrá-los em um ledger de recuperação com PR de origem, autor, razão do fechamento, arquivos/conceitos úteis, risco e ação recomendada do mantenedor.
3. Após o lote de limpeza, inspecionar manualmente o diff de cada PR fechado.
4. Cherry-pick somente quando o patch ainda se aplica limpo e preserva a arquitetura atual. Caso contrário, reimplementar a ideia útil em um novo branch do mantenedor.
5. Preservar a atribuição no corpo do commit ou no corpo do PR.
6. Comentar de volta no PR de origem quando um trabalho útil chega, vinculando ao PR do mantenedor ou ao commit mesclado.
7. Marcar o item do ledger como aterrizou, substituído, rastreado no Linear ou sem ação.

Proteções necessárias:

- Nunca fazer cherry-pick cego de ruído gerado, localização em massa ou mudanças de versão principal de dependência.
- Preferir PRs pequenos do mantenedor em vez de um megabranch de recuperação.
- Executar os mesmos gates de validação que mudanças normais de código, documentação ou catálogo.
- Manter o crédito do colaborador mesmo quando a implementação final é reescrita.

## Ordem de Implementação de Curto Prazo

1. Estender a matriz de adaptadores de harness e o onramp de scorecard público.
2. Manter o checklist de publicação de release/nome/plugin atual com evidência de commit final antes da publicação do rc.1.
3. Definir o contrato JSON HUD/status e o diretório de fixtures.
4. Iniciar o schema de política do AgentShield mais fixtures SARIF.
5. Auditar as superfícies de faturamento e execução de verificação do ECC Tools.
6. Inventariar pastas legadas e PRs obsoletos fechados no ledger de recuperação.
7. Portar trabalhos úteis obsoletos em PRs pequenos atribuídos do mantenedor.

## Não Objetivos

- Telemetria hospedada antes que o modelo de evento local seja útil e testável.
- Mutação automática de configurações de harness do usuário sem evidência do verificador.
- Tratar qualquer harness de agent como a interface canônica.
- Anúncios de release ou pagamentos antes que a evidência de comando, pacote, marketplace e faturamento esteja atualizada.
