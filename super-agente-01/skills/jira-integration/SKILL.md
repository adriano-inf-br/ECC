---
name: jira-integration
description: Use esta skill ao recuperar tickets do Jira, analisar requisitos, atualizar o status de tickets, adicionar comentários ou fazer a transição de issues. Fornece padrões da API do Jira via MCP ou chamadas REST diretas.
metadata:
  origin: ECC
---

# Jira Integration Skill

Recupere, analise e atualize tickets do Jira diretamente a partir do seu fluxo de trabalho de codificação com IA. Suporta tanto a abordagem **baseada em MCP** (recomendada) quanto a de **API REST direta**.

## Quando ativar

- Buscar um ticket do Jira para entender requisitos
- Extrair critérios de aceitação testáveis de um ticket
- Adicionar comentários de progresso a uma issue do Jira
- Fazer a transição do status de um ticket (To Do → In Progress → Done)
- Vincular merge requests ou branches a uma issue do Jira
- Pesquisar issues por consulta JQL

## Pré-requisitos

### Opção A: Servidor MCP (recomendada)

Instale o servidor MCP `mcp-atlassian`. Ele expõe as ferramentas do Jira diretamente ao seu agent de IA.

**Requisitos:**
- Python 3.10+
- `uvx` (do `uv`), instalado via seu gerenciador de pacotes ou pela documentação oficial de instalação do `uv`

**Adicione à sua configuração de MCP** (ex.: `~/.claude.json` → `mcpServers`):

```json
{
  "jira": {
    "command": "uvx",
    "args": ["mcp-atlassian==0.21.0"],
    "env": {
      "JIRA_URL": "https://YOUR_ORG.atlassian.net",
      "JIRA_EMAIL": "your.email@example.com",
      "JIRA_API_TOKEN": "your-api-token"
    },
    "description": "Jira issue tracking — search, create, update, comment, transition"
  }
}
```

> **Segurança:** Nunca insira segredos diretamente no código. Prefira definir `JIRA_URL`, `JIRA_EMAIL` e `JIRA_API_TOKEN` no ambiente do seu sistema (ou em um gerenciador de segredos). Use o bloco `env` do MCP apenas para arquivos de configuração locais não versionados.

**Para obter um token de API do Jira:**
1. Acesse <https://id.atlassian.com/manage-profile/security/api-tokens>
2. Clique em **Create API token**
3. Copie o token — armazene-o no seu ambiente, nunca no código-fonte

### Opção B: API REST direta

Se o MCP não estiver disponível, use diretamente a API REST v3 do Jira via `curl` ou um script auxiliar.

**Variáveis de ambiente necessárias:**

| Variável | Descrição |
|----------|-------------|
| `JIRA_URL` | A URL da sua instância do Jira (ex.: `https://yourorg.atlassian.net`) |
| `JIRA_EMAIL` | O e-mail da sua conta Atlassian |
| `JIRA_API_TOKEN` | Token de API de id.atlassian.com |

Armazene-as no ambiente do seu shell, em um gerenciador de segredos ou em um arquivo de ambiente local não versionado. Não as faça commit no repositório.

Para exemplos diretos com `curl`, mantenha as credenciais fora dos argumentos de linha de comando passando a configuração de usuário do Jira via stdin:

```bash
jira_curl() {
  printf 'user = "%s:%s"\n' "$JIRA_EMAIL" "$JIRA_API_TOKEN" |
    curl -s -K - "$@"
}
```

## Referência de ferramentas MCP

Quando o servidor MCP `mcp-atlassian` está configurado, estas ferramentas ficam disponíveis:

| Ferramenta | Finalidade | Exemplo |
|------|---------|---------|
| `jira_search` | Consultas JQL | `project = PROJ AND status = "In Progress"` |
| `jira_get_issue` | Buscar os detalhes completos de uma issue pela chave | `PROJ-1234` |
| `jira_create_issue` | Criar issues (Task, Bug, Story, Epic) | Novo relato de bug |
| `jira_update_issue` | Atualizar campos (summary, description, assignee) | Alterar o responsável |
| `jira_transition_issue` | Alterar o status | Mover para "In Review" |
| `jira_add_comment` | Adicionar comentários | Atualização de progresso |
| `jira_get_sprint_issues` | Listar issues de uma sprint | Revisão da sprint ativa |
| `jira_create_issue_link` | Vincular issues (Blocks, Relates to) | Rastreamento de dependências |
| `jira_get_issue_development_info` | Ver PRs, branches e commits vinculados | Contexto de desenvolvimento |

> **Dica:** Sempre chame `jira_get_transitions` antes de fazer uma transição — os IDs de transição variam conforme o fluxo de trabalho de cada projeto.

## Referência da API REST direta

### Buscar um ticket

```bash
jira_curl \
  -H "Content-Type: application/json" \
  "$JIRA_URL/rest/api/3/issue/PROJ-1234" | jq '{
    key: .key,
    summary: .fields.summary,
    status: .fields.status.name,
    priority: .fields.priority.name,
    type: .fields.issuetype.name,
    assignee: .fields.assignee.displayName,
    labels: .fields.labels,
    description: .fields.description
  }'
```

### Buscar comentários

```bash
jira_curl \
  -H "Content-Type: application/json" \
  "$JIRA_URL/rest/api/3/issue/PROJ-1234?fields=comment" | jq '.fields.comment.comments[] | {
    author: .author.displayName,
    created: .created[:10],
    body: .body
  }'
```

### Adicionar um comentário

```bash
jira_curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "body": {
      "version": 1,
      "type": "doc",
      "content": [{
        "type": "paragraph",
        "content": [{"type": "text", "text": "Your comment here"}]
      }]
    }
  }' \
  "$JIRA_URL/rest/api/3/issue/PROJ-1234/comment"
```

### Fazer a transição de um ticket

```bash
# 1. Obter as transições disponíveis
jira_curl \
  "$JIRA_URL/rest/api/3/issue/PROJ-1234/transitions" | jq '.transitions[] | {id, name: .name}'

# 2. Executar a transição (substitua TRANSITION_ID)
jira_curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"transition": {"id": "TRANSITION_ID"}}' \
  "$JIRA_URL/rest/api/3/issue/PROJ-1234/transitions"
```

### Pesquisar com JQL

```bash
jira_curl -G \
  --data-urlencode "jql=project = PROJ AND status = 'In Progress'" \
  "$JIRA_URL/rest/api/3/search"
```

## Analisando um ticket

Ao recuperar um ticket para desenvolvimento ou automação de testes, extraia:

### 1. Requisitos testáveis
- **Requisitos funcionais** — O que a funcionalidade faz
- **Critérios de aceitação** — Condições que devem ser atendidas
- **Comportamentos testáveis** — Ações específicas e resultados esperados
- **Papéis de usuário** — Quem usa esta funcionalidade e suas permissões
- **Requisitos de dados** — Quais dados são necessários
- **Pontos de integração** — APIs, serviços ou sistemas envolvidos

### 2. Tipos de teste necessários
- **Testes unitários** — Funções e utilitários individuais
- **Testes de integração** — Endpoints de API e interações entre serviços
- **Testes E2E** — Fluxos de UI voltados ao usuário
- **Testes de API** — Contratos de endpoints e tratamento de erros

### 3. Casos de borda e cenários de erro
- Entradas inválidas (vazias, longas demais, caracteres especiais)
- Acesso não autorizado
- Falhas de rede ou timeouts
- Usuários concorrentes ou condições de corrida
- Condições de limite (boundary)
- Dados ausentes ou nulos
- Transições de estado (navegação para trás, refresh, etc.)

### 4. Saída de análise estruturada

```
Ticket: PROJ-1234
Summary: [ticket title]
Status: [current status]
Priority: [High/Medium/Low]
Test Types: Unit, Integration, E2E

Requirements:
1. [requirement 1]
2. [requirement 2]

Acceptance Criteria:
- [ ] [criterion 1]
- [ ] [criterion 2]

Test Scenarios:
- Happy Path: [description]
- Error Case: [description]
- Edge Case: [description]

Test Data Needed:
- [data item 1]
- [data item 2]

Dependencies:
- [dependency 1]
- [dependency 2]
```

## Atualizando tickets

### Quando atualizar

| Etapa do fluxo de trabalho | Atualização no Jira |
|---|---|
| Iniciar o trabalho | Transição para "In Progress" |
| Testes escritos | Comentário com resumo da cobertura de testes |
| Branch criada | Comentário com o nome da branch |
| PR/MR criado | Comentário com o link, vincular a issue |
| Testes passando | Comentário com resumo dos resultados |
| PR/MR mesclado | Transição para "Done" ou "In Review" |

### Modelos de comentário

**Iniciando o trabalho:**
```
Starting implementation for this ticket.
Branch: feat/PROJ-1234-feature-name
```

**Testes implementados:**
```
Automated tests implemented:

Unit Tests:
- [test file 1] — [what it covers]
- [test file 2] — [what it covers]

Integration Tests:
- [test file] — [endpoints/flows covered]

All tests passing locally. Coverage: XX%
```

**PR criado:**
```
Pull request created:
[PR Title](https://github.com/org/repo/pull/XXX)

Ready for review.
```

**Trabalho concluído:**
```
Implementation complete.

PR merged: [link]
Test results: All passing (X/Y)
Coverage: XX%
```

## Diretrizes de segurança

- **Nunca insira diretamente no código** tokens de API do Jira em código-fonte ou arquivos de skill
- **Sempre use** variáveis de ambiente ou um gerenciador de segredos
- **Adicione `.env`** ao `.gitignore` em todos os projetos
- **Rotacione os tokens** imediatamente se forem expostos no histórico do git
- **Use tokens de API com privilégio mínimo**, com escopo restrito aos projetos necessários
- **Valide** que as credenciais estão definidas antes de fazer chamadas de API — falhe rápido com uma mensagem clara

## Resolução de problemas

| Erro | Causa | Correção |
|---|---|---|
| `401 Unauthorized` | Token de API inválido ou expirado | Regere em id.atlassian.com |
| `403 Forbidden` | Token sem permissões no projeto | Verifique os escopos do token e o acesso ao projeto |
| `404 Not Found` | Chave de ticket ou URL base incorreta | Verifique `JIRA_URL` e a chave do ticket |
| `spawn uvx ENOENT` | A IDE não encontra `uvx` no PATH | Use o caminho completo (ex.: `~/.local/bin/uvx`) ou defina o PATH em `~/.zprofile` |
| Connection timeout | Problema de rede/VPN | Verifique a conexão de VPN e as regras de firewall |

## Boas práticas

- Atualize o Jira conforme avança, não tudo de uma vez no final
- Mantenha os comentários concisos, mas informativos
- Vincule em vez de copiar — aponte para PRs, relatórios de teste e dashboards
- Use @menções se precisar de input de outras pessoas
- Verifique as issues vinculadas para entender o escopo completo da funcionalidade antes de começar
- Se os critérios de aceitação estiverem vagos, peça esclarecimentos antes de escrever código
