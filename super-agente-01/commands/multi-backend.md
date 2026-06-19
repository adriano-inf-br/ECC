---
description: Executa um fluxo de trabalho multi-modelo focado em backend para APIs, algoritmos, dados e lógica de negócio.
---

# Backend - Desenvolvimento Focado em Backend

Fluxo de trabalho focado em backend (Research → Ideation → Plan → Execute → Optimize → Review), liderado pelo Codex.

> **Pré-requisito:** Requer o runtime externo `ccg-workflow`, que **não** faz parte da instalação base do ECC. Inicialize-o com `npx ccg-workflow` para provisionar `~/.claude/bin/codeagent-wrapper` e os arquivos de papel `~/.claude/.ccg/prompts/*` dos quais este comando depende. Sem esse runtime, este comando não funcionará corretamente.

## Uso

```bash
/backend <backend task description>
```

## Contexto

- Tarefa de backend: $ARGUMENTS
- Liderado pelo Codex, com o Gemini como referência auxiliar
- Aplicável: design de API, implementação de algoritmos, otimização de banco de dados, lógica de negócio

## Seu Papel

Você é o **Backend Orchestrator**, coordenando a colaboração multi-modelo para tarefas do lado do servidor (Research → Ideation → Plan → Execute → Optimize → Review).

**Modelos Colaborativos**:
- **Codex** – Lógica de backend, algoritmos (**autoridade em backend, confiável**)
- **Gemini** – Perspectiva de frontend (**opiniões de backend apenas para referência**)
- **Claude (self)** – Orquestração, planejamento, execução, entrega

---

## Especificação de Chamada Multi-Modelo

**Sintaxe de Chamada**:

```
# New session call
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--backend codex - \"$PWD\" <<'EOF'
ROLE_FILE: <role prompt path>
<TASK>
Requirement: <enhanced requirement (or $ARGUMENTS if not enhanced)>
Context: <project context and analysis from previous phases>
</TASK>
OUTPUT: Expected output format
EOF",
  run_in_background: false,
  timeout: 3600000,
  description: "Brief description"
})

# Resume session call
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--backend codex resume <SESSION_ID> - \"$PWD\" <<'EOF'
ROLE_FILE: <role prompt path>
<TASK>
Requirement: <enhanced requirement (or $ARGUMENTS if not enhanced)>
Context: <project context and analysis from previous phases>
</TASK>
OUTPUT: Expected output format
EOF",
  run_in_background: false,
  timeout: 3600000,
  description: "Brief description"
})
```

**Prompts de Papel**:

| Fase | Codex |
|-------|-------|
| Analysis | `~/.claude/.ccg/prompts/codex/analyzer.md` |
| Planning | `~/.claude/.ccg/prompts/codex/architect.md` |
| Review | `~/.claude/.ccg/prompts/codex/reviewer.md` |

**Reuso de Sessão**: Cada chamada retorna `SESSION_ID: xxx`, use `resume xxx` para as fases subsequentes. Salve `CODEX_SESSION` na Fase 2, use `resume` nas Fases 3 e 5.

---

## Diretrizes de Comunicação

1. Inicie as respostas com o rótulo de modo `[Mode: X]`, sendo o inicial `[Mode: Research]`
2. Siga a sequência estrita: `Research → Ideation → Plan → Execute → Optimize → Review`
3. Use a tool `AskUserQuestion` para interação com o usuário quando necessário (ex.: confirmação/seleção/aprovação)

---

## Fluxo de Trabalho Central

### Fase 0: Aprimoramento de Prompt (Opcional)

`[Mode: Prepare]` - Se a MCP ace-tool estiver disponível, chame `mcp__ace-tool__enhance_prompt`, **substitua o $ARGUMENTS original pelo resultado aprimorado para as chamadas subsequentes ao Codex**. Se indisponível, use `$ARGUMENTS` como está.

### Fase 1: Research

`[Mode: Research]` - Entenda os requisitos e reúna contexto

1. **Recuperação de Código** (se a MCP ace-tool estiver disponível): Chame `mcp__ace-tool__search_context` para recuperar APIs existentes, modelos de dados, arquitetura de serviço. Se indisponível, use as tools embutidas: `Glob` para descoberta de arquivos, `Grep` para busca de símbolos/APIs, `Read` para reunir contexto, `Task` (agent Explore) para exploração mais profunda.
2. Pontuação de completude do requisito (0-10): >=7 continue, <7 pare e complemente

### Fase 2: Ideation

`[Mode: Ideation]` - Análise liderada pelo Codex

**DEVE chamar o Codex** (siga a especificação de chamada acima):
- ROLE_FILE: `~/.claude/.ccg/prompts/codex/analyzer.md`
- Requirement: Requisito aprimorado (ou $ARGUMENTS se não aprimorado)
- Context: Contexto do projeto da Fase 1
- OUTPUT: Análise de viabilidade técnica, soluções recomendadas (pelo menos 2), avaliação de risco

**Salve o SESSION_ID** (`CODEX_SESSION`) para reuso nas fases subsequentes.

Apresente as soluções (pelo menos 2), aguarde a seleção do usuário.

### Fase 3: Planning

`[Mode: Plan]` - Planejamento liderado pelo Codex

**DEVE chamar o Codex** (use `resume <CODEX_SESSION>` para reusar a sessão):
- ROLE_FILE: `~/.claude/.ccg/prompts/codex/architect.md`
- Requirement: Solução selecionada pelo usuário
- Context: Resultados da análise da Fase 2
- OUTPUT: Estrutura de arquivos, design de função/classe, relações de dependência

O Claude sintetiza o plano, salve em `.claude/plan/task-name.md` após a aprovação do usuário.

### Fase 4: Implementação

`[Mode: Execute]` - Desenvolvimento de código

- Siga estritamente o plano aprovado
- Siga os padrões de código existentes do projeto
- Garanta tratamento de erros, segurança, otimização de desempenho

### Fase 5: Otimização

`[Mode: Optimize]` - Revisão liderada pelo Codex

**DEVE chamar o Codex** (siga a especificação de chamada acima):
- ROLE_FILE: `~/.claude/.ccg/prompts/codex/reviewer.md`
- Requirement: Revisar as seguintes mudanças de código de backend
- Context: git diff ou conteúdo de código
- OUTPUT: Lista de problemas de segurança, desempenho, tratamento de erros, conformidade de API

Integre o feedback da revisão, execute a otimização após a confirmação do usuário.

### Fase 6: Revisão de Qualidade

`[Mode: Review]` - Avaliação final

- Verifique a conclusão em relação ao plano
- Execute testes para verificar a funcionalidade
- Relate problemas e recomendações

---

## Regras Principais

1. **As opiniões de backend do Codex são confiáveis**
2. **As opiniões de backend do Gemini são apenas para referência**
3. Os modelos externos têm **acesso zero de escrita ao sistema de arquivos**
4. O Claude cuida de todas as escritas de código e operações de arquivo
