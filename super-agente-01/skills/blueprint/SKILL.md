---
name: blueprint
description: >-
  Transforme um objetivo de uma linha em um plano de construção passo a passo para
  projetos de engenharia multi-sessão e multi-agent. Cada passo tem um
  brief de contexto autocontido para que um agent novo possa executá-lo do zero.
  Inclui portão de revisão adversarial, grafo de dependências, detecção de passos
  paralelos, catálogo de anti-padrões e protocolo de mutação de plano.
  TRIGGER quando: o usuário solicita um plano, blueprint ou roadmap para uma
  tarefa complexa de múltiplos PRs, ou descreve trabalho que precisa de múltiplas sessões.
  DO NOT TRIGGER quando: a tarefa é concluível em um único PR ou em menos
  de 3 chamadas de ferramenta, ou o usuário diz "apenas faça".
metadata:
  origin: community
---

# Blueprint — Gerador de Plano de Construção

Transforme um objetivo de uma linha em um plano de construção passo a passo que qualquer agent de código possa executar do zero.

## Quando Usar

- Quebrar uma feature grande em múltiplos PRs com ordem de dependência clara
- Planejar uma refatoração ou migração que abrange múltiplas sessões
- Coordenar fluxos de trabalho paralelos entre sub-agents
- Qualquer tarefa onde a perda de contexto entre sessões causaria retrabalho

**Não use** para tarefas concluíveis em um único PR, em menos de 3 chamadas de ferramenta, ou quando o usuário diz "apenas faça".

## Como Funciona

O Blueprint roda um pipeline de 5 fases:

1. **Research** — Verificações pré-voo (git, gh auth, remote, branch padrão), depois lê a estrutura do projeto, planos existentes e arquivos de memória para reunir contexto.
2. **Design** — Quebra o objetivo em passos do tamanho de um PR (3–12 típico). Atribui arestas de dependência, ordenação paralela/serial, tier de modelo (mais forte vs padrão) e estratégia de rollback por passo.
3. **Draft** — Escreve um arquivo de plano em Markdown autocontido em `plans/`. Cada passo inclui um brief de contexto, lista de tarefas, comandos de verificação e critérios de saída — para que um agent novo possa executar qualquer passo sem ler os passos anteriores.
4. **Review** — Delega a revisão adversarial a um sub-agent de modelo mais forte (ex.: Opus) contra um checklist e um catálogo de anti-padrões. Corrige todos os achados críticos antes de finalizar.
5. **Register** — Salva o plano, atualiza o índice de memória e apresenta a contagem de passos e o resumo de paralelismo ao usuário.

O Blueprint detecta a disponibilidade de git/gh automaticamente. Com git + GitHub CLI, ele gera planos completos de workflow de branch/PR/CI. Sem eles, muda para o modo direto (edição in-place, sem branches).

## Exemplos

### Uso básico

```
/blueprint myapp "migrate database to PostgreSQL"
```

Produz `plans/myapp-migrate-database-to-postgresql.md` com passos como:
- Step 1: Add PostgreSQL driver and connection config
- Step 2: Create migration scripts for each table
- Step 3: Update repository layer to use new driver
- Step 4: Add integration tests against PostgreSQL
- Step 5: Remove old database code and config

### Projeto multi-agent

```
/blueprint chatbot "extract LLM providers into a plugin system"
```

Produz um plano com passos paralelos onde possível (ex.: "implement Anthropic plugin" e "implement OpenAI plugin" rodam em paralelo após o passo de interface do plugin estar pronto), atribuições de tier de modelo (mais forte para o passo de design da interface, padrão para a implementação) e invariantes verificadas após cada passo (ex.: "all existing tests pass", "no provider imports in core").

## Recursos Principais

- **Execução cold-start** — Cada passo inclui um brief de contexto autocontido. Nenhum contexto anterior necessário.
- **Portão de revisão adversarial** — Todo plano é revisado por um sub-agent de modelo mais forte contra um checklist que cobre completude, correção de dependências e detecção de anti-padrões.
- **Workflow de branch/PR/CI** — Embutido em cada passo. Degrada graciosamente para o modo direto quando git/gh está ausente.
- **Detecção de passos paralelos** — O grafo de dependências identifica passos sem arquivos compartilhados ou dependências de saída.
- **Protocolo de mutação de plano** — Os passos podem ser divididos, inseridos, pulados, reordenados ou abandonados com protocolos formais e trilha de auditoria.
- **Risco zero em tempo de execução** — Skill em Markdown puro. O repositório inteiro contém apenas arquivos `.md` — sem hooks, sem scripts de shell, sem código executável, sem `package.json`, sem etapa de build. Nada roda na instalação ou invocação além do carregador nativo de Skills em Markdown do Claude Code.

## Instalação

Esta Skill vem com o Everything Claude Code. Nenhuma instalação separada é necessária quando o ECC está instalado.

### Instalação completa do ECC

Se você estiver trabalhando a partir do checkout do repositório do ECC, verifique se a Skill está presente com:

```bash
test -f skills/blueprint/SKILL.md
```

Para atualizar depois, revise o diff do ECC antes de atualizar:

```bash
cd /path/to/everything-claude-code
git fetch origin main
git log --oneline HEAD..origin/main       # review new commits before updating
git checkout <reviewed-full-sha>          # pin to a specific reviewed commit
```

### Instalação vendorizada independente

Se você estiver vendorizando apenas esta Skill fora da instalação completa do ECC, copie o arquivo revisado do repositório do ECC para `~/.claude/skills/blueprint/SKILL.md`. Cópias vendorizadas não têm um remote git, então atualize-as recopiando o arquivo a partir de um commit revisado do ECC em vez de rodar `git pull`.

## Requisitos

- Claude Code (para o comando `/blueprint`)
- Git + GitHub CLI (opcional — habilita o workflow completo de branch/PR/CI; o Blueprint detecta a ausência e muda automaticamente para o modo direto)

## Fonte

Inspirado em antbotlab/blueprint — projeto upstream e design de referência.
