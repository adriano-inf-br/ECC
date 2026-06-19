---
name: claude-devfleet
description: Orquestre tarefas de código multi-agent via Claude DevFleet — planeje projetos, despache agents paralelos em worktrees isolados, monitore o progresso e leia relatórios estruturados.
metadata:
  origin: community
---

# Claude DevFleet Multi-Agent Orchestration

## Quando Usar

Use esta skill quando você precisar despachar múltiplos agents do Claude Code para trabalhar em tarefas de código em paralelo. Cada agent roda em um worktree git isolado com ferramental completo.

## Configuração

O servidor DevFleet é um projeto separado, não incluído no ECC. Instale e
execute-o a partir do repositório dele primeiro: <https://github.com/LEC-AI/claude-devfleet>

Em seguida, conecte a instância em execução via MCP:
```bash
claude mcp add devfleet --transport http http://localhost:18801/mcp
```

Antes do primeiro uso, verifique se o processo escutando na porta 18801 é o
binário do DevFleet que você instalou (veja SECURITY.md sobre servidores MCP em localhost).

## Como Funciona

```
User → "Build a REST API with auth and tests"
  ↓
plan_project(prompt) → project_id + DAG de missões
  ↓
Mostrar plano ao usuário → obter aprovação
  ↓
dispatch_mission(M1) → Agent 1 é iniciado em worktree
  ↓
M1 conclui → auto-merge → auto-dispatch M2 (depends_on M1)
  ↓
M2 conclui → auto-merge
  ↓
get_report(M2) → files_changed, what_done, errors, next_steps
  ↓
Reportar de volta ao usuário
```

### Tools

| Tool | Propósito |
|------|---------|
| `plan_project(prompt)` | A IA decompõe uma descrição em um projeto com missões encadeadas |
| `create_project(name, path?, description?)` | Cria um projeto manualmente, retorna `project_id` |
| `create_mission(project_id, title, prompt, depends_on?, auto_dispatch?)` | Adiciona uma missão. `depends_on` é uma lista de strings de ID de missão (ex.: `["abc-123"]`). Defina `auto_dispatch=true` para iniciar automaticamente quando as dependências forem atendidas. |
| `dispatch_mission(mission_id, model?, max_turns?)` | Inicia um agent em uma missão |
| `cancel_mission(mission_id)` | Para um agent em execução |
| `wait_for_mission(mission_id, timeout_seconds?)` | Bloqueia até uma missão concluir (veja a nota abaixo) |
| `get_mission_status(mission_id)` | Verifica o progresso da missão sem bloquear |
| `get_report(mission_id)` | Lê o relatório estruturado (arquivos alterados, testados, erros, próximos passos) |
| `get_dashboard()` | Visão geral do sistema: agents em execução, estatísticas, atividade recente |
| `list_projects()` | Navega por todos os projetos |
| `list_missions(project_id, status?)` | Lista as missões de um projeto |

> **Nota sobre `wait_for_mission`:** Isso bloqueia a conversa por até `timeout_seconds` (padrão 600). Para missões de longa duração, prefira fazer polling com `get_mission_status` a cada 30–60 segundos, para que o usuário veja atualizações de progresso.

### Fluxo de trabalho: Planejar → Despachar → Monitorar → Reportar

1. **Planejar**: Chame `plan_project(prompt="...")` → retorna `project_id` + lista de missões com cadeias `depends_on` e `auto_dispatch=true`.
2. **Mostrar plano**: Apresente os títulos das missões, os tipos e a cadeia de dependências ao usuário.
3. **Despachar**: Chame `dispatch_mission(mission_id=<first_mission_id>)` na missão raiz (`depends_on` vazio). As missões restantes são despachadas automaticamente conforme suas dependências concluem (porque `plan_project` define `auto_dispatch=true` nelas).
4. **Monitorar**: Chame `get_mission_status(mission_id=...)` ou `get_dashboard()` para verificar o progresso.
5. **Reportar**: Chame `get_report(mission_id=...)` quando as missões concluírem. Compartilhe os destaques com o usuário.

### Concorrência

O DevFleet executa até 3 agents concorrentes por padrão (configurável via `DEVFLEET_MAX_AGENTS`). Quando todos os slots estão ocupados, as missões com `auto_dispatch=true` ficam na fila no watcher de missões e são despachadas automaticamente conforme os slots ficam livres. Verifique `get_dashboard()` para o uso atual de slots.

## Exemplos

### Totalmente automático: planejar e lançar

1. `plan_project(prompt="...")` → mostra o plano com missões e dependências.
2. Despache a primeira missão (aquela com `depends_on` vazio).
3. As missões restantes são despachadas automaticamente conforme as dependências são resolvidas (elas têm `auto_dispatch=true`).
4. Reporte de volta com o ID do projeto e a contagem de missões para que o usuário saiba o que foi lançado.
5. Faça polling com `get_mission_status` ou `get_dashboard()` periodicamente até que todas as missões atinjam um estado terminal (`completed`, `failed` ou `cancelled`).
6. `get_report(mission_id=...)` para cada missão terminal — resuma os sucessos e destaque as falhas com erros e próximos passos.

### Manual: controle passo a passo

1. `create_project(name="My Project")` → retorna `project_id`.
2. `create_mission(project_id=project_id, title="...", prompt="...", auto_dispatch=true)` para a primeira missão (raiz) → capture `root_mission_id`.
   `create_mission(project_id=project_id, title="...", prompt="...", auto_dispatch=true, depends_on=["<root_mission_id>"])` para cada tarefa subsequente.
3. `dispatch_mission(mission_id=...)` na primeira missão para iniciar a cadeia.
4. `get_report(mission_id=...)` quando concluído.

### Sequencial com revisão

1. `create_project(name="...")` → obtenha `project_id`.
2. `create_mission(project_id=project_id, title="Implement feature", prompt="...")` → obtenha `impl_mission_id`.
3. `dispatch_mission(mission_id=impl_mission_id)`, depois faça polling com `get_mission_status` até concluir.
4. `get_report(mission_id=impl_mission_id)` para revisar os resultados.
5. `create_mission(project_id=project_id, title="Review", prompt="...", depends_on=[impl_mission_id], auto_dispatch=true)` — inicia automaticamente, já que a dependência já foi atendida.

## Diretrizes

- Sempre confirme o plano com o usuário antes de despachar, a menos que ele já tenha dito para prosseguir.
- Inclua os títulos e IDs das missões ao reportar o status.
- Se uma missão falhar, leia o relatório dela antes de tentar novamente.
- Verifique `get_dashboard()` para a disponibilidade de slots de agent antes de despachar em massa.
- As dependências de missão formam um DAG — não crie dependências circulares.
- Cada agent roda em um worktree git isolado e faz auto-merge na conclusão. Se ocorrer um conflito de merge, as mudanças permanecem na branch de worktree do agent para resolução manual.
- Ao criar missões manualmente, sempre defina `auto_dispatch=true` se quiser que elas sejam disparadas automaticamente quando as dependências concluírem. Sem essa flag, as missões permanecem no status `draft`.
