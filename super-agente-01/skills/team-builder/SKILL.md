---
name: team-builder
description: Seletor interativo de agents para compor e despachar equipes paralelas
metadata:
  origin: community
---

# Team Builder

Menu interativo para navegar e compor equipes de agents sob demanda. Funciona com coleções de agents em estrutura plana ou em subdiretórios por domínio.

## Quando Usar

- Você tem múltiplas personas de agent (arquivos markdown) e quer escolher quais usar para uma tarefa
- Quer compor uma equipe ad-hoc de diferentes domínios (ex.: Segurança + SEO + Arquitetura)
- Quer navegar pelos agents disponíveis antes de decidir

## Pré-requisitos

Os arquivos de agent devem ser arquivos markdown contendo um Prompt de persona (identidade, regras, fluxo de trabalho, entregáveis). O primeiro `# Título` é usado como nome do agent e o primeiro parágrafo como descrição.

Layouts planos e em subdiretórios são suportados:

**Layout em subdiretório** — domínio inferido pelo nome da pasta:

```
agents/
├── engineering/
│   ├── security-engineer.md
│   └── software-architect.md
├── marketing/
│   └── seo-specialist.md
└── sales/
    └── discovery-coach.md
```

**Layout plano** — domínio inferido de prefixos compartilhados no nome do arquivo. Um prefixo conta como domínio quando 2+ arquivos o compartilham. Arquivos com prefixos únicos vão para "General". Nota: o algoritmo divide no primeiro `-`, então domínios com múltiplas palavras (ex.: `product-management`) devem usar o layout de subdiretório:

```
agents/
├── engineering-security-engineer.md
├── engineering-software-architect.md
├── marketing-seo-specialist.md
├── marketing-content-strategist.md
├── sales-discovery-coach.md
└── sales-outbound-strategist.md
```

## Configuração

Os agents são descobertos via dois métodos, mesclados e deduplicados por nome de agent:

1. **Comando `claude agents`** (primário) — execute `claude agents` para obter todos os agents conhecidos pelo CLI, incluindo agents de usuário, agents de plugin (ex.: `everything-claude-code:architect`) e agents embutidos. Isso cobre automaticamente instalações do marketplace ECC sem nenhuma configuração de caminho.
2. **Glob de arquivo** (fallback, para leitura do conteúdo do agent) — arquivos markdown de agent são lidos de:
   - `./agents/**/*.md` + `./agents/*.md` — agents locais do projeto
   - `~/.claude/agents/**/*.md` + `~/.claude/agents/*.md` — agents globais do usuário

Fontes anteriores têm precedência quando nomes colidem: agents de usuário > agents de plugin > agents embutidos. Um caminho personalizado pode ser usado se o usuário especificar um.

## Como Funciona

### Passo 1: Descobrir Agents Disponíveis

Execute `claude agents` para obter a lista completa de agents. Analise cada linha:
- **Agents de plugin** são prefixados com `nome-do-plugin:` (ex.: `everything-claude-code:security-reviewer`). Use a parte após `:` como nome do agent e o nome do plugin como domínio.
- **Agents de usuário** não têm prefixo. Leia o arquivo markdown correspondente de `~/.claude/agents/` ou `./agents/` para extrair nome e descrição.
- **Agents embutidos** (ex.: `Explore`, `Plan`) são ignorados a menos que o usuário peça explicitamente para incluí-los.

Para agents de usuário carregados de arquivos markdown:
- **Layout de subdiretório:** extraia o domínio do nome da pasta pai
- **Layout plano:** colete todos os prefixos de nome de arquivo (texto antes do primeiro `-`). Um prefixo se qualifica como domínio apenas se aparecer em 2 ou mais nomes de arquivo (ex.: `engineering-security-engineer.md` e `engineering-software-architect.md` ambos começam com `engineering` → domínio Engineering). Arquivos com prefixos únicos (ex.: `code-reviewer.md`, `tdd-guide.md`) são agrupados em "General"
- Extraia o nome do agent do primeiro `# Título`. Se nenhum título for encontrado, derive o nome do nome do arquivo (remova `.md`, substitua hífens por espaços, use título maiúsculo)
- Extraia um resumo de uma linha do primeiro parágrafo após o título

Se nenhum agent for encontrado após executar `claude agents` e verificar locais de arquivo, informe o usuário: "Nenhum agent encontrado. Execute `claude agents` para verificar sua configuração." Em seguida, pare.

### Passo 2: Apresentar Menu de Domínios

```
Domínios de agent disponíveis:
1. Engineering — Software Architect, Security Engineer
2. Marketing — SEO Specialist
3. Sales — Discovery Coach, Outbound Strategist

Escolha domínios ou nomeie agents específicos (ex.: "1,3" ou "security + seo"):
```

- Ignore domínios com zero agents (diretórios vazios)
- Mostre contagem de agents por domínio

### Passo 3: Tratar Seleção

Aceite entradas flexíveis:
- Números: "1,3" seleciona todos os agents de Engineering e Sales
- Nomes: "security + seo" faz correspondência fuzzy com os agents descobertos
- "all from engineering" seleciona todos os agents naquele domínio

Se mais de 5 agents forem selecionados, liste-os em ordem alfabética e peça ao usuário para reduzir: "Você selecionou N agents (máx. 5). Escolha quais manter, ou diga 'first 5' para usar os cinco primeiros em ordem alfabética."

Confirme a seleção:
```
Selecionados: Security Engineer + SEO Specialist
Em que devem trabalhar? (descreva a tarefa):
```

### Passo 4: Gerar Agents em Paralelo

1. Leia o arquivo markdown de cada agent selecionado
2. Solicite a descrição da tarefa se ainda não foi fornecida
3. Gere todos os agents em paralelo usando a ferramenta Agent:
   - `subagent_type: "general-purpose"`
   - `prompt: "{conteúdo do arquivo do agent}\n\nTask: {descrição da tarefa}"`
   - Cada agent executa independentemente — sem comunicação entre agents necessária
4. Se um agent falhar (erro, timeout ou saída vazia), registre a falha inline (ex.: "Security Engineer: falhou — [motivo]") e continue com resultados dos agents que tiveram sucesso

### Passo 5: Sintetizar Resultados

Colete todas as saídas e apresente um relatório unificado:
- Resultados agrupados por agent
- Seção de síntese destacando:
  - Acordos entre agents
  - Conflitos ou tensões entre recomendações
  - Próximos passos recomendados

Se apenas 1 agent foi selecionado, ignore a síntese e apresente a saída diretamente.

## Regras

- **Somente descoberta dinâmica.** Nunca codifique listas de agents. Novos arquivos no diretório aparecem automaticamente no menu.
- **Máximo de 5 agents por equipe.** Mais de 5 produz retornos decrescentes e uso excessivo de tokens. Aplique no momento da seleção.
- **Despacho paralelo.** Todos os agents executam simultaneamente — use o padrão de invocação paralela da ferramenta Agent.
- **Chamadas de Agent em paralelo, não TeamCreate.** Esta skill usa chamadas paralelas da ferramenta Agent para trabalho independente. TeamCreate (uma ferramenta do Claude Code para diálogo multi-agent) só é necessária quando os agents precisam debater ou responder uns aos outros.

## Exemplos

```
Usuário: team builder

Claude:
Domínios de agent disponíveis:
1. Engineering (2) — Software Architect, Security Engineer
2. Marketing (1) — SEO Specialist
3. Sales (4) — Discovery Coach, Outbound Strategist, Proposal Strategist, Sales Engineer
4. Support (1) — Executive Summary

Escolha domínios ou nomeie agents específicos:

Usuário: security + seo

Claude:
Selecionados: Security Engineer + SEO Specialist
Em que devem trabalhar?

Usuário: Revise meu site de e-commerce Next.js antes do lançamento

[Ambos os agents são gerados em paralelo, cada um aplicando sua especialidade à base de código]

Claude:
## Descobertas do Security Engineer
- [descobertas...]

## Descobertas do SEO Specialist
- [descobertas...]

## Síntese
Ambos os agents concordam em: [...]
Tensão: Security recomenda CSP que bloqueia estilos inline, SEO precisa de marcação schema inline. Resolução: [...]
Próximos passos: [...]
```
