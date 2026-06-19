# Notas de Lançamento ECC v2.0.0-rc.1

## Posicionamento

O ECC v2.0.0-rc.1 é a primeira superfície de candidato a lançamento do ECC como um sistema operacional cross-harness para trabalho agêntico.

Claude Code permanece como um alvo principal. Codex, OpenCode, Cursor, Gemini e outros harnesses são tratados como superfícies de execução que podem compartilhar as mesmas skills, regras, convenções MCP e workflows de operador. ECC é o substrato reutilizável; Hermes é documentado como o shell do operador que pode ficar em cima dessa camada.

## O Que Mudou

- Adicionado o guia de configuração sanitizado do Hermes à história de lançamento público.
- Adicionado material de lançamento no repo para que o lançamento possa ser enviado a partir de uma única superfície revisada.
- Esclarecida a divisão entre ECC como substrato reutilizável e Hermes como shell do operador.
- Documentado o modelo de portabilidade cross-harness para skills, hooks, MCPs, regras e instruções.
- Adicionado um playbook de importação do Hermes para transformar padrões de operador locais em skills ECC publicáveis.
- Adicionado Zed como alvo de planejamento/instalação local ao projeto enquanto mantém segredos BYOK e OpenRouter fora dos arquivos de projeto gerenciados pelo ECC.
- Adicionada cobertura de registro de comando, auditoria de plataforma, auditoria de discussão, painel do operador, prontidão de progresso Linear e gates de smoke do preview pack.
- Adicionado um [gate de prontidão de observabilidade](../../architecture/observability-readiness.md) local para status de loop, rastreamentos de sessão, auditoria de harness e logs de risco de ferramenta ECC2.
- Adicionado o [pacote de skill de mercado de predição Itô](ito-prediction-market-skill-pack.md) público de teaser
  para pesquisa somente leitura de cesta, comparação, inteligência de mercado estilo oráculo
  e revisão de risco. O acesso à API Itô ao vivo permanece gatado e separado do
  faturamento das ECC Tools.
- Adicionado o pacote de skill de otimização derivado de rollout: execução paralela,
  loops de benchmark, aceleração de throughput de dados, sistemas críticos de latência e
  ledgers de decisão recursivos.
- Atualizada a evidência de prontidão de lançamento após o acompanhamento da campanha Mini
  Shai-Hulud/TanStack de maio de 2026, incluindo cobertura completa de IOC AgentShield da campanha,
  verificações de fila zero/discussão, um gate detalhado de roadmap Linear,
  o snapshot do painel do operador de 18 de maio e um ledger de URL ao vivo/pendente
  para gatagem de anúncio.
- Publicado `ecc-universal@2.0.0-rc.1` no npm com a dist-tag `next`. A
  tag `latest` permanece em `1.10.0` durante a janela rc.1.

## Desde v1.10.0

A superfície rc.1 agora inclui a direção principal do 2.0 em vez de um branch de
feature isolado:

- trabalho de substrato cross-harness para Claude Code, Codex, OpenCode, Cursor,
  Gemini, Zed e workflows somente de terminal;
- superfícies de publicação de pacote e plugin mais robustas para npm, plugin Claude,
  marketplace de repo Codex, OpenCode e metadados de agente;
- gates de operador para PRs, issues, discussões, trabalho legado obsoleto, progresso
  Linear, evidências de lançamento e repetibilidade do painel;
- hardening da cadeia de suprimentos após a campanha Mini Shai-Hulud/TanStack,
  incluindo varredura IOC, instalações de CI sem ciclo de vida, atualização de fonte de aviso,
  verificações de auditoria/assinatura npm e alvos de persistência de ferramenta AI em nível de usuário;
- mirrors de roadmap enterprise do AgentShield para hardening do gerenciador de pacotes,
  proveniência do pacote de evidências, exportação de política, promoção de política, roteamento de frota
  e telemetria de saída do GitHub Action;
- mirrors de roadmap das ECC Tools para análise hospedada, consumo de resumo de frota,
  caminhos de evidência de descoberta, vinculação de rota de política de harness, rastreamentos de auditoria do juiz de promoção hospedado,
  preflight de anúncio de faturamento e estado de readback do Marketplace de produção;
- expansão de documentação, localização japonesa, reparo de paridade zh-CN para ja-JP
  e prontidão de dependências através do TypeScript 6 e atualizações de tipos Node;
- material de lançamento para texto de lançamento no GitHub, X, LinkedIn, esboço de artigo,
  handoff Telegram/Hermes, prompts de demonstração, outreach de parceiro/patrocinador/palestra e
  o checklist de lançamento aguardando aprovação.
- distribuição de skill Itô gatada como teaser de workflow público, não uma alegação de trading ao vivo
  ou um merge de propriedade das ECC Tools e Itô.
- um ledger de URL do lançamento que separa links que já resolvem de links
  que devem aguardar a tag/diretório do plugin, upload do vídeo e
  readback de faturamento das ECC Tools.

## Por Que Isso Importa

ECC não é mais apenas um plugin Claude Code ou pacote de configuração.

O sistema agora tem uma forma mais clara:

- skills reutilizáveis em vez de prompts únicos
- hooks e testes para disciplina de workflow
- acesso com suporte MCP a docs, código, automação de browser e pesquisa
- superfícies de instalação cross-harness para Claude Code, Codex, OpenCode, Cursor e ferramentas relacionadas
- Hermes como um shell de operador opcional para chat, cron, handoffs e roteamento de trabalho diário

## Limites do Candidato a Lançamento

Este é um candidato a lançamento, não a alegação GA final.

O que é entregue nesta superfície:

- documentação pública de configuração do Hermes
- notas de lançamento e material de lançamento
- documentação de arquitetura cross-harness
- orientação de importação do Hermes para workflows de operador sanitizados
- evidências de prontidão de publicação para estado da fila, estado de discussão, cobertura do roadmap Linear, status do painel do operador e acompanhamento da cadeia de suprimentos
- evidências de smoke do preview pack provando que o pacote público está montado sem estado Hermes privado

O que fica local:

- segredos, tokens OAuth e chaves de API
- exportações brutas de workspace privado
- conjuntos de dados pessoais
- automações específicas do operador que não foram sanitizadas
- playbooks mais profundos de CRM, finanças e Google Workspace

## Movimento de Upgrade

1. Siga o [quickstart do rc.1](quickstart.md).
2. Leia o [guia de configuração do Hermes](../../HERMES-SETUP.md).
3. Revise a [arquitetura cross-harness](../../architecture/cross-harness.md).
4. Execute o [gate de prontidão de observabilidade](../../architecture/observability-readiness.md).
5. Verifique o [ledger de URL do lançamento](release-url-ledger-2026-05-19.md) antes
   de usar quaisquer links de anúncio.
6. Comece com uma faixa de workflow: engenharia, pesquisa, conteúdo ou outreach.
7. Importe apenas padrões de operador sanitizados para skills ECC.
8. Trate `ecc2/` como um plano de controle alfa até que o empacotamento do lançamento e o comportamento
   do instalador sejam finalizados.

## Estado de Publicação

O pré-lançamento no GitHub e o pacote npm `next` estão ao vivo:

- Pré-lançamento no GitHub:
  <https://github.com/affaan-m/ECC/releases/tag/v2.0.0-rc.1>
- Pacote rc no npm:
  <https://www.npmjs.com/package/ecc-universal/v/2.0.0-rc.1>

Este ainda é um candidato a lançamento, não uma alegação GA. As alegações públicas restantes continuam
aguardando aprovação até que exista readback para o caminho de tag/marketplace do plugin Claude,
status de marketplace de repo ou Diretório Oficial de Plugins do Codex, URLs de upload de vídeo,
prontidão de faturamento/pagamentos nativos das ECC Tools e texto final de outbound.
