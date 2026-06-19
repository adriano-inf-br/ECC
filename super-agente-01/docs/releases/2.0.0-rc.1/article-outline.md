# Esboço de Artigo - ECC v2.0.0-rc.1

## Título de Trabalho

Transformando o ECC em um Sistema Operacional Cross-Harness

## Argumento Central

A maior parte do trabalho agêntico falha porque as ferramentas permanecem isoladas.

A alavancagem vem de tratar o harness, a camada de fluxo de trabalho reutilizável e o shell de operador como um único sistema:

- skills para trabalho repetível
- hooks e testes para aplicação
- MCPs para acesso a ferramentas
- memória e handoffs para continuidade
- um shell de operador que pode rotear a execução diária

## Estrutura

### 1. O Problema

- janelas de chat demais
- fluxos de trabalho específicos por ferramenta demais
- contexto demais vivendo em hábito pessoal em vez de forma de sistema reutilizável

### 2. O Que o ECC Já Resolveu

- formato de skill reutilizável
- superfícies de instalação cross-harness
- disciplina de hooks e verificação
- padrões de segurança e revisão
- skills de fluxo de trabalho de operador para conteúdo, pesquisa e operações de negócios
- verificações de fila, discussão, Linear, legado e evidência de lançamento que tornam o
  estado operacional inspecionável
- escaneamento de IOC na cadeia de suprimentos e endurecimento de instalação sem ciclo de vida após a
  campanha Mini Shai-Hulud/TanStack

### 3. Por Que o Hermes É a Camada de Operador

- chat, CLI, TUI, cron e handoffs podem estar acima da camada ECC reutilizável
- trabalho de negócios e conteúdo pode rodar ao lado do trabalho de engenharia
- o loop diário se torna mais fácil de inspecionar e melhorar

### 4. O Que É Entregue no rc.1

- guia de configuração sanitizado do Hermes
- material de lançamento e distribuição
- documento de arquitetura cross-harness
- orientação de importação do Hermes
- posicionamento mais claro do 2.0 no repositório
- gate de smoke do preview-pack
- rascunhos de lançamento para cópia de lançamento no GitHub, X, LinkedIn, artigo, handoff
  Telegram/Hermes e prompts de demonstração

### 5. O Que Mudou Desde o v1.10.0

- O Claude Code continua sendo o alvo principal, mas o ECC agora trata Codex, OpenCode,
  Cursor, Gemini, Zed e fluxos de trabalho apenas em terminal como superfícies de execução compartilhadas.
- O processo de lançamento agora tem verificações repetíveis de plataforma, discussão, observabilidade,
  cadeia de suprimentos, progresso no Linear e preview-pack.
- O trabalho do AgentShield e das ECC Tools é espelhado no roteiro para que as faixas de
  segurança empresarial, revisão hospedada, promoção de políticas e prontidão de faturamento não
  se afastem do lançamento principal.

### 6. O Que Permanece Local

- segredos e autenticação
- exportações brutas do workspace
- conjuntos de dados pessoais
- automações específicas de operador que não foram sanitizadas
- playbooks mais profundos de CRM, finanças e Google Workspace

### 7. Ponto de Encerramento

O objetivo não é copiar uma stack exata.

O objetivo é construir um sistema operacional em torno do agent que transforma trabalho repetido em superfícies reutilizáveis e mensuráveis.
