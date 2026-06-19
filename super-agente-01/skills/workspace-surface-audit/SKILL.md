---
name: workspace-surface-audit
description: Audita o repositório ativo, servidores MCP, plugins, conectores, superfícies de ambiente e configuração do harness, então recomenda as skills, hooks, agents e fluxos de trabalho operacionais nativos do ECC de maior valor. Use quando o usuário quiser ajuda para configurar o Claude Code ou entender quais capacidades estão realmente disponíveis no seu ambiente.
metadata:
  origin: ECC
---

# Auditoria de Superfície do Workspace

Skill de auditoria somente leitura para responder à pergunta "o que este workspace e esta máquina podem realmente fazer agora, e o que devemos adicionar ou habilitar a seguir?"

Esta é a resposta nativa do ECC para plugins de auditoria de configuração. Ela não modifica arquivos a menos que o usuário peça explicitamente uma implementação de acompanhamento.

## Quando Usar

- O usuário diz "configurar o Claude Code", "recomendar automações", "quais plugins ou MCPs devo usar?" ou "o que estou perdendo?"
- Auditando uma máquina ou repositório antes de instalar mais skills, hooks ou conectores
- Comparando plugins oficiais do marketplace com a cobertura nativa do ECC
- Revisando `.env`, `.mcp.json`, configurações de plugins ou superfícies de apps conectados para encontrar camadas de fluxo de trabalho ausentes
- Decidindo se uma capacidade deve ser uma skill, hook, agent, MCP ou conector externo

## Regras Inegociáveis

- Nunca imprima valores de segredos. Exponha apenas nomes de provedores, nomes de capacidades, caminhos de arquivos e se uma chave ou configuração existe.
- Prefira fluxos de trabalho nativos do ECC em vez de conselhos genéricos de "instale mais um plugin" quando o ECC puder razoavelmente cobrir a superfície.
- Trate plugins externos como referências e inspiração, não como fronteiras de produto autoritativas.
- Separe claramente três coisas:
  - já disponível agora
  - disponível, mas não bem encapsulado no ECC
  - não disponível e requereria uma nova integração

## Entradas da Auditoria

Inspecione apenas os arquivos e configurações necessários para responder bem à pergunta:

1. Superfície do repositório
   - `package.json`, lockfiles, marcadores de linguagem, configuração de framework, `README.md`
   - `.mcp.json`, `.lsp.json`, `.claude/settings*.json`, `.codex/*`
   - `AGENTS.md`, `CLAUDE.md`, manifestos de instalação, configurações de hook
2. Superfície de ambiente
   - Arquivos `.env*` no repositório ativo e workspaces ECC adjacentes óbvios
   - Exponha apenas nomes de chaves como `STRIPE_API_KEY`, `TWILIO_AUTH_TOKEN`, `FAL_KEY`
3. Superfície de ferramentas conectadas
   - Plugins instalados, conectores habilitados, servidores MCP, LSPs e integrações de apps
4. Superfície ECC
   - Skills, comandos, hooks, agents e módulos de instalação existentes que já cobrem a necessidade

## Processo de Auditoria

### Fase 1: Inventário do que Existe

Produza um inventário compacto:

- alvos de harness ativos
- plugins instalados e apps conectados
- servidores MCP configurados
- servidores LSP configurados
- serviços respaldados por variáveis de ambiente implícitos nos nomes das chaves
- skills ECC existentes já relevantes para o workspace

Se uma superfície existe apenas como primitivo, indique isso. Exemplo:

- "Stripe está disponível via app conectado, mas o ECC não possui uma skill de operador de faturamento"
- "Google Drive está conectado, mas não há um fluxo de trabalho de operador do Google Workspace nativo no ECC"

### Fase 2: Benchmark com Superfícies Oficiais e Instaladas

Compare o workspace com:

- plugins oficiais do Claude que se sobrepõem a configuração, revisão, documentação, design ou qualidade de fluxo de trabalho
- plugins instalados localmente no Claude ou Codex
- as superfícies de apps conectados atualmente pelo usuário

Não apenas liste nomes. Para cada comparação, responda:

1. o que eles realmente fazem
2. se o ECC já tem paridade
3. se o ECC possui apenas primitivos
4. se o ECC está completamente sem o fluxo de trabalho

### Fase 3: Transforme Lacunas em Decisões ECC

Para cada lacuna real, recomende a forma nativa ECC correta:

| Tipo de Lacuna | Forma ECC Preferida |
|----------|---------------------|
| Fluxo de trabalho de operador repetível | Skill |
| Aplicação automática ou efeito colateral | Hook |
| Papel delegado especializado | Agent |
| Ponte para ferramenta externa | Servidor MCP ou conector |
| Orientação de instalação/bootstrap | Skill de configuração ou auditoria |

Use como padrão skills voltadas ao usuário que orquestram ferramentas existentes quando a necessidade é operacional em vez de infraestrutural.

## Saída

Retorne cinco seções nesta ordem:

1. **Superfície atual**
   - o que já é utilizável agora
2. **Paridade**
   - onde o ECC já iguala ou supera o benchmark
3. **Lacunas somente com primitivos**
   - ferramentas existem, mas o ECC não possui uma skill de operador limpa
4. **Integrações ausentes**
   - capacidade ainda não disponível
5. **3-5 próximas ações principais**
   - adições nativas ECC concretas, ordenadas por impacto

## Regras de Recomendação

- Recomende no máximo 1-2 ideias de maior valor por categoria.
- Favoreça skills com intenção óbvia do usuário e valor de negócio:
  - auditoria de configuração
  - operações de faturamento/clientes
  - operações de issues/programa
  - operações do Google Workspace
  - controle de implantação/ops
- Se um conector for específico da empresa, recomende-o apenas quando estiver genuinamente disponível ou claramente útil para o fluxo de trabalho do usuário.
- Se o ECC já possui um primitivo forte, proponha uma skill wrapper em vez de inventar um subsistema completamente novo.

## Bons Resultados

- O usuário pode imediatamente ver o que está conectado, o que está faltando e o que o ECC deve assumir a seguir.
- As recomendações são específicas o suficiente para serem implementadas no repositório sem outra passagem de descoberta.
- A resposta final é organizada em torno de fluxos de trabalho, não de marcas de API.
