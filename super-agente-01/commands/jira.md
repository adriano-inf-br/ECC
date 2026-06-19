---
description: Recupera um ticket do Jira, analisa requisitos, atualiza status ou adiciona comentários. Usa a skill jira-integration e MCP ou REST API.
---

# Comando Jira

Interaja com tickets do Jira diretamente do seu fluxo de trabalho — busque tickets, analise requisitos, adicione comentários e altere o status.

## Uso

```
/jira get <TICKET-KEY>          # Busca e analisa um ticket
/jira comment <TICKET-KEY>      # Adiciona um comentário de progresso
/jira transition <TICKET-KEY>   # Altera o status do ticket
/jira search <JQL>              # Pesquisa issues com JQL
```

## O Que Este Comando Faz

1. **Buscar e Analisar** — Busca um ticket do Jira e extrai requisitos, critérios de aceitação, cenários de teste e dependências
2. **Comentar** — Adiciona atualizações de progresso estruturadas a um ticket
3. **Transicionar** — Move um ticket pelos estados do fluxo de trabalho (To Do → In Progress → Done)
4. **Pesquisar** — Encontra issues usando consultas JQL

## Como Funciona

### `/jira get <TICKET-KEY>`

1. Buscar o ticket no Jira (via MCP `jira_get_issue` ou REST API)
2. Extrair todos os campos: resumo, descrição, critérios de aceitação, prioridade, labels, issues vinculadas
3. Opcionalmente buscar comentários para contexto adicional
4. Produzir uma análise estruturada:

```
Ticket: PROJ-1234
Summary: [title]
Status: [status]
Priority: [priority]
Type: [Story/Bug/Task]

Requirements:
1. [extracted requirement]
2. [extracted requirement]

Acceptance Criteria:
- [ ] [criterion from ticket]

Test Scenarios:
- Happy Path: [description]
- Error Case: [description]
- Edge Case: [description]

Dependencies:
- [linked issues, APIs, services]

Recommended Next Steps:
- /plan to create implementation plan
- `tdd-workflow` skill to implement with tests first
```

### `/jira comment <TICKET-KEY>`

1. Summarize current session progress (what was built, tested, committed)
2. Format as a structured comment
3. Post to the Jira ticket

### `/jira transition <TICKET-KEY>`

1. Fetch available transitions for the ticket
2. Show options to user
3. Execute the selected transition

### `/jira search <JQL>`

1. Execute the JQL query against Jira
2. Return a summary table of matching issues

## Prerequisites

This command requires Jira credentials. Choose one:

**Option A — MCP Server (recommended):**
Add `jira` to your `mcpServers` config (see `mcp-configs/mcp-servers.json` for the template).

**Option B — Environment variables:**
```bash
export JIRA_URL="https://yourorg.atlassian.net"
export JIRA_EMAIL="your.email@example.com"
export JIRA_API_TOKEN="your-api-token"
```

If credentials are missing, stop and direct the user to set them up.

## Integration with Other Commands

After analyzing a ticket:
- Use `/plan` to create an implementation plan from the requirements
- Use the `tdd-workflow` skill to implement with test-driven development
- Use `/code-review` after implementation
- Use `/jira comment` to post progress back to the ticket
- Use `/jira transition` to move the ticket when work is complete

## Related

- **Skill:** `skills/jira-integration/`
- **MCP config:** `mcp-configs/mcp-servers.json` → `jira`
