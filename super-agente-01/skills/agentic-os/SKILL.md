---
name: agentic-os
description: Construa sistemas operacionais multiagente persistentes no Claude Code. Cobre arquitetura de kernel, agents especialistas, comandos de barra, memória baseada em arquivos, automação agendada e gerenciamento de estado sem bancos de dados externos.
metadata:
  origin: ECC
---

# Agentic OS

Trate o Claude Code como um runtime / sistema operacional persistente em vez de uma sessão de chat. Esta skill codifica a arquitetura usada por configurações agentic de produção: uma config de kernel que roteia tarefas para agents especialistas, memória persistente baseada em arquivos, automação agendada e uma camada de dados JSON/markdown.

## Quando Ativar

- Construir um fluxo de trabalho multiagente dentro do Claude Code
- Configurar automação persistente do Claude Code que sobrevive a reinícios de sessão
- Criar um "OS pessoal" ou "agentic OS" para tarefas recorrentes
- O usuário diz "agentic OS", "OS pessoal", "multiagente", "coordenador de agents", "agent persistente"
- Estruturar projetos de longa duração onde o contexto deve sobreviver entre sessões

## Visão Geral da Arquitetura

O Agentic OS tem quatro camadas. Cada camada é um diretório na raiz do seu projeto.

```
project-root/
├── CLAUDE.md          # Kernel: identidade, regras de roteamento, registro de agents
├── agents/            # Definições de agents especialistas (prompts em markdown)
├── .claude/commands/  # Comandos de barra: CLI voltada ao usuário
├── scripts/           # Scripts daemon: tarefas agendadas ou orientadas a eventos
└── data/              # Estado: sistema de arquivos JSON/markdown, sem DB externo
```

### Responsabilidades das Camadas

| Camada | Propósito | Persistência |
|---|---|---|
| Kernel (`CLAUDE.md`) | Identidade, roteamento, políticas de modelo, registro de agents | Rastreado pelo Git |
| Agents (`agents/`) | Identidades especialistas com tools e memória de escopo definido | Rastreado pelo Git |
| Comandos (`.claude/commands/`) | Comandos de barra voltados ao usuário (`/daily-sync`, `/outreach`) | Rastreado pelo Git |
| Scripts (`scripts/`) | Daemons Python/JS disparados por cron ou webhooks | Rastreado pelo Git |
| Estado (`data/`) | Logs append-only, estado de projeto, registros de decisão | Ignorado ou rastreado pelo Git |

## O Kernel

`CLAUDE.md` é o kernel. Ele atua como o COO / orquestrador. O Claude o lê no início da sessão e o usa para rotear o trabalho.

### Estrutura do Kernel

```markdown
# CLAUDE.md - Agentic OS Kernel

## Identity
You are the COO of [project-name]. You route tasks to specialist agents.
You never write code directly. You delegate to the right agent and synthesize results.

## Agent Registry

| Agent | Role | Trigger |
|---|---|---|
| @dev | Code, architecture, debugging | User says "build", "fix", "refactor" |
| @writer | Documentation, content, emails | User says "write", "draft", "blog" |
| @researcher | Research, analysis, fact-checking | User says "research", "analyze", "compare" |
| @ops | DevOps, deployment, infrastructure | User says "deploy", "CI", "server" |

## Routing Rules
1. Parse the user request for intent keywords
2. Match to the Agent Registry trigger column
3. Load the corresponding agent file from `agents/<name>.md`
4. Hand off execution with full context
5. Synthesize and present the result back to the user

## Model Policies
- Default model: use the repository or harness default.
- @dev tasks: prefer a higher-reasoning model for complex architecture.
- @researcher tasks: use the configured research-capable model and approved search tools.
- Cost ceiling: warn before exceeding the project's configured spend threshold.
```

### Princípio-Chave

O kernel deve ser **pequeno e declarativo**. A lógica de roteamento vive em tabelas markdown simples, não em código. Isso torna o sistema inspecionável e editável sem depuração.

## Agents Especialistas

Cada agent é um arquivo markdown autônomo em `agents/`. O Claude carrega o arquivo de agent relevante ao rotear uma tarefa.

### Formato de Definição de Agent

```markdown
# @dev - Software Engineer

## Identity
You are a senior software engineer. You write clean, tested, production-grade code.
You prefer simple solutions. You ask clarifying questions when requirements are ambiguous.

## Memory Scope
- Read `data/projects/<current-project>.md` for context
- Read `data/decisions/` for architectural decisions
- Append execution logs to `data/logs/<date>-@dev.md`

## Tool Access
- Full filesystem access within project root
- Git operations (status, diff, commit, branch)
- Test runner access
- MCP servers as configured in `.claude/mcp.json`

## Constraints
- Always write tests for new features
- Never commit directly to `main`; use feature branches
- Prefer editing existing files over creating new ones
- Keep functions under 50 lines when possible
```

### Padrão de Colaboração Multiagente

Quando uma tarefa abrange múltiplos agents, o kernel os roda sequencialmente ou em paralelo:

```
User: "Build a landing page and write the launch blog post"

Kernel routing:
1. @dev - "Build a landing page with [requirements]"
2. @writer - "Write a launch blog post for [product] using the landing page copy"
3. Kernel synthesizes both outputs into a unified response
```

Para execução paralela, use a capacidade de tarefas em background do Claude Code ou scripts de shell que invocam o Claude Code com contextos de agent específicos.

## Comandos e Fluxos de Trabalho Diários

Comandos de barra são arquivos markdown em `.claude/commands/`. Eles definem fluxos de trabalho reutilizáveis.

### Estrutura de Comando

```markdown
# /daily-sync

Run the morning briefing:

1. Read `data/logs/last-sync.md` for context
2. Check project status: `git status`, pending PRs, CI health
3. Review `data/inbox/` for new tasks or decisions needed
4. Generate a summary of blockers, priorities, and next actions
5. Append the briefing to `data/logs/daily/<date>.md`
```

### Conjunto Padrão de Comandos

| Comando | Propósito |
|---|---|
| `/daily-sync` | Briefing matinal: status, bloqueadores, prioridades |
| `/outreach` | Roda o fluxo de trabalho de prospecção (email, LinkedIn, etc.) |
| `/research <topic>` | Pesquisa profunda com rastreamento de citações |
| `/apply-jobs` | Personaliza currículo + carta de apresentação para uma vaga-alvo |
| `/analytics` | Puxa métricas do Stripe, GitHub ou fontes customizadas |
| `/interview-prep` | Gera flashcards ou perguntas de entrevista simulada |
| `/decision <topic>` | Registra uma decisão com prós/contras e o caminho escolhido |

### Ativando Comandos

Coloque os arquivos de comando em `.claude/commands/<command-name>.md`. O Claude Code os descobre automaticamente. Os usuários os invocam com `/<command-name>`.

## Memória Persistente

A memória é baseada em arquivos. Sem DB vetorial, sem Redis, sem PostgreSQL. Arquivos JSON e markdown em `data/` são o banco de dados.

### Estrutura do Diretório de Memória

```
data/
├── daily-logs/         # Logs de atividade diária append-only
├── projects/           # Arquivos de contexto por projeto
├── decisions/          # Decisões de arquitetura e negócio (formato ADR)
├── inbox/              # Novas tarefas ou ideias aguardando triagem
├── contacts/           # Pessoas, empresas, notas de relacionamento
└── templates/          # Prompts e formatos reutilizáveis
```

### Formato de Log Diário

```markdown
# 2026-04-22 - Daily Log

## Sessions
- 09:00 - Session 1: Refactored auth module (@dev)
- 11:30 - Session 2: Drafted investor update (@writer)

## Decisions
- Switched from JWT to session cookies (see `data/decisions/2026-04-22-auth.md`)

## Blockers
- Waiting on API key from vendor (follow up 2026-04-24)

## Next Actions
- [ ] Merge auth refactor PR
- [ ] Send investor update for review
```

### Padrão de Autorreflexão

Ao final de cada sessão, o kernel anexa uma reflexão:

```markdown
## Reflection - Session 3
- What worked: Parallel agent execution saved 20 minutes
- What didn't: @researcher hit a paywalled source, need better source ranking
- What to change: Add `source-tier` field to research notes (A/B/C credibility)
```

Isso cria um loop de feedback que melhora o sistema ao longo do tempo sem mudanças de código.

## Automação Agendada

As tarefas do Agentic OS rodam em um agendamento usando cron externo, não o cron embutido do Claude Code (que morre quando a sessão termina).

### macOS: LaunchAgent

```xml
<!-- ~/Library/LaunchAgents/com.agentic.daily-sync.plist -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" ...>
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.agentic.daily-sync</string>
    <key>ProgramArguments</key>
    <array>
        <string>/claude</string>
        <string>--cwd</string>
        <string>/path/to/project</string>
        <string>--command</string>
        <string>/daily-sync</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>8</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>
    <key>StandardOutPath</key>
    <string>/tmp/agentic-daily-sync.log</string>
</dict>
</plist>
```

### Linux: systemd Timer

```ini
# ~/.config/systemd/user/agentic-daily-sync.service
[Unit]
Description=Agentic OS Daily Sync

[Service]
Type=oneshot
ExecStart=/usr/local/bin/claude --cwd /path/to/project --command /daily-sync
```

```ini
# ~/.config/systemd/user/agentic-daily-sync.timer
[Unit]
Description=Run daily sync every morning

[Timer]
OnCalendar=*-*-* 8:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

### Multiplataforma: pm2

```bash
# ecosystem.config.js
module.exports = {
  apps: [{
    name: 'agentic-daily-sync',
    script: 'claude',
    args: '--cwd /path/to/project --command /daily-sync',
    cron_restart: '0 8 * * *',
    autorestart: false
  }]
};
```

## Camada de Dados

A camada de dados é o seu sistema de arquivos. Use JSON para dados estruturados e markdown para conteúdo narrativo.

### JSON para Estado Estruturado

```json
// data/projects/website-v2.json
{
  "name": "Website v2",
  "status": "in-progress",
  "milestone": "beta-launch",
  "agents_involved": ["@dev", "@writer"],
  "files": {
    "spec": "docs/website-v2-spec.md",
    "design": "designs/website-v2.fig"
  },
  "metrics": {
    "commits": 47,
    "last_session": "2026-04-22T11:30:00Z"
  }
}
```

### Markdown para Narrativa

Use markdown para qualquer coisa que um humano leia: decisões, logs, notas de pesquisa, registros de contatos.

### Evolução de Schema

Nunca renomeie campos existentes. Adicione novos campos e marque os antigos como depreciados:

```json
{
  "name": "Website v2",
  "status": "in-progress",
  "milestone": "beta-launch",
  "_deprecated_priority": "high",
  "priority_v2": { "level": "high", "rationale": "Blocks investor demo" }
}
```

Isso mantém os dados históricos legíveis sem scripts de migração.

## Anti-Padrões

### Agent Único Monolítico

```markdown
# BAD - One agent does everything
You are a full-stack developer, writer, researcher, and DevOps engineer.
```

Divida em agents especialistas. O kernel cuida do roteamento.

### Sessões Stateless

```markdown
# BAD - No memory between sessions
Starting fresh every time Claude Code opens.
```

Sempre leia `data/` no início da sessão e escreva de volta ao final dela.

### Credenciais Hardcoded

```markdown
# BAD - API keys in agent files or CLAUDE.md
Your OpenAI API key is sk-xxxxxxxx
```

Use variáveis de ambiente ou um arquivo `.env` carregado por scripts. Os agents referenciam `process.env.API_KEY`.

### Banco de Dados Externo para Estado Simples

```markdown
# BAD - PostgreSQL for a solo user's agentic OS
```

Use arquivos JSON/markdown até você ter múltiplos usuários concorrentes ou GBs de dados.

### Roteamento Superengenheirado

```markdown
# BAD - Routing logic in code instead of markdown tables
if (intent.includes('deploy')) { agent = opsAgent; }
```

Mantenha o roteamento declarativo em tabelas markdown no `CLAUDE.md`. Ele é inspecionável, editável e depurável.

## Boas Práticas

- [ ] `CLAUDE.md` tem menos de 200 linhas e cabe na janela de contexto
- [ ] Cada arquivo de agent tem menos de 100 linhas e foca em um domínio
- [ ] `data/` é ignorado pelo git para logs sensíveis, rastreado pelo git para decisões e specs
- [ ] Os comandos usam nomes imperativos: `/daily-sync`, não `/run-daily-sync`
- [ ] Os logs são append-only; nunca edite logs diários passados
- [ ] Todo agent tem uma seção `Memory Scope` definindo quais arquivos ele lê
- [ ] As reflexões são escritas ao final de cada sessão
- [ ] As tarefas agendadas usam cron externo (LaunchAgent, systemd, pm2), não o cron de sessão do Claude Code
- [ ] Rastreamento de custo: registre o gasto de API por sessão em `data/logs/<date>-costs.json`
- [ ] Um projeto = um Agentic OS. Não compartilhe um único `CLAUDE.md` entre projetos não relacionados.
