# Configuração Hermes x ECC

Hermes é o shell do operador. ECC é o sistema reutilizável por trás dele.

Este guia é a versão pública e sanitizada da stack Hermes usada para executar conteúdo, outreach, pesquisa, operações de vendas, verificações financeiras e fluxos de trabalho de engenharia a partir de uma superfície nativa de terminal.

## O que é Disponibilizado Publicamente

- Skills, agents, comandos, hooks e configs de MCP do ECC deste repositório
- Skills de fluxo de trabalho geradas pelo Hermes que são estáveis o suficiente para reutilização
- Uma topologia de operador documentada para chat, crons, memória de workspace e fluxos de distribuição
- Material de lançamento para compartilhar a stack publicamente

Este guia não inclui segredos privados, tokens ativos, dados pessoais ou uma exportação bruta de `~/.hermes`.

## Arquitetura

Use o Hermes como porta de entrada e o ECC como substrato de fluxo de trabalho reutilizável.

```text
Telegram / CLI / TUI
        ↓
      Hermes
        ↓
 ECC skills + hooks + MCPs + pacotes de fluxo de trabalho gerados
        ↓
 Google Drive / GitHub / automação de navegador / APIs de pesquisa / ferramentas de mídia / ferramentas financeiras
```

## Mapa de Workspace Público

Use isso como a superfície mínima para reproduzir a configuração sem vazar estado privado.

- `~/.hermes/config.yaml`
  - roteamento de modelo
  - registro de servidor MCP
  - carregamento de plugin
- `~/.hermes/skills/ecc-imports/`
  - skills do ECC copiadas para uso nativo no Hermes
- `skills/hermes-generated/`
  - padrões de operador destilados de sessões repetidas do Hermes
- `~/.hermes/plugins/`
  - plugins bridge para hooks, lembretes e cola de ferramenta específica de fluxo de trabalho
- `~/.hermes/cron/jobs.json`
  - execuções de automação agendadas com prompts e canais explícitos
- `~/.hermes/workspace/`
  - artefatos de negócios, ops, saúde, conteúdo e memória

## Stack de Capacidades Recomendada

### Core

- Hermes para chat, cron, orquestração e estado do workspace
- ECC para skills, regras, prompts e convenções cross-harness
- GitHub + Context7 + Exa + Firecrawl + Playwright como camada base de MCP

### Conteúdo

- FFmpeg para edição e montagem local
- Remotion para clipes programáveis
- fal.ai para geração de imagens/vídeo
- ElevenLabs para voz, limpeza e empacotamento de áudio
- CapCut ou VectCutAPI para polimento final nativo para redes sociais

### Operações de Negócios

- Google Drive como sistema de registro para documentos, planilhas, apresentações e dumps de pesquisa
- Stripe para operações de receita e pagamento
- GitHub para execução de engenharia
- Canais Telegram e estilo iMessage para nudges urgentes e aprovações

## O que Ainda Requer Auth Local

Estes permanecem locais e devem ser configurados por operador:

- Token OAuth do Google para Drive / Docs / Sheets / Slides
- Credenciais de distribuição do X / LinkedIn / outbound
- Chaves Stripe
- Credenciais de automação de navegador e configurações de stealth/proxy
- Quaisquer credenciais de sistema CRM ou de projeto como Linear ou Apollo
- Caminho de exportação ou ingestão do Apple Health se automações de saúde estiverem habilitadas

## Ordem de Inicialização Sugerida

0. Execute `ecc migrate audit --source ~/.hermes` primeiro para inventariar o workspace legado e ver quais partes já mapeiam para o ECC2.
0.5. Planeje e faça scaffold dos artefatos de migração antes de importar qualquer coisa:
   - gere planos revisáveis com `ecc migrate plan` e `ecc migrate scaffold`
   - faça scaffold de skills legadas reutilizáveis com `ecc migrate import-skills --output-dir migration-artifacts/skills`
   - faça scaffold de templates de tradução de ferramentas com `ecc migrate import-tools --output-dir migration-artifacts/tools`
   - faça scaffold de templates de plugins bridge com `ecc migrate import-plugins --output-dir migration-artifacts/plugins`
   - visualize jobs recorrentes com `ecc migrate import-schedules --dry-run`
   - visualize dispatch de gateway com `ecc migrate import-remote --dry-run`
   - visualize contexto seguro de env/serviço com `ecc migrate import-env --dry-run`
   - importe memória sanitizada do workspace com `ecc migrate import-memory`
1. Instale o ECC e verifique a configuração base do harness com `node tests/run-all.js`; o resultado esperado é um resumo de testes com zero falhas.
2. Instale o Hermes e aponte-o para as skills importadas do ECC.
3. Registre os servidores MCP que você realmente usa todos os dias.
4. Autentique o Google Drive primeiro, depois o GitHub, depois os canais de distribuição.
5. Comece com uma pequena superfície de cron: verificação de prontidão, accountability de conteúdo, triagem de caixa de entrada, monitor de receita.
6. Somente então adicione fluxos de trabalho pessoais mais pesados como saúde, grafos de relacionamento ou sequenciamento de outbound.

## Documentos Relacionados

- [Guia de migração Hermes/OpenClaw](HERMES-OPENCLAW-MIGRATION.md)
- [Arquitetura cross-harness](architecture/cross-harness.md)

## Por que Hermes x ECC

Esta stack é útil quando você quer:

- um lugar nativo de terminal para executar operações de negócios e engenharia
- skills reutilizáveis em vez de prompts únicos
- automação que pode notificar, auditar e escalar
- um repositório público que mostra o formato do sistema sem expor seu estado de operador privado

## Escopo do Release Candidate Público

O ECC v2.0.0-rc.1 documenta a superfície do Hermes e disponibiliza material de lançamento agora.

As peças privadas restantes podem ser adicionadas depois:

- templates sanitizados adicionais
- exemplos públicos mais ricos
- mais pacotes de fluxo de trabalho gerados
- integrações mais robustas com CRM e Google Workspace
