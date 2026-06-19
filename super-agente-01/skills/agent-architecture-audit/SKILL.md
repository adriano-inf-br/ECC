---
name: agent-architecture-audit
description: Diagnóstico full-stack para aplicações de agent e LLM. Audita a pilha de agent de 12 camadas em busca de regressão de wrapper, poluição de memória, falhas de disciplina de tools, loops de reparo ocultos e corrupção de renderização. Produz achados ordenados por severidade com correções code-first. Essencial para desenvolvedores que constroem aplicações de agent, loops autônomos ou qualquer recurso movido a LLM.
metadata:
  origin: oh-my-agent-check
tools: Read, Write, Edit, Bash, Grep, Glob
---

# Auditoria de Arquitetura de Agent

Um fluxo de trabalho de diagnóstico para sistemas de agent que escondem falhas atrás de camadas de wrapper, memória obsoleta, loops de retry ou mutações de transporte/renderização.

## Quando Ativar

**OBRIGATÓRIO para:**
- Liberar qualquer aplicação de agent ou movida a LLM para produção
- Entregar recursos com tool calling, memória ou fluxos de trabalho multi-etapa
- Comportamento do agent se degrada após adicionar camadas de wrapper
- Usuário relata "o agent está piorando" ou "as tools estão instáveis"
- O mesmo modelo funciona no playground mas quebra dentro do seu wrapper
- Depurar comportamento do agent por mais de 15 minutos sem encontrar a causa raiz

**Especialmente crítico quando:**
- Você adicionou novas camadas de prompt, definições de tools ou sistemas de memória
- Diferentes agents no seu sistema se comportam de forma inconsistente
- O modelo estava bem ontem mas está alucinando hoje
- Você suspeita de loops de reparo/retry ocultos mutando respostas silenciosamente

**Não use para:**
- Depuração geral de código — use `agent-introspection-debugging`
- Revisão de código — use agents revisores específicos da linguagem
- Varredura de segurança — use `security-review` ou `security-review/scan`
- Benchmarking de desempenho de agent — use `agent-eval`
- Escrever novos recursos — use a skill de fluxo de trabalho apropriada

## A Pilha de 12 Camadas

Todo sistema de agent tem estas camadas. Qualquer uma delas pode corromper a resposta:

| # | Camada | O Que Dá Errado |
|---|-------|----------------|
| 1 | System prompt | Instruções conflitantes, inchaço de instruções |
| 2 | Histórico de sessão | Injeção de contexto obsoleto de turnos anteriores |
| 3 | Memória de longo prazo | Poluição entre sessões, tópicos antigos em novas conversas |
| 4 | Destilação | Artefatos comprimidos reentrando como pseudofatos |
| 5 | Recall ativo | Camadas redundantes de re-resumo desperdiçando contexto |
| 6 | Seleção de tool | Roteamento de tool errado, modelo pula tools obrigatórias |
| 7 | Execução de tool | Execução alucinada — afirma chamar mas não chama |
| 8 | Interpretação de tool | Saída de tool mal lida ou ignorada |
| 9 | Formatação da resposta | Corrupção de formato na resposta final |
| 10 | Renderização de plataforma | Mutação na camada de transporte (UI, API, CLI mutam respostas válidas) |
| 11 | Loops de reparo ocultos | Agents de fallback/retry silenciosos rodando uma segunda passagem de LLM |
| 12 | Persistência | Estado expirado ou artefatos em cache reutilizados como evidência ativa |

## Padrões Comuns de Falha

### 1. Regressão de Wrapper

O modelo base produz respostas corretas, mas as camadas de wrapper o tornam pior.

**Sintomas:**
- O modelo funciona bem no playground ou em chamada direta de API, quebra no seu agent
- Adicionou uma nova camada de prompt, o comportamento existente se degradou
- O agent soa confiante mas está confiantemente errado
- "Estava funcionando antes da última atualização"

### 2. Contaminação de Memória

Tópicos antigos vazam para novas conversas por meio do histórico, da recuperação de memória ou da destilação.

**Sintomas:**
- O agent traz à tona tópicos passados não relacionados
- Correções do usuário não se fixam (memória antiga sobrescreve a nova)
- Artefatos da mesma sessão reentram como pseudofatos
- A memória cresce sem limite, degradando a qualidade da resposta ao longo do tempo

### 3. Falha de Disciplina de Tool

As tools são declaradas no prompt mas não são impostas no código. O modelo as pula ou aluciná a execução.

**Sintomas:**
- "Deve usar a tool X" no prompt, mas o modelo responde sem chamá-la
- Os resultados da tool parecem corretos mas nunca foram de fato executados
- Diferentes tools brigam pela mesma responsabilidade
- O modelo usa a tool quando não deveria, ou a pula quando é obrigatório

### 4. Corrupção de Renderização/Transporte

A resposta interna do agent está correta, mas a camada de plataforma a muta durante a entrega.

**Sintomas:**
- Os logs mostram a resposta correta, o usuário vê uma saída quebrada
- Renderização de markdown, parsing de JSON ou fragmentos de streaming corrompem respostas válidas
- Um agent de fallback oculto substitui silenciosamente a resposta antes da entrega
- A saída difere entre o terminal e a UI

### 5. Camadas de Agent Ocultas

Agents silenciosos de reparo, retry, sumarização ou recall rodam sem contratos explícitos.

**Sintomas:**
- A saída muda entre a geração interna e a entrega ao usuário
- Loops de "auto-fix" rodam uma segunda passagem de LLM que o usuário desconhece
- Múltiplos agents modificam a mesma saída sem coordenação
- As respostas são "suavizadas" ou "corrigidas" por camadas invisíveis

## Fluxo de Trabalho de Auditoria

### Fase 1: Escopo

Defina o que você está auditando:

- **Sistema-alvo** — qual aplicação de agent?
- **Pontos de entrada** — como os usuários interagem com ele?
- **Pilha de modelos** — qual(is) LLM(s) e provedores?
- **Sintomas** — o que o usuário relata?
- **Janela de tempo** — quando começou?
- **Camadas a auditar** — quais das 12 camadas se aplicam?

### Fase 2: Coleta de Evidências

Reúna evidências da base de código:

- **Código-fonte** — loop do agent, roteador de tools, admissão de memória, montagem de prompt
- **Logs** — traces históricos de sessão, registros de tool calls
- **Config** — templates de prompt, schemas de tools, configurações de provedor
- **Arquivos de memória** — SOPs, bases de conhecimento, arquivos de sessão

Use `rg` para buscar anti-padrões:

```bash
# Requisitos de tool expressos apenas em texto de prompt (não em código)
rg "must.*tool|必须.*工具|required.*call" --type md

# Execução de tool sem validação
rg "tool_call|toolCall|tool_use" --type py --type ts

# Chamadas de LLM ocultas fora do loop principal do agent
rg "completion|chat\.create|messages\.create|llm\.invoke"

# Admissão de memória sem prioridade de correção do usuário
rg "memory.*admit|long.*term.*update|persist.*memory" --type py --type ts

# Loops de fallback que rodam chamadas adicionais de LLM
rg "fallback|retry.*llm|repair.*prompt|re-?prompt" --type py --type ts

# Mutação silenciosa de saída
rg "mutate|rewrite.*response|transform.*output|shap" --type py --type ts
```

### Fase 3: Mapeamento de Falhas

Para cada achado, documente:

- **Sintoma** — o que o usuário vê
- **Mecanismo** — como o wrapper o causa
- **Camada de origem** — qual das 12 camadas
- **Causa raiz** — a causa mais profunda
- **Evidência** — referência file:line ou log:row
- **Confiança** — 0.0 a 1.0

### Fase 4: Estratégia de Correção

Ordem de correção padrão (code-first, não prompt-first):

1. **Gate de tool por código** — imponha no código, não apenas no texto do prompt
2. **Remova ou restrinja agents de reparo ocultos** — torne o fallback explícito com contratos
3. **Reduza a duplicação de contexto** — a mesma informação por prompt + histórico + memória + destilação
4. **Aperte a admissão de memória** — correções do usuário > asserções do agent
5. **Aperte os gatilhos de destilação** — não comprima o que não deveria ser comprimido
6. **Reduza a mutação de renderização** — pass-through, não transforme
7. **Converta para envelopes JSON tipados** — fluxo interno estruturado, não prosa livre

## Modelo de Severidade

| Nível | Significado | Ação |
|-------|---------|--------|
| `critical` | O agent pode produzir confiantemente comportamento operacional errado | Corrija antes do próximo release |
| `high` | O agent frequentemente degrada corretude ou estabilidade | Corrija neste sprint |
| `medium` | A corretude geralmente sobrevive mas a saída é frágil ou desperdiçadora | Planeje para o próximo ciclo |
| `low` | Problemas em sua maioria cosméticos ou de manutenibilidade | Backlog |

## Formato de Saída

Apresente os achados ao usuário nesta ordem:

1. **Achados ordenados por severidade** (mais crítico primeiro)
2. **Diagnóstico de arquitetura** (qual camada corrompeu o quê, e por quê)
3. **Plano de correção ordenado** (code-first, não prompt-first)

Não comece com elogios ou resumos. Se o sistema está quebrado, diga isso diretamente.

## Perguntas Rápidas de Diagnóstico

Ao auditar um sistema de agent, responda a estas:

| # | Pergunta | Se Sim → |
|---|----------|----------|
| 1 | O modelo pode pular uma tool obrigatória e ainda assim responder? | Tool sem gate de código |
| 2 | Conteúdo de conversas antigas aparece em novos turnos? | Contaminação de memória |
| 3 | A mesma informação está no system prompt E na memória E no histórico? | Duplicação de contexto |
| 4 | A plataforma roda uma segunda passagem de LLM antes da entrega? | Loop de reparo oculto |
| 5 | A saída difere entre a geração interna e a entrega ao usuário? | Corrupção de renderização |
| 6 | As regras "deve usar a tool X" estão apenas em texto de prompt? | Falha de disciplina de tool |
| 7 | O próprio monólogo do agent pode virar memória persistente? | Envenenamento de memória |

## Anti-Padrões a Evitar

- Evite culpar o modelo antes de falsificar regressões na camada de wrapper.
- Evite culpar a memória sem mostrar o caminho da contaminação.
- Não deixe um estado atual limpo apagar um incidente histórico sujo.
- Não trate prosa em markdown como um protocolo interno confiável.
- Não aceite "deve usar a tool" em texto de prompt quando o código nunca o impõe.
- Mantenha os achados diretos, embasados em evidências e ordenados por severidade.

## Schema de Relatório

As auditorias devem produzir relatórios estruturados seguindo este formato:

```json
{
  "schema_version": "ecc.agent-architecture-audit.report.v1",
  "executive_verdict": {
    "overall_health": "high_risk",
    "primary_failure_mode": "string",
    "most_urgent_fix": "string"
  },
  "scope": {
    "target_name": "string",
    "model_stack": ["string"],
    "layers_to_audit": ["string"]
  },
  "findings": [
    {
      "severity": "critical|high|medium|low",
      "title": "string",
      "mechanism": "string",
      "source_layer": "string",
      "root_cause": "string",
      "evidence_refs": ["file:line"],
      "confidence": 0.0,
      "recommended_fix": "string"
    }
  ],
  "ordered_fix_plan": [
    { "order": 1, "goal": "string", "why_now": "string", "expected_effect": "string" }
  ]
}
```

## Skills Relacionadas

- `agent-introspection-debugging` — Depure falhas de runtime do agent (loops, timeouts, erros de estado)
- `agent-eval` — Faça benchmark de desempenho de agent lado a lado
- `security-review` — Auditoria de segurança para código e configuração
- `autonomous-agent-harness` — Configure operações de agent autônomo
- `agent-harness-construction` — Construa harnesses de agent do zero
