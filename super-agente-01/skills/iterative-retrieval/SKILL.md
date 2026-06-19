---
name: iterative-retrieval
description: Padrão para refinar progressivamente a recuperação de contexto a fim de resolver o problema de contexto de subagents
metadata:
  origin: ECC
---

# Padrão de Recuperação Iterativa

Resolve o "problema de contexto" em fluxos de trabalho multiagente, em que subagents não sabem de qual contexto precisam até começarem a trabalhar.

## Quando Ativar

- Criando subagents que precisam de contexto do código-base que não conseguem prever de antemão
- Construindo fluxos de trabalho multiagente em que o contexto é refinado progressivamente
- Encontrando falhas de "contexto grande demais" ou "contexto ausente" em tarefas de agent
- Projetando pipelines de recuperação no estilo RAG para exploração de código
- Otimizando o uso de tokens na orquestração de agents

## O Problema

Subagents são criados com contexto limitado. Eles não sabem:
- Quais arquivos contêm o código relevante
- Quais padrões existem no código-base
- Qual terminologia o projeto usa

Abordagens padrão falham:
- **Enviar tudo**: Excede os limites de contexto
- **Não enviar nada**: O agent fica sem informações críticas
- **Adivinhar o que é necessário**: Frequentemente errado

## A Solução: Recuperação Iterativa

Um loop de 4 fases que refina progressivamente o contexto:

```
┌─────────────────────────────────────────────┐
│                                             │
│   ┌──────────┐      ┌──────────┐            │
│   │ DISPATCH │─────│ EVALUATE │            │
│   └──────────┘      └──────────┘            │
│        ▲                  │                 │
│        │                  ▼                 │
│   ┌──────────┐      ┌──────────┐            │
│   │   LOOP   │─────│  REFINE  │            │
│   └──────────┘      └──────────┘            │
│                                             │
│        Máx. 3 ciclos, depois prossiga       │
└─────────────────────────────────────────────┘
```

### Fase 1: DISPATCH

Consulta inicial ampla para reunir arquivos candidatos:

```javascript
// Comece com a intenção de alto nível
const initialQuery = {
  patterns: ['src/**/*.ts', 'lib/**/*.ts'],
  keywords: ['authentication', 'user', 'session'],
  excludes: ['*.test.ts', '*.spec.ts']
};

// Despacha para o agent de recuperação
const candidates = await retrieveFiles(initialQuery);
```

### Fase 2: EVALUATE

Avalie a relevância do conteúdo recuperado:

```javascript
function evaluateRelevance(files, task) {
  return files.map(file => ({
    path: file.path,
    relevance: scoreRelevance(file.content, task),
    reason: explainRelevance(file.content, task),
    missingContext: identifyGaps(file.content, task)
  }));
}
```

Critérios de pontuação:
- **Alta (0.8-1.0)**: Implementa diretamente a funcionalidade alvo
- **Média (0.5-0.7)**: Contém padrões ou tipos relacionados
- **Baixa (0.2-0.4)**: Relacionado tangencialmente
- **Nenhuma (0-0.2)**: Não relevante, excluir

### Fase 3: REFINE

Atualize os critérios de busca com base na avaliação:

```javascript
function refineQuery(evaluation, previousQuery) {
  return {
    // Adiciona novos padrões descobertos em arquivos de alta relevância
    patterns: [...previousQuery.patterns, ...extractPatterns(evaluation)],

    // Adiciona terminologia encontrada no código-base
    keywords: [...previousQuery.keywords, ...extractKeywords(evaluation)],

    // Exclui caminhos confirmados como irrelevantes
    excludes: [...previousQuery.excludes, ...evaluation
      .filter(e => e.relevance < 0.2)
      .map(e => e.path)
    ],

    // Foca em lacunas específicas
    focusAreas: evaluation
      .flatMap(e => e.missingContext)
      .filter(unique)
  };
}
```

### Fase 4: LOOP

Repita com critérios refinados (máx. 3 ciclos):

```javascript
async function iterativeRetrieve(task, maxCycles = 3) {
  let query = createInitialQuery(task);
  let bestContext = [];

  for (let cycle = 0; cycle < maxCycles; cycle++) {
    const candidates = await retrieveFiles(query);
    const evaluation = evaluateRelevance(candidates, task);

    // Verifica se temos contexto suficiente
    const highRelevance = evaluation.filter(e => e.relevance >= 0.7);
    if (highRelevance.length >= 3 && !hasCriticalGaps(evaluation)) {
      return highRelevance;
    }

    // Refina e continua
    query = refineQuery(evaluation, query);
    bestContext = mergeContext(bestContext, highRelevance);
  }

  return bestContext;
}
```

## Exemplos Práticos

### Exemplo 1: Contexto de Correção de Bug

```
Tarefa: "Corrigir o bug de expiração do token de autenticação"

Ciclo 1:
  DISPATCH: Buscar por "token", "auth", "expiry" em src/**
  EVALUATE: Encontrados auth.ts (0.9), tokens.ts (0.8), user.ts (0.3)
  REFINE: Adicionar palavras-chave "refresh", "jwt"; excluir user.ts

Ciclo 2:
  DISPATCH: Buscar termos refinados
  EVALUATE: Encontrados session-manager.ts (0.95), jwt-utils.ts (0.85)
  REFINE: Contexto suficiente (2 arquivos de alta relevância)

Resultado: auth.ts, tokens.ts, session-manager.ts, jwt-utils.ts
```

### Exemplo 2: Implementação de Funcionalidade

```
Tarefa: "Adicionar rate limiting aos endpoints da API"

Ciclo 1:
  DISPATCH: Buscar "rate", "limit", "api" em routes/**
  EVALUATE: Nenhuma correspondência - o código-base usa a terminologia "throttle"
  REFINE: Adicionar palavras-chave "throttle", "middleware"

Ciclo 2:
  DISPATCH: Buscar termos refinados
  EVALUATE: Encontrados throttle.ts (0.9), middleware/index.ts (0.7)
  REFINE: Preciso de padrões de router

Ciclo 3:
  DISPATCH: Buscar padrões "router", "express"
  EVALUATE: Encontrado router-setup.ts (0.8)
  REFINE: Contexto suficiente

Resultado: throttle.ts, middleware/index.ts, router-setup.ts
```

## Integração com Agents

Use em prompts de agent:

```markdown
Ao recuperar contexto para esta tarefa:
1. Comece com uma busca ampla por palavras-chave
2. Avalie a relevância de cada arquivo (escala de 0 a 1)
3. Identifique qual contexto ainda está faltando
4. Refine os critérios de busca e repita (máx. 3 ciclos)
5. Retorne arquivos com relevância >= 0.7
```

## Boas Práticas

1. **Comece amplo, estreite progressivamente** - Não superespecifique as consultas iniciais
2. **Aprenda a terminologia do código-base** - O primeiro ciclo costuma revelar convenções de nomenclatura
3. **Acompanhe o que está faltando** - A identificação explícita de lacunas orienta o refinamento
4. **Pare no "bom o suficiente"** - 3 arquivos de alta relevância superam 10 medianos
5. **Exclua com confiança** - Arquivos de baixa relevância não se tornarão relevantes

## Relacionados

- [The Longform Guide](https://x.com/affaanmustafa/status/2014040193557471352) - Seção de orquestração de subagents
- skill `continuous-learning` - Para padrões que melhoram ao longo do tempo
- Definições de agent incluídas com o ECC (caminho de instalação manual: `agents/`)
