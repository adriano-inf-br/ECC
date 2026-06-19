# Migração Hermes / OpenClaw -> ECC

Este documento é o guia público de migração para mover uma configuração de operador no estilo Hermes ou OpenClaw para o modelo ECC atual.

O objetivo não é reproduzir um workspace de operador privado byte a byte.

O objetivo é preservar a superfície de fluxo de trabalho útil:

- skills reutilizáveis
- pontos de entrada de automação estáveis
- portabilidade cross-harness
- agendadores / lembretes / dispatch
- contexto durável e memória do operador

enquanto remove as partes que devem permanecer privadas:

- segredos
- datasets pessoais
- tokens de conta
- artefatos de negócios somente locais

## Tese de Migração

Tratar Hermes e OpenClaw como sistemas de origem, não como o runtime final.

ECC é o sistema público durável:

- skills
- agents
- comandos
- hooks
- superfícies de instalação
- adaptadores de sessão
- trabalho do plano de controle ECC 2.0

Hermes e OpenClaw são entradas úteis porque contêm fluxos de trabalho de operador repetidos que podem ser destilados em superfícies nativas do ECC.

Isso significa que o caminho seguro mais curto é:

1. extrair o comportamento reutilizável
2. traduzi-lo em skills, hooks, documentação ou trabalho de adaptador nativos do ECC
3. manter segredos e dados pessoais fora do repositório

## Modelo de Workspace Atual

Use a divisão de workspace atual de forma consistente:

- trabalho de código ativo acontece em repositórios clonados em `~/GitHub`
- contexto de execução ativo específico do repositório vive em `WORKING-CONTEXT.md` no nível do repositório
- contexto mais amplo não relacionado a código pode viver em camadas de KB/arquivo
- a verdade durável entre máquinas deve preferir GitHub, Linear e a base de conhecimento

Não reconstrua um workspace privado paralelo dentro do repositório público.

## Mapa de Tradução

### 1. Camada de Agendador / cron

Exemplos de origem:

- `cron/scheduler.py`
- `jobs.py`
- loops recorrentes de prontidão ou accountability

Traduzir para:

- agendamento nativo do Claude onde disponível
- automação de hook / comando do ECC para repetibilidade local
- trabalho de agendador do ECC 2.0 sob a issue `#1050`

Hoje, o repositório já tem o enquadramento público correto:

- hooks para automação de baixa latência local ao repositório
- comandos para ações explícitas do operador
- ECC 2.0 como o futuro plano de controle/agendamento de longa duração

### 2. Camada de Gateway / dispatch

Exemplos de origem:

- gateway Hermes
- dispatch móvel / nudges remotos
- roteamento de operador entre sessões ativas

Traduzir para:

- trabalho de adaptador de sessão e plano de controle do ECC
- comandos de inspeção de orquestração/sessão
- backlog do plano de controle do ECC 2.0 em:
  - `#1045`
  - `#1046`
  - `#1047`
  - `#1048`

O repositório público deve descrever o limite do adaptador e o modelo do plano de controle, não fingir que o shell de operador remoto já está totalmente em GA.

### 3. Camada de Memória

Exemplos de origem:

- `memory_tool.py`
- memória de operador local
- armazenamentos de contexto de negócios/ops

Traduzir para:

- `knowledge-ops`
- `WORKING-CONTEXT.md` do repositório
- contexto durável suportado por GitHub / Linear / KB
- trabalho de memória profunda futura em `#1049`

A distinção importante é:

- o contexto de execução do repositório pertence próximo ao repositório
- a memória mais ampla não relacionada a código pertence em sistemas KB/arquivo
- o repositório público deve documentar o limite, não armazenar dumps de memória privada

### 4. Camada de Skill

Exemplos de origem:

- skills Hermes
- skills OpenClaw
- playbooks de operador gerados

Traduzir para:

- skills nativas do ECC de nível superior quando o fluxo de trabalho é reutilizável
- documentação/exemplos quando o conteúdo é apenas um template
- hooks ou comandos quando o comportamento é procedural em vez de ter formato de conhecimento

Exemplos recentes já recuperados desta forma:

- `knowledge-ops`
- `github-ops`
- `hookify-rules`
- `automation-audit-ops`
- `email-ops`
- `finance-billing-ops`
- `messages-ops`
- `research-ops`
- `terminal-ops`
- `ecc-tools-cost-audit`

### 5. Camada de Ferramenta / Serviço

Exemplos de origem:

- wrappers de serviço personalizados
- ferramentas locais suportadas por chave API
- cola de automação de navegador

Traduzir para:

- superfícies suportadas por MCP quando existe um conector
- skills nativas do ECC do operador quando a lógica do fluxo de trabalho é o ativo real
- trabalho de adaptador/plano de controle quando a peça ausente é a coordenação de sessão/runtime

Não importe runtimes opacos de terceiros para o ECC apenas porque um fluxo de trabalho privado dependia deles.

Se um fluxo de trabalho é valioso:

1. entenda o comportamento
2. reconstrua a versão mínima nativa do ECC
3. documente o auth/conectores necessários localmente

## O que Já Existe Publicamente

O repositório atual já cobre partes significativas da migração:

- documentação de descoberta de adaptadores/plano de controle do ECC 2.0
- substrato de inspeção de orquestração/sessão
- skills de fluxo de trabalho do operador
- skills de auditoria de custo/faturamento/workflow
- superfícies de instalação cross-harness
- AgentShield para varredura de configuração e superfície de agent

Isso significa que o problema de migração não é mais "começar do zero."

É principalmente:

- destilar fluxos de trabalho privados ausentes
- esclarecer documentação pública
- continuar o buildout de operador/plano de controle do ECC 2.0

O ECC 2.0 agora disponibiliza um ponto de entrada de auditoria de migração delimitado:

- `ecc migrate audit --source ~/.hermes`
- `ecc migrate plan --source ~/.hermes --output migration-plan.md`
- `ecc migrate scaffold --source ~/.hermes --output-dir migration-artifacts`
- `ecc migrate import-skills --source ~/.hermes --output-dir migration-artifacts/skills`
- `ecc migrate import-tools --source ~/.hermes --output-dir migration-artifacts/tools`
- `ecc migrate import-plugins --source ~/.hermes --output-dir migration-artifacts/plugins`
- `ecc migrate import-schedules --source ~/.hermes --dry-run`
- `ecc migrate import-remote --source ~/.hermes --dry-run`
- `ecc migrate import-env --source ~/.hermes --dry-run`
- `ecc migrate import-memory --source ~/.hermes`

Use isso primeiro para inventariar o workspace legado e mapear as superfícies detectadas para o agendador atual do ECC2, dispatch remoto, grafo de memória, templates e faixas de tradução manual.

## O que Ainda Pertence ao Backlog

Os temas grandes de migração restantes já estão rastreados:

- `#1051` Migração Hermes/OpenClaw
- `#1049` camada de memória profunda
- `#1050` agendamento autônomo
- `#1048` camada de compatibilidade de harness universal
- `#1046` orquestrador de agent
- `#1045` gerenciador TUI multi-sessão
- `#1047` gerenciador visual de worktree

Esse é o lugar certo para o trabalho não resolvido de plano de controle.

Não finja que a migração está "concluída" apenas porque a documentação pública existe.

## Ordem de Inicialização Recomendada

1. Manter o repositório ECC público como a camada reutilizável canônica.
2. Portar fluxos de trabalho reutilizáveis do Hermes/OpenClaw em skills nativas do ECC, uma faixa de cada vez.
3. Manter auth privado e contexto pessoal fora do repositório.
4. Usar sistemas GitHub / Linear / KB como verdade durável.
5. Tratar o ECC 2.0 como o caminho para um shell de operador nativo, não como um produto finalizado.

## Regra de Decisão

Ao revisar um artefato Hermes ou OpenClaw, pergunte:

1. Isso é reutilizável entre operadores ou apenas pessoal?
2. O ativo é principalmente conhecimento, procedimento ou comportamento de runtime?
3. Deve se tornar:
   - uma skill
   - um comando
   - um hook
   - uma documentação/exemplo
   - uma issue de plano de controle
4. Lançá-lo publicamente vaza segredos, datasets privados ou estado de operação pessoal?

Publique apenas a superfície reutilizável.
