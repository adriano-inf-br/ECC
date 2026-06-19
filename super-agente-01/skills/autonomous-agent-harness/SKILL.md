---
name: autonomous-agent-harness
description: Transforme o Claude Code em um sistema de Agent totalmente autônomo com memória persistente, operações agendadas, computer use e enfileiramento de tarefas. Substitui frameworks de Agent independentes (Hermes, AutoGPT) aproveitando crons, dispatch, ferramentas MCP e memória nativas do Claude Code. Use quando o usuário quer operação autônoma contínua, tarefas agendadas ou um loop de Agent autodirigido.
metadata:
  origin: ECC
---

# Autonomous Agent Harness

Transforme o Claude Code em um sistema de Agent persistente e autodirigido usando apenas recursos nativos e servidores MCP.

## Limites de Consentimento e Segurança

A operação autônoma deve ser explicitamente solicitada e delimitada pelo usuário. Não crie agendamentos, não dispare agents remotos, não escreva memória persistente, não use controle de computador, não publique externamente, não modifique recursos de terceiros nem aja sobre comunicações privadas, a menos que o usuário tenha aprovado essa capacidade e o workspace-alvo para a configuração atual.

Prefira planos de dry-run e arquivos de fila locais antes de habilitar ações recorrentes ou orientadas a eventos. Mantenha credenciais, exports de workspace privado, datasets pessoais e automações específicas de conta fora de artefatos reutilizáveis do ECC.

## When to Activate

- O usuário quer um Agent que rode continuamente ou em um agendamento
- Configurar workflows automatizados que disparam periodicamente
- Construir um assistente de IA pessoal que lembra contexto entre sessões
- O usuário diz "rode isto todo dia", "verifique isto regularmente", "continue monitorando"
- Quer replicar funcionalidade do Hermes, AutoGPT ou frameworks de Agent autônomo similares
- Precisa de computer use combinado com execução agendada

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    Claude Code Runtime                        │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐ │
│  │  Crons   │  │ Dispatch │  │ Memory   │  │ Computer    │ │
│  │ Schedule │  │ Remote   │  │ Store    │  │ Use         │ │
│  │ Tasks    │  │ Agents   │  │          │  │             │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬──────┘ │
│       │              │             │                │        │
│       ▼              ▼             ▼                ▼        │
│  ┌──────────────────────────────────────────────────────┐    │
│  │              ECC Skill + Agent Layer                  │    │
│  │                                                      │    │
│  │  skills/     agents/     commands/     hooks/        │    │
│  └──────────────────────────────────────────────────────┘    │
│       │              │             │                │        │
│       ▼              ▼             ▼                ▼        │
│  ┌──────────────────────────────────────────────────────┐    │
│  │              MCP Server Layer                        │    │
│  │                                                      │    │
│  │  memory    github    exa    supabase    browser-use  │    │
│  └──────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

## Componentes Centrais

### 1. Memória Persistente

Use o sistema de memória embutido do Claude Code, aprimorado com o servidor MCP de memória para dados estruturados.

**Memória embutida** (`~/.claude/projects/*/memory/`):
- Preferências do usuário, feedback, contexto do projeto
- Armazenada como arquivos markdown com frontmatter
- Carregada automaticamente no início da sessão

**Servidor MCP de memória** (grafo de conhecimento estruturado):
- Entidades, relações, observações
- Estrutura de grafo consultável
- Persistência entre sessões

**Padrões de memória:**

```
# Curto prazo: contexto da sessão atual
Use TodoWrite for in-session task tracking

# Médio prazo: arquivos de memória do projeto
Write to ~/.claude/projects/*/memory/ for cross-session recall

# Longo prazo: grafo de conhecimento MCP
Use mcp__memory__create_entities for permanent structured data
Use mcp__memory__create_relations for relationship mapping
Use mcp__memory__add_observations for new facts about known entities
```

### 2. Operações Agendadas (Crons)

Use as tarefas agendadas do Claude Code para criar operações de Agent recorrentes.

**Configurando um cron:**

```
# Via ferramenta MCP
mcp__scheduled-tasks__create_scheduled_task({
  name: "daily-pr-review",
  schedule: "0 9 * * 1-5",  # 9 AM weekdays
  prompt: "Review all open PRs in affaan-m/everything-claude-code. For each: check CI status, review changes, flag issues. Post summary to memory.",
  project_dir: "/path/to/repo"
})

# Via claude -p (modo programático)
echo "Review open PRs and summarize" | claude -p --project /path/to/repo
```

**Padrões úteis de cron:**

| Padrão | Agendamento | Caso de Uso |
|---------|----------|----------|
| Daily standup | `0 9 * * 1-5` | Revisar PRs, issues, status de deploy |
| Weekly review | `0 10 * * 1` | Métricas de qualidade de código, cobertura de testes |
| Hourly monitor | `0 * * * *` | Saúde de produção, checagens de taxa de erro |
| Nightly build | `0 2 * * *` | Rodar a suíte completa de testes, scan de segurança |
| Pre-meeting | `*/30 * * * *` | Preparar contexto para reuniões futuras |

### 3. Dispatch / Agents Remotos

Dispare agents do Claude Code remotamente para workflows orientados a eventos.

**Padrões de dispatch:**

```bash
# Disparar a partir do CI/CD
curl -X POST "https://api.anthropic.com/dispatch" \
  -H "Authorization: Bearer $ANTHROPIC_API_KEY" \
  -d '{"prompt": "Build failed on main. Diagnose and fix.", "project": "/repo"}'

# Disparar a partir de webhook
# GitHub webhook → dispatch → Claude agent → fix → PR

# Disparar a partir de outro agent
claude -p "Analyze the output of the security scan and create issues for findings"
```

### 4. Computer Use

Aproveite o MCP de computer use do Claude para interação com o mundo físico.

**Capacidades:**
- Automação de navegador (navegar, clicar, preencher formulários, capturar tela)
- Controle de desktop (abrir apps, digitar, controlar o mouse)
- Operações de sistema de arquivos além da CLI

**Casos de uso dentro do harness:**
- Testes automatizados de UIs web
- Preenchimento de formulários e entrada de dados
- Monitoramento baseado em capturas de tela
- Workflows com múltiplos apps

### 5. Fila de Tarefas

Gerencie uma fila persistente de tarefas que sobrevive aos limites de sessão.

**Implementação:**

```
# Persistência de tarefas via memória
Write task queue to ~/.claude/projects/*/memory/task-queue.md

# Formato da tarefa
---
name: task-queue
type: project
description: Persistent task queue for autonomous operation
---

## Active Tasks
- [ ] PR #123: Review and approve if CI green
- [ ] Monitor deploy: check /health every 30 min for 2 hours
- [ ] Research: Find 5 leads in AI tooling space

## Completed
- [x] Daily standup: reviewed 3 PRs, 2 issues
```

## Substituindo o Hermes

| Componente do Hermes | Equivalente no ECC | Como |
|------------------|---------------|-----|
| Gateway/Router | Dispatch + crons do Claude Code | Tarefas agendadas disparam sessões de Agent |
| Sistema de Memória | Memória do Claude + servidor MCP de memória | Persistência embutida + grafo de conhecimento |
| Registro de Ferramentas | Servidores MCP | Provedores de ferramentas carregados dinamicamente |
| Orquestração | Skills + agents do ECC | Definições de Skill direcionam o comportamento do Agent |
| Computer Use | MCP computer-use | Controle nativo de navegador e desktop |
| Gerenciador de Contexto | Gerenciamento de sessão + memória | Ciclo de vida de sessão do ECC 2.0 |
| Fila de Tarefas | Lista de tarefas persistida em memória | TodoWrite + arquivos de memória |

## Guia de Configuração

### Passo 1: Configurar os Servidores MCP

Garanta que estes estejam em `~/.claude.json`:

```json
{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": ["-y", "@anthropic/memory-mcp-server"]
    },
    "scheduled-tasks": {
      "command": "npx",
      "args": ["-y", "@anthropic/scheduled-tasks-mcp-server"]
    },
    "computer-use": {
      "command": "npx",
      "args": ["-y", "@anthropic/computer-use-mcp-server"]
    }
  }
}
```

### Passo 2: Criar os Crons Base

```bash
# Briefing matinal diário
claude -p "Create a scheduled task: every weekday at 9am, review my GitHub notifications, open PRs, and calendar. Write a morning briefing to memory."

# Aprendizado contínuo
claude -p "Create a scheduled task: every Sunday at 8pm, extract patterns from this week's sessions and update the learned skills."
```

### Passo 3: Inicializar o Grafo de Memória

```bash
# Faça o bootstrap da sua identidade e contexto
claude -p "Create memory entities for: me (user profile), my projects, my key contacts. Add observations about current priorities."
```

### Passo 4: Habilitar o Computer Use (Opcional)

Conceda ao MCP computer-use as permissões necessárias para controle de navegador e desktop.

## Exemplos de Workflows

### Revisor de PR Autônomo
```
Cron: every 30 min during work hours
1. Check for new PRs on watched repos
2. For each new PR:
   - Pull branch locally
   - Run tests
   - Review changes with code-reviewer agent
   - Post review comments via GitHub MCP
3. Update memory with review status
```

### Agent de Pesquisa Pessoal
```
Cron: daily at 6 AM
1. Check saved search queries in memory
2. Run Exa searches for each query
3. Summarize new findings
4. Compare against yesterday's results
5. Write digest to memory
6. Flag high-priority items for morning review
```

### Agent de Preparação de Reunião
```
Trigger: 30 min before each calendar event
1. Read calendar event details
2. Search memory for context on attendees
3. Pull recent email/Slack threads with attendees
4. Prepare talking points and agenda suggestions
5. Write prep doc to memory
```

## Restrições

- Tarefas de cron rodam em sessões isoladas — elas não compartilham contexto com sessões interativas a não ser através da memória.
- O computer use requer concessões explícitas de permissão. Não presuma acesso.
- O dispatch remoto pode ter limites de taxa. Projete crons com intervalos apropriados.
- Os arquivos de memória devem ser mantidos concisos. Arquive dados antigos em vez de deixar os arquivos crescerem sem limite.
- Sempre verifique se as tarefas agendadas foram concluídas com sucesso. Adicione tratamento de erros aos prompts de cron.
