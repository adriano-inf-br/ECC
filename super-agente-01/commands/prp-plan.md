---
description: Cria um plano de implementação de funcionalidade abrangente com análise do codebase e extração de padrões
argument-hint: <feature description | path/to/prd.md>
---

> Adaptado de PRPs-agentic-eng por Wirasm. Parte da série de fluxo de trabalho PRP.

# PRP Plan

Cria um plano de implementação detalhado e autocontido que captura todos os padrões, convenções e contexto do codebase necessários para implementar uma funcionalidade em uma única passada.

**Filosofia central**: Um ótimo plano contém tudo o que é necessário para implementar sem fazer mais perguntas. Todo padrão, toda convenção, toda pegadinha — capturados uma vez, referenciados em todo o plano.

**Regra de ouro**: Se você precisaria buscar no codebase durante a implementação, capture esse conhecimento AGORA no plano.

---

## Fase 0 — DETECT

Determine o tipo de entrada a partir de `$ARGUMENTS`:

| Padrão de Entrada | Detecção | Ação |
|---|---|---|
| Caminho terminando em `.prd.md` | Caminho de arquivo para um PRD | Parse do PRD, encontra a próxima fase pendente |
| Caminho para `.md` com "Implementation Phases" | Documento tipo PRD | Parse das fases, encontra a próxima pendente |
| Caminho para qualquer outro arquivo | Arquivo de referência | Lê o arquivo como contexto, trata como texto livre |
| Texto livre | Descrição de funcionalidade | Prossegue diretamente para a Fase 1 |
| Vazio / em branco | Sem entrada | Pergunta ao usuário qual funcionalidade planejar |

### Parse de PRD (quando a entrada é um PRD)

1. Leia o arquivo do PRD com `cat "$PRD_PATH"`
2. Faça o parse da seção **Implementation Phases**
3. Encontre as fases por status:
   - Procure por fases `pending`
   - Verifique as cadeias de dependência (uma fase pode depender de fases anteriores estarem `complete`)
   - Selecione a **próxima fase pendente elegível**
4. Extraia da fase selecionada:
   - Nome e descrição da fase
   - Critérios de aceitação
   - Dependências de fases anteriores
   - Quaisquer notas de escopo ou restrições
5. Use a descrição da fase como a funcionalidade a planejar

Se não restarem fases pendentes, reporte que todas as fases estão completas.

---

## Fase 1 — PARSE

Extraia e esclareça os requisitos da funcionalidade.

### Entendimento da Funcionalidade

A partir da entrada (fase de PRD ou descrição em texto livre), identifique:

- **O quê** está sendo construído (entregável concreto)
- **Por que** importa (valor para o usuário)
- **Quem** usa (usuário/sistema alvo)
- **Onde** se encaixa (qual parte do codebase)

### História de Usuário

Formate como:
```
As a [type of user],
I want [capability],
So that [benefit].
```

### Avaliação de Complexidade

| Nível | Indicadores | Escopo Típico |
|---|---|---|
| **Small** | Arquivo único, mudança isolada, sem novas dependências | 1-3 arquivos, <100 linhas |
| **Medium** | Múltiplos arquivos, segue padrões existentes, novos conceitos menores | 3-10 arquivos, 100-500 linhas |
| **Large** | Preocupações transversais, novos padrões, integrações externas | 10+ arquivos, 500+ linhas |
| **XL** | Mudanças arquiteturais, novos subsistemas, migração necessária | 20+ arquivos, considere dividir |

### Gate de Ambiguidade

Se qualquer um destes estiver pouco claro, **PARE e pergunte ao usuário** antes de prosseguir:

- O entregável central é vago
- Os critérios de sucesso são indefinidos
- Há múltiplas interpretações válidas
- A abordagem técnica tem incógnitas importantes

NÃO adivinhe. Pergunte. Um plano construído sobre suposições falha durante a implementação.

---

## Fase 2 — EXPLORE

Reúna inteligência profunda do codebase. Busque no codebase diretamente para cada categoria abaixo.

### Busca no Codebase (8 Categorias)

Para cada categoria, busque usando grep, find e leitura de arquivos:

1. **Implementações Similares** — Encontre funcionalidades existentes que se assemelhem à planejada. Procure por padrões, endpoints, componentes ou módulos análogos.

2. **Convenções de Nomenclatura** — Identifique como arquivos, funções, variáveis, classes e exports são nomeados na área relevante do codebase.

3. **Tratamento de Erros** — Encontre como erros são capturados, propagados, logados e retornados aos usuários em caminhos de código similares.

4. **Padrões de Logging** — Identifique o que é logado, em que nível e em que formato.

5. **Definições de Tipo** — Encontre tipos, interfaces, schemas relevantes e como são organizados.

6. **Padrões de Teste** — Encontre como funcionalidades similares são testadas. Anote a localização dos arquivos de teste, nomenclatura, padrões de setup/teardown e estilos de asserção.

7. **Configuração** — Encontre arquivos de config relevantes, variáveis de ambiente e feature flags.

8. **Dependências** — Identifique pacotes, imports e módulos internos usados por funcionalidades similares.

### Análise do Codebase (5 Rastreamentos)

Leia os arquivos relevantes para rastrear:

1. **Pontos de Entrada** — Como uma requisição/ação entra no sistema e chega à área que você está modificando?
2. **Fluxo de Dados** — Como os dados se movem pelos caminhos de código relevantes?
3. **Mudanças de Estado** — Que estado é modificado e onde?
4. **Contratos** — Quais interfaces, APIs ou protocolos devem ser respeitados?
5. **Padrões** — Quais padrões arquiteturais são usados (repository, service, controller, etc.)?

### Tabela Unificada de Descoberta

Compile os achados em uma única referência:

| Category | File:Lines | Pattern | Key Snippet |
|---|---|---|---|
| Naming | `src/services/userService.ts:1-5` | camelCase services, PascalCase types | `export class UserService` |
| Error | `src/middleware/errorHandler.ts:10-25` | Custom AppError class | `throw new AppError(...)` |
| ... | ... | ... | ... |

---

## Fase 3 — RESEARCH

Se a funcionalidade envolver bibliotecas externas, APIs ou tecnologia desconhecida:

1. Busque na web a documentação oficial
2. Encontre exemplos de uso e melhores práticas
3. Identifique pegadinhas específicas de versão

Formate cada achado como:

```
KEY_INSIGHT: [what you learned]
APPLIES_TO: [which part of the plan this affects]
GOTCHA: [any warnings or version-specific issues]
```

Se a funcionalidade usar apenas padrões internos bem compreendidos, pule esta fase e anote: "No external research needed — feature uses established internal patterns."

---

## Fase 4 — DESIGN

### Transformação de UX (se aplicável)

Documente a experiência do usuário antes/depois:

**Before:**
```
┌─────────────────────────────┐
│  [Current user experience]  │
│  Show the current flow,     │
│  what the user sees/does    │
└─────────────────────────────┘
```

**After:**
```
┌─────────────────────────────┐
│  [New user experience]      │
│  Show the improved flow,    │
│  what changes for the user  │
└─────────────────────────────┘
```

### Mudanças de Interação

| Touchpoint | Before | After | Notes |
|---|---|---|---|
| ... | ... | ... | ... |

Se a funcionalidade for puramente de backend/interna sem mudança de UX, anote: "Internal change — no user-facing UX transformation."

---

## Fase 5 — ARCHITECT

### Design Estratégico

Defina a abordagem de implementação:

- **Approach**: Estratégia de alto nível (ex.: "Add new service layer following existing repository pattern")
- **Alternatives Considered**: Que outras abordagens foram avaliadas e por que foram rejeitadas
- **Scope**: Limites concretos do que SERÁ construído
- **NOT Building**: Lista explícita do que está FORA DE ESCOPO (previne scope creep durante a implementação)

---

## Fase 6 — GENERATE

Escreva o documento de plano completo usando o template abaixo. Salve em `.claude/PRPs/plans/{kebab-case-feature-name}.plan.md`.

Crie o diretório se ele não existir:
```bash
mkdir -p .claude/PRPs/plans
```

### Template de Plano

````markdown
# Plan: [Feature Name]

## Summary
[2-3 sentence overview]

## User Story
As a [user], I want [capability], so that [benefit].

## Problem → Solution
[Current state] → [Desired state]

## Metadata
- **Complexity**: [Small | Medium | Large | XL]
- **Source PRD**: [path or "N/A"]
- **PRD Phase**: [phase name or "N/A"]
- **Estimated Files**: [count]

---

## UX Design

### Before
[ASCII diagram or "N/A — internal change"]

### After
[ASCII diagram or "N/A — internal change"]

### Interaction Changes
| Touchpoint | Before | After | Notes |
|---|---|---|---|

---

## Mandatory Reading

Files that MUST be read before implementing:

| Priority | File | Lines | Why |
|---|---|---|---|
| P0 (critical) | `path/to/file` | 1-50 | Core pattern to follow |
| P1 (important) | `path/to/file` | 10-30 | Related types |
| P2 (reference) | `path/to/file` | all | Similar implementation |

## External Documentation

| Topic | Source | Key Takeaway |
|---|---|---|
| ... | ... | ... |

---

## Patterns to Mirror

Code patterns discovered in the codebase. Follow these exactly.

### NAMING_CONVENTION
// SOURCE: [file:lines]
[actual code snippet showing the naming pattern]

### ERROR_HANDLING
// SOURCE: [file:lines]
[actual code snippet showing error handling]

### LOGGING_PATTERN
// SOURCE: [file:lines]
[actual code snippet showing logging]

### REPOSITORY_PATTERN
// SOURCE: [file:lines]
[actual code snippet showing data access]

### SERVICE_PATTERN
// SOURCE: [file:lines]
[actual code snippet showing service layer]

### TEST_STRUCTURE
// SOURCE: [file:lines]
[actual code snippet showing test setup]

---

## Files to Change

| File | Action | Justification |
|---|---|---|
| `path/to/file.ts` | CREATE | New service for feature |
| `path/to/existing.ts` | UPDATE | Add new method |

## NOT Building

- [Explicit item 1 that is out of scope]
- [Explicit item 2 that is out of scope]

---

## Step-by-Step Tasks

### Task 1: [Name]
- **ACTION**: [What to do]
- **IMPLEMENT**: [Specific code/logic to write]
- **MIRROR**: [Pattern from Patterns to Mirror section to follow]
- **IMPORTS**: [Required imports]
- **GOTCHA**: [Known pitfall to avoid]
- **VALIDATE**: [How to verify this task is correct]

### Task 2: [Name]
- **ACTION**: ...
- **IMPLEMENT**: ...
- **MIRROR**: ...
- **IMPORTS**: ...
- **GOTCHA**: ...
- **VALIDATE**: ...

[Continue for all tasks...]

---

## Testing Strategy

### Unit Tests

| Test | Input | Expected Output | Edge Case? |
|---|---|---|---|
| ... | ... | ... | ... |

### Edge Cases Checklist
- [ ] Empty input
- [ ] Maximum size input
- [ ] Invalid types
- [ ] Concurrent access
- [ ] Network failure (if applicable)
- [ ] Permission denied

---

## Validation Commands

### Static Analysis
```bash
# Run type checker
[project-specific type check command]
```
EXPECT: Zero type errors

### Unit Tests
```bash
# Run tests for affected area
[project-specific test command]
```
EXPECT: All tests pass

### Full Test Suite
```bash
# Run complete test suite
[project-specific full test command]
```
EXPECT: No regressions

### Database Validation (if applicable)
```bash
# Verify schema/migrations
[project-specific db command]
```
EXPECT: Schema up to date

### Browser Validation (if applicable)
```bash
# Start dev server and verify
[project-specific dev server command]
```
EXPECT: Feature works as designed

### Manual Validation
- [ ] [Step-by-step manual verification checklist]

---

## Acceptance Criteria
- [ ] All tasks completed
- [ ] All validation commands pass
- [ ] Tests written and passing
- [ ] No type errors
- [ ] No lint errors
- [ ] Matches UX design (if applicable)

## Completion Checklist
- [ ] Code follows discovered patterns
- [ ] Error handling matches codebase style
- [ ] Logging follows codebase conventions
- [ ] Tests follow test patterns
- [ ] No hardcoded values
- [ ] Documentation updated (if needed)
- [ ] No unnecessary scope additions
- [ ] Self-contained — no questions needed during implementation

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| ... | ... | ... | ... |

## Notes
[Any additional context, decisions, or observations]
```

---

## Saída

### Salvar o Plano

Escreva o plano gerado em:
```
.claude/PRPs/plans/{kebab-case-feature-name}.plan.md
```

### Atualizar o PRD (se a entrada foi um PRD)

Se este plano foi gerado a partir de uma fase de PRD:
1. Atualize o status da fase de `pending` para `in-progress`
2. Adicione o caminho do arquivo de plano como referência na fase

### Reportar ao Usuário

```
## Plan Created

- **File**: .claude/PRPs/plans/{kebab-case-feature-name}.plan.md
- **Source PRD**: [path or "N/A"]
- **Phase**: [phase name or "standalone"]
- **Complexity**: [level]
- **Scope**: [N files, M tasks]
- **Key Patterns**: [top 3 discovered patterns]
- **External Research**: [topics researched or "none needed"]
- **Risks**: [top risk or "none identified"]
- **Confidence Score**: [1-10] — likelihood of single-pass implementation

> Next step: Run `/prp-implement .claude/PRPs/plans/{name}.plan.md` to execute this plan.
```

---

## Verificação

Antes de finalizar, verifique o plano contra estes checklists:

### Completude de Contexto
- [ ] Todos os arquivos relevantes descobertos e documentados
- [ ] Convenções de nomenclatura capturadas com exemplos
- [ ] Padrões de tratamento de erros documentados
- [ ] Padrões de teste identificados
- [ ] Dependências listadas

### Prontidão para Implementação
- [ ] Toda tarefa tem ACTION, IMPLEMENT, MIRROR e VALIDATE
- [ ] Nenhuma tarefa requer busca adicional no codebase
- [ ] Caminhos de import estão especificados
- [ ] GOTCHAs documentados onde aplicável

### Fidelidade aos Padrões
- [ ] Os trechos de código são exemplos reais do codebase (não inventados)
- [ ] As referências SOURCE apontam para arquivos e números de linha reais
- [ ] Os padrões cobrem nomenclatura, erros, logging, acesso a dados e testes
- [ ] O novo código será indistinguível do código existente

### Cobertura de Validação
- [ ] Comandos de análise estática especificados
- [ ] Comandos de teste especificados
- [ ] Verificação de build incluída

### Clareza de UX
- [ ] Estados de antes/depois documentados (ou marcados como N/A)
- [ ] Mudanças de interação listadas
- [ ] Edge cases de UX identificados

### Teste de Conhecimento Prévio Zero
Um desenvolvedor não familiarizado com este codebase deve ser capaz de implementar a funcionalidade usando APENAS este plano, sem buscar no codebase ou fazer perguntas. Se não for o caso, adicione o contexto faltante.

---

## Próximos Passos

- Rode `/prp-implement <plan-path>` para executar este plano
- Rode `/plan` para um planejamento conversacional rápido sem artefatos
- Rode `/prp-prd` para criar um PRD primeiro se o escopo estiver pouco claro
````
