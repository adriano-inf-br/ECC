---
description: Executa um plano de implementação multi-modelo mantendo o Claude como o único escritor do sistema de arquivos.
---

# Execute - Execução Colaborativa Multi-Modelo

Execução colaborativa multi-modelo - Obter protótipo do plano → Claude refatora e implementa → Auditoria e entrega multi-modelo.

> **Pré-requisito:** Requer o runtime externo `ccg-workflow`, que **não** faz parte da instalação base do ECC. Inicialize-o com `npx ccg-workflow` para provisionar `~/.claude/bin/codeagent-wrapper` e os arquivos de papel `~/.claude/.ccg/prompts/*` dos quais este comando depende. Sem esse runtime, este comando não funcionará corretamente.

$ARGUMENTS

---

## Protocolos Centrais

- **Protocolo de Idioma**: Use **inglês** ao interagir com tools/modelos, comunique-se com o usuário no idioma dele
- **Soberania do Código**: Os modelos externos têm **acesso zero de escrita ao sistema de arquivos**, todas as modificações são feitas pelo Claude
- **Refatoração de Protótipo Sujo**: Trate o Unified Diff do Codex/Gemini como "protótipo sujo", deve ser refatorado para código de nível de produção
- **Mecanismo de Stop-Loss**: Não avance para a próxima fase até que a saída da fase atual seja validada
- **Pré-requisito**: Só execute após o usuário responder explicitamente "Y" à saída de `/ccg:plan` (se ausente, deve confirmar primeiro)

---

## Especificação de Chamada Multi-Modelo

**Sintaxe de Chamada** (paralelo: use `run_in_background: true`):

```
# Resume session call (recommended) - Implementation Prototype
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--backend <codex|gemini> {{GEMINI_MODEL_FLAG}}resume <SESSION_ID> - \"$PWD\" <<'EOF'
ROLE_FILE: <role prompt path>
<TASK>
Requirement: <task description>
Context: <plan content + target files>
</TASK>
OUTPUT: Unified Diff Patch ONLY. Strictly prohibit any actual modifications.
EOF",
  run_in_background: true,
  timeout: 3600000,
  description: "Brief description"
})

# New session call - Implementation Prototype
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--backend <codex|gemini> {{GEMINI_MODEL_FLAG}}- \"$PWD\" <<'EOF'
ROLE_FILE: <role prompt path>
<TASK>
Requirement: <task description>
Context: <plan content + target files>
</TASK>
OUTPUT: Unified Diff Patch ONLY. Strictly prohibit any actual modifications.
EOF",
  run_in_background: true,
  timeout: 3600000,
  description: "Brief description"
})
```

**Sintaxe de Chamada de Auditoria** (Code Review / Auditoria):

```
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--backend <codex|gemini> {{GEMINI_MODEL_FLAG}}resume <SESSION_ID> - \"$PWD\" <<'EOF'
ROLE_FILE: <role prompt path>
<TASK>
Scope: Audit the final code changes.
Inputs:
- The applied patch (git diff / final unified diff)
- The touched files (relevant excerpts if needed)
Constraints:
- Do NOT modify any files.
- Do NOT output tool commands that assume filesystem access.
</TASK>
OUTPUT:
1) A prioritized list of issues (severity, file, rationale)
2) Concrete fixes; if code changes are needed, include a Unified Diff Patch in a fenced code block.
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
| Implementation | `~/.claude/.ccg/prompts/codex/architect.md` | `~/.claude/.ccg/prompts/gemini/frontend.md` |
| Review | `~/.claude/.ccg/prompts/codex/reviewer.md` | `~/.claude/.ccg/prompts/gemini/reviewer.md` |

**Reuso de Sessão**: Se `/ccg:plan` forneceu um SESSION_ID, use `resume <SESSION_ID>` para reusar o contexto.

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

**Executar Tarefa**: $ARGUMENTS

### Fase 0: Ler o Plano

`[Mode: Prepare]`

1. **Identificar Tipo de Entrada**:
   - Caminho do arquivo de plano (ex.: `.claude/plan/xxx.md`)
   - Descrição de tarefa direta

2. **Ler Conteúdo do Plano**:
   - Se um caminho de arquivo de plano for fornecido, leia e faça o parse
   - Extraia: tipo de tarefa, passos de implementação, arquivos-chave, SESSION_ID

3. **Confirmação Pré-Execução**:
   - Se a entrada for "descrição de tarefa direta" ou o plano não tiver `SESSION_ID` / arquivos-chave: confirme primeiro com o usuário
   - Se não for possível confirmar que o usuário respondeu "Y" ao plano: deve confirmar novamente antes de prosseguir

4. **Roteamento por Tipo de Tarefa**:

   | Tipo de Tarefa | Detecção | Rota |
   |-----------|-----------|-------|
   | **Frontend** | Páginas, componentes, UI, estilos, layout | Gemini |
   | **Backend** | API, interfaces, banco de dados, lógica, algoritmos | Codex |
   | **Fullstack** | Contém tanto frontend quanto backend | Codex ∥ Gemini em paralelo |

---

### Fase 1: Recuperação Rápida de Contexto

`[Mode: Retrieval]`

**Se a MCP ace-tool estiver disponível**, use-a para recuperação rápida de contexto:

Com base na lista de "Arquivos-Chave" no plano, chame `mcp__ace-tool__search_context`:

```
mcp__ace-tool__search_context({
  query: "<semantic query based on plan content, including key files, modules, function names>",
  project_root_path: "$PWD"
})
```

**Estratégia de Recuperação**:
- Extraia os caminhos-alvo da tabela "Arquivos-Chave" do plano
- Construa uma query semântica cobrindo: arquivos de entrada, módulos de dependência, definições de tipo relacionadas
- Se os resultados forem insuficientes, adicione 1-2 recuperações recursivas

**Se a MCP ace-tool NÃO estiver disponível**, use as tools embutidas do Claude Code como fallback:
1. **Glob**: Encontre os arquivos-alvo da tabela "Arquivos-Chave" do plano (ex.: `Glob("src/components/**/*.tsx")`)
2. **Grep**: Busque símbolos-chave, nomes de função, definições de tipo em todo o codebase
3. **Read**: Leia os arquivos descobertos para reunir o contexto completo
4. **Task (agent Explore)**: Para exploração mais ampla, use `Task` com `subagent_type: "Explore"`

**Após a Recuperação**:
- Organize os trechos de código recuperados
- Confirme o contexto completo para a implementação
- Prossiga para a Fase 3

---

### Fase 3: Aquisição de Protótipo

`[Mode: Prototype]`

**Roteamento por Tipo de Tarefa**:

#### Rota A: Frontend/UI/Estilos → Gemini

**Limite**: Contexto < 32k tokens

1. Chame o Gemini (use `~/.claude/.ccg/prompts/gemini/frontend.md`)
2. Entrada: Conteúdo do plano + contexto recuperado + arquivos-alvo
3. OUTPUT: `Unified Diff Patch ONLY. Strictly prohibit any actual modifications.`
4. **O Gemini é a autoridade de design de frontend, seu protótipo CSS/React/Vue é a baseline visual final**
5. **AVISO**: Ignore as sugestões de lógica de backend do Gemini
6. Se o plano contiver `GEMINI_SESSION`: prefira `resume <GEMINI_SESSION>`

#### Rota B: Backend/Lógica/Algoritmos → Codex

1. Chame o Codex (use `~/.claude/.ccg/prompts/codex/architect.md`)
2. Entrada: Conteúdo do plano + contexto recuperado + arquivos-alvo
3. OUTPUT: `Unified Diff Patch ONLY. Strictly prohibit any actual modifications.`
4. **O Codex é a autoridade de lógica de backend, aproveite suas capacidades de raciocínio lógico e debug**
5. Se o plano contiver `CODEX_SESSION`: prefira `resume <CODEX_SESSION>`

#### Rota C: Fullstack → Chamadas Paralelas

1. **Chamadas Paralelas** (`run_in_background: true`):
   - Gemini: Cuida da parte de frontend
   - Codex: Cuida da parte de backend
2. Aguarde os resultados completos de ambos os modelos com `TaskOutput`
3. Cada um usa o `SESSION_ID` correspondente do plano para `resume` (crie uma nova sessão se ausente)

**Siga as instruções `IMPORTANTE` na `Especificação de Chamada Multi-Modelo` acima**

---

### Fase 4: Implementação de Código

`[Mode: Implement]`

**O Claude, como Soberano do Código, executa os seguintes passos**:

1. **Ler o Diff**: Faça o parse do Unified Diff Patch retornado pelo Codex/Gemini

2. **Sandbox Mental**:
   - Simule a aplicação do Diff aos arquivos-alvo
   - Verifique a consistência lógica
   - Identifique possíveis conflitos ou efeitos colaterais

3. **Refatorar e Limpar**:
   - Refatore o "protótipo sujo" para **código altamente legível, sustentável e de nível corporativo**
   - Remova código redundante
   - Garanta conformidade com os padrões de código existentes do projeto
   - **Não gere comentários/docs a menos que necessário**, o código deve ser autoexplicativo

4. **Escopo Mínimo**:
   - Limite as mudanças apenas ao escopo do requisito
   - **Revisão obrigatória** para efeitos colaterais
   - Faça correções direcionadas

5. **Aplicar Mudanças**:
   - Use as tools Edit/Write para executar as modificações reais
   - **Modifique apenas o código necessário**, nunca afete outras funcionalidades existentes do usuário

6. **Autoverificação** (fortemente recomendado):
   - Execute o lint / typecheck / tests existentes do projeto (priorize o escopo relacionado mínimo)
   - Se falhar: corrija as regressões primeiro, depois prossiga para a Fase 5

---

### Fase 5: Auditoria e Entrega

`[Mode: Audit]`

#### 5.1 Auditoria Automática

**Após as mudanças entrarem em vigor, DEVE chamar imediatamente em paralelo** o Codex e o Gemini para Code Review:

1. **Revisão do Codex** (`run_in_background: true`):
   - ROLE_FILE: `~/.claude/.ccg/prompts/codex/reviewer.md`
   - Entrada: Diff modificado + arquivos-alvo
   - Foco: Segurança, desempenho, tratamento de erros, correção lógica

2. **Revisão do Gemini** (`run_in_background: true`):
   - ROLE_FILE: `~/.claude/.ccg/prompts/gemini/reviewer.md`
   - Entrada: Diff modificado + arquivos-alvo
   - Foco: Acessibilidade, consistência de design, experiência do usuário

Aguarde os resultados completos de revisão de ambos os modelos com `TaskOutput`. Prefira reusar as sessões da Fase 3 (`resume <SESSION_ID>`) para consistência de contexto.

#### 5.2 Integrar e Corrigir

1. Sintetize o feedback de revisão do Codex + Gemini
2. Pondere pelas regras de confiança: Backend segue o Codex, Frontend segue o Gemini
3. Execute as correções necessárias
4. Repita a Fase 5.1 conforme necessário (até o risco ser aceitável)

#### 5.3 Confirmação de Entrega

Após a auditoria passar, reporte ao usuário:

```markdown
## Execution Complete

### Change Summary
| File | Operation | Description |
|------|-----------|-------------|
| path/to/file.ts | Modified | Description |

### Audit Results
- Codex: <Passed/Found N issues>
- Gemini: <Passed/Found N issues>

### Recommendations
1. [ ] <Suggested test steps>
2. [ ] <Suggested verification steps>
```

---

## Regras Principais

1. **Soberania do Código** – Todas as modificações de arquivo são feitas pelo Claude, os modelos externos têm acesso zero de escrita
2. **Refatoração de Protótipo Sujo** – A saída do Codex/Gemini é tratada como rascunho, deve ser refatorada
3. **Regras de Confiança** – Backend segue o Codex, Frontend segue o Gemini
4. **Mudanças Mínimas** – Modifique apenas o código necessário, sem efeitos colaterais
5. **Auditoria Obrigatória** – Deve realizar Code Review multi-modelo após as mudanças

---

## Uso

```bash
# Execute plan file
/ccg:execute .claude/plan/feature-name.md

# Execute task directly (for plans already discussed in context)
/ccg:execute implement user authentication based on previous plan
```

---

## Relação com /ccg:plan

1. `/ccg:plan` gera o plano + SESSION_ID
2. O usuário confirma com "Y"
3. `/ccg:execute` lê o plano, reusa o SESSION_ID, executa a implementação
