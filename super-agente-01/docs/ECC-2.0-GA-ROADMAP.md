# Roadmap ECC 2.0 GA

Este roadmap é o espelho durável no repositório para o projeto Linear ativo:

<https://linear.app/itomarkets/project/ecc-platform-roadmap-52b328ee03e1>

A criação de issues no Linear está disponível novamente no workspace da Ito Markets. A verdade
de execução ao vivo está dividida entre:

- os documentos do projeto Linear, raias de issues, dependências e marcos;
- este documento no repositório;
- evidências de PRs mesclados;
- handoffs em `~/.cluster-swarm/handoffs/`.

O mapa de execução de lançamento/crescimento de 19 de maio está em
[`docs/releases/2.0.0/ecc-2-hypergrowth-release-command-center.md`](releases/2.0.0/ecc-2-hypergrowth-release-command-center.md).
É a superfície operacional para a identidade final do repositório ECC 2.0, suíte de vídeos,
funil de parceiros/patrocinadores, funil de consultoria/palestras e plano de lançamento social.

## Delta de 2026-05-20

- A auditoria de plataforma rastreada continua verde em 20 de maio com 0 PRs abertos,
  0 issues abertos, 0 lacunas de toque de mantenedor em discussões, 0 lacunas de Q&A respondíveis,
  0 PRs conflitantes e 0 arquivos sujos bloqueadores em `affaan-m/ECC`,
  `affaan-m/agentshield`, `affaan-m/JARVIS`, `ECC-Tools/ECC-Tools` e
  `ECC-Tools/ECC-website`.
- O novo Q&A de localização de setup #2015 foi respondido e marcado como aceito. A
  resposta mantém as orientações de instalação conservadoras: não instalar em `C:\`; usar um
  workspace normal, instalar o Plugin Claude `ecc@ecc` uma vez, copiar apenas as pastas de
  regras necessárias ao usar regras manuais e evitar empilhar Plugin mais instalação manual
  completa.
- Os PRs #80-#88 do ECC-Tools entregaram o próximo lote da plataforma hospedada: recibos de
  execução agora exigem motivos de falha; IDs de aprovação da frota AgentShield sobrevivem à
  revisão de segurança hospedada e são renderizados em comentários/check-runs; a sincronização
  de acompanhamento do Linear reutiliza IDs externos determinísticos; itens de remediação
  AgentShield hospedados sincronizam com o Linear; eventos de observabilidade de jobs hospedados
  são emitidos para estados enfileirado, concluído, bloqueado, falhou e orçamento-bloqueado; e
  tanto comentários de status de jobs hospedados quanto check-runs do plano de profundidade
  hospedado leem eventos recentes de observabilidade/orçamento. O PR #88 adiciona o readback
  autenticado da API de observabilidade para dashboards de operadores e testes de smoke em
  produção.
- O PR #94 do AgentShield entregou a próxima fatia do adaptador cross-harness: Zed e
  VS Code são detecções de adaptador de primeira classe, `.zed/settings.json` e
  `.zed/tasks.json` são entradas de varredura descobríveis, e `.zed/setup.mjs` agora
  aciona a mesma regra IOC de persistência de ferramenta de IA que `.vscode/setup.mjs`.
- O PR #95 do AgentShield limpou o alerta Dependabot restante no Branch padrão movendo
  entradas de lockfile transitivas de `brace-expansion` 5.x para `5.0.6`; a API de alertas
  abertos do Dependabot pós-merge agora retorna `[]`, e o `npm audit --audit-level=moderate`
  local retorna 0 vulnerabilidades.
- O PR #2019 do ECC mesclou a sincronização do release-gate de alvo selecionado do Marketplace
  Pro neste repositório como `30f60710d4e0424fc70d9bbdc105009db141d9d8`. A execução de CI
  principal pós-merge `26135974576` foi concluída com sucesso em lint, coverage, segurança,
  validação e a matriz completa de SO/gerenciador de pacotes.
- O PR #2020 do ECC mesclou o espelho do announcement-gate de alvo selecionado como
  `c2471fe5c535310f8a8008c9ed7ea9f6757b33f2`. A execução de CI principal pós-merge
  `26136949698` foi concluída com sucesso em lint, coverage, segurança, validação
  e a matriz completa de SO/gerenciador de pacotes.
- O PR #90 do ECC-Tools adicionou o portão de anúncio oficial de alvo selecionado para
  `billing:announcement-gate -- --select-ready-target`; o preflight seguro de produção não
  requer mais um login bruto no GitHub e agora bloqueia apenas na entrada
  `INTERNAL_API_SECRET` local/interna antes da execução ao vivo.
- O PR #91 do ECC-Tools adicionou suporte a `--env-file` em ambos os scripts de portão de
  billing para que arquivos de credenciais de operadores locais ignorados possam fornecer
  `INTERNAL_API_SECRET`, autenticação do Cloudflare, modo de autenticação do Wrangler ou
  fallbacks de alvo sem imprimir o conteúdo dos segredos. Verificação, Auditoria de Segurança
  e Workers Builds foram aprovados antes do merge como `72119a1`, e a execução de CI principal
  `26137280847` foi concluída com sucesso após o merge.
- O PR #92 do ECC-Tools adicionou um bearer `INTERNAL_OPERATOR_API_SECRET` não-disruptivo
  aceito por rotas de API internas privilegiadas sem rotacionar o `INTERNAL_API_SECRET`
  existente; Verificação, Auditoria de Segurança e Workers Builds foram aprovados
  antes do merge como `18d80197be779619283e0b37e2952bac53819a07`, e o Worker mesclado foi
  implantado em `api.ecc.tools`.
- O portão de pagamentos nativos ao vivo de 20 de maio agora passa: o readback do Wrangler
  com vault selecionou um alvo Marketplace Pro pronto com fingerprint
  `e953a74209fe`, ambas as famílias de chaves presentes, evidência de webhook pronta, 0
  bloqueadores KV e o `npm run billing:announcement-gate -- --select-ready-target` oficial
  retornou `announcementGateReady: true`, 0 ações necessárias, 0 bloqueadores e resumo de
  auditoria 6 aprovados / 1 aviso / 0 falhas pelo novo caminho de bearer do operador.
- O PR #93 do ECC-Tools registrou essas evidências de billing ao vivo no checklist de
  lançamento do aplicativo e no roadmap de distribuição como
  `d3d62df83fa075660fa4530c3e0edc311a4355fe`; o texto público de pagamentos nativos não está
  mais bloqueado por evidências de billing, mas o momento de publicação permanece atrás dos
  portões de lançamento final, Plugin, URL ao vivo e aprovação do proprietário.
- O ITO-54 do Linear e o Roadmap da Plataforma ECC agora têm os comentários de atualização
  de observabilidade hospedada do ECC-Tools de 20 de maio
  `74dcc101-3be5-4173-be13-62b80d54f569` e
  `348ea8f5-2a2d-46d9-a0fe-ed99653e7fe5`, após os comentários anteriores dos PRs #84/#85
  registrarem sincronização de remediação e eventos de observabilidade hospedada. O PR #88
  está registrado nos comentários do Linear `291e2a4b-06e3-4672-a057-cdb141478161` e
  `b2d35de0-ca49-44cb-982a-ddec229e7691`; AgentShield #94 está registrado no
  comentário ITO-49 `faed69dd-35f5-469d-acb5-ddde6a70d6a1` e no comentário do projeto
  `70187c1e-d481-4181-b418-09bd65d54b5e`; AgentShield #95 está registrado no
  comentário ITO-49 `371fc3e4-611f-4d20-a23f-67db1260b418`, no comentário ITO-57
  `bd06e252-15c1-4256-b667-caa3f64f5968` e no comentário do projeto
  `22c2c388-2fd1-4dea-a939-6141f40c9a21`.
- O ITO-61 do Linear e o Roadmap da Plataforma ECC agora têm os comentários do portão de
  lançamento do Marketplace Pro de 20 de maio `467d148a-712a-4777-aad9-95593e9f1739` e
  `7642ee9c-3107-400c-a229-53e2895a8914`, registrando ECC-Tools #89, ECC #2019,
  a execução de CI pós-merge verde e o portão restante de bearer token interno.
  O espelho do repositório agora também registra ECC-Tools #90 e #91 como o portão de
  anúncio de alvo selecionado e o acompanhamento do caminho de operador com env-file do
  portão de billing.

## Delta de 2026-05-19

- A identidade pública do repositório agora é `affaan-m/ECC`; superfícies de lançamento,
  pacote, Plugin, workflow e textos de lançamento devem usar essa URL para links públicos atuais.
- A drenagem da fila do final de 19 de maio adicionou o `release:approval-gate` determinístico
  no `main` do ECC, mesclou o hardening de redação do billing-announcement do ECC-Tools e
  limpou a cauda de reparo de Dependabot/deploy do JARVIS. A auditoria de plataforma rastreada
  agora está verde com 0 PRs abertos, 0 issues abertos e 0 lacunas de discussão em todos os
  cinco repositórios rastreados, mas ações de lançamento/publicação permanecem sob portão de
  proprietário e URL ao vivo.
- A história de lançamento do ECC 2.0 deve liderar diretamente com a forma do produto:
  sistema operacional nativo do harness, convenções reutilizáveis de Skills/rules/Hooks/MCP,
  plano de controle alpha `ecc2/`, Hermes como shell de operador opcional e ECC Tools
  Pro/Patrocinadores/consultoria como a superfície de negócios.
- O texto deve evitar apresentar isso como uma renomeação de repositório ou migração de
  config-pack. A prova de lançamento deve mostrar o sistema através do fluxo de instalação,
  demos cross-harness, evidências de segurança, evidências de produto hospedado e a suíte
  de vídeos.

## Evidências Atuais

Em 2026-05-20:

- As filas do GitHub estão limpas em `affaan-m/ECC`,
  `affaan-m/agentshield`, `affaan-m/JARVIS`, `ECC-Tools/ECC-Tools` e
  `ECC-Tools/ECC-website`: a varredura mais recente de `platform-audit` encontrou 0 PRs abertos,
  0 issues abertos, 0 lacunas de toque de mantenedor em discussões, 0 Q&A respondíveis sem
  respostas aceitas e 0 arquivos sujos bloqueadores. A saída atual de
  `scripts/work-items.js list --json` também reporta `totalCount: 0`, portanto
  não há itens de trabalho locais abertos ou bloqueados na ponte SQLite.
- A limpeza da fila do proprietário também está dentro do orçamento solicitado:
  `docs/releases/2.0.0-rc.1/owner-queue-cleanup-2026-05-18.md` registra a
  varredura `gh search` ao vivo que fechou 24 PRs de dependency-bot obsoletos e 72 issues
  obsoletos de pagamentos legados/roadmap 0EM, depois fechou os 9 PRs restantes obsoletos,
  gerados, conflitantes ou de teste/ruído e as 5 issues restantes de legado,
  alcance ou placeholder. O namespace do proprietário `affaan-m` mais amplo agora está com
  0 PRs abertos e 0 issues abertos por `gh search` ao vivo. Repositórios arquivados
  tocados durante o fechamento foram restaurados ao estado arquivado.
- As discussões do GitHub estão atualizadas em todos os repositórios rastreados:
  `affaan-m/ECC` tem 60 discussões totais e 0 sem
  toque de mantenedor após a proposta de integração AURA #2003 de 19 de maio ter sido
  roteada como uma proposta de adaptador externo, não acoplamento core de carteira/escrow, e
  o Q&A de localização de setup #2015 de 20 de maio ter sido respondido e aceito; AgentShield,
  JARVIS, ECC Tools e o site ECC Tools têm discussões desabilitadas ou 0
  discussões totais. `docs/architecture/discussion-response-playbook.md` agora
  fornece as categorias de resposta ITO-59, modelos públicos, caminho de escalada de segurança
  e regras de readback para futuros lotes de discussão.
- O roadmap atual do Linear contém 16 raias de issues (`ITO-44` a
  `ITO-59`) e cinco marcos: Linha de Base de Segurança e Acesso, Prévia e Publicação do ECC 2.0,
  Iteração Enterprise do AgentShield, Plataforma de Próximo Nível do ECC Tools e
  Auditoria e Salvamento de Legado.
- A sincronização ao vivo do Linear está atualizada para o merge do PR #2002 de 19 de maio e o
  lote de discussões: o projeto de plataforma ECC tem o documento de sincronização pós-PR #2002
  `ecc-may-19-post-pr-2002-sync-64cef8f668e0`, comentário do projeto
  `a6411e3a-8c8e-4a58-adba-687e77d4c543` e comentários de issues em ITO-44,
  ITO-47, ITO-48, ITO-49, ITO-51, ITO-54 e ITO-56. ITO-47, ITO-48,
  ITO-49, ITO-51, ITO-54 e ITO-56 foram movidos para Em Andamento porque essas
  raias agora têm implementação/evidência atual e trabalho restante de portão/readback.
  ITO-57 ainda tem o comentário de atualização emergencial da cadeia de suprimentos de 18 de maio
  (`3fe5b2b7-c4fe-401c-a317-b40d72119cb3`). As atualizações de status do projeto Linear estão
  desabilitadas neste workspace, portanto documentos e comentários do projeto são a
  superfície de status externo suportada.
- O último lote de merges de 18 de maio no `main` inclui PR #1970 correções de bypass do
  validador de segurança de workflow, PR #1971 correções de relatório de custo e
  de-duplicação de avisos da ponte de métricas, PR #1972 estrutura de ativação da Skill
  `uncloud`, PR #1976 guardas de resposta do provedor OpenAI/AstraFlow, evidência de espelho
  de readback de billing OAuth do Wrangler do ECC-Tools, o hardening do scanner IOC
  defensive-deny `04d4d819`, hardening de escopo de publicação OIDC de lançamento `7911af4a`,
  normalização de terminação de linha do workflow de lançamento `97567a91` e evidência de
  lançamento com um dashboard de operador atualizado.
- `docs/releases/2.0.0-rc.1/publication-evidence-2026-05-19.md` registra o
  estado de fila zero de 19 de maio, merge de identidade canônica do ECC, portão de suíte
  de vídeos de lançamento, pacote de alcance a parceiros/patrocinadores/palestrantes, pacote
  de aprovação do proprietário (`owner-approval-packet-2026-05-19.md`), digest de smoke do
  pacote de prévia atual `eebb8a66c33e`, suíte de testes local de 2568 testes, merge do PR
  #2001 e sucesso da execução do GitHub Actions `26102500291`, portão de atualização do
  dashboard de aprovação do proprietário do PR #2002 e GitHub Actions `26103853507`,
  evidência de prontidão do Linear do PR #2004 e GitHub Actions `26105012698`, mais a
  atualização de evidências pós-PR #2004 do PR #2005 e GitHub Actions `26106321921`,
  correção do portão de evidências da cadeia de suprimentos do PR #2008 e GitHub Actions
  `26108473648`, execução de CI principal pós-PR #2006 `26109953093` e execução do
  GitHub Actions de higiene do registro de projetos do PR #2009 `26111313938`, execução de
  CI principal pós-PR #2009 `26111946778`, execução de CI principal do GateGuard pós-PR
  #2011 `26113695068` e execução de CI principal do release-approval-gate pós-PR #2013
  `26128749863`. O alvo de sincronização do final de 19 de maio também inclui
  o hardening de redação do billing-announcement do PR #79 do ECC-Tools e o reparo de
  fila/deploy dos PRs #15/#16 do JARVIS, com CI principal, CodeQL e Deploy do JARVIS
  verdes após o reparo do workflow. A superfície de status externo do projeto Linear agora tem
  tanto o documento de sincronização pós-PR #2002 quanto o documento de aprovação tardia
  `ecc-may-19-late-queue-zero-and-release-gate-sync-1c26f65e6b3f`, mais o
  comentário do projeto `d42bf0e2-7a8e-4934-9f3f-e281498ee805`. O portão da cadeia de
  suprimentos agora também registra o pin `@types/node@25.7.0` e a atualização de lock
  `brace-expansion` necessária para a verificação atual de npm audit/assinatura.
- A aprovação da plataforma hospedada do ECC-Tools de 20 de maio estende essas evidências
  com os PRs #80 a #88, todos mesclados após verificações verdes do GitHub
  Verify/Security Audit/Workers Builds. A validação local para a fatia final de
  observabilidade do plano de profundidade passou no teste de rota hospedada do plano de
  profundidade focado, na suíte completa de rotas (89/89), typecheck, lint, suíte completa
  do Vitest do ECC-Tools (683/683) e `git diff --check`. O PR #88 adicionalmente expõe o
  readback autenticado de observabilidade hospedada em `/api/analysis/observability` para
  dashboards de operadores e testes de smoke em produção; sua verificação local passou em
  typecheck, lint, na suíte completa do Vitest do ECC-Tools (686/686) e
  `git diff --check`.
- O PR #94 do AgentShield adiciona Zed e VS Code ao registro de adaptadores de primeira
  classe após verificação local com typecheck, lint, os testes focados de scanner/regras
  core, `npm test` completo (1822 testes), `npm run build` e `git diff --check`.
  As verificações do GitHub passaram em GitGuardian, suíte de varredura, auto-varredura,
  exemplos de auto-varredura, CI Node 18/20/22, CodeRabbit e Cubic após reexecução de
  uma falha transitória de upload de artefato do GitHub.
- O PR #95 do AgentShield resolve o Dependabot #20 / `GHSA-jxxr-4gwj-5jf2` /
  `CVE-2026-45149` atualizando as entradas transitivas vulneráveis de lockfile
  `brace-expansion` 5.x para `5.0.6`. A validação local passou em
  `npm audit --audit-level=moderate`, typecheck, lint, `npm test` completo
  (1822 testes), Build e verificações de espaço em branco; as verificações do GitHub passaram
  em Verify Node 18/20/22, auto-varredura, exemplos de auto-varredura, Test GitHub Action,
  GitGuardian, CodeRabbit e Cubic.
- `docs/releases/2.0.0-rc.1/operator-readiness-dashboard-2026-05-20.md`
  regenera o dashboard de Prompt-para-artefato do ITO-44 a partir de evidências ao vivo da
  auditoria de plataforma: fila de PRs, fila de issues, fila de discussões, portão de
  worktree local, geração de dashboard e loop de cadeia de suprimentos estão atuais; o
  dashboard agora também rastreia a linha de base de hipercrescimento de `$1.728/mês` a
  `$10.000/mês`, raia de suíte de vídeos de lançamento, pacote de alcance a
  parceiros/patrocinadores/palestrantes e pacote de aprovação do proprietário; publicação,
  Plugin, billing, AgentShield, ECC Tools, sincronização do portão de lançamento do Linear
  e aprovação de saída final permanecem como o próximo trabalho.
- `docs/releases/2.0.0-rc.1/publication-evidence-2026-05-17.md` registra o
  estado de fila zero de 17 de maio, merge de localização para japonês, merges de TypeScript
  e Node type do Dependabot, reparo de lint ja-JP pós-merge, reverificação de proteção local
  Mini Shai-Hulud/TanStack, verificações de npm audit/assinatura, dashboard de operador atual
  e sucesso de CI do GitHub para `99dd6ac0`.
- `docs/releases/2.0.0-rc.1/publication-evidence-2026-05-16.md` registra a
  fila, discussão, roadmap do Linear, acesso ao ECC Tools, acompanhamento completo de campanha
  Mini Shai-Hulud/TanStack, cobertura agendada de monitoramento da cadeia de suprimentos,
  hardening de instalação de CI sem lifecycle, purga de cache do GitHub Actions, verificação
  de assinatura de registro do AgentShield #85, proveniência CI do pacote de evidências do
  AgentShield #86, classificação de confiança em tempo de execução do cache de Plugin do
  AgentShield #87, inspecionar/readback do pacote de evidências do AgentShield #88,
  roteamento de frota do pacote de evidências do AgentShield #89, itens de revisão de frota
  do AgentShield #90, exportação de política com suporte a checksum do AgentShield #91,
  promoção de política verificada por checksum do AgentShield #92, restrição do portão de
  billing do ECC-Tools #75, consumo de resumo de frota AgentShield do ECC-Tools #76,
  caminhos de evidência de descobertas hospedadas do ECC-Tools #77, vinculação de rota de
  política do harness do ECC-Tools #78, proteção da cadeia de suprimentos do PR #1947 e
  atualização de evidências de lançamento de 16 de maio.
- `npm run harness:audit -- --format json` reporta 80/80 no `main` atual.
- `npm run observability:ready` reporta prontidão 21/21 no `main` atual,
  incluindo o contrato de sincronização de progresso GitHub/Linear/handoff/roadmap.
- A execução de CI do GitHub `26017368895` foi concluída com sucesso para
  `04d4d81938b20ac2bac1f0025145ab77d6a59f5f`, incluindo Validate Components,
  Coverage, Lint, Security Scan e a matriz completa de Node/gerenciador de pacotes.
- A execução Supply-Chain Watch `26009825837` foi concluída com sucesso para
  `3b7e0ba30a027ffd3319c2f145c63076c296d80a`, incluindo instalação sem lifecycle,
  verificação de npm audit/assinatura, fixtures de scanner, fixtures de fonte de
  aviso, geração de artefatos IOC/aviso e validação de segurança de workflow.
- O PR #1846 foi mesclado como `797f283036904128bb1b348ae62019eb9f08cf39` e tornou a
  verificação de assinatura do registro npm um portão durável de segurança de workflow:
  workflows que executam `npm audit` agora precisam de `npm audit signatures`.
- O PR #1848 foi mesclado como `cbecf5689d8d1bd5915e7031697a1d56aac538f2` e adicionou
  `docs/security/supply-chain-incident-response.md`, mais uma regra de validador de
  segurança de workflow bloqueando workflows `pull_request_target` de restaurar ou
  salvar caches de dependências compartilhados.
- O PR #1940 foi mesclado como `6951b8d5d29d13cac6b89b461104ad03838553de` e adicionou um
  workflow agendado de monitoramento da cadeia de suprimentos que emite um relatório IOC durável.
- O PR #1941 foi mesclado como `f7035b5644ffc857879b71c39353b2141f17c3f0` e endureceu
  as instalações de dependências de CI contra comprometimento de Hook de lifecycle desabilitando
  scripts de lifecycle do gerenciador de pacotes, removendo o uso de cache de dependências do
  Actions e adicionando cobertura de validação para que esses padrões não possam ser
  reintroduzidos silenciosamente.
- O PR #1850 foi mesclado como `248673271455e9dc85b8add2a6ab76107b718639` e removeu
  o acesso shell de Agents analisadores somente leitura e cópias zh-CN, reduzindo
  descobertas altas do AgentShield nessa superfície sem alterar Agents operadores.
- O PR #1851 foi mesclado como `209abd403b7eaa968c6d4fa67be82e04b55706d6` e tornou
  `persist-credentials: false` obrigatório para `actions/checkout` em workflows
  com permissões de escrita.
- O PR #1860 foi mesclado como `c2762dd5691a33aaa7f84a0a4901a5bab7980fc8` e fechou
  #1859 adicionando a superfície do pacote de linguagem Ruby/Rails, aliases de instalação,
  componentes de instalação seletiva e testes focados do executor de manifesto de instalação.
- O AgentShield PR #78 foi mesclado como `1b19a985d6ae1346244089a78806a7d5eaaf270e`
  e endureceu o workflow de lançamento com `persist-credentials: false` mais
  `npm ci --ignore-scripts` no caminho de lançamento write/id-token.
- O AgentShield PR #79 foi mesclado como `86a823c5f2c35ee97e6ecf6f99e9ac301d54119a`
  e moveu fingerprints de baseline/monitoramento/remediação para um helper de
  fingerprint de evidências hasheadas compartilhado. Novos baselines omitem
  evidências brutas de descobertas enquanto baselines de evidências brutas mais
  antigas permanecem comparáveis.
- O AgentShield PR #80 foi mesclado como `8ed379d1de067b25640ac6273aa4d9f8e6735d43`
  e adicionou recomendações priorizadas de precisão de corpus aos gates de corpus
  com falha, mapeando erros por categoria, regra ausente e ID de configuração para
  que o trabalho empresarial de regressão de scanner tenha um plano de melhoria
  acionável.
- O AgentShield PR #81 foi mesclado como `6583884e74ba2e896942113e1ce3146230e6fb76`
  e adicionou fases ordenadas de workflow de remediação a planos de remediação,
  roteando auto-correções seguras, revisão manual e verificação através de
  fingerprints estáveis de descobertas sem copiar evidências brutas.
- O AgentShield PR #82 foi mesclado como `51336ba074ad5e9fed2c0aa3237422be22147e76`
  e expandiu o corpus de ataque embutido com um cenário de sequestro de proxy de
  ambiente cobrindo mutação de proxy/runtime, exfiltração de env-token, exfiltração
  DNS, acesso a credential-store e acesso à área de transferência.
- O AgentShield PR #87 foi mesclado como `26bb44650663816d07180e0d20c1895e431a326c`
  e adicionou confiança de runtime do plugin-cache instalado do Claude. Descobertas
  de Plugin em cache agora emitem `runtimeConfidence: plugin-cache`, o impacto na
  pontuação não-secreta permanece no `0.5x` pretendido, caminhos `plugins/cache`
  não-Claude locais do repositório não são rebaixados e implementações de Hook em
  cache não aparecem mais como `hook-code` de nível superior ativo.
- O AgentShield PR #88 foi mesclado como `65ed6e2a87545dc99d962b58413f49096a4d70ec`
  e adicionou `agentshield evidence-pack inspect` para consumidores downstream.
  Bundles de evidence-pack agora têm readback compacto JSON/texto para pontuação
  de relatório, contagens de descobertas, confiança de runtime, política, baseline,
  supply-chain, contexto CI, fases de remediação e erros de artefato malformado
  sem abrir manualmente cada arquivo do bundle.
- O AgentShield PR #89 foi mesclado como `521ada9091bb6d818511ab8589ae675b920c106a`
  e adicionou `agentshield evidence-pack fleet <dirs...> [--json]` para roteamento
  de frota downstream. Múltiplos evidence packs verificados agora se agregam em
  rotas ready, security-blocker, policy-review, baseline-regression,
  supply-chain-review e invalid com totais de descobertas, política, baseline,
  supply-chain e remediação.
- O JARVIS PR #13 foi mesclado como `127efabbfb5033ae53d7a53e1546aa3c33d6f962`
  e endureceu os workflows de CI/deploy com verificação de assinatura do registry
  npm, desabilitou credenciais de checkout persistidas em jobs com permissão de
  escrita e fixou a instalação do Vercel CLI em vez de usar `latest`.
- O ECC-Tools PR #53 foi mesclado como `99018e943d03f024de8c9d278c91f66393d4f1ee`
  e adicionou verificação de assinatura do registry npm antes da auditoria de
  dependência de produção existente no CI.
- O ECC-Tools PR #54 foi mesclado como `05df89721f49c1e19d8502c545e26f5694806998`
  e fez `/ecc-tools followups sync-linear` rastrear rascunhos de PR prontos para
  cópia no backlog do Linear/projeto quando `open-pr-drafts` não é utilizado,
  preservando trabalho útil de salvamento de PR desatualizado sem abrir shells
  de PR extras.
- O ECC-Tools PR #55 foi mesclado como `5d8c112cce4794cfa089d5b0ea661ba87a178be1`
  e adicionou prontidão de profundidade de análise a comentários de
  `/ecc-tools analyze`, separando repositórios apenas de histórico de commits de
  repositórios com evidências e deep-ready usando evidências de CI/CD, segurança,
  harness, referência/eval, roteamento de IA/controle de custos e handoff de equipe.
- O ECC-Tools PR #56 foi mesclado como `5b729c88641eafe80f65364bab3fc74d0270f57b`
  e adicionou o contrato autenticado `/api/analysis/depth-plan` que mapeia a
  prontidão de profundidade de análise em jobs hospedados concretos para
  diagnósticos de CI, revisão de evidências de segurança, compatibilidade de
  harness, avaliação de reference-set, revisão de roteamento de IA/custo e
  roteamento de backlog de equipe.
- O ECC-Tools PR #57 foi mesclado como `4cc61112a4cc9feec7b07af09321f360e34af6a4`
  e adicionou o primeiro job executável de análise hospedada: `/api/analysis/jobs/ci-diagnostics`
  agora faz gate na prontidão de CI/CD, inspeciona artefatos de workflow/test-runner/
  evidência de falha, retorna descobertas de hardening de CI e próximas ações, e cobra
  uso apenas após execução bem-sucedida.
- O ECC-Tools PR #58 foi mesclado como `ce09dd8d9b46f65c6b88dc4f48cfb6b6227ae0bf`
  e adicionou o segundo job executável: `/api/analysis/jobs/security-evidence-review`
  aplica os mesmos gates hospedados a artefatos de evidence-pack, política, baseline,
  SBOM, SARIF e scanner de segurança do AgentShield.
- O ECC-Tools PR #59 foi mesclado como `505b372dbd8f75f996d9e2ed079effd30cec5ba5`
  e adicionou o terceiro job executável: `/api/analysis/jobs/harness-compatibility-audit`
  aplica os mesmos gates a evidências Claude, Codex, OpenCode, MCP, Plugin e
  cross-harness enquanto evita fetches de harness config local com segredos.
- O ECC-Tools PR #60 foi mesclado como `b75e0a49ba5672b1ec9a2a4880ddcfa2d07dc557`
  e adicionou o quarto job executável: `/api/analysis/jobs/reference-set-evaluation`
  aplica os mesmos gates a evidências de corpus de analisador, RAG/evaluator,
  salvamento de PR, harness, segurança e modo de falha de CI enquanto evita
  fetches de fixtures com segredos.
- O ECC-Tools PR #61 foi mesclado como `7b01b67cae0b80774b311cb515b7eca0aa038c65`
  e adicionou o quinto job executável: `/api/analysis/jobs/ai-routing-cost-review`
  aplica os mesmos gates a evidências de roteamento de modelo, orçamento de tokens,
  limite de uso, limite de taxa, billing/habilitação, regressão de custos e política
  de custos enquanto evita fetches de caminhos com segredos.
- O ECC-Tools PR #62 foi mesclado como `781d6733e56f7556edb43fb96bdfb00b1f0a3aa6`
  e adicionou o sexto job executável: `/api/analysis/jobs/team-backlog-routing`
  aplica os mesmos gates a evidências de roadmap, runbook, handoff, plano de
  lançamento, issue-template, propriedade, project-tracker, backlog e follow-up
  enquanto evita fetches de caminhos com segredos.
- O ECC-Tools PR #63 foi mesclado como `fb9e4c5ceb9ccde50da74c7a69c3fa4bd321fc07`
  e tornou o plano de execução hospedado visível ao operador na análise de PR
  enfileirada: a fila agora publica um check-run não-bloqueante
  `ECC Tools / Hosted Depth Plan` no PR head SHA com comandos de executor hospedado
  ready/blocked e texto de próxima ação.
- O ECC-Tools PR #64 foi mesclado como `72020ef94db94840812977ea7ac37e9344036668`
  e adicionou controles de despacho de jobs hospedados voltados ao PR:
  comentários `/ecc-tools analyze --job ...` agora enfileiram jobs hospedados,
  executam pelos gates existentes de prontidão/evidência hospedada e postam
  artefatos/descobertas/próximas ações de volta ao PR.
- O ECC-Tools PR #65 foi mesclado como `bacd4adf6a3a629e8d403865456d15f127baaf4e`
  e adicionou histórico de resultados de jobs hospedados: jobs enfileirados armazenam
  em cache o resultado mais recente e registros imutáveis de execução, depois publicam
  um check-run não-bloqueante por job no PR head SHA com artefatos, descobertas,
  bloqueadores de prontidão e próximas ações.
- O ECC-Tools PR #66 foi mesclado como `4e1db48252d068ea5dcf4308b0bc11b0dfe0c9ce`
  e adicionou um comando de status hospedado somente leitura:
  `/ecc-tools analyze --job status` lê o cache de resultado mais recente #65 para
  o PR head atual e posta uma tabela compacta de concluído/bloqueado/não-executado.
- O ECC-Tools PR #67 foi mesclado como `f20e6bec2b0bf49e4cc36e08b7285c795973b73d`
  e tornou o check-run do hosted depth-plan consciente do status: a análise de PR
  enfileirada lê o cache de resultado mais recente ao publicar
  `ECC Tools / Hosted Depth Plan` e recomenda o próximo job pronto não-executado.
- O ECC-Tools PR #68 foi mesclado como `2cde524b5ef8f34ab7bb1af973248fe4be4359f8`
  e adicionou prontidão de promoção hospedada determinística: PRs abertos/sincronizados
  agora publicam um check-run não-bloqueante `ECC Tools / Hosted Promotion Readiness`
  que compara arquivos alterados com o corpus evaluator/RAG com check-in.
- O ECC-Tools PR #69 foi mesclado como `d0112dac7cef807ae27def41f057682ef0772cce`
  e estendeu a prontidão de promoção hospedada com pontuação de saída determinística:
  a verificação agora pontua artefatos e descobertas de jobs hospedados em cache em
  relação às expectativas do corpus evaluator/RAG.
- O ECC-Tools PR #70 foi mesclado como `7001d805ac981fe220b4575159f469fbea9dbb76`
  e adicionou planejamento de recuperação para promoção hospedada: a verificação emite
  candidatos de recuperação classificados de artefatos hospedados em cache, descobertas
  hospedadas, caminhos de evidências esperados e caminhos de fonte alterados, mais um
  seed de prompt de modelo.
- O ECC-Tools PR #71 foi mesclado como `d41e59ff00fe1bd0b0c96386e56bc5269d7b9c15`
  e adicionou o primeiro contrato de juiz de promoção hospedada com modelo: a verificação
  emite um contrato de solicitação `hosted-promotion-judge.v1` neutro para provedor e
  falha fechado a menos que evidência de recuperação hospedada, habilitação, orçamento
  restante e configuração de provedor estejam presentes.
- O ECC-Tools PR #72 foi mesclado como `973bc51e5436dd279ae5a890cce9811485eef0b5`
  e executa o juiz de modelo de promoção hospedada atrás de gates explícitos:
  `PR_HOSTED_PROMOTION_MODEL_JUDGE_MODE=execute` chama o provedor configurado apenas
  após todos os gates passarem; a verificação permanece não-bloqueante, apenas JSON
  estrito e rejeita saída não citada.
- O commit `05d4e8296e37ba72e471beaa23ea4c81eb2aa31f` do ECC-Tools adiciona rastros de
  auditoria legíveis pelo operador ao julgamento de modelo de promoção hospedada:
  os check-runs renderizam um fingerprint de solicitação determinística e contagem de
  citações permitidas sem expor saída bruta do provedor.
- O ECC-Tools PR #73 foi mesclado como `7d0538c9354e18adbfc72ef00d858949a817fa48`
  e adicionou um gate de anúncio de pagamentos nativos fail-closed a
  `/api/billing/readiness`: claims de pagamento públicas agora exigem
  `announcementGate.ready === true` de uma conta de teste gerenciada pelo Marketplace.
- O commit `91a441b92342b842832ac28b018ee46f0c4a906f` do ECC-Tools adiciona
  `npm run billing:announcement-gate -- --preflight` para que os operadores possam
  verificar a conta de teste do Marketplace, presença do token interno de API e
  endpoint de billing-readiness antes da chamada privilegiada de readback.
- O commit `eb6941290b2fa70db01a51084e9e79a160238468` do ECC-Tools registrou o primeiro
  estado de readback de produção ao vivo: os nomes de secrets do Cloudflare Worker
  incluem `INTERNAL_API_SECRET`, mas nenhuma conta gerenciada pelo Marketplace conseguiu
  passar o gate de anúncio ainda.
- O commit `95d0bec69dbcf364ed084e983a40d0a94d443d16` do ECC-Tools adiciona readback
  agregado repetível de KV de produção com `npm run billing:kv-readback`: a última
  execução autenticada encontrou 253 registros `account-billing:*` e 253 registros
  `billing-state:*`, mas 0 registros Pro gerenciados pelo Marketplace.
- O commit `285967807ea7b5eb3146bc984fb2229db67d4290` do ECC-Tools exige proveniência de
  webhook do GitHub Marketplace nos registros de billing-state Pro antes que a prontidão
  de anúncio de pagamentos nativos possa passar. A execução CI `26013559229` foi
  bem-sucedida.
- O commit `42653f9140c232961280d961ed76a6142433cfa1` do ECC-Tools adiciona
  `npm run billing:kv-readback -- --wrangler` para readback via sessão OAuth autenticada
  do Wrangler. A execução CI `26016223013` foi bem-sucedida; o último readback ao vivo
  encontrou 253 registros `account-billing:*`, 253 registros `billing-state:*`, 194
  estados marketplace/free, 59 estados Stripe/pro, 0 estados Marketplace Pro e 0 falhas
  de parse.
- O commit `632e059e51b6e1297ba118807c8b5b2adbac74ce` do ECC-Tools adiciona readback de
  billing de conta-alvo com `npm run billing:kv-readback -- --account <github-login> --require-ready`.
  O relatório redige o login da conta e as chaves KV brutas, emite apenas um fingerprint
  estável mais booleanos de prontidão sanitizados. A execução CI `26018941515`
  foi bem-sucedida. O recheck ao vivo de 2026-05-18 separou o Linear ITO-61 para o
  bloqueador de conta-alvo.
- O commit `d5f60db` do ECC-Tools adiciona contagens de proveniência de fonte Marketplace
  sanitizadas ao `npm run billing:kv-readback`. O readback OAuth do Wrangler ao vivo de
  2026-05-18 encontrou 256 registros account-billing, 256 registros billing-state, 197
  registros de fonte Marketplace, 59 de fonte Stripe, 53 Pro, 0 Marketplace Pro, 4 com
  proveniência de webhook e 193 sem proveniência de webhook.
- O commit `13cd3fc` do ECC-Tools normaliza o case das chaves de billing-state para que
  escritas de webhook do Marketplace e readbacks de anúncio concordem no case do login
  do GitHub; o CI `26037611421` passou.
- O commit `69ca535` do ECC-Tools expõe controles de feedback de aprendizado de equipe
  hospedado: compatibilidade de harness e roteamento de backlog de equipe agora mostram
  dias de retenção, rota/SLA de exclusão e rota de opt-out. O Linear ITO-52 está
  Concluído com CI `26054455434`.
- O commit `e56fc1a` do ECC-Tools atualiza o lockfile para `brace-expansion@5.0.6` e
  corrigiu o alerta Dependabot 44 para CVE-2026-45149; a API do GitHub reportou
  `state: fixed` em `2026-05-18T19:10:15Z` e o CI `26054671308` passou.
- O ECC-Tools PR #89 foi mesclado como `512bca6b99cdaa67058a6aa9a4e7e7f0b1d9873a`
  e adiciona `npm run billing:kv-readback -- --select-ready-target --require-ready` para
  que os operadores possam provar uma conta Marketplace Pro pronta sem passar ou imprimir
  o login. O readback de produção de 2026-05-20 encontrou registros ready-like com
  proveniência de webhook e 0 falhas de parse. O antigo bloqueador "sem billing-state
  de target Pro gerenciado pelo Marketplace" está eliminado.
- O ECC-Tools PR #90 foi mesclado como `16a5bb33ee5ce7c31d2ad8d041e5afac03308f05`
  após Verify, Security Audit e Workers Builds passarem. Adiciona o gate de anúncio
  oficial de target selecionado através de
  `npm run billing:announcement-gate -- --select-ready-target` sem exigir login bruto
  do GitHub.
- O ECC-Tools PR #91 foi mesclado como `72119a1acc6f5a0cd3bb5d90afd6e87fd1fefd05`
  após Verify, Security Audit e Workers Builds passarem. Adiciona o caminho de operador
  env-file do gate de billing com suporte a `--env-file` mais testes sentinela provando
  que secrets e logins não são impressos.
- O ECC-Tools PR #92 foi mesclado como `18d80197be779619283e0b37e2952bac53819a07`
  após Verify, Security Audit e Workers Builds passarem. Adiciona o bearer de recuperação
  opcional `INTERNAL_OPERATOR_API_SECRET`; o Worker mesclado foi deployado em
  `api.ecc.tools` antes da execução do gate ao vivo.
- O ECC-Tools PR #93 foi mesclado como `d3d62df83fa075660fa4530c3e0edc311a4355fe`
  após Verify, Security Audit e Workers Builds passarem. Registra a evidência de billing
  ao vivo de 2026-05-20: target Marketplace Pro pronto selecionado, fingerprint
  `e953a74209fe`, 0 bloqueadores KV, preflight pronto, `announcementGateReady: true`,
  0 ações necessárias, 0 bloqueadores e resumo 6 aprovado / 1 aviso / 0 reprovado.
- O handoff `ecc-supply-chain-audit-20260513-0645.md` em `~/.cluster-swarm/handoffs/`
  registra a varredura de supply-chain de 13 de maio: sem hit ativo de lockfile/manifesto
  para indicadores TanStack/Mini Shai-Hulud; verificações de npm audit/assinatura limpas
  em todos os lockfiles npm ativos; `cargo audit` limpo para `ecc2`; `pip-audit` do
  trunk limpo; auditoria Python do grafo fixado do backend JARVIS limpa sob o alvo
  Python 3.12 suportado.
- A validação do PR #1861 atualizou `node scripts/harness-audit.js --format json` em
  70/70 e `npm run observability:ready` em 21/21.
- O PR #1862 atualizou este roadmap após a auditoria Python do backend JARVIS ser
  reexecutada contra o grafo fixado do Python 3.12 suportado.
- `docs/architecture/harness-adapter-compliance.md` mapeia suporte a Claude Code, Codex,
  OpenCode, Cursor, Gemini, Zed-adjacent, dmux, Orca, Superset, Ghast e terminal-only
  para caminhos de instalação, comandos de verificação e notas de risco.
- `npm run harness:adapters -- --check` valida que a matriz pública de adapters ainda
  corresponde aos dados fonte em `scripts/lib/harness-adapter-compliance.js`.
- `docs/releases/2.0.0-rc.1/publication-readiness.md` faz gate de lançamento do GitHub,
  npm dist-tag, Plugin Claude, Plugin Codex, pacote OpenCode, billing e publicação de
  anúncio em campos de evidências frescas.
- `docs/releases/2.0.0-rc.1/naming-and-publication-matrix.md` registra a decisão de
  nomenclatura rc.1: lançar como Everything Claude Code (ECC), manter `ecc-universal`
  para npm, manter `ecc` para slugs de Plugin Claude/Codex e adiar qualquer rename mais
  amplo até após o pipeline de lançamento ser provado.
- `docs/releases/2.0.0-rc.1/publication-evidence-2026-05-12.md` registra a passagem de
  evidências de publicação em dry-run: dry-runs de npm pack/publish, smoke de instalação
  temporária, preflight de validação/tag do Plugin Claude, forma CLI do marketplace Codex,
  build OpenCode e os bloqueadores restantes com gate de aprovação.
- `docs/releases/2.0.0-rc.1/publication-evidence-2026-05-13.md` registra a atualização
  de evidências de prontidão de lançamento: 70/70 harness audit, adapter compliance PASS,
  16/16 observabilidade pronta, 2376/2376 testes root Node, markdownlint, testes de
  superfície de lançamento e de publicação npm e 462/462 testes Rust do `ecc2`.
- `docs/releases/2.0.0-rc.1/publication-evidence-2026-05-13-post-hardening.md` registra
  a atualização pós-hardening após PR #1850 e PR #1851: 70/70 harness audit, adapter
  compliance PASS, 18/18 observabilidade pronta, 2380/2380 testes root Node, markdownlint,
  testes de superfície, 462/462 testes Rust, verificações de npm audit/assinatura, auditoria
  de advisory Rust e verificações IOC TanStack/Mini Shai-Hulud.
- Uma worktree limpa destacada em `bfacf37715b39655cbc2c48f12f2a35c67cb0253` verificou
  dry-run de tag do Plugin Claude sem `--force`, descoberta local do marketplace,
  instalação local com home temporária, listagem de Plugin habilitado e desinstalação
  limpa para `ecc@ecc` `2.0.0-rc.1`.
- `docs/architecture/evaluator-rag-prototype.md` e `examples/evaluator-rag-prototype/`
  definem o primeiro protótipo de harness auto-aprimorado somente leitura: specs de
  cenário, traces, relatórios, playbooks candidatos, resultados de verificador, salvamento
  aceito de mantenedor, candidatos de billing-readiness, CI-failure-diagnosis e
  harness-config-quality, mais o cenário de exceção de política do AgentShield e
  candidatos inseguros rejeitados.
- A superfície do pacote npm agora exclui artefatos de bytecode/cache Python através de
  regras de negação de `files` do pacote e um teste de regressão de superfície de
  publicação.
- `docs/legacy-artifact-inventory.md` registra que não existem diretórios
  `_legacy-documents-*` no checkout atual, inventaria os dois repositórios
  `_legacy-documents-*` de nível de workspace irmãos como fontes de extração sanitizadas
  e classifica `legacy-command-shims/` como uma superfície de arquivo opt-in/sem-ação.
- `docs/stale-pr-salvage-ledger.md` registra resultados de salvamento de PR desatualizado,
  PRs ignorados, trabalho substituído e a cauda restante de tradução/revisão manual #1687,
  #1609, #1563, #1564 e #1565 agora vinculada ao Linear ITO-55.
- O AgentShield PR #53 reduziu dois falsos positivos de context-rule e fechou as issues
  restantes do AgentShield.
- O AgentShield PR #55 adicionou aplicação de política organizacional do GitHub Action com
  entradas `policy` / `fail-on-policy`, saídas `policy-status` / `policy-violations`,
  evidências de job-summary e anotações de violação de política.
- O AgentShield PR #56 adicionou saída SARIF/code-scanning para violações de política
  organizacional como resultados `agentshield-policy/*`.
- O AgentShield PR #57 adicionou presets de policy-pack OSS, team, enterprise, regulated,
  high-risk-hooks/MCP e CI-enforcement mais `agentshield policy init --pack`.
- O AgentShield PR #58 adicionou campos de proveniência de pacote MCP e contagens de
  nível de relatório para npm vs git, fixado vs não-fixado, conhecido-bom e evidências de
  supply-chain com suporte de registry.
- O AgentShield PR #59 adicionou resumos executivos HTML autocontidos com postura de risco,
  descobertas críticas/de alta prioridade, exposição de categoria, documentação README/API,
  validação de smoke CLI construído e cobertura de 1.704 testes.
- O AgentShield PR #60 adicionou saída de benchmark de corpus embutido de nível de
  categoria, um sinal `readyForRegressionGate`, cobertura de categoria `--corpus` no
  terminal, documentação README/API, validação de smoke CLI construído e cobertura de
  1.705 testes.
- O AgentShield PR #61 eliminou o PR de segurança/bugfix restante do Dependabot com um
  bump de lockfile apenas `postcss` 8.5.6 -> 8.5.14 após typecheck local, testes
  completos, lint, build e verificação remota de self-scan/action.
- O AgentShield PR #62 adicionou evidências de auditoria de ciclo de vida de exceção de
  política organizacional: contagens de exceções ativas, expirando em breve e expiradas;
  relatórios de proprietário, ticket, escopo, expiração e dias-até-expiração; evidências
  de saída de terminal e job-summary do GitHub Action; documentação README; bundles de
  action reconstruídos e validação de 1.708 testes.
- O AgentShield PR #63 expôs drift de baseline no GitHub Action com entradas `baseline` /
  `save-baseline`, saídas de drift de baseline, evidências de job-summary, anotações de
  regressão, documentação README/API, bundles de action reconstruídos e verificação
  remota verde de action/self-scan/Node.
- O AgentShield PR #64 adicionou o comando CLI de primeira classe
  `agentshield baseline write` com filtragem de severidade, saída de metadados JSON,
  documentação README/API, bundle CLI reconstruído, cobertura TDD local e verificação
  remota verde de action/self-scan/Node.
- O AgentShield PR #65 fixou as actions de workflow para hardening de CI de
  lançamento/segurança.
- O AgentShield PR #66 desabilitou o uso de cache no job de publicação de lançamento
  para que a publicação não dependa do estado de build restaurado mutável.
- O AgentShield PR #67 adicionou o primeiro bundle de evidence-pack empresarial portátil:
  `agentshield scan --evidence-pack <dir>` escreve manifest determinístico, README, JSON,
  HTML, SARIF, policy-evaluation, baseline-comparison e artefatos de supply-chain com
  redação padrão e marcadores `not-run` para evidências opcionais de política/baseline.
- O AgentShield PR #68 endureceu a redação de evidence-pack para famílias de credenciais
  empresariais incluindo GitHub fine-grained PATs, GitLab PATs, tokens npm, chaves de API
  Linear, chaves Stripe, chaves de API Google, tokens Hugging Face, tokens Vercel, IDs de
  chave de acesso AWS e credenciais em formato JWT.
- O AgentShield PR #69 adicionou o registry determinístico de adapters de harness.
  Relatórios de scan agora expõem evidências de marcador local para Claude Code, OpenCode,
  Codex, Gemini, dmux, agentes de terminal genéricos e templates locais de projeto em
  saídas JSON, markdown, terminal e HTML.
- Decisão de exportação PDF do AgentShield: adiar um escritor PDF nativo por enquanto. O
  relatório executivo HTML autocontido permanece como o artefato exportável do comprador e
  pode ser impresso em PDF quando necessário; a geração nativa de PDF deve aguardar demanda
  explícita de enterprise/compliance.
- `docs/architecture/agentshield-enterprise-research-roadmap.md` identifica o próximo
  sinal empresarial do AgentShield: mover de scanner/relatório/gate de política para um
  plano de controle de equipe com drift de baseline, evidence packs, adapters multi-harness,
  gates de precisão de corpus, roteamento de remediação, inteligência de ameaças e
  integração ECC-Tools/GitHub App.
- O ECC PR #1778 recuperou os conceitos úteis de Agent de arquitetura de rede/homelab
  desatualizados #1413.
- O ECC-Tools PR #26 adicionou follow-ups preditivos de risco de custo/token para
  roteamento de IA, chamadas de Claude/modelo, limites de uso, cota e mudanças de
  orçamento de análise que carecem de evidências de validação de orçamento, cota,
  limite de taxa ou custo.
- O ECC-Tools PR #27 adicionou o check-run não-bloqueante `ECC Tools / PR Risk Taxonomy`
  para buckets de Security Evidence, Harness Drift, Install Manifest Integrity,
  CI/CD Recommendation, Cost/Token Risk e Agent Config Review.
- O ECC-Tools PR #28 adicionou verificações de auditoria de prontidão de billing para
  limites de plano, habilitações, forma do plano do Marketplace, fonte de assinatura,
  seats e medição de overage.
- O ECC-Tools PR #29 adicionou sinais determinísticos de Reference Set Validation para
  mudanças de analisador, Skill, Agent, comando e orientação de harness que carecem de
  evidências de eval, golden trace, benchmark ou reference-set.
- O ECC-Tools PR #30 limitou a geração de follow-up a três novas issues do GitHub e um
  PR de rascunho por execução, depois emite os achados determinísticos restantes como
  um backlog de sync de projeto para rastreamento Linear/status.
- O ECC-Tools PR #31 adicionou sinais de follow-up de revisão a comentários de conclusão
  de análise para solicitações de alteração pendentes, threads de revisão não resolvidas
  ou desatualizadas e atividade de revisão sem aprovação explícita.
- O ECC-Tools PR #32 adicionou follow-ups preditivos de modo de falha de CI para mudanças
  de workflow e test-runner que carecem de fixtures de falha, logs capturados, notas de
  solução de problemas, evidências de dry-run ou cobertura de regressão.
- O ECC-Tools PR #33 adicionou follow-ups preditivos de qualidade de harness-config para
  mudanças de MCP, Plugin, Agent, Hook, comando e harness config que carecem de auditoria
  de harness, matriz de adapter, documentação cross-harness ou evidências de regressão de
  compatibilidade.
- O ECC-Tools PR #34 adicionou follow-ups preditivos de qualidade de Skill e um bucket de
  risco de PR Skill Quality para mudanças de orientação de Skill, Agent, comando e regra
  que carecem de exemplos, validação, eval ou evidências de referência.
- O ECC-Tools PR #35 adicionou follow-ups preditivos de RAG/evaluator e um bucket de risco
  de PR RAG/Evaluator Evidence para mudanças de recuperação, embedding, ranking e evaluator
  que carecem de comparação de reference-set, golden trace, benchmark, fixture ou evidências
  de eval-run.
- O ECC-Tools PR #36 adicionou follow-ups preditivos de deep-analyzer, um bucket de risco
  de PR Deep Analyzer Evidence e uma tabela de backlog de sync de projeto pronta para o
  Linear para trabalho de follow-up adiado.
- O ECC-Tools PR #37 adicionou uma fixture de corpus de analisador mantida, testes de
  validação de corpus e reconhecimento de evidências de reference-set de analisador
  co-localizado para futuros follow-ups preditivos e verificações de taxonomia de risco
  de PR.
- O ECC-Tools PR #38 adicionou follow-ups preditivos de revisão de PR/salvamento de
  desatualizado, um bucket de taxonomia PR Review/Salvage Evidence e fixtures de corpus
  mantidas para evidências de salvamento de fechamento desatualizado, reviewer-thread e
  fluxo de reabertura.
- O ECC-Tools PR #39 adicionou sync opt-in do Linear GraphQL nativo para itens de backlog
  de follow-up adiados, preservando os limites de objetos do GitHub enquanto cria ou
  reutiliza issues do Linear quando `LINEAR_API_KEY` e `LINEAR_TEAM_ID` estão configurados.
- O ECC-Tools PR #40 adicionou um contrato de corpus evaluator/RAG com check-in cobrindo
  salvamento de PR desatualizado, prontidão de billing, diagnóstico de falha de CI,
  qualidade de harness config, exceções de política do AgentShield, evidências de qualidade
  de Skill, evidências de deep-analyzer e evidências de comparação RAG/evaluator, com cada
  cenário exercitando diffs de evidência ausente e com evidências.
- O ECC-Tools PR #41 endureceu as dependências de supply-chain.
- O ECC-Tools PR #42 adicionou previsão de lacuna de evidence-pack do AgentShield e roteou
  evidências ausentes de política/baseline/allowlist/supressão/supply-chain na taxonomia de
  risco de PR, rascunhos de follow-up e tabela de backlog pronta para o Linear.
- O ECC-Tools PR #43 reconheceu o contrato de artefato de evidence-pack concreto do
  AgentShield #67 para que os arquivos de bundle canônicos agora satisfaçam a taxonomia e
  os PRs de follow-up gerados apontem os mantenedores para
  `agentshield scan --evidence-pack <dir>`.
- O ECC-Tools PR #55 adicionou o primeiro sinal de prontidão de análise hospedada/mais
  profunda: os comentários de análise agora classificam um repositório como
  commit-history-only, evidence-backed ou deep-ready antes de rotear trabalho para lanes
  de CI, AgentShield, harness, reference-set, RAG/evaluator, AI-routing, controle de
  custos e rastreamento Linear/projeto.
- O ECC-Tools PR #56 transformou esse sinal em um contrato de plano de execução hospedado:
  `/api/analysis/depth-plan` retorna jobs ready/blocked e texto de próxima ação sem cobrar
  uso de análise ou criar PRs de bundle.
- Os ECC-Tools PRs #57-#62 implementaram os seis executores hospedados específicos de job
  para diagnósticos de CI, revisão de evidências de segurança, auditoria de compatibilidade
  de harness, avaliação de reference-set, revisão de roteamento de IA/custo e roteamento
  de backlog de equipe.
- O ECC-Tools PR #63 publica o check-run do hosted depth-plan após a análise de PR
  enfileirada ser concluída, tornando os seis comandos de executor hospedado visíveis no
  PR head SHA.
- O ECC-Tools PR #64 conecta esses comandos à fila: os mantenedores podem comentar
  `/ecc-tools analyze --job ci-diagnostics`, `security-evidence`, `harness-compatibility`,
  `reference-set-evaluation`, `ai-routing-cost` ou `team-backlog` em um PR.
- O ECC-Tools PR #65 persiste resultados de jobs hospedados concluídos e bloqueados no
  cache de análise por 30 dias e publica check-runs não-bloqueantes `ECC Tools / Hosted Job: ...`.
- O ECC-Tools PR #66 expõe os resultados em cache de comentários de PR com
  `/ecc-tools analyze --job status`.
- O ECC-Tools PR #67 alimenta os resultados em cache de volta no check-run do hosted
  depth-plan para que a análise enfileirada recomende o próximo job ready não-executado.
- O ECC-Tools PR #68 adiciona o primeiro gate de promoção hospedada com respaldo de
  evaluator: PRs abertos/sincronizados recebem um check-run de Hosted Promotion Readiness
  não-bloqueante.
- O ECC-Tools PR #69 estende esse gate para pontuar saídas de jobs hospedados concluídos
  em cache para o PR head atual.
- O ECC-Tools PR #76 consome a saída de frota do PR #89 do AgentShield na revisão de
  segurança hospedada: `agentshield-evidence/fleet-summary.json` agora é classificado como
  `evidence-pack-fleet`.
- O ECC-Tools PR #77 foi mesclado como `31fd883b3f0cee135aee4839b01d34855b7867f6` e
  adiciona uma coluna `Evidence` a comentários de PR de jobs hospedados e detalhes de
  check-run, expondo até três caminhos de evidência fonte para cada descoberta.
- O ECC-Tools PR #78 foi mesclado como `0d4eb949aa56f56da88e6654273a22ffb95983a1` e
  vincula rotas de frota do AgentShield à revisão de compatibilidade de harness hospedada.
- O ECC-Tools PR #79 foi mesclado como `67ee247ae1b7b50ecc1261ed5d62d65cc8390da8` e
  redige a saída da conta do gate de anúncio de billing: o preflight e o readback ao vivo
  agora imprimem fingerprints estáveis de conta e booleanos de prontidão sanitizados.
- O ECC-Tools PR #80 foi mesclado como `4efc8cc858022f84c844690f3298633b081c4398` e exige
  motivos de falha de recibo de runtime antes que recibos de runtime de harness possam
  contar como evidências de observabilidade hospedada.
- O ECC-Tools PR #81 foi mesclado como `1fbf635f492284f75ba7166c029c39eb8cc15794` e
  preserva os IDs de aprovação de frota do AgentShield através da revisão de segurança
  hospedada.
- O ECC-Tools PR #82 foi mesclado como `7a7b4d096a176ae80b3a2076c09d45601e36013a` e
  renderiza IDs de aprovação de frota do AgentShield em comentários hospedados e
  check-runs.
- O ECC-Tools PR #83 foi mesclado como `b6b107f33961bef18a85fb619f3a976eb5d752dd` e faz
  o sync de follow-up do Linear reutilizar IDs externos determinísticos antes do fallback
  de título, prevenindo issues duplicadas de backlog adiado.
- O ECC-Tools PR #84 foi mesclado como `73bac7058071c55cb30c6b8ac6db779b3660c02c` e
  sincroniza itens de remediação do AgentShield hospedado com o Linear quando o
  token/equipe do workspace estão configurados.
- O ECC-Tools PR #85 foi mesclado como `1637e0f2bfa0a889387f2c20675680ccc5528123` e emite
  eventos de observabilidade de jobs hospedados para estados enfileirado, concluído,
  bloqueado, com falha e bloqueado por orçamento no `ANALYSIS_CACHE`.
- O ECC-Tools PR #86 foi mesclado como `5a9e94d3ff860307c3e7fd9fd065f0de2bd633dd` e lê
  eventos recentes de observabilidade hospedada em `/ecc-tools analyze --job status`.
- O ECC-Tools PR #87 foi mesclado como `508fbc02b63cf1fcb5af2f3624608fa66e53b5d4` e
  adiciona o mesmo readback de observabilidade hospedada aos check-runs do hosted depth-plan.
- O ECC-Tools PR #88 foi mesclado como `c836ac3fb24ed7e2ae38cd61e41c9651ac9c00f8` e expõe
  o readback autenticado da API de observabilidade hospedada em `/api/analysis/observability`.
- O AgentShield PR #90 foi mesclado como `6d1c57c92000541d65a3b6bc366f0322d7d0dacc` e
  adiciona `reviewItems` de frota duráveis: `agentshield evidence-pack fleet --json` agora
  retorna itens de revisão prontos para o proprietário com rota, severidade, contexto de
  repositório/target, caminhos de evidências fonte, motivo e recomendação.
- O AgentShield PR #91 foi mesclado como `73e1e3586dc4513a462e39c9799f75eea104e110` e
  adiciona exportação durável de policy pack: `agentshield policy export` escreve uma
  política JSON por pack selecionado mais um `manifest.json` com respaldo de checksum.
- O AgentShield PR #92 foi mesclado como `e7e259dc6212b63a8e03a253ca6b8c1e3c2abff7` e
  adiciona o gate de promoção protegida: `agentshield policy promote` verifica o manifesto
  de exportação e o digest SHA-256 da política selecionada, rejeita JSON adulterado e
  suporta revisão JSON em dry-run antes de escrever o `.agentshield/policy.json` ativo.
- O AgentShield PR #94 foi mesclado como `4caee27acfadb50a4cd024e738b5c3cbd4b0bb03` e
  adiciona cobertura de adapter nativa de editor para Zed e VS Code. `.zed/settings.json`,
  `.zed/tasks.json` e arquivos de hook-code `.zed` agora são entradas de scan, e
  `.zed/setup.mjs` é coberto pela regra IOC de persistência de ferramenta de IA.
- O AgentShield PR #95 foi mesclado como `25d91f0002214c408da4ceaac7def20bad40ca10` e
  elimina o alerta Dependabot do `brace-expansion`. O lockfile agora resolve as cópias
  transitivas vulneráveis 5.x para `5.0.6`.
- O commit principal do AgentShield `87aec47fb55d04ea28d494852d4f664c268c5601` estende a
  promoção de política com `reviewItems` duráveis para evidências de digest de manifesto,
  aprovação de proprietário de política, handoff de PR de rollout protegido e smoke
  testing de runtime. A execução do GitHub Actions `25985170621` completou com sucesso.
- O commit principal do AgentShield `28d08c7f9961eaa54804b26e6352d23b64ae2776` adiciona
  detecção de drift de hardening de package-manager para `.npmrc`, `.pnpmrc`, `.yarnrc`,
  `.yarnrc.yml`, `pnpm-workspace.yaml` e `pnpm-workspace.yml`, incluindo detecção de
  credencial de registry em texto simples, habilitação explícita de lifecycle-script e
  achados de cooldown de release-age ausente ou fraco. A execução `25986170958` completou
  com sucesso.
- O commit principal do AgentShield `659f569190f85f6f0808353e096d66c0a6d7817e` atualiza
  todos os pins de action de workflow para `actions/checkout@v6.0.2` e
  `actions/setup-node@v6.4.0`; a execução `25986221319` completou com sucesso.
- O commit principal do AgentShield `ee585cd` corrige a orientação de hardening de
  package-manager após a verificação local mostrar que o npm `10.9.4` rejeita
  `min-release-age`: as configurações npm agora são escaneadas para drift de lifecycle/token
  e chaves de release-age não suportadas, enquanto os achados de cooldown aplicáveis
  permanecem no pnpm `minimumReleaseAge` / `minimum-release-age` e no Yarn `npmMinimalAgeGate`.
- O commit principal do AgentShield `1124535345d7040242ecd3803f65bcd4dcaf6ec2` expõe o
  hardening de package-manager através do GitHub Action para que consumidores de CI/hospedado
  possam rotear drift de credencial de registry, lifecycle-script e gate de release-age
  separadamente de contagens genéricas de achados.
- O ECC PR #1803 entregou o Branch de tratamento Quarkus do contribuidor após limpeza do
  mantenedor, alinhamento com o `main` atual, validação local completa e preservação da
  remoção pelo autor das traduções Quarkus incompletas ja-JP e zh-CN.
- O ECC PR #1812 salvou orientação útil de revisor Django, resolver de build Django e
  Django Celery do PR desatualizado #1310 através de um Branch de propriedade do mantenedor
  com crédito de fonte, sync de catálogo e validação local/remota completa.
- O ECC PR #1813 expandiu o ledger de salvamento de PR desatualizado com mapeamentos de
  fonte-para-salvamento para #1325, #1414, #1478, #1504 e #1603.
- O ECC PR #1815 salvou o trabalho útil de rastreamento de custos desatualizado #1304 e
  skill-scout #1232 nas convenções atuais de comando/Skill com sync de catálogo atual e
  validação local/remota completa.
- O ECC PR #1816 salvou a orientação de design frontend desatualizada #1659 útil no layout
  de Skill canônico do ECC enquanto preservava a guardrail de que a Skill oficial
  `frontend-design` da Anthropic permanece com fonte externa.
- O ECC PR #1817 salvou as guardrails úteis de falso positivo do code-reviewer desatualizadas
  #1658, adicionando gates de prova para achados HIGH/CRITICAL, exclusões comuns de falsos
  positivos e um teste de regressão.
- O ECC PR #1818 registrou a passagem de gap de salvamento-desatualizado de 12 de maio,
  classificando trabalho já presente, trabalho ignorado e restos de tradução/revisão manual.

## Regras de Operação

- Manter os PRs e issues públicos abaixo de 20, com zero como o alvo preferido para a
  lane de lançamento.
- Manter 80/80 de harness audit e 21/21 de prontidão de observabilidade após cada lote
  de prontidão para GA.
- Não publicar lançamentos ou anúncios sociais até que as superfícies de lançamento do
  GitHub, estado de npm/pacote, estado de billing e envio de Plugin sejam verificadas
  com evidências frescas.
- Não tratar PRs desatualizados fechados como descartados. Emparelhe cada lote de limpeza
  com uma passagem de salvamento: inspecione os diffs fechados, porte trabalho compatível
  útil em Branches de propriedade do mantenedor e credite o PR de origem.
- Use documentos/comentários de projeto do Linear para atualizações de nível de projeto
  porque as atualizações de status de projeto estão desabilitadas neste workspace; crie ou
  atualize issues quando uma lane precisar de um proprietário de execução durável.

## Checklist de Execução Prompt-to-Artifact

Esta tabela mantém o prompt longo do operador vinculado a artefatos concretos. Um status
não está completo a menos que a coluna de evidência exista e tenha sido verificada
recentemente.

| Requisito do Prompt | Artefato ou gate exigido | Evidência atual | Status |
| --- | --- | --- | --- |
| Manter PRs públicos abaixo de 20 | Recheck de PR da família de repositórios | 0 PRs abertos em `ECC`, AgentShield, JARVIS, `ECC-Tools/ECC-Tools` e `ECC-Tools/ECC-website` na auditoria de plataforma do final de 2026-05-19 após mesclar ECC PR #2013, ECC-Tools PR #79, JARVIS PR #15 e JARVIS PR #16 | Concluído |
| Manter issues públicas abaixo de 20 | Recheck de issues da família de repositórios | 0 issues abertas em `ECC`, AgentShield, JARVIS, `ECC-Tools/ECC-Tools` e `ECC-Tools/ECC-website` em 2026-05-19 após a atualização da auditoria de plataforma ao vivo | Concluído |
| Gerenciar discussões do repositório | Recheck de discussões da família de repositórios mais playbook de resposta | A auditoria de plataforma reporta 0 gaps de toque de mantenedor em discussões e 0 Q&A respondíveis sem respostas aceitas; `docs/architecture/discussion-response-playbook.md` distingue caminhos de suporte, coordenação de mantenedor, desatualizado/concluído, lançamento, informativo e segurança-sensível | Concluído |
| Gerenciar discussões de PR | Fechamento de revisão/comentário de PR mais estado de merge/fechamento | ECC #1990-#2013 mesclados através do lote de harness audit, identidade canônica, suíte de vídeo de lançamento, outreach de crescimento, atualização de evidências, QA visual, contagem de suíte, pacote de aprovação do proprietário, gate do dashboard de aprovação do proprietário, evidências de prontidão do Linear, gate de evidências de supply-chain, adapter Claude Code por projeto, higiene de project-registry de aprendizado contínuo, introspecção git citada do GateGuard e lote de gate de aprovação de lançamento determinístico; ECC-Tools #79 e JARVIS #15/#16 também mesclados; sem PRs rastreados abertos restantes | Concluído |
| Salvar trabalho desatualizado útil | `docs/stale-pr-salvage-ledger.md` mais `docs/legacy-artifact-inventory.md` | O ledger registra salvados, substituídos, ignorados e caudas de revisão manual; #1815-#1818 adicionaram rastreamento de custos, skill scout, orientação de design frontend, guardrails de falso positivo do code-reviewer e a passagem de gap de 12 de maio; as caudas de localização #1687, #1609, #1563, #1564 e #1565 estão vinculadas ao Linear ITO-55 para revisão de proprietário de linguagem e nenhuma importação automática permanece bloqueadora de lançamento | Concluído; repetir scan legado antes do lançamento |
| Preview pack do ECC 2.0 pronto | Docs de lançamento, quickstart, prontidão de publicação, notas de lançamento | `docs/releases/2.0.0-rc.1/` e docs de prontidão estão na árvore; as evidências de 19/20 de maio registram estado de fila-zero, identidade ECC canônica, suíte de vídeo de lançamento, pacote de outreach de crescimento, pacote de aprovação do proprietário, suíte local de 2568 testes e várias execuções de CI do GitHub Actions; smoke digest do preview-pack `eebb8a66c33e` | Precisa de aprovação de lançamento final |
| Habilidades especializadas do Hermes incluídas com segurança | Docs de setup/importação do Hermes e superfície de Skill sanitizada | Setup e playbook de importação do Hermes são públicos; segredos ficam locais | Precisa de revisão de lançamento final |
| Prontidão de nomenclatura e rename | Matriz de nomenclatura em superfícies de pacote/Plugin/docs/social | `docs/releases/2.0.0-rc.1/naming-and-publication-matrix.md` registra evidências de disponibilidade de pacote, repositório, Plugin Claude, Plugin Codex, OpenCode e npm atuais | Concluído para rc.1; rename pós-rc permanece trabalho futuro |
| Publicação de Plugin Claude e Codex | Caminho de contato/envio com artefatos necessários e status | Prontidão de publicação, matriz de nomenclatura e evidências de dry-run de 12 de maio documentam validação de Plugin, smoke de instalação/tag do Claude com checkout limpo e forma CLI do marketplace Codex | Precisa de aprovação explícita para tag/push real e envio ao marketplace |
| Artigos, tweets e anúncios | Thread X, texto LinkedIn, texto de lançamento GitHub, checklist de publicação, pacote de outreach de parceiros/patrocinadores/palestras | Rascunho de material de lançamento e texto de outreach com gate de aprovação existem nos docs de lançamento rc.1 | Precisa de atualização com URLs e aprovação humana antes de postar ou enviar |
| Iteração empresarial do AgentShield | Gates de política, SARIF, packs, proveniência, corpus, relatórios HTML, auditoria de ciclo de vida de exceção, superfícies de Action/CLI de drift de baseline, redação de evidence-pack, registry de adapter de harness, cobertura de adapter nativa de editor Zed/VS Code, fechamento de alerta Dependabot, roadmap de pesquisa empresarial, caminho de lançamento com hardening de supply-chain, fingerprints de baseline CI-safe, recomendações de precisão de corpus, fases de workflow de remediação, cobertura de corpus de hijack de proxy env, IOCs de pacote de campanha completa Mini Shai-Hulud, evidence packs com proveniência CI, triagem de confiança de runtime plugin-cache, readback de consumidor de evidence-pack, roteamento de fleet de evidence-pack, itens de revisão de fleet, payloads de ticket de revisão de fleet, exportação de política com checksum, promoção de política verificada por checksum, itens de revisão de promoção de política, saídas de Action de hardening de package-manager, saídas de Action de promoção de política, consumo hospedado de saídas de Action de promoção, valores de saída de promoção visíveis ao operador e rastros de auditoria de juiz de promoção hospedada | PRs #53, #55-#64, #67-#69, #78-#92, #94 e #95 entregues com evidências de teste; vários commits do AgentShield e do ECC-Tools adicionaram saídas de Action de hardening de package-manager, saídas de Action de promoção de política, consumo hospedado das saídas de promoção, valores visíveis ao operador e rastros de auditoria de juiz de promoção hospedada; exportação nativa de PDF adiada em favor de HTML autocontido mais impressão para PDF até demanda empresarial explícita aparecer | A próxima automação de workflow deve aprofundar a aprovação/readback do operador ao vivo após os gates de Marketplace/pagamento |
| App next-level do ECC Tools | Auditoria de billing, verificações de PR, deep analyzer, backlog de sync, corpus evaluator/RAG, rastro de auditoria de juiz de promoção hospedada, readback de pagamentos nativos, seleção de target Marketplace Pro pronto, gate de anúncio de target selecionado, caminho de operador env-file do gate de billing, observabilidade hospedada, roteamento hospedado de fleet-summary do AgentShield, caminhos de evidência de achados hospedados, vinculação de política de rota de harness, telemetria hospedada de saídas de Action de promoção de política e valores de saída de promoção visíveis ao operador | PRs #26-#43 mais #53-#93 entregues com evidências de teste em análise hospedada, prontidão de promoção hospedada, execução de juiz de modelo, gate de anúncio de pagamentos nativos, consumo de evidências do AgentShield, sync Linear/remediação hospedado, readback de observabilidade hospedada, seleção de target Marketplace Pro pronto, gate de anúncio oficial de target selecionado e carregamento de credencial env-file de operador | Obter ou rotacionar o caminho de bearer token `INTERNAL_API_SECRET` local/interno, via env exportada ou `--env-file` ignorado, depois executar o gate de anúncio de billing de target selecionado ao vivo |
| Verificações estilo GitGuardian/Dependabot/CodeRabbit | Taxonomia não-bloqueante, verificações de follow-up determinísticas e gates de supply-chain locais | Check de taxonomia de risco do ECC-Tools mais sinais de follow-up entregues, incluindo Skill Quality, Deep Analyzer Evidence, Analyzer Corpus Evidence, RAG/Evaluator Evidence, PR Review/Salvage Evidence e evidências de evidence-pack do AgentShield; #1846 adicionou gates de assinatura npm registry; #1848 adicionou o playbook de resposta a incidentes de supply-chain e a guarda de validador de envenenamento de cache `pull_request_target`; #1851 adicionou a guarda de persistência de credencial de checkout privilegiado; AgentShield #78, JARVIS #13 e ECC-Tools #53 aplicaram o mesmo hardening fora do trunk | Gate de supply-chain atual completo; features de revisão hospedada mais profunda permanecem futuras |
| Sistema de aprendizado agnóstico de harness | Auditoria, matriz de adapter, observabilidade, traces, loop de promoção | Gates de auditoria/adapters/observabilidade mais `docs/architecture/evaluator-rag-prototype.md`, `examples/evaluator-rag-prototype/` e ECC-Tools PR #40 definem cenários somente leitura de stale-salvage, billing-readiness, CI-failure-diagnosis, harness-config-quality, exceção de política do AgentShield, evidência de qualidade de Skill, evidência de deep-analyzer e comparação RAG/evaluator; ECC-Tools PRs #68-#72 agora transformam esse corpus em um check-run de gate de PR determinístico com pontuação de saída hospedada em cache, candidatos de recuperação classificados, um seed de prompt de modelo, um contrato de juiz de modelo hospedado fail-closed e execução de modelo ao vivo opt-in atrás de gates estritos de evidências hospedadas | Check de PR hospedado determinístico, pontuação de saída em cache, planejamento de recuperação, contrato de juiz e execução de modelo com gate integrados |
| Roadmap do Linear é detalhado | Documento de projeto/comentários do Linear mais espelho do repositório | O espelho do repositório existe e a criação de issues funciona novamente; o sync de 19 de maio adiciona o documento de sync pós-PR #2002 `ecc-may-19-post-pr-2002-sync-64cef8f668e0`, o comentário de projeto `a6411e3a-8c8e-4a58-adba-687e77d4c543`, comentários de issues ITO-44/47/48/49/51/54/56 e estado Em Progresso para ITO-47, ITO-48, ITO-49, ITO-51, ITO-54 e ITO-56; o lote de passagem tardia adiciona o documento `ecc-may-19-late-queue-zero-and-release-gate-sync-1c26f65e6b3f`, o comentário de projeto `d42bf0e2-7a8e-4934-9f3f-e281498ee805` e comentários ITO-44/50/54/56/61 para PR #2013, ECC-Tools #79 e JARVIS #15/#16 porque as atualizações de status de projeto estão desabilitadas no workspace | Precisa de atualizações recorrentes de documento/comentário após cada lote significativo de merge |
| Separação de fluxos e rastreamento de progresso | Lanes de fluxo com artefatos de proprietário e cadência de atualização | Este roadmap define as lanes abaixo e `docs/architecture/progress-sync-contract.md` faz o sync GitHub/Linear/handoff/roadmap parte do gate de prontidão | Ativo |
| Sync Linear em tempo real | Documentos de projeto/comentários mais comentários de issues para atualizações de lane | O ECC-Tools #39 implementa o sync opt-in de API do Linear para itens de backlog de follow-up adiados, e o ECC-Tools #54 adiciona rascunhos de PR prontos para cópia a esse backlog quando shells de PR de rascunho não são abertos; `docs/architecture/progress-sync-contract.md` define o limite local com respaldo de arquivo em tempo real; os comentários de conector ao vivo de 18 e 19 de maio foram postados no projeto da plataforma ECC e issues de lane após as atualizações de status de projeto retornarem desabilitadas | Precisa de configuração de workspace/rollout de produto para sync de issues hospedado |
| Observabilidade para uso próprio | Gate de prontidão local, traces, snapshots de status, contrato HUD/status, ledger de risco, contrato de progress-sync | `npm run observability:ready` reporta 21/21 | Concluído para gate local |
| Lançamento e notificações adequados | Tag de lançamento, estado de publicação npm, estado de Plugin, posts sociais | O gate de prontidão de publicação existe com evidências de dry-run de 12 de maio e de prontidão de 13 de maio | Não concluído; aprovação/URLs ao vivo necessários |

## Lanes de Execução e Contrato de Rastreamento

Até que a capacidade de issues do Linear seja liberada, este documento é o ledger
durável de execução e o Linear recebe apenas atualizações de status do projeto. O
contrato de sync vive em `docs/architecture/progress-sync-contract.md`. Quando a
capacidade estiver disponível, cada lane abaixo deve se tornar um pequeno conjunto
de issues do Linear vinculadas de volta às evidências do repositório e commits de merge.

| Lane | Fonte de verdade | Próximo artefato rastreado | Cadência de atualização |
| --- | --- | --- | --- |
| Higiene de fila e salvamento | Estado de PR/issue do GitHub, ledger de salvamento | Acrescentar entradas ao ledger para fechamentos futuros desatualizados | Cada lote de limpeza |
| Lançamento e publicação | Docs de rc.1, doc de prontidão de publicação | Matriz de nomenclatura e checklist de envio/contato de plugin | Antes de qualquer tag |
| Harness OS core | Auditoria, matriz de adapter, docs de observabilidade, `ecc2/` | Spec de aceitação de HUD/session-control | Semanal até GA |
| Avaliação e RAG | Validação de conjunto de referência, auditoria de harness, traces, corpus do ECC-Tools | Protótipo somente leitura de evaluator/RAG mais fixtures de salvamento-desatualizado, billing-readiness, diagnóstico de falha de CI, qualidade de harness-config, exceção de política do AgentShield, evidência de qualidade de Skill, evidência de deep-analyzer e comparação RAG/evaluator; ECC-Tools #68 publica o corpus como um check-run de prontidão de promoção hospedada, #69 pontua saídas de jobs hospedados em cache em relação ao mesmo corpus, #70 emite candidatos de recuperação classificados mais um seed de prompt de modelo, #71 adiciona um contrato de solicitação de juiz de modelo hospedado fail-closed, e #72 executa esse juiz apenas quando explicitamente habilitado e respaldado por citações de recuperação hospedada; ECC-Tools `16c537f` expõe valores de saída de Action de promoção de política em comentários/checks de segurança hospedados; ECC-Tools `05d4e82` adiciona traces de auditoria de juiz de modelo hospedado com fingerprints de solicitação e contagens de citações permitidas | Verificação de estado de billing do Marketplace Pro com proveniência de webhook |
| AgentShield enterprise | Evidência de PR do AgentShield e notas de roadmap | Roteamento de fleet concluído em #89 após inspect/readback de evidence-pack em #88; #90 emite `reviewItems` de fleet; #91 exporta pacotes de política respaldados por checksum; #92 promove políticas verificadas por checksum desses pacotes para arquivos de política ativos; #94 adiciona detecção de adapter Zed e VS Code, descoberta de scan de projeto Zed e cobertura de IOC de persistência `.zed/setup.mjs`; #95 fecha o alerta Dependabot `brace-expansion` com 0 alertas abertos após merge; AgentShield `87aec47` adiciona `reviewItems` de promoção de política; `28d08c7` adiciona detecção de drift de hardening de package-manager; `659f569` atualiza pins de runtime de actions de workflow; `ee585cd` corrige orientações de release-age npm e mantém findings executáveis de cooldown em pnpm/Yarn; `1124535` expõe saídas de Action de hardening de package-manager para roteamento CI/hospedado; `1593925` expõe saídas de Action de promoção de política e evidências de job-summary de smoke de runtime; `840952a` adiciona payloads de ticket de revisão de fleet e breadcrumbs atuais de IOC do Mini Shai-Hulud; ECC-Tools #76 consome resumos de fleet, #77 expõe caminhos de evidência fonte em findings hospedados, #78 vincula rotas de fleet a proprietários de harness, ECC-Tools `8658951` consome saídas de Action de promoção de política e ECC-Tools `16c537f` renderiza valores de saída visíveis ao operador | Aprofundar aprovação/readback de operador ao vivo após gates de Marketplace/pagamento |
| App ECC Tools | Evidência de PR do ECC-Tools, auditoria de billing, taxonomia de risco, corpus evaluator/RAG | ECC-Tools #53 publicou o branch de hardening de workflow de supply-chain, #54 rastreia rascunhos de PR prontos para cópia no backlog Linear/projeto, #55 classifica prontidão de profundidade de análise, #56 expõe o plano de execução hospedado, #57 executa o primeiro job hospedado de diagnóstico de CI, #58 executa o job hospedado de revisão de evidência de segurança, #59 executa a auditoria hospedada de compatibilidade de harness, #60 executa a avaliação hospedada de conjunto de referência, #61 executa a revisão hospedada de roteamento de AI/custo, #62 executa roteamento de backlog de equipe hospedado, #63 publica o check-run de depth-plan hospedado, #64 despacha jobs hospedados via comentários de PR, #65 persiste histórico de resultados/check-runs de jobs hospedados, #66 expõe status de jobs hospedados via comentários de PR, #67 torna recomendações de depth-plan conscientes de cache, #68 publica prontidão de promoção hospedada a partir do corpus evaluator/RAG, #69 pontua saídas de jobs hospedados em cache em relação ao corpus, #70 emite candidatos de recuperação classificados mais seed de prompt de modelo, #71 emite o contrato `hosted-promotion-judge.v1` com gate sem chamadas ao vivo, #72 adiciona execução opt-in de juiz de modelo ao vivo atrás de gates de evidência hospedada e JSON/citação estritos, #73 adiciona um `announcementGate` fail-closed de pagamentos nativos ao billing-readiness, #74 adiciona `npm run billing:announcement-gate` para verificação do operador, #75 reforça o gate de anúncio de billing para readback ao vivo do Marketplace, #76 roteia evidências de fleet-summary do AgentShield para findings de segurança hospedados, #77 adiciona caminhos de evidência fonte ao output de findings hospedados, #78 vincula caminhos alvo de fleet do AgentShield a findings de proprietário de harness hospedados, `8658951` roteia saídas de Action de promoção de política do AgentShield para revisão de segurança hospedada e pontuação de prontidão de promoção, `16c537f` renderiza valores de status/pack/contagem/digest de promoção de política em comentários/checks de segurança hospedados, `05d4e82` renderiza fingerprints de solicitação de juiz de promoção hospedado mais traces de auditoria de citações permitidas, `91a441b` adiciona saída de preflight de anúncio de billing para inputs de readback obrigatórios, `eb69412` registra o estado inicial de readback de produção, `95d0bec` adiciona evidência agregada de `billing:kv-readback`, `2859678` exige proveniência de webhook do Marketplace nos registros de billing-readiness, `42653f9` adiciona readback OAuth do Wrangler com contagens de produção ao vivo agregadas, `632e059` adiciona readback sanitizado de billing de conta alvo para a conta de teste exata do Marketplace, ECC-Tools #89 adiciona readback de KV de target pronto selecionado, ECC-Tools #90 adiciona gate de anúncio oficial de target selecionado sem input de login bruto, e ECC-Tools #91 adiciona suporte a `--env-file` para credenciais de billing locais ignoradas sem imprimir secrets ou logins | Obter ou rotacionar o caminho do bearer token `INTERNAL_API_SECRET` local/interno, via env exportada ou `--env-file` ignorado, depois executar o gate de anúncio de billing de target selecionado ao vivo |
| Progresso no Linear | Atualizações de status do projeto Linear, `docs/architecture/progress-sync-contract.md`, saída gerada de `operator:dashboard` e este espelho | Atualização de status com fila/evidências/gates faltantes | Cada lote significativo de merge |

A atualização de status do projeto deve sempre incluir:

1. Contagens atuais de PR e issues públicos.
2. Evidências mescladas desde a atualização anterior.
3. Itens adiados ou bloqueados com o motivo.
4. Os próximos um ou dois slices de implementação.
5. Qualquer gate de lançamento ou publicação que ainda não tenha respaldo de evidências.

## Pressão de Referência

O roadmap de GA é informado por estas superfícies de referência:

- `stablyai/orca` e `superset-sh/superset` para UX de agente paralelo nativo de worktree,
  loops de revisão e presets de workspace.
- `standardagents/dmux` e `aidenybai/ghast` para multiplexação de terminal/worktree,
  agrupamento de sessões e hooks de ciclo de vida.
- `jarrodwatts/claude-hud` para status, tool, agent, todo e telemetria de contexto
  sempre visíveis.
- `stanford-iris-lab/meta-harness` e `greyhaven-ai/autocontext` para melhoria de
  harness orientada por avaliação, traces, playbooks e loops de promoção.
- `NousResearch/hermes-agent` para shell de operador, gateway, memória, skills e
  padrões de comando multiplataforma.
- `anthropics/claude-code`, `sst/opencode` / `anomalyco/opencode` ativos, Zed, Codex,
  Cursor, Gemini e fluxos de trabalho somente-terminal para expectativas de adapter.

O resultado deste trabalho de referência deve ser deltas concretos do ECC, não um
segundo memorando de estratégia.

## Marcos

### 1. Prontidão de Lançamento GA, Nomenclatura e Publicação de Plugin

Meta: 2026-05-24

Critérios de aceitação:

- A matriz de nomenclatura cobre nome de produto, pacote npm, plugin Claude, plugin Codex,
  pacote OpenCode, metadados de marketplace, docs e cópia de migração.
- Os gates de lançamento GitHub, dist-tag npm, publicação de plugin e anúncio estão
  mapeados para evidências de comando atualizadas.
- Notas de lançamento, guia de migração, issues conhecidas, quickstart, thread no X, post
  no LinkedIn e cópia de lançamento no GitHub estão prontos, mas não publicados antes de
  as URLs de lançamento existirem.
- Caminhos de publicação/contato de plugin para Claude e Codex estão documentados com
  proprietário, artefatos necessários e status de envio.

### 2. Matriz de Conformidade de Adapter de Harness e Onramp de Scorecard

Meta: 2026-05-31

Critérios de aceitação:

- A matriz de adapters cobre Claude Code, Codex, OpenCode, Cursor, Gemini, superfícies
  adjacentes ao Zed, dmux, Orca, Superset, Ghast e uso somente-terminal.
- Cada adapter tem assets suportados, superfícies não suportadas, caminho de instalação,
  comando de verificação e notas de risco.
- A auditoria de harness permanece 80/80 e ganha um onramp público que explica como as
  equipes usam o scorecard.
- Findings de referência são convertidos em deltas concretos de adapter, observabilidade
  ou superfície de operador.

### 3. Observabilidade Local, HUD/Status e Plano de Controle de Sessão

Meta: 2026-06-07

Critérios de aceitação:

- A prontidão de observabilidade permanece 21/21 e é respaldada por traces JSONL,
  snapshots de status, ledger de risco e contratos de handoff exportáveis.
- O modelo de HUD/status cobre contexto, chamadas de tool, agents ativos, todos, checks,
  custo, risco e estado da fila.
- Os controles de worktree/sessão cobrem criar, retomar, status, parar, diff, PR, fila de
  merge e fila de conflitos.
- O modelo de sync Linear/GitHub/handoff é explícito o suficiente para rastreamento de
  progresso em tempo real.

### 4. Loop de Avaliação de Harness Auto-Aperfeiçoável

Meta: 2026-06-10

Critérios de aceitação:

- Specs de cenário, contratos de verificador, traces, playbooks e gates de regressão
  estão documentados e pelo menos um protótipo somente leitura existe.
- O loop separa observação, proposta, verificação e promoção.
- Configurações de equipe e individuais podem ser pontuadas e melhoradas sem mutar
  configs cegamente.
- O design RAG/conjunto de referência cobre padrões ECC vettados, histórico de equipe,
  falhas de CI, diffs, resultados de revisão e qualidade de harness config.

### 5. Plataforma de Segurança Enterprise do AgentShield

Meta: 2026-06-14

Critérios de aceitação:

- Schema formal de política e saída de avaliação existem para baselines de org,
  exceções, proprietários, expiração, severidade, trilhas de auditoria, visibilidade de
  expiração próxima e aplicação de exceção expirada.
- Saída SARIF/code-scanning está implementada e testada.
- Gates de política de GitHub Action expõem status de política de organização e contagens
  de violação para evidências de branch-protection e CI.
- Packs de política estão definidos para OSS, equipe, enterprise, regulado, hooks/MCP
  de alto risco e aplicação de CI.
- Inteligência de supply-chain cobre proveniência de pacote MCP e tem um caminho de
  extensão para reputação npm/pip, CVEs, typosquats e risco de dependência.
- Corpus de prompt-injection e benchmark de regressão estão prontos para hardening
  contínuo de regras com cobertura por categoria e saída de gate de regressão.
- Relatórios enterprise incluem JSON mais saída HTML executiva autocontida com postura de
  risco, findings prioritários, exposição por categoria e evidência de ciclo de vida de
  exceção de política em resumos de terminal/CI.
- Exportação nativa de PDF não é bloqueadora de GA, a menos que um fluxo de trabalho
  enterprise/compliance exija um arquivo PDF gerado em vez do relatório HTML autocontido
  e do caminho de impressão para PDF do browser.

### 6. Billing, Análise Profunda, Checks de PR e Sync Linear do ECC Tools

Meta: 2026-06-21

Critérios de aceitação:

- O anúncio de billing nativo do GitHub Marketplace está respaldado por implementação
  verificada e docs.
- A auditoria interna de prontidão de billing cobre limites de plano, assentos,
  mapeamento de entitlements, formato do plano do Marketplace, estado de assinatura,
  hooks de excesso e modos de falha.
- O deep analyzer cobre padrões de diff, fluxos de CI/CD, superfície de dependências/
  segurança, comportamento de revisão de PR, histórico de falhas, harness config,
  qualidade de skill, evidências de corpus de analyzer dedicado, conjuntos de referência
  co-localizados do analyzer, evidência de revisão de PR/salvamento desatualizado,
  comparação RAG/evaluator e validação de conjunto de referência.
- A taxonomia de check suite de PR inclui Evidência de Segurança, Drift de Harness,
  Integridade do Manifesto de Instalação, Recomendação de CI/CD, Risco de Custo/Token,
  Validação de Conjunto de Referência, Evidência de Deep Analyzer, Evidência RAG/
  Evaluator, Evidência de Revisão de PR/Salvamento, Qualidade de Skill e Revisão de
  Config de Agent.
- A fixture de prontidão de billing Evaluator/RAG
  `examples/evaluator-rag-prototype/billing-marketplace-readiness/` registra o caminho
  de verificação somente leitura para linguagem de Marketplace, App, assinatura, assento,
  entitlement e plano antes que a cópia de lançamento possa tratar essas claims como
  ativas.
- Follow-ups preditivos de risco de custo/token sinalizam mudanças de roteamento de AI,
  chamada de modelo, uso, cota e orçamento quando evidências de orçamento estiverem
  ausentes.
- Follow-ups de validação de conjunto de referência sinalizam mudanças em analyzer,
  skill, agent, comando e orientação de harness que carecem de evidências de eval, trace
  dourado, benchmark ou conjunto de referência mantido.
- Follow-ups de deep-analyzer sinalizam mudanças de repositório, commit, arquitetura,
  padrão e pipeline de análise que carecem de corpus de analyzer, snapshot, fixture ou
  evidências de benchmark.
- Evidências de corpus de analyzer incluem fixtures e testes mantidos para saídas atuais
  de analyzer de arquitetura e commit, mais caminhos de evidência co-localizados
  `src/analyzers/{fixtures,goldens,reference-sets,benchmarks,evals}/`.
- Follow-ups de RAG/evaluator sinalizam mudanças de recuperação, embedding, ranking e
  evaluator que carecem de comparação de conjunto de referência, trace dourado, benchmark,
  fixture ou evidências de execução de eval.
- O contrato de corpus Evaluator/RAG espelha os cenários do protótipo local em fixtures
  e testes do ECC-Tools para salvamento de PR desatualizado, prontidão de billing,
  diagnóstico de falha de CI, qualidade de harness config, exceções de política do
  AgentShield, evidência de qualidade de skill, evidência de deep-analyzer e comparação
  RAG/evaluator.
- Follow-ups de revisão de PR/salvamento desatualizado sinalizam mudanças de revisão,
  triagem, fechamento desatualizado e automação de pull-request que carecem de fixtures
  de salvamento desatualizado, casos de thread de revisor ou evidência de fluxo de
  reabertura.
- Comentários de análise de PR resumem sinais de follow-up de revisão para mudanças
  solicitadas, threads de revisão não resolvidos ou desatualizados e aprovações
  ausentes.
- Follow-ups preditivos de modo de falha de CI sinalizam mudanças de workflow e
  test-runner que carecem de fixtures de falha, logs capturados, notas de solução de
  problemas, evidências de dry-run ou cobertura de regressão.
- Follow-ups preditivos de qualidade de harness-config sinalizam mudanças de MCP,
  plugin, agent, hook, comando e config de harness que carecem de auditoria, matriz de
  adapter, doc cross-harness ou evidências de regressão de compatibilidade.
- O sync do Linear mapeia findings de backlog adiados para issues do Linear sem inundar
  o GitHub, cria ou reutiliza issues do Linear com título exato quando configurado e
  reporta sync ignorado quando credenciais ou configuração de equipe estiverem ausentes.
- O sync de backlog Linear/projeto inclui rascunhos de PR prontos para cópia quando
  `/ecc-tools followups sync-linear` é usado sem `open-pr-drafts`, para que o trabalho
  de salvamento de PR desatualizado permaneça rastreado sem abrir shells extras de PR.
- A geração de follow-ups limita a criação automática de objetos GitHub e mantém
  findings de overflow em um backlog de sync de projeto pronto para cópia.

### 7. Auditoria de Legado e Fechamento de Salvamento de Trabalho Desatualizado

Meta: 2026-06-15

Critérios de aceitação:

- Diretórios legados e handoffs órfãos estão inventariados.
- Cada artefato útil está marcado como concluído, rastreado no Linear/projeto, branch de
  salvamento ou arquivado/sem-ação.
- Repositórios legados no nível de workspace são minerados apenas através de branches
  sanitizados de mantenedor; contexto bruto, secrets, caminhos pessoais, configurações
  locais e rascunhos privados nunca são importados em massa.
- A política de salvamento de PR desatualizado permanece em vigor: fechar PRs
  desatualizados/conflitantes primeiro, registrar um item no ledger de salvamento, depois
  portar conteúdo compatível útil em branches de mantenedor com atribuição.
- Resíduos de localização do #1687 são tratados apenas por tradutor/revisão manual, não
  por cherry-pick cego.

## Próximos Slices de Engenharia

1. Continuar a sequência de plano de controle enterprise do AgentShield a partir de
   `docs/architecture/agentshield-enterprise-research-roadmap.md`: PR #63 entregou
   saídas de GitHub Action baseline e evidências de job-summary; PR #64 entregou criação
   de snapshot de baseline de primeira classe via `agentshield baseline write`; PR #67
   entregou o bundle de evidence-pack; PR #68 reforçou a redação de evidence-pack; PR
   #69 entregou o registro de adapter multi-harness; PR #78 reforçou o workflow de
   lançamento para a classe atual de incidentes de supply-chain; PR #79 moveu
   fingerprints de baseline/watch/remediação para evidências com hash e parou de gravar
   evidências brutas em novas baselines; PR #80 adicionou recomendações de precisão de
   corpus priorizadas para gates de regressão com falha; PR #81 adicionou fases de
   workflow de remediação ordenadas; PR #82 expandiu a cobertura do corpus para
   sequestros de proxy de env e exfiltração fora de banda; PRs #83-#85 reforçaram a
   cobertura de IOC do Mini Shai-Hulud e a verificação de supply-chain do caminho de
   lançamento; PR #86 adicionou workflow `ci-context.json` na lista branca, commit,
   execução e proveniência de runtime para evidence packs; PR #87 classificou caches
   instalados de plugin Claude separadamente da config ativa de runtime de nível superior,
   incluindo implementações de hook em cache; PR #88 adicionou readback JSON/texto de
   `agentshield evidence-pack inspect` para consumidores downstream; PR #89 adicionou
   resumo/roteamento de `agentshield evidence-pack fleet` em múltiplos bundles
   inspecionados; ECC-Tools PRs #42/#43 agora roteiam e reconhecem evidence packs;
   ECC-Tools PR #76 consome resumos de fleet na revisão de segurança hospedada; ECC-Tools
   PR #77 expõe caminhos de evidência fonte em comentários e check-runs de PR hospedados;
   ECC-Tools PR #78 vincula caminhos alvo de fleet do AgentShield a findings de
   proprietário de harness hospedados; e AgentShield PR #90 emite `reviewItems` de fleet
   com caminhos de evidência fonte e recomendações prontas para proprietário; AgentShield
   PR #91 exporta bundles de política respaldados por checksum para revisão de
   branch-protection e promoção downstream de política; AgentShield PR #92 promove
   bundles de política verificados por checksum em arquivos de política ativos com revisão
   JSON em dry-run; commit do AgentShield `87aec47` adiciona `reviewItems` de promoção
   de política para evidências de digest, revisão de proprietário, handoff de PR de
   rollout protegido e smoke testing de runtime; commit do AgentShield `28d08c7` adiciona
   detecção de drift de hardening de package-manager; commit do AgentShield `659f569`
   limpa os avisos de depreciação de action-runtime com actions v6 com SHA atual
   fixadas; commit do AgentShield `ee585cd` corrige orientações de release-age npm para
   que chaves de age npm não suportadas sejam findings enquanto findings executáveis de
   cooldown permanecem em pnpm/Yarn; commit do AgentShield `1124535` expõe saídas de
   Action de hardening de package-manager para credenciais de registry, drift de
   lifecycle-script e drift de gate de release-age; e commit do AgentShield `1593925`
   expõe saídas de Action de promoção de política para aprovação de proprietário, rollout
   protegido, evidências de digest e itens de revisão de smoke de runtime, commit
   `8658951` do ECC-Tools consome essas saídas na revisão de segurança hospedada e
   pontuação de Prontidão de Promoção Hospedada, e commit `16c537f` do ECC-Tools
   renderiza status de promoção, pack, contagem de itens de revisão, contagem de ações
   restantes e digest em comentários/check-runs de segurança hospedados. Commit do
   AgentShield `840952a` adiciona payloads de ticket de revisão de fleet prontos para
   Linear/operador e expande breadcrumbs atuais de IOC do Mini Shai-Hulud, com CI local
   e remoto verde. Commit do AgentShield `4e36aab` reforça instalações de pacote de CI
   após a atualização expandida do Mini Shai-Hulud, com workflows de CI, Test GitHub
   Action, Self-Scan e Dependabot Update verdes. Commit `05d4e82` do ECC-Tools adiciona
   traces de auditoria de juiz de promoção hospedada com fingerprints de solicitação
   determinísticos e contagens de citações permitidas, sem expor saída bruta do
   provedor. Commit `91a441b` do ECC-Tools adiciona um comando de preflight de anúncio
   de billing para verificar inputs de readback do Marketplace antes de chamadas de API
   privilegiadas. Commit `2859678` do ECC-Tools exige proveniência de webhook do
   Marketplace no billing-state antes que a prontidão de anúncio de pagamentos nativos
   possa passar. Commit `42653f9` do ECC-Tools adiciona readback OAuth KV do Wrangler e
   confirma que o bloqueador atual não é o acesso de leitura do Cloudflare; é a ausência
   de um registro de billing-state do Marketplace Pro ready-like com proveniência de
   webhook. Commit `632e059` do ECC-Tools adiciona readback sanitizado de conta alvo, e
   PRs #89/#90/#91 movem o caminho final do operador para readback de target selecionado,
   gate de anúncio de target selecionado e carregamento de credencial de env-file ignorado
   sem imprimir logins de conta ou nomes de chave KV brutos. ECC-Tools PR #79 redige a
   saída de conta do gate de anúncio de billing; PR #80 exige razões de falha em recibos
   de runtime; PRs #81/#82 preservam e renderizam IDs de aprovação de fleet do
   AgentShield; PR #83 torna o sync de follow-up do Linear idempotente por ID externo;
   PR #84 sincroniza itens de remediação do AgentShield hospedados no Linear; PR #85
   emite eventos de observabilidade de jobs hospedados incluindo resultados bloqueados
   por orçamento; PRs #86/#87 leem esses eventos de volta em comentários de status
   hospedados e check-runs de depth-plan hospedados; e PR #88 expõe readback autenticado
   de API de observabilidade hospedada para dashboards de operador.
2. Executar `npm run billing:announcement-gate -- --preflight --select-ready-target`,
   adicionando `--env-file /path/to/ecc-tools.env` quando o bearer token local estiver
   armazenado em um arquivo de operador ignorado, depois executar o mesmo comando sem
   `--preflight` e exigir `announcementGate.ready === true` antes de qualquer anúncio
   nativo de pagamentos GitHub.
3. Habilitar/configurar o caminho de sync de backlog do Linear mesclado após a capacidade
   de issues do workspace ser liberada ou o workspace do Linear ser atualizado, depois
   verificar se os itens de salvamento de rascunho de PR chegam ao projeto esperado.
4. Usar o corpus evaluator/RAG do ECC-Tools como gate de promoção antes de adicionar
   recuperação hospedada mais profunda, armazenamento vetorial ou promoção automática de
   check-run.
