---
name: architecture-decision-records
description: Capture decisões de arquitetura tomadas durante sessões do Claude Code como ADRs estruturados. Detecta automaticamente momentos de decisão, registra contexto, alternativas consideradas e justificativa. Mantém um log de ADRs para que futuros desenvolvedores entendam por que o codebase tem a forma que tem.
metadata:
  origin: ECC
---

# Architecture Decision Records

Capture decisões de arquitetura conforme elas acontecem durante as sessões de código. Em vez de as decisões viverem apenas em threads do Slack, comentários de PR ou na memória de alguém, esta Skill produz documentos ADR estruturados que vivem ao lado do código.

## When to Activate

- O usuário diz explicitamente "vamos registrar esta decisão" ou "faça um ADR disso"
- O usuário escolhe entre alternativas significativas (framework, biblioteca, padrão, banco de dados, design de API)
- O usuário diz "decidimos por..." ou "a razão de fazermos X em vez de Y é..."
- O usuário pergunta "por que escolhemos X?" (ler ADRs existentes)
- Durante fases de planejamento quando trade-offs de arquitetura são discutidos

## Formato de ADR

Use o formato leve de ADR proposto por Michael Nygard, adaptado para desenvolvimento assistido por IA:

```markdown
# ADR-NNNN: [Título da Decisão]

**Date**: YYYY-MM-DD
**Status**: proposed | accepted | deprecated | superseded by ADR-NNNN
**Deciders**: [quem esteve envolvido]

## Context

Qual é o problema que estamos vendo que está motivando esta decisão ou mudança?

[2-5 frases descrevendo a situação, restrições e forças em jogo]

## Decision

Qual é a mudança que estamos propondo e/ou fazendo?

[1-3 frases declarando a decisão com clareza]

## Alternatives Considered

### Alternative 1: [Nome]
- **Pros**: [benefícios]
- **Cons**: [desvantagens]
- **Why not**: [razão específica pela qual foi rejeitada]

### Alternative 2: [Nome]
- **Pros**: [benefícios]
- **Cons**: [desvantagens]
- **Why not**: [razão específica pela qual foi rejeitada]

## Consequences

O que se torna mais fácil ou mais difícil de fazer por causa desta mudança?

### Positive
- [benefício 1]
- [benefício 2]

### Negative
- [trade-off 1]
- [trade-off 2]

### Risks
- [risco e mitigação]
```

## Workflow

### Capturando um Novo ADR

Quando um momento de decisão é detectado:

1. **Inicialize (apenas na primeira vez)** — se `docs/adr/` não existir, peça confirmação ao usuário antes de criar o diretório, um `README.md` preenchido com o cabeçalho da tabela de índice (veja Formato do Índice de ADR abaixo) e um `template.md` em branco para uso manual. Não crie arquivos sem consentimento explícito.
2. **Identifique a decisão** — extraia a escolha de arquitetura central que está sendo feita
3. **Reúna o contexto** — qual problema motivou isto? Quais restrições existem?
4. **Documente as alternativas** — quais outras opções foram consideradas? Por que foram rejeitadas?
5. **Declare as consequências** — quais são os trade-offs? O que fica mais fácil/mais difícil?
6. **Atribua um número** — varra os ADRs existentes em `docs/adr/` e incremente
7. **Confirme e escreva** — apresente o rascunho do ADR ao usuário para revisão. Só escreva em `docs/adr/NNNN-decision-title.md` após aprovação explícita. Se o usuário recusar, descarte o rascunho sem escrever nenhum arquivo.
8. **Atualize o índice** — adicione ao `docs/adr/README.md`

### Lendo ADRs Existentes

Quando um usuário pergunta "por que escolhemos X?":

1. Verifique se `docs/adr/` existe — caso contrário, responda: "Nenhum ADR encontrado neste projeto. Você gostaria de começar a registrar decisões de arquitetura?"
2. Se existir, varra o índice em `docs/adr/README.md` em busca de entradas relevantes
3. Leia os arquivos ADR correspondentes e apresente as seções Context e Decision
4. Se nenhuma correspondência for encontrada, responda: "Nenhum ADR encontrado para essa decisão. Você gostaria de registrar um agora?"

### Estrutura do Diretório de ADR

```
docs/
└── adr/
    ├── README.md              ← índice de todos os ADRs
    ├── 0001-use-nextjs.md
    ├── 0002-postgres-over-mongo.md
    ├── 0003-rest-over-graphql.md
    └── template.md            ← template em branco para uso manual
```

### Formato do Índice de ADR

```markdown
# Architecture Decision Records

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [0001](0001-use-nextjs.md) | Use Next.js as frontend framework | accepted | 2026-01-15 |
| [0002](0002-postgres-over-mongo.md) | PostgreSQL over MongoDB for primary datastore | accepted | 2026-01-20 |
| [0003](0003-rest-over-graphql.md) | REST API over GraphQL | accepted | 2026-02-01 |
```

## Sinais de Detecção de Decisão

Fique atento a estes padrões na conversa que indicam uma decisão de arquitetura:

**Sinais explícitos**
- "Vamos com X"
- "Devíamos usar X em vez de Y"
- "O trade-off vale a pena porque..."
- "Registre isto como um ADR"

**Sinais implícitos** (sugira registrar um ADR — não crie automaticamente sem confirmação do usuário)
- Comparar dois frameworks ou bibliotecas e chegar a uma conclusão
- Fazer uma escolha de design de schema de banco de dados com justificativa declarada
- Escolher entre padrões de arquitetura (monolito vs microsserviços, REST vs GraphQL)
- Decidir sobre a estratégia de autenticação/autorização
- Selecionar infraestrutura de deploy após avaliar alternativas

## O Que Faz um Bom ADR

### Faça
- **Seja específico** — "Use o ORM Prisma", não "use um ORM"
- **Registre o porquê** — a justificativa importa mais do que o quê
- **Inclua as alternativas rejeitadas** — futuros desenvolvedores precisam saber o que foi considerado
- **Declare as consequências honestamente** — toda decisão tem trade-offs
- **Mantenha curto** — um ADR deve ser legível em 2 minutos
- **Use o tempo presente** — "Nós usamos X", não "Nós usaremos X"

### Não Faça
- Registrar decisões triviais — nomenclatura de variáveis ou escolhas de formatação não precisam de ADRs
- Escrever ensaios — se a seção de contexto exceder 10 linhas, está longa demais
- Omitir alternativas — "a gente só escolheu" não é uma justificativa válida
- Preencher retroativamente sem marcar isso — se registrar uma decisão passada, anote a data original
- Deixar os ADRs ficarem obsoletos — decisões substituídas devem referenciar sua substituta

## Ciclo de Vida do ADR

```
proposed → accepted → [deprecated | superseded by ADR-NNNN]
```

- **proposed**: a decisão está em discussão, ainda não confirmada
- **accepted**: a decisão está em vigor e sendo seguida
- **deprecated**: a decisão não é mais relevante (ex.: funcionalidade removida)
- **superseded**: um ADR mais novo substitui este (sempre vincule a substituta)

## Categorias de Decisões que Valem Registro

| Categoria | Exemplos |
|----------|---------|
| **Escolhas de tecnologia** | Framework, linguagem, banco de dados, provedor de nuvem |
| **Padrões de arquitetura** | Monolito vs microsserviços, orientado a eventos, CQRS |
| **Design de API** | REST vs GraphQL, estratégia de versionamento, mecanismo de auth |
| **Modelagem de dados** | Design de schema, decisões de normalização, estratégia de cache |
| **Infraestrutura** | Modelo de deploy, pipeline de CI/CD, stack de monitoramento |
| **Segurança** | Estratégia de auth, abordagem de criptografia, gestão de segredos |
| **Testes** | Framework de teste, metas de cobertura, equilíbrio E2E vs integração |
| **Processo** | Estratégia de branching, processo de revisão, cadência de releases |

## Integração com Outras Skills

- **Agent planner**: quando o planner propõe mudanças de arquitetura, sugira criar um ADR
- **Agent code reviewer**: sinalize PRs que introduzem mudanças de arquitetura sem um ADR correspondente
