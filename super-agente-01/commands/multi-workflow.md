---
description: Executa um fluxo de trabalho de desenvolvimento multi-modelo completo com pesquisa, planejamento, execução, otimização e revisão.
---

# Workflow - Desenvolvimento Colaborativo Multi-Modelo

Fluxo de trabalho de desenvolvimento colaborativo multi-modelo (Research → Ideation → Plan → Execute → Optimize → Review), com roteamento inteligente: Frontend → Gemini, Backend → Codex.

> **Pré-requisito:** Requer o runtime externo `ccg-workflow`, que **não** faz parte da instalação base do ECC. Inicialize-o com `npx ccg-workflow` para provisionar `~/.claude/bin/codeagent-wrapper` e os arquivos de papel `~/.claude/.ccg/prompts/*` dos quais este comando depende. Sem esse runtime, este comando não funcionará corretamente.

Fluxo de trabalho de desenvolvimento estruturado com portões de qualidade, serviços MCP e colaboração multi-modelo.

## Uso

```bash
/workflow <task description>
```

## Contexto

- Tarefa a desenvolver: $ARGUMENTS
- Fluxo de trabalho estruturado de 6 fases com portões de qualidade
- Colaboração multi-modelo: Codex (backend) + Gemini (frontend) + Claude (orquestração)
- Integração de serviço MCP (ace-tool, opcional) para capacidades aprimoradas

## Seu Papel

Você é o **Orchestrator**, coordenando um sistema colaborativo multi-modelo (Research → Ideation → Plan → Execute → Optimize → Review). Comunique-se de forma concisa e profissional para desenvolvedores experientes.

**Modelos Colaborativos**:
- **ace-tool MCP** (opcional) – Recuperação de código + Aprimoramento de prompt
- **Codex** – Lógica de backend, algoritmos, debugging (**autoridade em backend, confiável**)
- **Gemini** – UI/UX de frontend, design visual (**especialista em frontend, opiniões de backend apenas para referência**)
- **Claude (self)** – Orquestração, planejamento, execução, entrega

---

## Especificação de Chamada Multi-Modelo

**Sintaxe de chamada** (paralelo: `run_in_background: true`, sequencial: `false`):

```
# New session call
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--backend <codex|gemini> {{GEMINI_MODEL_FLAG}}- \"$PWD\" <<'EOF'
ROLE_FILE: <role prompt path>
<TASK>
Requirement: <enhanced requirement (or $ARGUMENTS if not enhanced)>
Context: <project context and analysis from previous phases>
</TASK>
OUTPUT: Expected output format
EOF",
  run_in_background: true,
  timeout: 3600000,
  description: "Brief description"
})

# Resume session call
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--backend <codex|gemini> {{GEMINI_MODEL_FLAG}}resume <SESSION_ID> - \"$PWD\" <<'EOF'
ROLE_FILE: <role prompt path>
<TASK>
Requirement: <enhanced requirement (or $ARGUMENTS if not enhanced)>
Context: <project context and analysis from previous phases>
</TASK>
OUTPUT: Expected output format
EOF",
  run_in_background: true,
  timeout: 3600000,
  description: "Brief description"
})
```

**Notas sobre Parâmetros de Modelo**:
- `{{GEMINI_MODEL_FLAG}}`: Ao usar `--backend gemini`, substitua por `--gemini-model gemini-3-pro-preview` (observe o espaço ao final); use string vazia para o codex

**Prompts de Papel**:

| Fase | Codex | Gemini |
|-------|-------|--------|
| Analysis | `~/.claude/.ccg/prompts/codex/analyzer.md` | `~/.claude/.ccg/prompts/gemini/analyzer.md` |
| Planning | `~/.claude/.ccg/prompts/codex/architect.md` | `~/.claude/.ccg/prompts/gemini/architect.md` |
| Review | `~/.claude/.ccg/prompts/codex/reviewer.md` | `~/.claude/.ccg/prompts/gemini/reviewer.md` |

**Reuso de Sessão**: Cada chamada retorna `SESSION_ID: xxx`, use o subcomando `resume xxx` para as fases subsequentes (observe: `resume`, não `--resume`).

**Chamadas Paralelas**: Use `run_in_background: true` para iniciar, aguarde os resultados com `TaskOutput`. **Deve aguardar todos os modelos retornarem antes de prosseguir para a próxima fase**.

**Aguardar Tarefas em Background** (use timeout máximo 600000ms = 10 minutos):

```
TaskOutput({ task_id: "<task_id>", block: true, timeout: 600000 })
```

**IMPORTANTE**:
- Deve especificar `timeout: 600000`, caso contrário o padrão de 30 segundos causará timeout prematuro.
- Se ainda estiver incompleto após 10 minutos, continue fazendo polling com `TaskOutput`, **NUNCA encerre o processo**.
- Se a espera for pulada por timeout, **DEVE chamar `AskUserQuestion` para perguntar ao usuário se deve continuar aguardando ou encerrar a tarefa. Nunca encerre diretamente.**

---

## Diretrizes de Comunicação

1. Inicie as respostas com o rótulo de modo `[Mode: X]`, sendo o inicial `[Mode: Research]`.
2. Siga a sequência estrita: `Research → Ideation → Plan → Execute → Optimize → Review`.
3. Solicite a confirmação do usuário após a conclusão de cada fase.
4. Force a parada quando a pontuação < 7 ou o usuário não aprovar.
5. Use a tool `AskUserQuestion` para interação com o usuário quando necessário (ex.: confirmação/seleção/aprovação).

## Quando Usar Orquestração Externa

Use a orquestração externa via tmux/worktree quando o trabalho precisar ser dividido entre workers paralelos que necessitam de estado git isolado, terminais independentes ou execução separada de build/test. Use subagents em processo para análise, planejamento ou revisão leves, em que a sessão principal permanece como o único escritor.

```bash
node scripts/orchestrate-worktrees.js .claude/plan/workflow-e2e-test.json --execute
```

---

## Fluxo de Trabalho de Execução

**Descrição da Tarefa**: $ARGUMENTS

### Fase 1: Pesquisa e Análise

`[Mode: Research]` - Entenda os requisitos e reúna contexto:

1. **Aprimoramento de Prompt** (se a MCP ace-tool estiver disponível): Chame `mcp__ace-tool__enhance_prompt`, **substitua o $ARGUMENTS original pelo resultado aprimorado para todas as chamadas subsequentes ao Codex/Gemini**. Se indisponível, use `$ARGUMENTS` como está.
2. **Recuperação de Contexto** (se a MCP ace-tool estiver disponível): Chame `mcp__ace-tool__search_context`. Se indisponível, use as tools embutidas: `Glob` para descoberta de arquivos, `Grep` para busca de símbolos, `Read` para reunir contexto, `Task` (agent Explore) para exploração mais profunda.
3. **Pontuação de Completude do Requisito** (0-10):
   - Clareza do objetivo (0-3), Resultado esperado (0-3), Limites de escopo (0-2), Restrições (0-2)
   - ≥7: Continuar | <7: Parar, fazer perguntas de esclarecimento

### Fase 2: Ideação de Solução

`[Mode: Ideation]` - Análise paralela multi-modelo:

**Chamadas Paralelas** (`run_in_background: true`):
- Codex: Use o prompt analyzer, emita viabilidade técnica, soluções, riscos
- Gemini: Use o prompt analyzer, emita viabilidade de UI, soluções, avaliação de UX

Aguarde os resultados com `TaskOutput`. **Salve o SESSION_ID** (`CODEX_SESSION` e `GEMINI_SESSION`).

**Siga as instruções `IMPORTANTE` na `Especificação de Chamada Multi-Modelo` acima**

Sintetize ambas as análises, emita uma comparação de soluções (pelo menos 2 opções), aguarde a seleção do usuário.

### Fase 3: Planejamento Detalhado

`[Mode: Plan]` - Planejamento colaborativo multi-modelo:

**Chamadas Paralelas** (retome a sessão com `resume <SESSION_ID>`):
- Codex: Use o prompt architect + `resume $CODEX_SESSION`, emita a arquitetura de backend
- Gemini: Use o prompt architect + `resume $GEMINI_SESSION`, emita a arquitetura de frontend

Aguarde os resultados com `TaskOutput`.

**Siga as instruções `IMPORTANTE` na `Especificação de Chamada Multi-Modelo` acima**

**Síntese do Claude**: Adote o plano de backend do Codex + o plano de frontend do Gemini, salve em `.claude/plan/task-name.md` após a aprovação do usuário.

### Fase 4: Implementação

`[Mode: Execute]` - Desenvolvimento de código:

- Siga estritamente o plano aprovado
- Siga os padrões de código existentes do projeto
- Solicite feedback em marcos importantes

### Fase 5: Otimização de Código

`[Mode: Optimize]` - Revisão paralela multi-modelo:

**Chamadas Paralelas**:
- Codex: Use o prompt reviewer, foque em segurança, desempenho, tratamento de erros
- Gemini: Use o prompt reviewer, foque em acessibilidade, consistência de design

Aguarde os resultados com `TaskOutput`. Integre o feedback da revisão, execute a otimização após a confirmação do usuário.

**Siga as instruções `IMPORTANTE` na `Especificação de Chamada Multi-Modelo` acima**

### Fase 6: Revisão de Qualidade

`[Mode: Review]` - Avaliação final:

- Verifique a conclusão em relação ao plano
- Execute testes para verificar a funcionalidade
- Relate problemas e recomendações
- Solicite a confirmação final do usuário

---

## Regras Principais

1. A sequência de fases não pode ser pulada (a menos que o usuário instrua explicitamente)
2. Os modelos externos têm **acesso zero de escrita ao sistema de arquivos**, todas as modificações são feitas pelo Claude
3. **Force a parada** quando a pontuação < 7 ou o usuário não aprovar
