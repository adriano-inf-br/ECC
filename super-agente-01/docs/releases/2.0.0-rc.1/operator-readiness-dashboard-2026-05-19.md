# Dashboard de Prontidão do Operador ECC

Este dashboard é gerado por `npm run operator:dashboard`. É um snapshot do operador, não uma aprovação de release.

Gerado: 2026-05-20T01:28:52.541Z
Commit: a2bbc45504ff55f09e9e06be0e253d72f3c54f90
Status: trabalho pendente

## Status Atual

| Área | Status | Evidência |
| --- | --- | --- |
| Fila de PRs | Atual | 0 PRs abertos nos repositórios rastreados |
| Fila de issues | Atual | 0 issues abertas nos repositórios rastreados |
| Discussions | Atual | 0 precisam de toque do mantenedor; 0 sem resposta aceita |
| Worktree local | Atual | 0 arquivos sujos bloqueadores; 0 entradas sujas ignoradas |
| Geração do dashboard | Atual | auditoria da plataforma pronta: true; GitHub ignorado: false |
| Publicação | Não concluída | gates de release, npm, plugin, faturamento e anúncio rastreados abaixo |

## Linha de Base de Crescimento

| Métrica | Atual | Meta | Lacuna |
| --- | ---: | ---: | ---: |
| MRR | $1.728/mês | $10.000/mês | $8.272/mês |

Lanes de crescimento: GitHub Sponsors e patrocinadores parceiros OSS; assinaturas ECC Tools Pro; contratos de consultoria e implementação; palestras, podcasts, demos em conferências e webinars com parceiros.

## Checklist de Prompt-Para-Artefato

| Requisito objetivo | Artefato ou gate | Status | Evidência | Lacuna |
| --- | --- | --- | --- | --- |
| Manter PRs públicos abaixo de 20 | varredura ao vivo do GitHub em scripts/platform-audit.js mais ledger de limpeza de fila em todo o proprietário | atual | 0 PRs abertos em 5 repositórios rastreados; 0 PRs abertos em todo o proprietário após limpeza | repetir platform:audit e gh search em todo o proprietário antes do release |
| Manter issues públicas abaixo de 20 | varredura ao vivo do GitHub em scripts/platform-audit.js mais ledger de limpeza de fila em todo o proprietário | atual | 0 issues abertas em 5 repositórios rastreados; 0 issues abertas em todo o proprietário após limpeza | repetir platform:audit e gh search em todo o proprietário antes do release |
| Responder e gerenciar discussions do repositório | resumo de discussions em scripts/platform-audit.js | atual | 0 precisam de toque do mantenedor; 0 discussions respondíveis sem resposta aceita | repetir antes do release |
| Incorporar dashboard de conclusão ITO-44 em um comando repetível | npm run operator:dashboard | completo | script de pacote operator:dashboard existe | manter dashboard gerado anexado à evidência de publicação |
| Preview pack do ECC 2.0 pronto | docs/releases/2.0.0-rc.1/preview-pack-manifest.md | atual | manifesto do preview pack e gate de smoke determinístico estão na árvore | repetir smoke de preview-pack com checkout limpo antes da publicação |
| Incluir skills especializadas do Hermes com segurança | docs/HERMES-SETUP.md e skills/hermes-imports/SKILL.md | atual | artefatos de configuração/importação do Hermes são cobertos pelo smoke do preview-pack | repetir smoke do preview-pack antes da revisão de release |
| Preparar caminhos de mudança de nome, plugin Claude e plugin Codex | naming-and-publication-matrix mais checklist de release-name-plugin-publication mais publication-readiness | em_progresso | matrix de nomenclatura, checklist de publicação de release e gates de prontidão do plugin existem | tag/push real, envio ao marketplace e escolha final do canal permanecem gateados por aprovação |
| Preparar notas de release, artigos, tweets e notificações push | arquivos sociais e de cópia de release em docs/releases/2.0.0-rc.1 | em_progresso | notas de release, thread no X, rascunho do LinkedIn e ledger de URLs estão presentes | URLs finais ao vivo de release/npm/plugin/faturamento e aprovação de publicação ainda pendentes |
| Preparar pacote de aprovação final do proprietário | docs/releases/2.0.0-rc.1/owner-approval-packet-2026-05-19.md | atual | pacote de aprovação do proprietário cobre decisões de release, pacote, plugin, vídeo, faturamento, social e saída | revisar aprovações do proprietário a partir do commit final de release antes de qualquer publicação ou ação de saída |
| Criar centro de comando de release de hipercrescimento de segunda fase | docs/releases/2.0.0/ecc-2-hypergrowth-release-command-center.md mais evidência de 19 de maio | atual | MRR atual, MRR alvo, lacuna, declaração de release, lane de vídeo, plano de distribuição e limites de aprovação estão na árvore | atualizar após cada mudança de MRR, canal ou estado de aprovação antes do lançamento público |
| Produzir a suíte de vídeos de release do ECC 2.0 | docs/releases/2.0.0-rc.1/video-suite-production.md e npm run release:video-suite | atual | gate da suíte de vídeos está pronto com 15/15 ativos de origem, 13/13 artefatos da suíte, 12/12 candidatos à publicação, autoavaliação primária e zero segmentos de quadro preto detectados registrados na evidência de 19 de maio | aprovação final do proprietário, upload e URLs públicas de vídeo permanecem gateados por aprovação |
| Preparar cópia de patrocinador, parceiro, consultoria, podcast, palestra e Discussion | docs/releases/2.0.0-rc.1/partner-sponsor-talks-pack.md | em_progresso | saída para patrocinadores, DM de parceiro de plataforma, introdução de consultoria, pitch de palestra/podcast, anúncio de Discussion do GitHub, hooks de CTA e gate de não-envio estão rascunhados | substituir URLs finais após os gates de publicação, então obter aprovação explícita antes de posts de saída ou de conta pessoal |
| Avançar iteração empresarial do AgentShield | evidência de PR do AgentShield mais roadmap empresarial | em_progresso | `reviewItems` de promoção de política do AgentShield pousou em `87aec47`; detecção de drift de hardening do gerenciador de pacotes pousou em `28d08c7`; pins de runtime de action de fluxo de trabalho foram atualizados em `659f569`; orientação de age-gate de npm foi corrigida em `ee585cd`; outputs de Action de hardening do gerenciador de pacotes pousaram em `1124535`; outputs de Action de promoção de política e evidência de job-summary de smoke de runtime pousaram em `1593925`; payloads de ticket de revisão de fleet e rastros de IOC atuais do Mini Shai-Hulud pousaram em `840952a`; ECC-Tools consome esses outputs em `8658951`, expõe telemetria de status/pack/count/digest legível pelo operador em `16c537f` e renderiza rastreamentos de auditoria de juiz de promoção hospedada em `05d4e82`; todos estão espelhados no roadmap de GA | aprofundar aprovação/readback ao vivo do operador após gates de Marketplace/pagamento |
| Avançar pagamentos nativos das ECC Tools e aplicativo harness-agnostic nativo de IA | evidência de PR das ECC Tools, gate de faturamento, lanes de análise hospedada | em_progresso | gate de anúncio de faturamento, lanes de análise hospedada, consumo de fleet-summary do AgentShield, caminhos de evidência de achados hospedados, vinculação de política de rota de harness, telemetria de output de Action de promoção de política, detalhes de output de promoção visíveis pelo operador, rastreamentos de auditoria de juiz de promoção hospedada, preflight de anúncio de faturamento, readback de KV de faturamento de produção agregado, readback OAuth do Wrangler, readback de faturamento da conta alvo, gates de estado de faturamento do Marketplace com reconhecimento de proveniência, contagens de proveniência de plano/ação do Marketplace sanitizadas, seleção pronta de alvo Pro do Marketplace, controles de feedback de aprendizado em equipe hospedada e remediação de alertas Dependabot das ECC-Tools estão espelhados no roadmap de GA | obter ou rotacionar o caminho do bearer-token local/interno INTERNAL_API_SECRET, então executar o gate de anúncio de faturamento ao vivo para o alvo Pro do Marketplace selecionado antes de publicar cópia de pagamentos nativos |
| Auditar, podar ou anexar trabalho legado | docs/stale-pr-salvage-ledger.md e inventário legado | atual | ledger de recuperação legado e inventário estão atuais; todas as caudas de localização estão vinculadas ao Linear ITO-55 para revisão manual do proprietário do idioma | repetir varredura legada antes do release |
| Manter roadmap do Linear detalhado e rastreamento de progresso sincronizado | espelho de projeto Linear mais contrato de sincronização de progresso | atual | sincronização ao vivo do Linear está atual com o documento de sincronização pós-PR #2002 de 19 de maio, comentário de projeto e atualizações de lane de issue ativas; contrato de sincronização de progresso define o caminho de work-items/status respaldado em arquivo | repetir atualização de status do Linear/projeto e sincronização de work-items locais após cada lote significativo de merges |
| Fornecer observabilidade do ECC 2.0 para uso próprio | gate de prontidão de observabilidade | completo | comando observability:ready e doc de prontidão existem | implementação de runtime/dashboard pode continuar após os gates de release |
| Manter loop de proteção Mini Shai-Hulud/TanStack atualizado | vigilância de cadeia de suprimentos mais runbook mais hardening do gerenciador de pacotes do AgentShield | atual | vigilância agendada de cadeia de suprimentos emite artefatos de IOC/atualização de fontes de advisory; scanner ECC cobre persistência de token-store do gh-token-monitor; AgentShield agora detecta IOCs de persistência de ferramentas de IA conhecidas, drift de ciclo de vida/token de npm, drift de age-key de npm não suportada e drift de cooldown de pnpm/Yarn; evidência de vigilância do head atual e atualizações de evidência do Linear em 18 de maio do ITO-57 estão atuais | repetir atualização de advisory/fonte e sincronização do Linear após cada lote significativo de cadeia de suprimentos |

## Principais Ações

- `naming-and-plugin-publication`: tag/push real, envio ao marketplace e escolha final do canal permanecem gateados por aprovação
- `release-notes-and-notifications`: URLs finais ao vivo de release/npm/plugin/faturamento e aprovação de publicação ainda pendentes
- `partner-sponsor-talks-pack`: substituir URLs finais após os gates de publicação, então obter aprovação explícita antes de posts de saída ou de conta pessoal
- `agentshield-enterprise-iteration`: aprofundar aprovação/readback ao vivo do operador após gates de Marketplace/pagamento
- `ecc-tools-next-level`: obter ou rotacionar o caminho do bearer-token local/interno INTERNAL_API_SECRET, então executar o gate de anúncio de faturamento ao vivo para o alvo Pro do Marketplace selecionado antes de publicar cópia de pagamentos nativos

## Próxima Ordem de Trabalho

1. Regenerar este dashboard a partir do commit final de release antes de registrar evidência de publicação.
2. Revisar o pacote de aprovação do proprietário a partir do commit final de release e aprovar, adiar ou bloquear cada lane de publicação e saída.
3. Revisar os candidatos primários de vídeo de lançamento aprovados pelo proprietário, escolher os cortes finais, fazer upload após aprovação e anexar URLs públicas de vídeo ao pacote de release.
4. Substituir URLs finais de release, npm, plugin, faturamento e vídeo no pacote de parceiro/patrocinador/palestra, então obter aprovação explícita antes da saída.
5. Repetir sincronização de status do Linear/projeto ITO-57 após o próximo lote significativo de merges ou atualização de fontes de advisory.
6. Obter ou rotacionar o caminho do bearer-token local/interno INTERNAL_API_SECRET, então executar o gate de anúncio de faturamento ao vivo para o alvo Pro do Marketplace selecionado antes de publicar cópia de pagamentos nativos.
