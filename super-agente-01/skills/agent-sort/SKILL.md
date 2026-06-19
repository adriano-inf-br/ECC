---
name: agent-sort
description: Construa um plano de instalação ECC embasado em evidências para um repositório específico classificando skills, comandos, regras, hooks e extras em baldes DAILY vs LIBRARY usando passagens de revisão paralelas e cientes do repositório. Use quando a ECC deve ser enxugada para o que um projeto de fato precisa em vez de carregar o bundle completo.
metadata:
  origin: ECC
---

# Agent Sort

Use esta skill quando um repositório precisa de uma superfície ECC específica do projeto em vez da instalação completa padrão.

O objetivo não é adivinhar o que "parece útil". O objetivo é classificar componentes ECC com evidências da base de código real.

## Quando Usar

- Um projeto só precisa de um subconjunto da ECC e as instalações completas são ruidosas demais
- A stack do repositório é clara, mas ninguém quer curar skills manualmente uma a uma
- Uma equipe quer uma decisão de instalação repetível embasada em evidências de grep em vez de opinião
- Você precisa separar as superfícies de fluxo de trabalho diário sempre carregadas das superfícies de biblioteca/referência pesquisáveis
- Um repositório derivou para o conjunto errado de linguagem, regra ou hook e precisa de limpeza

## Regras Inegociáveis

- Use o repositório atual como fonte da verdade, não preferências genéricas
- Toda decisão DAILY deve citar evidência concreta do repositório
- LIBRARY não significa "apagar"; significa "manter acessível sem carregar por padrão"
- Não instale hooks, regras ou scripts que o repositório atual não consegue usar
- Prefira superfícies nativas da ECC; não introduza um segundo sistema de instalação

## Saídas

Produza estes artefatos em ordem:

1. inventário DAILY
2. inventário LIBRARY
3. plano de instalação
4. relatório de verificação
5. roteador `skill-library` opcional, se o projeto quiser um

## Modelo de Classificação

Use apenas dois baldes:

- `DAILY`
  - deve carregar em toda sessão para este repositório
  - fortemente combinado com a linguagem, framework, fluxo de trabalho ou superfície de operador do repositório
- `LIBRARY`
  - útil de manter, mas não vale a pena carregar por padrão
  - deve permanecer alcançável por busca, skill roteadora ou uso manual seletivo

## Fontes de Evidência

Use evidência local do repositório antes de fazer qualquer classificação:

- extensões de arquivo
- gerenciadores de pacotes e lockfiles
- configs de framework
- configs de CI e hook
- scripts de build/test
- imports e manifestos de dependências
- docs do repositório que descrevem explicitamente a stack

Comandos úteis incluem:

```bash
rg --files
rg -n "typescript|react|next|supabase|django|spring|flutter|swift"
cat package.json
cat pyproject.toml
cat Cargo.toml
cat pubspec.yaml
cat go.mod
```

## Passagens de Revisão Paralelas

Se sub-agents paralelos estiverem disponíveis, divida a revisão nestas passagens:

1. Agents
   - classifique `agents/*`
2. Skills
   - classifique `skills/*`
3. Comandos
   - classifique `commands/*`
4. Regras
   - classifique `rules/*`
5. Hooks e scripts
   - classifique superfícies de hook, verificações de saúde de MCP, scripts auxiliares e compatibilidade de SO
6. Extras
   - classifique contextos, exemplos, configs de MCP, templates e docs de orientação

Se os sub-agents não estiverem disponíveis, rode as mesmas passagens sequencialmente.

## Fluxo de Trabalho Central

### 1. Leia o repositório

Estabeleça a stack real antes de classificar qualquer coisa:

- linguagens em uso
- frameworks em uso
- gerenciador de pacotes primário
- stack de testes
- stack de lint/format
- superfície de deploy/runtime
- integrações de operador já presentes

### 2. Construa a tabela de evidências

Para cada superfície candidata, registre:

- caminho do componente
- tipo do componente
- balde proposto
- evidência do repositório
- justificativa curta

Use este formato:

```text
skills/frontend-patterns | skill | DAILY | 84 .tsx files, next.config.ts present | core frontend stack
skills/django-patterns   | skill | LIBRARY | no .py files, no pyproject.toml       | not active in this repo
rules/typescript/*       | rules | DAILY | package.json + tsconfig.json            | active TS repo
rules/python/*           | rules | LIBRARY | zero Python source files             | keep accessible only
```

### 3. Decida DAILY vs LIBRARY

Promova para `DAILY` quando:

- o repositório claramente usa a stack correspondente
- o componente é geral o suficiente para ajudar em toda sessão
- o repositório já depende do runtime ou fluxo de trabalho correspondente

Rebaixe para `LIBRARY` quando:

- o componente está fora da stack
- o repositório pode precisar dele depois, mas não todo dia
- ele adiciona overhead de contexto sem relevância imediata

### 4. Construa o plano de instalação

Traduza a classificação em ação:

- skills DAILY -> instale ou mantenha em `.claude/skills/`
- comandos DAILY -> mantenha como shims explícitos apenas se ainda forem úteis
- regras DAILY -> instale apenas os conjuntos de linguagem correspondentes
- hooks/scripts DAILY -> mantenha apenas os compatíveis
- superfícies LIBRARY -> mantenha acessíveis por busca ou `skill-library`

Se o repositório já usa instalações seletivas, atualize aquele plano em vez de criar outro sistema.

### 5. Crie o roteador de biblioteca opcional

Se o projeto quiser uma superfície de biblioteca pesquisável, crie:

- `.claude/skills/skill-library/SKILL.md`

Esse roteador deve conter:

- uma explicação curta de DAILY vs LIBRARY
- palavras-chave de gatilho agrupadas
- onde ficam as referências da biblioteca

Não duplique o corpo de cada skill dentro do roteador.

### 6. Verifique o resultado

Após o plano ser aplicado, verifique:

- todo arquivo DAILY existe onde esperado
- regras de linguagem obsoletas não foram deixadas ativas
- hooks incompatíveis não foram instalados
- a instalação resultante de fato corresponde à stack do repositório

Retorne um relatório compacto com:

- contagem DAILY
- contagem LIBRARY
- superfícies obsoletas removidas
- questões em aberto

## Handoffs

Se o próximo passo for instalação ou reparo interativo, faça handoff para:

- `configure-ecc`

Se o próximo passo for limpeza de sobreposição ou revisão de catálogo, faça handoff para:

- `skill-stocktake`

Se o próximo passo for enxugamento de contexto mais amplo, faça handoff para:

- `strategic-compact`

## Formato de Saída

Retorne o resultado nesta ordem:

```text
STACK
- language/framework/runtime summary

DAILY
- always-loaded items with evidence

LIBRARY
- searchable/reference items with evidence

INSTALL PLAN
- what should be installed, removed, or routed

VERIFICATION
- checks run and remaining gaps
```
