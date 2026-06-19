# Dashboard de Prontidão do Operador ECC

Este dashboard é gerado por `npm run operator:dashboard`. É um snapshot do operador, não uma aprovação de release.

Gerado: 2026-05-18T20:25:22.649Z
Commit: 4470e2e6702f17099d6feb137ba03ff00582c202
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

## Checklist de Prompt-Para-Artefato

| Requisito objetivo | Artefato ou gate | Status | Evidência | Lacuna |
| --- | --- | --- | --- | --- |
| Manter PRs públicos abaixo de 20 | varredura ao vivo do GitHub em scripts/platform-audit.js mais ledger de limpeza de fila em todo o proprietário | atual | 0 PRs abertos em 5 repositórios rastreados; 0 PRs abertos em todo o proprietário após limpeza | repetir platform:audit e gh search em todo o proprietário antes do release |
| Manter issues públicas abaixo de 20 | varredura ao vivo do GitHub em scripts/platform-audit.js mais ledger de limpeza de fila em todo o proprietário | atual | 0 issues abertas em 5 repositórios rastreados; 0 issues abertas em todo o proprietário após limpeza | repetir platform:audit e gh search em todo o proprietário antes do release |
| Responder e gerenciar discussions do repositório | resumo de discussions em scripts/platform-audit.js | atual | 0 precisam de toque do mantenedor; 0 discussions respondíveis sem resposta aceita | repetir antes do release |
| Incorporar dashboard de conclusão ITO-44 em um comando repetível | npm run operator:dashboard | completo | script de pacote operator:dashboard existe | manter dashboard gerado anexado à evidência de publicação |
| Preview pack do ECC 2.0 pronto | docs/releases/2.0.0-rc.1/preview-pack-manifest.md | atual | manifesto do preview pack e gate de smoke determinístico estão na árvore | repetir smoke de preview-pack com checkout limpo antes da publicação |
| Incluir skills especializadas do Hermes com segurança | docs/HERMES-SETUP.md e skills/hermes-imports/SKILL.md | atual | artefatos de configuração/importação do Hermes são cobertos pelo smoke do preview-pack | repetir smoke do preview-pack antes da revisão de release |
| Preparar caminhos de mudança de nome, plugin Claude e plugin Codex | naming-and-publication-matrix mais checklist de publication-readiness de release-name-plugin-publication mais publication-readiness | em_progresso | matrix de nomenclatura, checklist de publicação de release e gates de prontidão do plugin existem | tag/push real, envio ao marketplace e escolha final do canal permanecem gateados por aprovação |
| Preparar notas de release, artigos, tweets e notificações push | arquivos sociais e de cópia de release em docs/releases/2.0.0-rc.1 | em_progresso | notas de release, thread no X, rascunho do LinkedIn e ledger de URLs estão presentes | URLs finais ao vivo de release/npm/plugin/faturamento e aprovação de publicação ainda pendentes |
| Avançar iteração empresarial do AgentShield | evidência de PR do AgentShield mais roadmap empresarial | em_progresso | `reviewItems` de promoção de política do AgentShield pousou em `87aec47`; detecção de drift de hardening do gerenciador de pacotes pousou em `28d08c7`; pins de runtime de action de fluxo de trabalho foram atualizados em `659f569`; orientação de age-gate de npm foi corrigida em `ee585cd`; outputs de Action de hardening do gerenciador de pacotes pousaram em `1124535`; outputs de Action de promoção de política e evidência de job-summary de smoke de runtime pousaram em `1593925`; payloads de ticket de revisão de fleet e rastros de IOC atuais do Mini Shai-Hulud pousaram em `840952a`; ECC-Tools consome esses outputs em `8658951`, expõe telemetria de status/pack/count/digest legível pelo operador em `16c537f` e renderiza rastreamentos de auditoria de juiz de promoção hospedada em `05d4e82`; todos estão espelhados no roadmap de GA | aprofundar aprovação/readback ao vivo do operador após gates de Marketplace/pagamento |
| Avançar pagamentos nativos das ECC Tools e aplicativo harness-agnostic nativo de IA | evidência de PR das ECC Tools, gate de faturamento, lanes de análise hospedada | em_progresso | gate de anúncio de faturamento, lanes de análise hospedada, consumo de fleet-summary do AgentShield, caminhos de evidência de achados hospedados, vinculação de política de rota de harness, telemetria de output de Action de promoção de política, detalhes de output de promoção visíveis pelo operador, rastreamentos de auditoria de juiz de promoção hospedada, preflight de anúncio de faturamento, readback de KV de faturamento de produção agregado, readback OAuth do Wrangler, readback de faturamento da conta alvo, gates de estado de faturamento do Marketplace com reconhecimento de proveniência, contagens de proveniência de plano/ação do Marketplace sanitizadas, controles de feedback de aprendizado em equipe hospedada e remediação de alertas Dependabot das ECC-Tools estão espelhados no roadmap de GA | criar ou verificar estado de faturamento do Marketplace gerenciado Pro com proveniência de webhook, configurar a conta alvo e INTERNAL_API_SECRET, então executar novamente o readback alvo e o gate de anúncio ao vivo |
| Auditar, podar ou anexar trabalho legado | docs/stale-pr-salvage-ledger.md e inventário legado | atual | ledger de recuperação legado e inventário estão atuais; todas as caudas de localização estão vinculadas ao Linear ITO-55 para revisão manual do proprietário do idioma | repetir varredura legada antes do release |
| Manter roadmap do Linear detalhado e rastreamento de progresso sincronizado | espelho de projeto Linear mais contrato de sincronização de progresso | atual | sincronização ao vivo do Linear e superfície de progresso do projeto estão atuais; contrato de sincronização de progresso define o caminho de work-items/status respaldado em arquivo | repetir atualização de status do Linear/projeto e sincronização de work-items locais após cada lote significativo de merges |
| Fornecer observabilidade do ECC 2.0 para uso próprio | gate de prontidão de observabilidade | completo | comando observability:ready e doc de prontidão existem | implementação de runtime/dashboard pode continuar após os gates de release |
| Manter loop de proteção Mini Shai-Hulud/TanStack atualizado | vigilância de cadeia de suprimentos mais runbook mais hardening do gerenciador de pacotes do AgentShield | atual | vigilância agendada de cadeia de suprimentos emite artefatos de IOC/atualização de fontes de advisory; scanner ECC cobre persistência de token-store do gh-token-monitor; AgentShield agora detecta IOCs de persistência de ferramentas de IA conhecidas, drift de ciclo de vida/token de npm, drift de age-key de npm não suportada e drift de cooldown de pnpm/Yarn; evidência de vigilância do head atual e atualizações de evidência do Linear em 18 de maio do ITO-57 estão atuais | repetir atualização de advisory/fonte e sincronização do Linear após cada lote significativo de cadeia de suprimentos |

## Principais Ações

- `naming-and-plugin-publication`: tag/push real, envio ao marketplace e escolha final do canal permanecem gateados por aprovação
- `release-notes-and-notifications`: URLs finais ao vivo de release/npm/plugin/faturamento e aprovação de publicação ainda pendentes
- `agentshield-enterprise-iteration`: aprofundar aprovação/readback ao vivo do operador após gates de Marketplace/pagamento
- `ecc-tools-next-level`: criar ou verificar estado de faturamento do Marketplace gerenciado Pro com proveniência de webhook, configurar a conta alvo e INTERNAL_API_SECRET, então executar novamente o readback alvo e o gate de anúncio ao vivo

## Próxima Ordem de Trabalho

1. Regenerar este dashboard a partir do commit final de release antes de registrar evidência de publicação.
2. Repetir sincronização de status do Linear/projeto ITO-57 após o próximo lote significativo de merges ou atualização de fontes de advisory.
3. Criar ou verificar estado de faturamento do Marketplace gerenciado Pro com proveniência de webhook, configurar a conta alvo e INTERNAL_API_SECRET, então executar novamente o readback alvo e o gate de anúncio ao vivo antes de publicar cópia de pagamentos nativos.
4. Retomar ITO-45, ITO-46 e ITO-56 somente após o dashboard gerado e os gates finais de release serem atualizados.
