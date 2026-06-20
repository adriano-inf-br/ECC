# Manifesto do Preview Pack ECC v2.0.0-rc.1

Este manifesto define o preview pack revisado para `2.0.0-rc.1`. Não é
uma ação de release por si só. Use-o para verificar que a superfície de lançamento público permanece
montada após o prerelease do GitHub e a publicação npm `next`, e antes de
fazer tag de superfícies de plugin, fazer upload de vídeo ou postar anúncios.

## Conteúdo do Pack

| Artefato | Papel | Gate |
| --- | --- | --- |
| `README.md` | Onramp público e superfície de instalação | Links de configuração do Hermes, notas rc.1, instalação de plugin, instalação manual, reset e orientação de desinstalação |
| `docs/HERMES-SETUP.md` | Topologia pública do operador Hermes | Sem exportação bruta de workspace, credenciais, nomes de conta privados ou estado de operador somente local |
| `skills/hermes-imports/SKILL.md` | Fluxo de trabalho de importação sanitizado do Hermes para ECC | Inclui regras de importação, checklist de sanitização, padrão de conversão e contrato de saída |
| `docs/architecture/cross-harness.md` | Modelo de substrato compartilhado para Claude Code, Codex, OpenCode, Cursor, Gemini, Hermes e uso exclusivamente em terminal | Nomeia limites de portabilidade e não reivindica paridade nativa não suportada |
| `docs/architecture/harness-adapter-compliance.md` | Matrix de adapter e scorecard | Verificado por `npm run harness:adapters -- --check` |
| `docs/architecture/platform-value-loop.md` | Tese de integração de produto e plataforma full-stack | Mantém pacotes de skill de produto externo, APIs gateadas, estudos de caso, patrocínio, Pro e loops de consultoria separados de declarações não suportadas de GA/plano de controle |
| `docs/architecture/observability-readiness.md` | Gate de prontidão do operador local | Verificado por `npm run observability:ready` |
| `docs/architecture/progress-sync-contract.md` | Limite de sincronização do GitHub, Linear, handoff, roadmap e work-item | Verificado por `node scripts/platform-audit.js --json` |
| `scripts/preview-pack-smoke.js` | Gate de smoke determinístico do preview-pack | Verificado por `npm run preview-pack:smoke` |
| `scripts/release-approval-gate.js` | Gate final de decisão do proprietário, URL ao vivo e cópia de lançamento | Deve retornar ready true antes de qualquer ação adicional de release/pacote, tag de plugin, upload de vídeo, anúncio ou lote de saída |
| `docs/releases/2.0.0-rc.1/release-notes.md` | Fonte de cópia do release do GitHub | Deve permanecer alinhado com URLs ao vivo do GitHub/npm e gates restantes de plugin/vídeo/faturamento antes da publicação |
| `docs/releases/2.0.0-rc.1/quickstart.md` | Caminho de clone para primeiro fluxo de trabalho | Cobre clone, instalação, verificação, primeira skill e troca de harness |
| `docs/releases/2.0.0-rc.1/launch-checklist.md` | Checklist de lançamento do operador | Deve permanecer gateado por aprovação para ações de plugin, vídeo, faturamento e anúncio |
| `docs/releases/2.0.0-rc.1/publication-readiness.md` | Gate de release | Requer evidência nova do commit exato de release |
| `docs/releases/2.0.0-rc.1/publication-evidence-2026-05-15.md` | Evidência atual da fila de 15 de maio, roadmap, segurança, vigilância de cadeia de suprimentos, hardening de CI sem ciclo de vida, proveniência do evidence-pack do AgentShield #86, gate de faturamento das ECC Tools, purga de cache do Actions e evidência de testes `ecc2` através do PR #1941 | Deve ser substituído por um arquivo de evidência final com checkout limpo antes da publicação real |
| `docs/releases/2.0.0-rc.1/publication-evidence-2026-05-16.md` | Limpeza de fila de 16/17 de maio atual, merge de skill recsys, triagem GateGuard, proteção de cadeia de suprimentos PR #1947, evidência de confiança de plugin-cache AgentShield #87, inspecção/readback do evidence-pack AgentShield #88, roteamento de fleet do evidence-pack AgentShield #89, itens de revisão de fleet AgentShield #90, exportação de política AgentShield #91, promoção de política AgentShield #92, consumo de fleet-summary das ECC-Tools #76, caminhos de evidência de achados hospedados das ECC-Tools #77, vinculação de política de rota de harness das ECC-Tools #78, atualização de dashboard e evidência combinada de gate de Node/Rust/superfície de release através do espelho de 16 de maio | Ainda deve ser repetido de um checkout estritamente limpo antes da publicação real |
| `docs/releases/2.0.0-rc.1/publication-evidence-2026-05-17.md` | Estado de fila-zero de 17 de maio, merge de localização japonesa, merges TypeScript e tipo Node do Dependabot, reparo de lint ja-JP pós-merge, verificação de proteção Mini Shai-Hulud/TanStack, verificações de npm audit/assinaturas, roteamento de progresso legado e do Linear, smoke determinístico do preview-pack, atualização do dashboard do operador, sincronização do Linear e evidência de CI do GitHub para `27dc2918` | Substituído pelo snapshot de evidência de 18 de maio; repetir de um checkout estritamente limpo antes da publicação real |
| `docs/releases/2.0.0-rc.1/publication-evidence-2026-05-18.md` | Estado de fila-zero de 18 de maio, lote de merge #1970/#1971/#1972, revisão/fechamento #1978, verificação de cadeia de suprimentos, espelho de evidência do AgentShield, sincronização do Linear, sucesso de CI/varredura de segurança do head atual para `4470e2e6` e fechamento de nomenclatura/publicação de plugin ITO-46 | Substituído pelo snapshot de evidência de identidade ECC, vídeo e crescimento de 19 de maio |
| `docs/releases/2.0.0-rc.1/publication-evidence-2026-05-19.md` | Evidência atual de 19/20 de maio para identidade canônica ECC, suíte de vídeos de release, pacote de alcance de parceiro/patrocinador/palestra, pacote de aprovação do proprietário, gate de aprovação de release, dashboard do operador de 20 de maio, digest `eebb8a66c33e` do smoke do preview-pack, suíte local com 2568 testes, sucesso de CI do PR #1998 de QA visual, sucesso de CI do PR #1999 de evidência de dashboard, sucesso de evidência de contagem da suíte do PR #2000, sucesso de CI do PR #2001 de pacote de aprovação do proprietário, sucesso de CI do gate de dashboard de aprovação do proprietário PR #2002, sucesso de CI de sincronização de evidência de prontidão do Linear PR #2004, sucesso de CI do gate de evidência de cadeia de suprimentos PR #2008, sucesso de CI principal pós-PR #2006, sucesso de CI de higiene do registro de projeto PR #2009, sucesso de CI principal pós-PR #2009, sucesso de CI do GateGuard pós-PR #2011, sucesso de CI do gate de aprovação de release pós-PR #2013, sincronização de evidência do AgentShield PR #2017/#2018, hardening de redação de anúncio de faturamento das ECC-Tools #79, receipt de runtime das ECC-Tools #80-#93, ID de aprovação do AgentShield, sincronização do Linear, sincronização de remediação, readback de evento/status/plano-de-profundidade/API de observabilidade hospedada, readback de alvo selecionado do Marketplace Pro, gate de anúncio de alvo selecionado, caminho do operador de faturamento com env-file, caminho do operador bearer não-quebrador, `announcementGateReady: true` ao vivo, cobertura de adapter Zed/VS Code do AgentShield #94, fechamento de alerta Dependabot do AgentShield #95, reparo de fila/deploy JARVIS #15/#16, sincronização do gate Pro do Marketplace ECC #2019/#2020 e comentários de sincronização do Linear de 19/20 de maio | Snapshot de prontidão mais forte atual; ainda deve ser repetido de um checkout estritamente limpo antes da publicação real |
| `docs/releases/2.0.0-rc.1/operator-readiness-dashboard-2026-05-17.md` | Dashboard anterior de prompt-para-artefato do operador | Substituído pelo dashboard gerado de 18 de maio |
| `docs/releases/2.0.0-rc.1/operator-readiness-dashboard-2026-05-18.md` | Dashboard anterior de prompt-para-artefato do operador | Substituído pelo dashboard gerado de 19 de maio |
| `docs/releases/2.0.0-rc.1/operator-readiness-dashboard-2026-05-19.md` | Dashboard anterior de prompt-para-artefato do operador | Substituído pelo dashboard gerado de 20 de maio |
| `docs/releases/2.0.0-rc.1/operator-readiness-dashboard-2026-05-20.md` | Dashboard atual de prompt-para-artefato do operador | Mostra gates de PR/issue/discussion/plataforma/cadeia de suprimentos atuais e adiciona o hipercrescimento atual de `$1.728/mês` para `$10.000/mês`, aprovação do proprietário de vídeo, sincronização de gate de release do Linear, gate de faturamento de alvo selecionado, caminho do operador bearer ao vivo, passagem do gate de faturamento ao vivo e lanes operacionais do pacote de saída |
| `docs/releases/2.0.0-rc.1/owner-approval-packet-2026-05-19.md` | Folha final de decisão humana para aprovações de release, pacote, plugin, vídeo, faturamento, social e saída | Deve ser revisada pelo proprietário antes de qualquer publicação ou ação de saída |
| `docs/releases/2.0.0-rc.1/release-url-ledger-2026-05-19.md` | Ledger de URL ao vivo e URL gateada por aprovação para cópia de release | Deve ser regenerado a partir do commit final de release antes de anúncios públicos |
| `docs/releases/2.0.0-rc.1/video-suite-production.md` | Manifesto de produção do vídeo de release | Gates de inventário de mídia local, renderização primária aproximada, legendas, linha do tempo, autoavaliação e regras de publicação sem caminho privado |
| `docs/releases/2.0.0-rc.1/partner-sponsor-talks-pack.md` | Cópia de parceiro, patrocinador, consultoria, conferência, podcast e discussion | Deve permanecer gateado por aprovação e evitar reivindicações de faturamento ao vivo, release, pacote ou plugin sem evidência |
| `docs/releases/2.0.0-rc.1/naming-and-publication-matrix.md` | Registro de decisão de nomenclatura, slug e caminho de publicação | Mantém `ECC`, npm `ecc-universal` e slug de plugin `ecc` para rc.1 |
| `docs/releases/2.0.0-rc.1/release-name-plugin-publication-checklist-2026-05-18.md` | Checklist de nome de release, pacote, plugin Claude, plugin Codex e ordem de publicação | Congela a identidade do rc.1 e requer evidência do commit final antes de ações de plugin, faturamento ou anúncio |
| `docs/releases/2.0.0-rc.1/x-thread.md` | Rascunho de lançamento no X | Deve usar URLs ao vivo do GitHub/npm e manter URLs restantes de plugin/vídeo/faturamento gateadas |
| `docs/releases/2.0.0-rc.1/linkedin-post.md` | Rascunho de lançamento no LinkedIn | Deve usar URLs ao vivo do GitHub/npm e manter URLs restantes de plugin/vídeo/faturamento gateadas |
| `docs/releases/2.0.0-rc.1/article-outline.md` | Esboço de lançamento longform | Deve permanecer enquadrado como release-candidate até que exista evidência de GA |
| `docs/releases/2.0.0-rc.1/telegram-handoff.md` | Cópia de handoff interna/compartilhável | Não deve incluir detalhes de workspace privado ou credenciais |
| `docs/releases/2.0.0-rc.1/demo-prompts.md` | Prompts de demo e prompts de prova de trabalho | Deve manter fluxos de trabalho privados do Hermes abstraídos em exemplos públicos |
| `docs/releases/2.0.0-rc.1/ito-prediction-market-skill-pack.md` | Nota de distribuição do pacote de skills públicas Itô | Mantém o acesso à API Itô gateado, não consultivo e separado do faturamento das ECC Tools |

## Limite do Pacote de Skills Itô

O contrato geral de integração de produto está registrado em
`docs/architecture/platform-value-loop.md`. O pack Itô é o primeiro exemplo trabalhado:
fluxos de trabalho públicos úteis, acesso à API gateado separado e padrões de operador
sanitizados alimentando de volta no ECC sem mesclar propriedade de negócios.

O preview pack inclui seis skills teaser públicas para fluxos de trabalho de mercado de
predição e adjacentes ao Itô:

- `skills/ito-market-intelligence/SKILL.md`
- `skills/ito-basket-compare/SKILL.md`
- `skills/ito-trade-planner/SKILL.md`
- `skills/ito-data-atlas-agent/SKILL.md`
- `skills/prediction-market-oracle-research/SKILL.md`
- `skills/prediction-market-risk-review/SKILL.md`

São skills de pesquisa, comparação, planejamento e revisão de riscos. Elas não
colocam negociações, não fornecem conselhos de investimento e não mesclam as ECC Tools com
Itô. Qualquer chamada de dados respaldada pelo Itô requer acesso à API gateado explícito através de
`ITO_API_KEY`.

## Limite de Skills do Hermes

O preview pack inclui uma skill pública especializada do Hermes:

- `skills/hermes-imports/SKILL.md`

Isso é intencional para o rc.1. A skill é um fluxo de trabalho de sanitização e conversão,
não um dump de automações privadas do Hermes. Skills adicionais geradas pelo Hermes
devem entrar no ECC somente após passarem pelas mesmas regras:

- sem exportações brutas de workspace;
- sem nomes de conta ao vivo, dados de cliente, dados financeiros, dados de CRM, dados de saúde ou
  grafo de contatos privado;
- requisitos do provedor descritos por capacidade, não por valor secreto;
- exemplos relativos ao repositório em vez de caminhos absolutos locais;
- testes ou docs provando que o fluxo de trabalho é útil sem estado privado.

## Direção de Adapter Inspirada em Referência

O preview pack usa sistemas externos como pressão de design, não como alvos de cópia:

| Pressão de referência | Interpretação do preview-pack ECC |
| --- | --- |
| Claude Code | Plugin nativo, skills, comandos, hooks, convenções MCP e fluxos de trabalho orientados à statusline |
| Codex | Metadados de plugin respaldados por instrução, skills compartilhadas, config de referência MCP e ressalvas explícitas de paridade de hook |
| OpenCode | Superfície de pacote/plugin respaldada por adapter com lógica de hook compartilhada na borda |
| Ferramentas adjacentes ao Zed | Portabilidade respaldada por instrução até que exista um adapter nativo verificado |
| dmux | Sinais de orquestração de sessão/runtime e exportações de handoff, não um substituto para validação de repositório |
| Orca, Superset, Ghast | Pressão apenas de referência para ciclo de vida de worktree, agrupamento de sessão, notificações e presets de workspace |
| Agent Hermes, meta-harness, sistemas estilo autocontext | Pressão de avaliação, memória e roteamento de contexto roteada através de artefatos públicos, outputs de verificador e o protótipo de avaliador/RAG |

## Comandos Finais de Verificação

Executar a partir do commit exato de release antes da publicação:

```bash
git status --short --branch
node scripts/platform-audit.js --json
npm run preview-pack:smoke
npm run release:approval-gate -- --format json
npm run release:video-suite -- --format json
npm run harness:adapters -- --check
npm run harness:audit -- --format json
npm run observability:ready
npm run security:ioc-scan
npm audit --audit-level=moderate
npm audit signatures
node tests/docs/ecc2-release-surface.test.js
node tests/run-all.js
cd ecc2 && cargo test
```

## Bloqueadores de Publicação

O preview pack está montado e as primeiras superfícies de release/pacote estão agora
ao vivo. A publicação completa ainda está bloqueada até que estas superfícies ao vivo e decisões
sejam registradas em um arquivo de evidência final:

- ledger de URLs de release final regenerado a partir do commit de release pretendido;
- `npm run release:approval-gate -- --format json` retornando ready true após
  as aprovações do proprietário e readbacks de URL ao vivo serem registrados;
- checklist de publicação de nome/plugin de release final executada novamente a partir do commit de release pretendido;
- readback ao vivo do prerelease do GitHub `v2.0.0-rc.1`;
- readback ao vivo de `ecc-universal@2.0.0-rc.1` no dist-tag `next` do npm;
- tag de plugin Claude / propagação do marketplace para `ecc@ecc`;
- evidência de distribuição de repo-marketplace do Codex mais status de disponibilidade oficial no Plugin Directory;
- URLs finais de anúncio no X, LinkedIn, release do GitHub e cópia longform;
- evidência de prontidão de faturamento/produto das ECC Tools permanece atualizada: o readback de KV de alvo selecionado de 20 de maio e o gate de anúncio ao vivo passaram através do caminho do operador bearer. Repetir o readback de faturamento e o gate imediatamente antes de qualquer cópia de anúncio de pagamentos nativos ser publicada.

## Resultado

O preview pack rc.1 está pronto para um gate de release final com checkout limpo, mas não
para publicação pública completa sem as etapas restantes de release, pacote, plugin e
anúncio gateadas por aprovação acima. GitHub e npm agora estão registrados; aprovações de plugin, vídeo,
faturamento e saída permanecem abertas.
