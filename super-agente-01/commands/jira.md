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
Resumo: [título]
Status: [status]
Prioridade: [prioridade]
Tipo: [Story/Bug/Task]

Requisitos:
1. [requisito extraído]
2. [requisito extraído]

Critérios de Aceitação:
- [ ] [critério do ticket]

Cenários de Teste:
- Caminho Feliz: [descrição]
- Caso de Erro: [descrição]
- Caso Limite: [descrição]

Dependências:
- [issues vinculadas, APIs, serviços]

Próximos Passos Recomendados:
- /plan para criar um plano de implementação
- skill `tdd-workflow` para implementar com testes primeiro
```

### `/jira comment <TICKET-KEY>`

1. Resumir o progresso da sessão atual (o que foi construído, testado, commitado)
2. Formatar como um comentário estruturado
3. Publicar no ticket do Jira

### `/jira transition <TICKET-KEY>`

1. Buscar as transições disponíveis para o ticket
2. Mostrar as opções ao usuário
3. Executar a transição selecionada

### `/jira search <JQL>`

1. Executar a consulta JQL no Jira
2. Retornar uma tabela-resumo das issues correspondentes

## Pré-requisitos

Este comando requer credenciais do Jira. Escolha uma:

**Opção A — Servidor MCP (recomendado):**
Adicione `jira` à sua configuração `mcpServers` (veja `mcp-configs/mcp-servers.json` para o template).

**Opção B — Variáveis de ambiente:**
```bash
export JIRA_URL="https://yourorg.atlassian.net"
export JIRA_EMAIL="your.email@example.com"
export JIRA_API_TOKEN="your-api-token"
```

Se as credenciais estiverem ausentes, pare e oriente o usuário a configurá-las.

## Integração com Outros Comandos

Após analisar um ticket:
- Use `/plan` para criar um plano de implementação a partir dos requisitos
- Use a skill `tdd-workflow` para implementar com desenvolvimento orientado a testes
- Use `/code-review` após a implementação
- Use `/jira comment` para publicar o progresso de volta no ticket
- Use `/jira transition` para mover o ticket quando o trabalho estiver concluído

## Relacionados

- **Skill:** `skills/jira-integration/`
- **Config de MCP:** `mcp-configs/mcp-servers.json` → `jira`
