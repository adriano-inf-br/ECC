---
name: knowledge-ops
description: Gerenciamento, ingestão, sincronização e recuperação de base de conhecimento em múltiplas camadas de armazenamento (arquivos locais, memória MCP, vector stores, repositórios Git). Use quando o usuário quiser salvar, organizar, sincronizar, deduplicar ou pesquisar em seus sistemas de conhecimento.
metadata:
  origin: ECC
---

# Operações de Conhecimento

Gerencie um sistema de conhecimento em múltiplas camadas para ingerir, organizar, sincronizar e recuperar conhecimento em diversos armazenamentos.

Prefira o modelo de workspace ao vivo:
- o trabalho de código fica nos repositórios clonados reais
- o contexto de execução ativo fica no GitHub, Linear e em arquivos de contexto de trabalho locais ao repositório
- notas mais amplas voltadas ao ser humano podem ficar em uma pasta de contexto/arquivo fora do repositório
- a memória durável entre máquinas pertence à base de conhecimento, não a um workspace de repositório paralelo

## Quando Ativar

- O usuário quer salvar informações em sua base de conhecimento
- Ingerir documentos, conversas ou dados em armazenamento estruturado
- Sincronizar conhecimento entre sistemas (arquivos locais, memória MCP, Supabase, repositórios Git)
- Deduplicar ou organizar conhecimento existente
- O usuário diz "salvar isto na KB", "sincronizar conhecimento", "o que eu sei sobre X", "ingerir isto", "atualizar a base de conhecimento"
- Qualquer tarefa de gestão de conhecimento além de simples recuperação de memória

## Arquitetura de Conhecimento

### Camada 1: Verdade de execução ativa
- **Fontes:** issues, PRs, discussões e release notes do GitHub, issues/projetos/docs do Linear
- **Use para:** o estado operacional atual do trabalho
- **Regra:** se algo afeta um plano de engenharia ativo, roadmap, rollout ou release, prefira colocar aqui primeiro

### Camada 2: Memória do Claude Code (Acesso Rápido)
- **Caminho:** `~/.claude/projects/*/memory/`
- **Formato:** arquivos Markdown com frontmatter
- **Tipos:** preferências do usuário, feedback, contexto de projeto, referência
- **Use para:** contexto de acesso rápido que persiste entre conversas
- **Carregado automaticamente no início da sessão**

### Camada 3: Servidor de Memória MCP (Grafo de Conhecimento Estruturado)
- **Acesso:** tools de memória MCP (create_entities, create_relations, add_observations, search_nodes)
- **Use para:** busca semântica em todas as memórias armazenadas, mapeamento de relacionamentos
- **Persistência entre sessões com estrutura de grafo consultável**

### Camada 4: Repositório da base de conhecimento / armazenamento durável de documentos
- **Use para:** notas duráveis curadas, exportações de sessão, pesquisa sintetizada, memória do operador, docs de formato longo
- **Regra:** este é o armazenamento durável preferido para contexto entre máquinas quando o conteúdo não é código de propriedade do repositório

### Camada 5: Armazenamento de Dados Externo (Supabase, PostgreSQL, etc.)
- **Use para:** dados estruturados, armazenamento de grandes documentos, busca full-text
- **Bom para:** documentos grandes demais para arquivos de memória, dados que precisam de consultas SQL

### Camada 6: Pasta local de contexto/arquivo
- **Use para:** notas voltadas ao ser humano, planos de jogo arquivados, organização de mídia local, docs temporários sem código
- **Regra:** gravável para armazenamento de informações, mas não um workspace de código paralelo
- **Não use para:** mudanças de código ativas ou verdade do repositório que deveria viver upstream

## Fluxo de trabalho de Ingestão

Quando um novo conhecimento precisa ser capturado:

### 1. Classificar
Que tipo de conhecimento é?
- Decisão de negócio -> arquivo de memória (tipo project) + memória MCP
- Estado ativo de roadmap / release / implementação -> GitHub + Linear primeiro
- Preferência pessoal -> arquivo de memória (tipo user/feedback)
- Informação de referência -> arquivo de memória (tipo reference) + memória MCP
- Documento grande -> armazenamento externo + resumo na memória
- Conversa/sessão -> repositório da base de conhecimento + resumo curto na memória

### 2. Deduplicar
Verifique se este conhecimento já existe:
- Pesquise nos arquivos de memória por entradas existentes
- Consulte a memória MCP com termos relevantes
- Verifique se a informação já existe no GitHub ou Linear antes de criar outra nota local
- Não crie duplicatas. Em vez disso, atualize as entradas existentes.

### 3. Armazenar
Grave na(s) camada(s) apropriada(s):
- Sempre atualize a memória do Claude Code para acesso rápido
- Use a memória MCP para pesquisabilidade semântica e mapeamento de relacionamentos
- Atualize GitHub / Linear primeiro quando a informação mudar a verdade ativa do projeto
- Faça commit no repositório da base de conhecimento para adições duráveis de formato longo

### 4. Indexar
Atualize quaisquer índices ou arquivos de resumo relevantes.

## Operações de Sincronização

### Sincronização de Conversa
Sincronize periodicamente o histórico de conversas com a base de conhecimento:
- Fontes: arquivos de sessão do Claude, sessões do Codex, outras sessões de agent
- Destino: repositório da base de conhecimento
- Gere um índice de sessões para navegação rápida
- Faça commit e push

### Sincronização do Estado do Workspace
Espelhe configurações e scripts importantes do workspace para a base de conhecimento:
- Gere mapas de diretórios
- Remova dados sensíveis (redação) antes de fazer commit
- Acompanhe mudanças ao longo do tempo
- Não trate a base de conhecimento ou pasta de arquivo como o workspace de código ao vivo

### Sincronização com GitHub / Linear
Quando a informação afeta a execução ativa:
- atualize a issue, PR, discussão, release notes ou thread de roadmap relevante do GitHub
- anexe docs de apoio ao Linear quando o trabalho precisar de contexto de planejamento durável
- só espelhe uma nota local depois se ainda agregar valor

### Sincronização de Conhecimento entre Fontes
Reúna conhecimento de múltiplas fontes em um único lugar:
- Exportações de conversa do Claude/ChatGPT/Grok
- Favoritos do navegador
- Eventos de atividade do GitHub
- Escreva resumo de status, faça commit e push

## Padrões de Memória

```
# Curto prazo: contexto da sessão atual
Use TodoWrite para acompanhamento de tarefas dentro da sessão

# Médio prazo: arquivos de memória do projeto
Grave em ~/.claude/projects/*/memory/ para recuperação entre sessões

# Longo prazo: GitHub / Linear / KB
Coloque a verdade de execução ativa no GitHub + Linear
Coloque contexto sintetizado durável no repositório da base de conhecimento

# Camada semântica: grafo de conhecimento MCP
Use mcp__memory__create_entities para dados estruturados permanentes
Use mcp__memory__create_relations para mapeamento de relacionamentos
Use mcp__memory__add_observations para novos fatos sobre entidades conhecidas
Use mcp__memory__search_nodes para encontrar conhecimento existente
```

## Boas Práticas

- Mantenha os arquivos de memória concisos. Arquive dados antigos em vez de deixar os arquivos crescerem sem limite.
- Use frontmatter (YAML) para metadados em todos os arquivos de conhecimento.
- Deduplique antes de armazenar. Pesquise primeiro, depois crie ou atualize.
- Prefira um único lar canônico por conjunto de fatos. Evite cópias paralelas do mesmo plano em notas locais, arquivos de repositório e docs de tracker.
- Remova informações sensíveis (chaves de API, senhas) antes de fazer commit no Git.
- Use convenções de nomenclatura consistentes para arquivos de conhecimento (lowercase-kebab-case).
- Marque entradas com tópicos/categorias para facilitar a recuperação.

## Portão de Qualidade

Antes de concluir qualquer operação de conhecimento:
- nenhuma entrada duplicada foi criada
- dados sensíveis removidos de quaisquer arquivos rastreados pelo Git
- índices e resumos atualizados
- camada de armazenamento apropriada escolhida para o tipo de dado
- referências cruzadas adicionadas onde relevante
