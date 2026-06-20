---
name: agent-eval
description: Comparação lado a lado de agents de programação (Claude Code, Aider, Codex, etc.) em tarefas customizadas com métricas de taxa de aprovação, custo, tempo e consistência
metadata:
  origin: ECC
tools: Read, Write, Edit, Bash, Grep, Glob
---

# Skill Agent Eval

Uma ferramenta de CLI leve para comparar agents de programação lado a lado em tarefas reprodutíveis. Toda comparação de "qual agent de programação é o melhor?" roda na base do feeling — esta ferramenta a sistematiza.

## Quando Ativar

- Comparar agents de programação (Claude Code, Aider, Codex, etc.) na sua própria base de código
- Medir o desempenho de um agent antes de adotar uma nova ferramenta ou modelo
- Rodar verificações de regressão quando um agent atualiza seu modelo ou ferramental
- Produzir decisões de seleção de agent embasadas em dados para uma equipe

## Instalação

> **Nota:** Instale o agent-eval a partir de seu repositório após revisar o código-fonte.

## Conceitos Centrais

### Definições de Tarefa em YAML

Defina tarefas de forma declarativa. Cada tarefa especifica o que fazer, quais arquivos tocar e como julgar o sucesso:

```yaml
name: add-retry-logic
description: Add exponential backoff retry to the HTTP client
repo: ./my-project
files:
  - src/http_client.py
prompt: |
  Add retry logic with exponential backoff to all HTTP requests.
  Max 3 retries. Initial delay 1s, max delay 30s.
judge:
  - type: pytest
    command: pytest tests/test_http_client.py -v
  - type: grep
    pattern: "exponential_backoff|retry"
    files: src/http_client.py
commit: "abc1234"  # fixe em um commit específico para reprodutibilidade
```

### Isolamento por Git Worktree

Cada execução de agent recebe seu próprio git worktree — sem necessidade de Docker. Isso fornece isolamento de reprodutibilidade para que os agents não possam interferir uns com os outros nem corromper o repositório base.

### Métricas Coletadas

| Métrica | O Que Mede |
|--------|-----------------|
| Taxa de aprovação | O agent produziu código que passa no juiz? |
| Custo | Gasto de API por tarefa (quando disponível) |
| Tempo | Segundos de relógio até a conclusão |
| Consistência | Taxa de aprovação em execuções repetidas (ex.: 3/3 = 100%) |

## Fluxo de Trabalho

### 1. Definir Tarefas

Crie um diretório `tasks/` com arquivos YAML, um por tarefa:

```bash
mkdir tasks
# Escreva as definições de tarefa (veja o template acima)
```

### 2. Executar Agents

Execute os agents contra suas tarefas:

```bash
agent-eval run --task tasks/add-retry-logic.yaml --agent claude-code --agent aider --runs 3
```

Cada execução:
1. Cria um git worktree novo a partir do commit especificado
2. Entrega o prompt ao agent
3. Roda os critérios do juiz
4. Registra aprovação/falha, custo e tempo

### 3. Comparar Resultados

Gere um relatório de comparação:

```bash
agent-eval report --format table
```

```
Task: add-retry-logic (3 runs each)
┌──────────────┬───────────┬────────┬────────┬─────────────┐
│ Agent        │ Pass Rate │ Cost   │ Time   │ Consistency │
├──────────────┼───────────┼────────┼────────┼─────────────┤
│ claude-code  │ 3/3       │ $0.12  │ 45s    │ 100%        │
│ aider        │ 2/3       │ $0.08  │ 38s    │  67%        │
└──────────────┴───────────┴────────┴────────┴─────────────┘
```

## Tipos de Juiz

### Baseado em Código (determinístico)

```yaml
judge:
  - type: pytest
    command: pytest tests/ -v
  - type: command
    command: npm run build
```

### Baseado em Padrão

```yaml
judge:
  - type: grep
    pattern: "class.*Retry"
    files: src/**/*.py
```

### Baseado em Modelo (LLM-as-judge)

```yaml
judge:
  - type: llm
    prompt: |
      Does this implementation correctly handle exponential backoff?
      Check for: max retries, increasing delays, jitter.
```

## Boas Práticas

- **Comece com 3-5 tarefas** que representem sua carga de trabalho real, não exemplos de brinquedo
- **Rode ao menos 3 ensaios** por agent para capturar a variância — agents são não determinísticos
- **Fixe o commit** no YAML da tarefa para que os resultados sejam reprodutíveis ao longo de dias/semanas
- **Inclua ao menos um juiz determinístico** (testes, build) por tarefa — juízes LLM adicionam ruído
- **Acompanhe o custo junto com a taxa de aprovação** — um agent com 95% a 10x o custo pode não ser a escolha certa
- **Versione suas definições de tarefa** — elas são fixtures de teste, trate-as como código

## Links

- Repositório: [github.com/joaquinhuigomez/agent-eval](https://github.com/joaquinhuigomez/agent-eval)
