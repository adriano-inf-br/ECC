---
description: Cria um plano de implementação multi-modelo sem modificar o código de produção.
---

# Plan - Planejamento Colaborativo Multi-Modelo

Planejamento colaborativo multi-modelo - Recuperação de contexto + Análise de modelo duplo → Gerar plano de implementação passo a passo.

> **Pré-requisito:** Requer o runtime externo `ccg-workflow`, que **não** faz parte da instalação base do ECC. Inicialize-o com `npx ccg-workflow` para provisionar `~/.claude/bin/codeagent-wrapper` e os arquivos de papel `~/.claude/.ccg/prompts/*` dos quais este comando depende. Sem esse runtime, este comando não funcionará corretamente.

$ARGUMENTS

---

## Protocolos Centrais

- **Protocolo de Idioma**: Use **inglês** ao interagir com tools/modelos, comunique-se com o usuário no idioma dele
- **Paralelismo Obrigatório**: As chamadas ao Codex/Gemini DEVEM usar `run_in_background: true` (inclusive chamadas de modelo único, para evitar bloquear a thread principal)
- **Soberania do Código**: Os modelos externos têm **acesso zero de escrita ao sistema de arquivos**, todas as modificações são feitas pelo Claude
- **Mecanismo de Stop-Loss**: Não avance para a próxima fase até que a saída da fase atual seja validada
- **Apenas Planejamento**: Este comando permite ler contexto e escrever em arquivos de plano `.claude/plan/*`, mas **NUNCA modifica o código de produção**

---

## Especificação de Chamada Multi-Modelo

**Sintaxe de Chamada** (paralelo: use `run_in_background: true`):

```
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--backend <codex|gemini> {{GEMINI_MODEL_FLAG}}- \"$PWD\" <<'EOF'
ROLE_FILE: <role prompt path>
<TASK>
Requirement: <enhanced requirement>
Context: <retrieved project context>
</TASK>
OUTPUT: Step-by-step implementation plan with pseudo-code. DO NOT modify any files.
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

**Reuso de Sessão**: Cada chamada retorna `SESSION_ID: xxx` (normalmente emitido pelo wrapper), **DEVE salvar** para uso subsequente em `/ccg:execute`.

**Aguardar Tarefas em Background** (timeout máximo 600000ms = 10 minutos):

```
TaskOutput({ task_id: "<task_id>", block: true, timeout: 600000 })
```

**IMPORTANTE**:
- Deve especificar `timeout: 600000`, caso contrário o padrão de 30 segundos causará timeout prematuro
- Se ainda estiver incompleto após 10 minutos, continue fazendo polling com `TaskOutput`, **NUNCA encerre o processo**
- Se a espera for pulada por timeout, **DEVE chamar `AskUserQuestion` para perguntar ao usuário se deve continuar aguardando ou encerrar a tarefa**

---

## Fluxo de Trabalho de Execução

**Tarefa de Planejamento**: $ARGUMENTS

### Fase 1: Recuperação Completa de Contexto

`[Mode: Research]`

#### 1.1 Aprimoramento de Prompt (DEVE executar primeiro)

**Se a MCP ace-tool estiver disponível**, chame a tool `mcp__ace-tool__enhance_prompt`:

```
mcp__ace-tool__enhance_prompt({
  prompt: "$ARGUMENTS",
  conversation_history: "<last 5-10 conversation turns>",
  project_root_path: "$PWD"
})
```

Aguarde o prompt aprimorado, **substitua o $ARGUMENTS original pelo resultado aprimorado** para todas as fases subsequentes.

**Se a MCP ace-tool NÃO estiver disponível**: Pule este passo e use o `$ARGUMENTS` original como está para todas as fases subsequentes.

#### 1.2 Recuperação de Contexto

**Se a MCP ace-tool estiver disponível**, chame a tool `mcp__ace-tool__search_context`:

```
mcp__ace-tool__search_context({
  query: "<semantic query based on enhanced requirement>",
  project_root_path: "$PWD"
})
```

- Construa a query semântica usando linguagem natural (Where/What/How)
- **NUNCA responda com base em suposições**

**Se a MCP ace-tool NÃO estiver disponível**, use as tools embutidas do Claude Code como fallback:
1. **Glob**: Encontre arquivos relevantes por padrão (ex.: `Glob("**/*.ts")`, `Glob("src/**/*.py")`)
2. **Grep**: Busque símbolos-chave, nomes de função, definições de classe (ex.: `Grep("className|functionName")`)
3. **Read**: Leia os arquivos descobertos para reunir o contexto completo
4. **Task (agent Explore)**: Para exploração mais profunda, use `Task` com `subagent_type: "Explore"` para buscar em todo o codebase

#### 1.3 Verificação de Completude

- Deve obter **definições e assinaturas completas** das classes, funções e variáveis relevantes
- Se o contexto for insuficiente, acione a **recuperação recursiva**
- Priorize a saída: arquivo de entrada + número de linha + nome do símbolo-chave; adicione trechos mínimos de código apenas quando necessário para resolver ambiguidade

#### 1.4 Alinhamento de Requisitos

- Se os requisitos ainda tiverem ambiguidade, **DEVE** emitir perguntas orientadoras para o usuário
- Até que os limites do requisito estejam claros (sem omissões, sem redundância)

### Fase 2: Análise Colaborativa Multi-Modelo

`[Mode: Analysis]`

#### 2.1 Distribuir Entradas

**Chame em paralelo** o Codex e o Gemini (`run_in_background: true`):

Distribua o **requisito original** (sem opiniões pré-definidas) para ambos os modelos:

1. **Análise de Backend do Codex**:
   - ROLE_FILE: `~/.claude/.ccg/prompts/codex/analyzer.md`
   - Foco: Viabilidade técnica, impacto na arquitetura, considerações de desempenho, riscos potenciais
   - OUTPUT: Soluções multiperspectiva + análise de prós/contras

2. **Análise de Frontend do Gemini**:
   - ROLE_FILE: `~/.claude/.ccg/prompts/gemini/analyzer.md`
   - Foco: Impacto em UI/UX, experiência do usuário, design visual
   - OUTPUT: Soluções multiperspectiva + análise de prós/contras

Aguarde os resultados completos de ambos os modelos com `TaskOutput`. **Salve o SESSION_ID** (`CODEX_SESSION` e `GEMINI_SESSION`).

#### 2.2 Validação Cruzada

Integre as perspectivas e itere para otimização:

1. **Identifique consenso** (sinal forte)
2. **Identifique divergência** (precisa ser ponderada)
3. **Forças complementares**: A lógica de backend segue o Codex, o design de frontend segue o Gemini
4. **Raciocínio lógico**: Elimine lacunas lógicas nas soluções

#### 2.3 (Opcional mas Recomendado) Rascunho de Plano de Modelo Duplo

Para reduzir o risco de omissões no plano sintetizado do Claude, é possível ter ambos os modelos emitindo "rascunhos de plano" em paralelo (ainda **não permitido** modificar arquivos):

1. **Rascunho de Plano do Codex** (autoridade em backend):
   - ROLE_FILE: `~/.claude/.ccg/prompts/codex/architect.md`
   - OUTPUT: Plano passo a passo + pseudo-código (foco: fluxo de dados/casos extremos/tratamento de erros/estratégia de teste)

2. **Rascunho de Plano do Gemini** (autoridade em frontend):
   - ROLE_FILE: `~/.claude/.ccg/prompts/gemini/architect.md`
   - OUTPUT: Plano passo a passo + pseudo-código (foco: arquitetura de informação/interação/acessibilidade/consistência visual)

Aguarde os resultados completos de ambos os modelos com `TaskOutput`, registre as principais diferenças em suas sugestões.

#### 2.4 Gerar Plano de Implementação (Versão Final do Claude)

Sintetize ambas as análises, gere o **Plano de Implementação Passo a Passo**:

```markdown
## Implementation Plan: <Task Name>

### Task Type
- [ ] Frontend (→ Gemini)
- [ ] Backend (→ Codex)
- [ ] Fullstack (→ Parallel)

### Technical Solution
<Optimal solution synthesized from Codex + Gemini analysis>

### Implementation Steps
1. <Step 1> - Expected deliverable
2. <Step 2> - Expected deliverable
...

### Key Files
| File | Operation | Description |
|------|-----------|-------------|
| path/to/file.ts:L10-L50 | Modify | Description |

### Risks and Mitigation
| Risk | Mitigation |
|------|------------|

### SESSION_ID (for /ccg:execute use)
- CODEX_SESSION: <session_id>
- GEMINI_SESSION: <session_id>
```

### Fim da Fase 2: Entrega do Plano (Não Execução)

**As responsabilidades de `/ccg:plan` terminam aqui, DEVE executar as seguintes ações**:

1. Apresente o plano de implementação completo ao usuário (incluindo pseudo-código)
2. Salve o plano em `.claude/plan/<feature-name>.md` (extraia o nome da feature do requisito, ex.: `user-auth`, `payment-module`)
3. Emita o aviso em **texto em negrito** (DEVE usar o caminho real do arquivo salvo):

---
**Plano gerado e salvo em `.claude/plan/actual-feature-name.md`**

**Por favor, revise o plano acima. Você pode:**
- **Modificar o plano**: Diga-me o que precisa ser ajustado, eu atualizarei o plano
- **Executar o plano**: Copie o comando a seguir para uma nova sessão

```
/ccg:execute .claude/plan/actual-feature-name.md
```
---

**NOTA**: O `actual-feature-name.md` acima DEVE ser substituído pelo nome real do arquivo salvo!

4. **Encerre imediatamente a resposta atual** (Pare aqui. Sem mais chamadas de tool.)

**ABSOLUTAMENTE PROIBIDO**:
- Perguntar "Y/N" ao usuário e depois executar automaticamente (a execução é responsabilidade de `/ccg:execute`)
- Quaisquer operações de escrita no código de produção
- Chamar automaticamente `/ccg:execute` ou quaisquer ações de implementação
- Continuar acionando chamadas de modelo quando o usuário não solicitou explicitamente modificações

---

## Salvamento do Plano

Após a conclusão do planejamento, salve o plano em:

- **Primeiro planejamento**: `.claude/plan/<feature-name>.md`
- **Versões de iteração**: `.claude/plan/<feature-name>-v2.md`, `.claude/plan/<feature-name>-v3.md`...

A escrita do arquivo de plano deve ser concluída antes de apresentar o plano ao usuário.

---

## Fluxo de Modificação do Plano

Se o usuário solicitar modificações no plano:

1. Ajuste o conteúdo do plano com base no feedback do usuário
2. Atualize o arquivo `.claude/plan/<feature-name>.md`
3. Reapresente o plano modificado
4. Solicite que o usuário revise ou execute novamente

---

## Próximos Passos

Após a aprovação do usuário, execute **manualmente**:

```bash
/ccg:execute .claude/plan/<feature-name>.md
```

---

## Regras Principais

1. **Apenas plano, sem implementação** – Este comando não executa nenhuma mudança de código
2. **Sem avisos Y/N** – Apenas apresente o plano, deixe o usuário decidir os próximos passos
3. **Regras de Confiança** – Backend segue o Codex, Frontend segue o Gemini
4. Os modelos externos têm **acesso zero de escrita ao sistema de arquivos**
5. **Handoff do SESSION_ID** – O plano deve incluir `CODEX_SESSION` / `GEMINI_SESSION` ao final (para uso em `/ccg:execute resume <SESSION_ID>`)
