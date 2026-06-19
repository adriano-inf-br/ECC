---
name: evolve
description: Analisa instintos e sugere ou gera estruturas evoluídas
command: true
---

# Comando Evolve

## Implementação

Execute a CLI de instintos usando o caminho raiz do plugin:

```bash
python3 "${CLAUDE_PLUGIN_ROOT}/skills/continuous-learning-v2/scripts/instinct-cli.py" evolve [--generate]
```

Ou, se `CLAUDE_PLUGIN_ROOT` não estiver definido (instalação manual):

```bash
python3 ~/.claude/skills/continuous-learning-v2/scripts/instinct-cli.py evolve [--generate]
```

Analisa instintos e agrupa os relacionados em estruturas de nível mais alto:
- **Comandos**: Quando os instintos descrevem ações invocadas pelo usuário
- **Skills**: Quando os instintos descrevem comportamentos disparados automaticamente
- **Agents**: Quando os instintos descrevem processos complexos de várias etapas

## Uso

```
/evolve                    # Analisa todos os instintos e sugere evoluções
/evolve --generate         # Também gera arquivos em evolved/{skills,commands,agents}
```

## Regras de Evolução

### → Comando (Invocado pelo Usuário)
Quando os instintos descrevem ações que um usuário solicitaria explicitamente:
- Múltiplos instintos sobre "quando o usuário pede para..."
- Instintos com gatilhos como "ao criar um novo X"
- Instintos que seguem uma sequência repetível

Exemplo:
- `new-table-step1`: "ao adicionar uma tabela de banco de dados, criar migration"
- `new-table-step2`: "ao adicionar uma tabela de banco de dados, atualizar schema"
- `new-table-step3`: "ao adicionar uma tabela de banco de dados, regenerar types"

→ Cria: comando **new-table**

### → Skill (Disparada Automaticamente)
Quando os instintos descrevem comportamentos que devem acontecer automaticamente:
- Gatilhos de correspondência de padrões
- Respostas de tratamento de erros
- Aplicação de estilo de código

Exemplo:
- `prefer-functional`: "ao escrever funções, prefira estilo funcional"
- `use-immutable`: "ao modificar estado, use padrões imutáveis"
- `avoid-classes`: "ao projetar módulos, evite design baseado em classes"

→ Cria: skill `functional-patterns`

### → Agent (Precisa de Profundidade/Isolamento)
Quando os instintos descrevem processos complexos de várias etapas que se beneficiam de isolamento:
- Fluxos de trabalho de depuração
- Sequências de refatoração
- Tarefas de pesquisa

Exemplo:
- `debug-step1`: "ao depurar, primeiro verifique os logs"
- `debug-step2`: "ao depurar, isole o componente que falha"
- `debug-step3`: "ao depurar, crie uma reprodução mínima"
- `debug-step4`: "ao depurar, verifique a correção com um teste"

→ Cria: agent **debugger**

## O Que Fazer

1. Detectar o contexto atual do projeto
2. Ler os instintos do projeto + globais (o projeto tem precedência em conflitos de ID)
3. Agrupar instintos por padrões de gatilho/domínio
4. Identificar:
   - Candidatos a skill (clusters de gatilho com 2+ instintos)
   - Candidatos a comando (instintos de fluxo de trabalho de alta confiança)
   - Candidatos a agent (clusters maiores, de alta confiança)
5. Mostrar candidatos a promoção (projeto -> global) quando aplicável
6. Se `--generate` for passado, escrever arquivos em:
   - Escopo de projeto: `~/.claude/homunculus/projects/<project-id>/evolved/`
   - Fallback global: `~/.claude/homunculus/evolved/`

## Formato de Saída

```
============================================================
  EVOLVE ANALYSIS - 12 instincts
  Project: my-app (a1b2c3d4e5f6)
  Project-scoped: 8 | Global: 4
============================================================

High confidence instincts (>=80%): 5

## SKILL CANDIDATES
1. Cluster: "adding tests"
   Instincts: 3
   Avg confidence: 82%
   Domains: testing
   Scopes: project

## COMMAND CANDIDATES (2)
  /adding-tests
    From: test-first-workflow [project]
    Confidence: 84%

## AGENT CANDIDATES (1)
  adding-tests-agent
    Covers 3 instincts
    Avg confidence: 82%
```

## Flags

- `--generate`: Gera arquivos evoluídos além da saída de análise

## Formato de Arquivo Gerado

### Comando
```markdown
---
name: new-table
description: Create a new database table with migration, schema update, and type generation
command: /new-table
evolved_from:
  - new-table-migration
  - update-schema
  - regenerate-types
---

# New Table Command

[Generated content based on clustered instincts]

## Steps
1. ...
2. ...
```

### Skill
```markdown
---
name: functional-patterns
description: Enforce functional programming patterns
evolved_from:
  - prefer-functional
  - use-immutable
  - avoid-classes
---

# Functional Patterns Skill

[Generated content based on clustered instincts]
```

### Agent
```markdown
---
name: debugger
description: Systematic debugging agent
model: sonnet
evolved_from:
  - debug-check-logs
  - debug-isolate
  - debug-reproduce
---

# Debugger Agent

[Generated content based on clustered instincts]
```
